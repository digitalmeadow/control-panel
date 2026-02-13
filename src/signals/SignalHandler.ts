import { Controller } from "../controllers/Controller";
import { createElement } from "../utils/dom";
import { easings, type Ease } from "../utils/easings";
import { type MathSignalType } from "./MathSignals";

export type SignalBehaviour =
  | "forward"
  | "backward"
  | "loopForward"
  | "loopBackward"
  | "pingpong";

export interface SignalHandlerOptions {
  container: HTMLElement;
  onChange: (easedValue: number, behaviour: SignalBehaviour) => void;
}

export interface SignalHandlerState {
  type: string | null;
  midiId: string | null;
  ease: Ease;
  behaviour: SignalBehaviour;
}

export class SignalHandler {
  // State
  private rafId: number | null = null;
  private currentSignalType:
    | "volume"
    | "bass"
    | "mids"
    | "highs"
    | "constant"
    | "sine"
    | "sawtooth"
    | "triangle"
    | "square"
    | "random"
    | "midi"
    | null = null;
  private currentMidiId: string | null = null;
  private currentEase: Ease = "linear";
  private currentBehaviour: SignalBehaviour = "forward";

  // UI References
  private signalSelect!: HTMLSelectElement;
  private midiRow!: HTMLElement;
  private midiBtn!: HTMLButtonElement;
  private mathParamsContainer!: HTMLElement;
  private easeRow!: HTMLElement;
  private easeSelect!: HTMLSelectElement;
  private behaviourRow!: HTMLElement;
  private behaviourSelect!: HTMLSelectElement;

  // Callback
  private onChange: (easedValue: number, behaviour: SignalBehaviour) => void;

  constructor(options: SignalHandlerOptions) {
    this.onChange = options.onChange;
    this.setupControllers(options.container);
  }

  private setupControllers(container: HTMLElement) {
    // Signal Select
    const signalRes = this.createSettingSelect(
      "signal",
      [
        "none",
        "volume",
        "bass",
        "mids",
        "highs",
        "constant",
        "sine",
        "sawtooth",
        "triangle",
        "square",
        "random",
        "midi",
      ],
      (val) => this.setSignalType(val),
    );
    this.signalSelect = signalRes.select;
    container.appendChild(signalRes.row);

    // Midi Row
    this.midiRow = createElement("div", {
      className: "cp-setting-row",
      style: "display: none;",
    });
    const midiLabel = createElement(
      "label",
      { className: "cp-setting-label" },
      ["Midi"],
    );
    this.midiBtn = createElement(
      "button",
      { className: "cp-button cp-input-small" },
      ["Learn"],
    );
    this.midiBtn.addEventListener("click", async () => {
      if (this.midiBtn.textContent === "Listening...") {
        Controller.midi.cancelListen();
        this.setMidiId(null);
        return;
      }
      this.midiBtn.textContent = "Listening...";
      const id = await Controller.midi.listen();
      this.setMidiId(id);
    });
    this.midiRow.appendChild(midiLabel);
    this.midiRow.appendChild(this.midiBtn);
    container.appendChild(this.midiRow);

    // Math Signal Parameters Container
    this.mathParamsContainer = createElement("div", {
      style: "display: none; flex-direction: column; gap: 4px;",
    });
    container.appendChild(this.mathParamsContainer);

    // Behaviour Row
    const behaviourRes = this.createSettingSelect(
      "behaviour",
      ["forward", "backward", "loopForward", "loopBackward", "pingpong"],
      (val) => this.setBehaviour(val as SignalBehaviour),
    );
    this.behaviourRow = behaviourRes.row;
    this.behaviourSelect = behaviourRes.select;
    this.behaviourRow.style.display = "none";
    this.behaviourSelect.value = this.currentBehaviour;
    container.appendChild(this.behaviourRow);

    // Ease Row
    const easeRes = this.createSettingSelect(
      "ease",
      Object.keys(easings),
      (val) => this.setEase(val as Ease),
    );
    this.easeRow = easeRes.row;
    this.easeSelect = easeRes.select;
    this.easeRow.style.display = "none";
    this.easeSelect.value = this.currentEase;
    container.appendChild(this.easeRow);
  }

  private createSettingSelect(
    label: string,
    options: string[],
    onChange: (val: string) => void,
  ) {
    const row = createElement("div", { className: "cp-setting-row" });
    const labelEl = createElement("label", { className: "cp-setting-label" }, [
      label,
    ]);
    const select = createElement("select", {
      className: "cp-select cp-input-small",
    });

    options.forEach((opt) => {
      const option = createElement("option", { value: opt }, [opt]);
      select.appendChild(option);
    });

    select.addEventListener("change", () => onChange(select.value));

    row.appendChild(labelEl);
    row.appendChild(select);
    return { row, select };
  }

  private createNumberInput(
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (val: number) => void,
  ) {
    const row = createElement("div", { className: "cp-setting-row" });
    const labelEl = createElement("label", { className: "cp-setting-label" }, [
      label,
    ]);
    const input = createElement("input", {
      className: "cp-input-number cp-input-small",
      type: "number",
      value: String(value),
      min: String(min),
      max: String(max),
      step: String(step),
    }) as HTMLInputElement;

    input.addEventListener("input", () => {
      const val = parseFloat(input.value);
      if (!isNaN(val)) {
        onChange(val);
      }
    });

    row.appendChild(labelEl);
    row.appendChild(input);
    return { row, input };
  }

