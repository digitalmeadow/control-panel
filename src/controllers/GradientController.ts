import { Controller, type ControllerOptions } from "./Controller";
import { createElement, createDeleteButton } from "../utils/dom";
import { lerpColor } from "../utils/color";
import {
  SignalHandler,
  type SignalBehaviour,
  type SignalHandlerState,
} from "../signals/SignalHandler";

export interface ColorStop {
  color: string;
  position: number;
}

export interface GradientControllerOptions extends ControllerOptions {
  stops?: ColorStop[];
}

interface GradientControllerState {
  stops: ColorStop[];
  settings: {
    signal: SignalHandlerState;
  };
}

export class GradientController extends Controller<string> {
  // Config
  stops: ColorStop[] = [];

  // Signal State
  private signalHandler?: SignalHandler;
  private pingPongDirection: 1 | -1 = 1;
  private animationT = 0;
  private manualPosition: number = 0;

  // UI
  displayText: HTMLElement;
  stopsContainer: HTMLElement;

  private initialOptions: GradientControllerOptions;

  constructor(
    object: any,
    property: string,
    options: GradientControllerOptions = {},
  ) {
    super(object, property, options);
    this.initialOptions = options;

    // Default stops if none provided
    this.stops = options.stops || [
      { color: "#000000", position: 0 },
      { color: "#ffffff", position: 1 },
    ];
    this.sortStops();

    const details = createElement("details", {
      className: "cp-controller-details",
    });
    const summary = createElement("summary", {
      className: "cp-controller-summary",
    });

    const summaryContent = createElement("div", {
      className: "cp-controller-summary-content",
    });

    this.displayText = createElement(
      "span",
      { className: "cp-value-display" },
      [String(this.value)],
    );

    summaryContent.appendChild(this.displayText);
    summary.appendChild(summaryContent);
    details.appendChild(summary);

    // Settings
    const settings = createElement("div", { className: "cp-number-settings" });

    // Stops Manager
    this.stopsContainer = createElement("div", {
      className: "cp-stops-container",
    });
    this.renderStops();
    settings.appendChild(this.stopsContainer);

    const addBtn = createElement(
      "button",
      {
        className: "cp-button",
      },
      ["+ Add Stop"],
    );
    addBtn.addEventListener("click", () => {
      this.stops.push({ color: "#ffffff", position: 0.5 });
      this.sortStops();
      this.renderStops();
      this.updateOutput();
    });
    settings.appendChild(addBtn);

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

    // Initial output update at position 0
    this.updateOutput(0);
  }

  sortStops() {
    this.stops.sort((a, b) => a.position - b.position);
  }

  renderStops() {
    this.stopsContainer.innerHTML = "";

    this.stops.forEach((stop, index) => {
      const row = createElement("div", { className: "cp-gradient-stop-row" });

      // Color Input
      const colorInput = createElement("input", {
        type: "color",
        className: "cp-input-color",
        value: stop.color,
      });
      colorInput.addEventListener("input", (e) => {
        stop.color = (e.target as HTMLInputElement).value;
        this.updateOutput();
      });

      // Position Input
      const posInput = createElement("input", {
        type: "number",
        className: "cp-input-number cp-input-small",
        min: "0",
        max: "1",
        step: "0.01",
        value: String(stop.position),
      });
      posInput.addEventListener("change", (e) => {
        let val = parseFloat((e.target as HTMLInputElement).value);
        if (isNaN(val)) val = 0;
        stop.position = Math.max(0, Math.min(1, val));
        this.sortStops();
        this.renderStops();
        this.updateOutput();
      });

      // Delete Button
      const delBtn = createDeleteButton(() => {
        this.stops.splice(index, 1);
        this.renderStops();
        this.updateOutput();
      });

      row.appendChild(colorInput);
      row.appendChild(posInput);
      row.appendChild(delBtn);

      this.stopsContainer.appendChild(row);
    });
  }

  // Calculate color at t (0-1) and update value
  updateOutput(t: number = this.manualPosition) {
    if (this.stops.length === 0) return;
    if (this.stops.length === 1) {
      this.setValue(this.stops[0].color);
      this.updateDisplay();
      return;
    }

    // Find segment
    let color = "#000000";

    // Clamp t
    t = Math.max(0, Math.min(1, t));

    if (t <= this.stops[0].position) {
      color = this.stops[0].color;
    } else if (t >= this.stops[this.stops.length - 1].position) {
      color = this.stops[this.stops.length - 1].color;
    } else {
      // Find interval
      for (let i = 0; i < this.stops.length - 1; i++) {
        const start = this.stops[i];
        const end = this.stops[i + 1];
        if (t >= start.position && t <= end.position) {
          const range = end.position - start.position;
          const localT = range === 0 ? 0 : (t - start.position) / range;
          color = lerpColor(start.color, end.color, localT);
          break;
        }
      }
    }

    this.setValue(color);
    this.updateDisplay();
  }

  updateDisplay() {
    if (this.displayText) {
      this.displayText.textContent = this.value;
    }
  }

  private applySignal(easedValue: number, behaviour: SignalBehaviour) {
    let finalT = easedValue;

    if (behaviour === "forward") {
      finalT = easedValue;
    } else if (behaviour === "backward") {
      finalT = 1 - easedValue;
    } else {
      // Time Based Behaviors (loopForward / loopBackward / pingpong)
      // We use the signal intensity as SPEED
      const speed = easedValue * 0.05; // 5% per frame at max

      if (behaviour === "loopForward") {
        this.animationT = (this.animationT + speed) % 1;
        finalT = this.animationT;
      } else if (behaviour === "loopBackward") {
        this.animationT = (this.animationT - speed + 1) % 1;
        finalT = this.animationT;
      } else if (behaviour === "pingpong") {
        this.animationT += speed * this.pingPongDirection;
        if (this.animationT >= 1) {
          this.animationT = 1;
          this.pingPongDirection = -1;
        } else if (this.animationT <= 0) {
          this.animationT = 0;
          this.pingPongDirection = 1;
        }
        finalT = this.animationT;
      }
    }

    this.updateOutput(finalT);
    this.manualPosition = finalT;
  }

  save(): GradientControllerState {
    return {
      stops: this.stops,
      settings: {
        signal: this.signalHandler!.save(),
      },
    };
  }

  load(data: any) {
    if (data && data.stops) {
      this.stops = data.stops;
      this.sortStops();
      this.renderStops();
    }
    if (data && data.settings) {
      this.signalHandler?.load(data.settings.signal);
    }
  }

  reset() {
    this.stops = this.initialOptions.stops || [
      { color: "#000000", position: 0 },
      { color: "#ffffff", position: 1 },
    ];
    this.sortStops();
    this.renderStops();
    this.signalHandler?.reset();
    this.updateOutput(0);
  }
}
