import { Controller, type ControllerOptions } from "./Controller";
import { createElement } from "../utils/dom";
import {
  SignalHandler,
  type SignalBehaviour,
  type SignalHandlerState,
} from "../signals/SignalHandler";

export interface RangeControllerOptions extends ControllerOptions {
  min?: number;
  max?: number;
  step?: number;
}

interface RangeControllerState {
  value: number;
  settings: {
    min: number;
    max: number;
    step: string;
    signal: SignalHandlerState;
  };
}

export class RangeController extends Controller<number> {
  input: HTMLInputElement;
  display: HTMLElement;
  private signalHandler?: SignalHandler;
  private pingPongDirection: 1 | -1 = 1;
  private min: number = 0;
  private max: number = 100;

  private initialOptions: RangeControllerOptions;

  // UI References
  private minInput!: HTMLInputElement;
  private maxInput!: HTMLInputElement;
  private stepInput!: HTMLInputElement;

  constructor(
    object: any,
    property: string,
    options: RangeControllerOptions = {},
  ) {
    super(object, property, options);
    this.initialOptions = options;

    this.min = options.min ?? 0;
    this.max = options.max ?? 100;

    const details = createElement("details", {
      className: "cp-controller-details",
    });
    const summary = createElement("summary", {
      className: "cp-controller-summary",
    });

    this.input = createElement("input", {
      type: "range",
      className: "cp-input-range",
      step: options.step ?? "any",
    });

    if (options.min !== undefined) this.input.min = String(options.min);
    if (options.max !== undefined) this.input.max = String(options.max);

    this.input.value = String(this.value);

    this.display = createElement(
      "span",
      {
        className: "cp-value-display",
      },
      [String(this.value.toFixed(1))],
    );

    this.input.addEventListener("input", () => {
      const val = parseFloat(this.input.value);
      if (!isNaN(val)) {
        this.setValue(val);
        this.display.textContent = String(val.toFixed(1));
      }
    });

    this.input.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    const summaryContent = createElement("div", {
      className: "cp-controller-summary-content",
    });
    summaryContent.appendChild(this.input);
    summaryContent.appendChild(this.display);

    summary.appendChild(summaryContent);
    details.appendChild(summary);

    const settings = createElement("div", { className: "cp-number-settings" });

    // Min
    const minRes = this.createSetting("min", options.min, (val) =>
      this.setMin(val),
    );
    this.minInput = minRes.input;
    settings.appendChild(minRes.row);

    // Max
    const maxRes = this.createSetting("max", options.max, (val) =>
      this.setMax(val),
    );
    this.maxInput = maxRes.input;
    settings.appendChild(maxRes.row);

    // Step
    const stepRes = this.createSetting("step", options.step, (val) =>
      this.setStep(val),
    );
    this.stepInput = stepRes.input;
    settings.appendChild(stepRes.row);

    const separator = createElement("hr", { className: "cp-separator" });
    settings.appendChild(separator);

    // Signal Handler
    this.signalHandler = new SignalHandler({
      container: settings,
      onChange: (easedValue, behaviour) =>
        this.applySignal(easedValue, behaviour),
    });

    details.appendChild(settings);
    this.appendWidget(details);
  }

  // Setters
  setMin(val: string | number) {
    if (typeof val === "number") val = String(val);
    if (val === "" || isNaN(parseFloat(val))) {
      this.input.removeAttribute("min");
    } else {
      this.input.min = val;
      this.min = parseFloat(val);
    }
    if (this.minInput && this.minInput.value !== val) {
      this.minInput.value = val;
    }
  }

  setMax(val: string | number) {
    if (typeof val === "number") val = String(val);
    if (val === "" || isNaN(parseFloat(val))) {
      this.input.removeAttribute("max");
    } else {
      this.input.max = val;
      this.max = parseFloat(val);
    }
    if (this.maxInput && this.maxInput.value !== val) {
      this.maxInput.value = val;
    }
  }

  setStep(val: string | number | undefined) {
    if (val === undefined) val = "";
    if (typeof val === "number") val = String(val);
    if (val === "" || val === "any" || isNaN(parseFloat(val))) {
      this.input.step = "any";
    } else {
      this.input.step = val;
    }
    // Update the step input UI (handle "any" specially for type="number" input)
    if (this.stepInput) {
      if (val === "any" || val === "") {
        this.stepInput.value = "";
      } else if (this.stepInput.value !== val) {
        this.stepInput.value = val;
      }
    }
  }