  private updateMathParams(type: MathSignalType) {
    // Clear existing params
    this.mathParamsContainer.innerHTML = "";

    const config = Controller.math.getConfig(type);

    // Frequency/Speed parameter (all signals have this)
    let freqLabel = "Frequency";
    let freqMin = 0.1;
    let freqMax = 10;
    let freqStep = 0.1;

    if (type === "random") {
      freqMax = 30;
    } else if (type === "constant") {
      freqLabel = "Speed";
      freqMin = 0.01;
      freqMax = 2;
      freqStep = 0.01;
    }

    const freqInput = this.createNumberInput(
      freqLabel,
      config.frequency,
      freqMin,
      freqMax,
      freqStep,
      (val) => Controller.math.setConfig(type, { frequency: val }),
    );
    this.mathParamsContainer.appendChild(freqInput.row);

    // Amplitude (all signals)
    const ampInput = this.createNumberInput(
      "Amplitude",
      config.amplitude,
      0,
      2,
      0.1,
      (val) => Controller.math.setConfig(type, { amplitude: val }),
    );
    this.mathParamsContainer.appendChild(ampInput.row);

    // Offset (all signals)
    const offsetInput = this.createNumberInput(
      "Offset",
      config.offset,
      0,
      1,
      0.1,
      (val) => Controller.math.setConfig(type, { offset: val }),
    );
    this.mathParamsContainer.appendChild(offsetInput.row);

    // Phase (only for oscillators, not random or time)
    if (["sine", "sawtooth", "triangle", "square"].includes(type)) {
      const phaseInput = this.createNumberInput(
        "Phase",
        config.phase,
        0,
        1,
        0.01,
        (val) => Controller.math.setConfig(type, { phase: val }),
      );
      this.mathParamsContainer.appendChild(phaseInput.row);
    }
  }

  setSignalType(val: string | null) {
    if (!val || val === "none") {
      this.currentSignalType = null;
      this.currentMidiId = null;
      this.midiRow.style.display = "none";
      this.mathParamsContainer.style.display = "none";
      this.easeRow.style.display = "none";
      this.behaviourRow.style.display = "none";
      this.stop();
      if (this.signalSelect.value !== "none") this.signalSelect.value = "none";
    } else {
      this.currentSignalType = val as any;
      const isMidi = val === "midi";
      const isMath = [
        "constant",
        "sine",
        "sawtooth",
        "triangle",
        "square",
        "random",
      ].includes(val);
      const isAudio = ["volume", "bass", "mids", "highs"].includes(val);

      this.midiRow.style.display = isMidi ? "flex" : "none";
      this.mathParamsContainer.style.display = isMath ? "flex" : "none";
      if (isMath) {
        this.updateMathParams(val as MathSignalType);
      }
      this.easeRow.style.display = "flex";
      this.behaviourRow.style.display = "flex";

      if (isAudio) {
        this.currentMidiId = null;
        if (Controller.audio.ctx.state === "suspended") {
          Controller.audio.setInput("microphone");
        }
      } else if (!isMidi) {
        this.currentMidiId = null;
      }

      this.start();
      if (this.signalSelect.value !== val) this.signalSelect.value = val;
    }
  }

  setMidiId(id: string | null) {
    this.currentMidiId = id;
    this.midiBtn.textContent = id ?? "Learn";
  }

  setEase(val: Ease) {
    this.currentEase = val;
    if (this.easeSelect.value !== val) this.easeSelect.value = val;
  }

  setBehaviour(val: SignalBehaviour) {
    this.currentBehaviour = val;
    if (this.behaviourSelect.value !== val) this.behaviourSelect.value = val;
  }

  private loop = () => {
    if (this.currentSignalType) {
      let rawVal = 0;

      if (this.currentSignalType === "midi") {
        if (this.currentMidiId) {
          rawVal = Controller.midi.getSignal(this.currentMidiId)();
        }
      } else if (
        [
          "constant",
          "sine",
          "sawtooth",
          "triangle",
          "square",
          "random",
        ].includes(this.currentSignalType)
      ) {
        const signalFn = Controller.math.getSignal(
          this.currentSignalType as any,
        );
        rawVal = signalFn();
      } else if (
        ["volume", "bass", "mids", "highs"].includes(this.currentSignalType)
      ) {
        const signalFn = Controller.audio.getSignal(
          this.currentSignalType as any,
        );
        rawVal = signalFn();
      }

      const easedVal = easings[this.currentEase](rawVal);
      this.onChange(easedVal, this.currentBehaviour);

      this.rafId = requestAnimationFrame(this.loop);
    }
  };

  start() {
    if (!this.rafId && this.currentSignalType) {
      this.loop();
    }
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  save(): SignalHandlerState {
    return {
      type: this.currentSignalType,
      midiId: this.currentMidiId,
      ease: this.currentEase,
      behaviour: this.currentBehaviour,
    };
  }

  load(data: SignalHandlerState | null) {
    if (data) {
      this.setSignalType(data.type);
      this.setMidiId(data.midiId || null);
      this.setEase(data.ease || "linear");
      this.setBehaviour(data.behaviour || "forward");
    }
  }

  reset() {
    this.setSignalType("none");
    this.setEase("linear");
    this.setBehaviour("forward");
    this.setMidiId(null);
  }
}