  private applySignal(easedValue: number, behaviour: SignalBehaviour) {
    const range = this.max - this.min;
    let newVal: number;

    if (behaviour === "forward") {
      newVal = this.min + easedValue * range;
    } else if (behaviour === "backward") {
      newVal = this.max - easedValue * range;
    } else {
      // Compound behaviour: loopForward, loopBackward, and pingpong
      // Base speed: 1% of range per frame at max signal
      const delta = easedValue * (range * 0.01);
      newVal = this.value;

      if (behaviour === "loopForward") {
        newVal += delta;
        if (newVal > this.max) {
          newVal = this.min + ((newVal - this.min) % range);
        }
      } else if (behaviour === "loopBackward") {
        newVal -= delta;
        if (newVal < this.min) {
          newVal = this.max - ((this.max - newVal) % range);
        }
      } else if (behaviour === "pingpong") {
        newVal += delta * this.pingPongDirection;

        if (newVal >= this.max) {
          newVal = this.max;
          this.pingPongDirection = -1;
        } else if (newVal <= this.min) {
          newVal = this.min;
          this.pingPongDirection = 1;
        }
      }
    }

    // Apply step rounding
    newVal = this.roundToStep(newVal);

    this.setValue(newVal);
    this.input.value = String(newVal);
    this.display.textContent = String(newVal.toFixed(1));
  }

  private roundToStep(value: number): number {
    const step = this.input.step;
    if (step === "any" || step === "" || isNaN(parseFloat(step))) {
      return value;
    }

    const stepValue = parseFloat(step);
    const offset = this.min;
    return offset + Math.round((value - offset) / stepValue) * stepValue;
  }

  private createSetting(
    label: string,
    initialValue: number | undefined,
    onChange: (val: string) => void,
  ) {
    const row = createElement("div", { className: "cp-setting-row" });
    const labelEl = createElement("label", { className: "cp-setting-label" }, [
      label,
    ]);
    const input = createElement("input", {
      type: "number",
      className: "cp-input-number cp-input-small",
      step: "any",
    });

    if (initialValue !== undefined) {
      input.value = String(initialValue);
    }

    input.addEventListener("input", () => onChange(input.value));

    row.appendChild(labelEl);
    row.appendChild(input);
    return { row, input };
  }

  updateDisplay() {
    // if (document.activeElement !== this.input && !this.signalHandler) {
    this.input.value = String(this.value);
    this.display.textContent = String(this.value.toFixed(1));
    // }
  }

  save(): RangeControllerState {
    return {
      value: this.value,
      settings: {
        min: this.min,
        max: this.max,
        step: this.input.step,
        signal: this.signalHandler!.save(),
      },
    };
  }

  load(data: any) {
    if (typeof data === "number") {
      this.setValue(data);
      this.resetSettings();
    } else if (typeof data === "object" && data !== null && "value" in data) {
      const settings = data.settings || {};

      if (settings.min !== undefined) {
        this.setMin(settings.min);
      } else {
        this.setMin(
          this.initialOptions.min !== undefined ? this.initialOptions.min : "",
        );
      }

      if (settings.max !== undefined) {
        this.setMax(settings.max);
      } else {
        this.setMax(
          this.initialOptions.max !== undefined ? this.initialOptions.max : "",
        );
      }

      if (settings.step !== undefined) {
        this.setStep(settings.step);
      } else {
        this.setStep(this.initialOptions.step);
      }

      // Clamp value to be within the min/max range before setting
      let clampedValue = data.value;
      if (!isNaN(this.min) && clampedValue < this.min) {
        clampedValue = this.min;
      }
      if (!isNaN(this.max) && clampedValue > this.max) {
        clampedValue = this.max;
      }

      // Now set the value after the range is correct
      this.setValue(clampedValue);

      this.signalHandler?.load(settings.signal);
    }
  }

  reset() {
    this.setValue(this.initialValue);
    this.resetSettings();
  }

  private resetSettings() {
    this.setMin(
      this.initialOptions.min !== undefined ? this.initialOptions.min : "",
    );
    this.setMax(
      this.initialOptions.max !== undefined ? this.initialOptions.max : "",
    );
    this.setStep(this.initialOptions.step);

    this.signalHandler?.reset();
  }
}
