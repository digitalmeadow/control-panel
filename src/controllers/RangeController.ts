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
    signal: SignalHandlerState | null;
  };
}

const DRAG_THRESHOLD = 3;

export class RangeController extends Controller<number> {
  input: HTMLInputElement;
  private signalHandler?: SignalHandler;
  private pingPongDirection: 1 | -1 = 1;
  private min: number = 0;
  private max: number = 100;

  private initialOptions: RangeControllerOptions;
  private drag: {
    pointerId: number;
    x: number;
    value: number;
    moved: boolean;
    fine: boolean;
  } | null = null;
  private valueBeforeEdit: number = 0;

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
      type: "number",
      id: this.controllerId,
      className: "cp-input-number cp-input-scrub",
      step: options.step ?? "any",
    });

    this.input.min = String(this.min);
    this.input.max = String(this.max);

    this.updateDisplay();
    this.bindScrub();

    this.input.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    const summaryContent = createElement("div", {
      className: "cp-controller-summary-content",
    });
    summaryContent.appendChild(this.input);

    summary.appendChild(summaryContent);
    details.appendChild(summary);

    const settings = createElement("div", { className: "cp-number-settings" });

    // Min
    const minRes = this.createSetting("min", this.min, (val) =>
      this.setMin(val),
    );
    this.minInput = minRes.input;
    settings.appendChild(minRes.row);

    // Max
    const maxRes = this.createSetting("max", this.max, (val) =>
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

    // Signal Handler
    if (options.showSignals) {
      const separator = createElement("hr", { className: "cp-separator" });
      settings.appendChild(separator);

      this.signalHandler = new SignalHandler({
        container: settings,
        onChange: (easedValue, behaviour) =>
          this.applySignal(easedValue, behaviour),
      });
    }

    details.appendChild(settings);
    this.appendWidget(details);
  }

  // Drag to scrub, click to type. Focused, it behaves as a plain number field.
  private bindScrub() {
    // Focus comes from mousedown, not pointerdown. Cancelling pointerdown would interfere with the pointer capture that keeps the drag alive off-element.
    this.input.addEventListener("mousedown", (e) => {
      if (document.activeElement === this.input) return;
      e.preventDefault(); // suppress native focus so a drag doesn't place a caret
    });

    this.input.addEventListener("pointerdown", (e) => {
      if (document.activeElement === this.input) return;

      // Set before capturing: a throw below must not leave the drag half-built.
      this.drag = {
        pointerId: e.pointerId,
        x: e.clientX,
        value: this.value,
        moved: false,
        fine: e.shiftKey,
      };

      try {
        this.input.setPointerCapture(e.pointerId);
      } catch {
        // InvalidPointerId: the pointer went away before capture could be set
        // (a rapid tap). The window handlers still end the drag.
      }

      // Capture alone is not enough. Mounted inside a `pointer-events: none`
      // overlay, the pointer leaving the panel lands on a region that is not
      // hit-testable and the element stops receiving events. Window sees them
      // regardless, since they bubble from whatever is underneath.
      window.addEventListener("pointermove", this.onScrubMove);
      window.addEventListener("pointerup", this.onScrubEnd);
      window.addEventListener("pointercancel", this.onScrubEnd);
    });

    this.input.addEventListener("focus", () => {
      this.valueBeforeEdit = this.value;
      this.input.value = String(this.value); // unrounded while editing
    });

    this.input.addEventListener("blur", () => {
      const val = parseFloat(this.input.value);
      if (isNaN(val)) this.updateDisplay();
      else this.commit(val);
    });

    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.input.blur();
      } else if (e.key === "Escape") {
        this.setValue(this.valueBeforeEdit);
        this.input.blur();
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault(); // native stepping wouldn't clamp or emit
        const typed = parseFloat(this.input.value);
        const from = isNaN(typed) ? this.value : typed;
        const direction = e.key === "ArrowUp" ? 1 : -1;
        this.commit(
          from + direction * this.stepAmount() * (e.shiftKey ? 10 : 1),
        );
      }
    });
  }

  // Bound once so add/removeEventListener see the same reference.
  private onScrubMove = (e: PointerEvent) => {
    if (!this.drag || e.pointerId !== this.drag.pointerId) return;

    // Released somewhere that never delivered a pointerup — outside the browser
    // window, say. Without this the drag would resume on the next move.
    if (e.buttons === 0) {
      this.endScrub(e.pointerId);
      return;
    }

    // Re-anchor when shift is toggled so sensitivity changes don't jump.
    if (e.shiftKey !== this.drag.fine) {
      this.drag = {
        pointerId: this.drag.pointerId,
        x: e.clientX,
        value: this.value,
        moved: true,
        fine: e.shiftKey,
      };
      return;
    }

    const dx = e.clientX - this.drag.x;
    if (!this.drag.moved && Math.abs(dx) < DRAG_THRESHOLD) return;
    this.drag.moved = true;

    const sensitivity = e.shiftKey ? 0.1 : 1;
    this.commit(this.drag.value + dx * this.valuePerPixel() * sensitivity);
  };

  private onScrubEnd = (e: PointerEvent) => this.endScrub(e.pointerId);

  // Single teardown for every way a scrub can end.
  private endScrub(pointerId: number) {
    if (!this.drag || pointerId !== this.drag.pointerId) return;

    const { moved } = this.drag;
    this.drag = null;

    window.removeEventListener("pointermove", this.onScrubMove);
    window.removeEventListener("pointerup", this.onScrubEnd);
    window.removeEventListener("pointercancel", this.onScrubEnd);

    if (this.input.hasPointerCapture(pointerId)) {
      this.input.releasePointerCapture(pointerId);
    }

    // A press that never travelled is a click: focus ready to type over.
    if (!moved) {
      this.input.focus();
      this.input.select();
    }
  }

  private commit(value: number) {
    this.setValue(this.clamp(this.roundToStep(value)));
  }

  private clamp(value: number): number {
    if (Number.isFinite(this.min)) value = Math.max(this.min, value);
    if (Number.isFinite(this.max)) value = Math.min(this.max, value);
    return value;
  }

  private get hasRange(): boolean {
    return (
      Number.isFinite(this.min) &&
      Number.isFinite(this.max) &&
      this.max > this.min
    );
  }

  // Arrow-key increment: the step if set, otherwise a percent of the range.
  private stepAmount(): number {
    const step = parseFloat(this.input.step);
    if (Number.isFinite(step)) return step;
    return this.hasRange ? (this.max - this.min) / 100 : 1;
  }

  // Full field width spans the whole range; without a range, a step per pixel.
  private valuePerPixel(): number {
    const width = this.input.clientWidth;
    if (this.hasRange && width > 0) return (this.max - this.min) / width;
    const step = parseFloat(this.input.step);
    return Number.isFinite(step) ? step : 0.01;
  }

  private get decimals(): number {
    const step = this.input.step;
    const parsed = parseFloat(step);
    if (!Number.isFinite(parsed)) return 2;
    if (step.includes("e")) return Math.max(0, -Math.floor(Math.log10(parsed)));
    return step.split(".")[1]?.length ?? 0;
  }

  private updateFill() {
    const percent = this.hasRange
      ? ((this.value - this.min) / (this.max - this.min)) * 100
      : 0;
    this.input.style.setProperty(
      "--cp-fill",
      `${Math.min(100, Math.max(0, percent))}%`,
    );
  }

  // Setters
  setMin(val: string | number | null | undefined) {
    val = val === undefined || val === null ? "" : String(val);
    if (val === "" || isNaN(parseFloat(val))) {
      this.input.removeAttribute("min");
      this.min = NaN;
    } else {
      this.input.min = val;
      this.min = parseFloat(val);
    }
    if (this.minInput && this.minInput.value !== val) {
      this.minInput.value = val;
    }
    this.updateFill();
  }

  setMax(val: string | number | null | undefined) {
    val = val === undefined || val === null ? "" : String(val);
    if (val === "" || isNaN(parseFloat(val))) {
      this.input.removeAttribute("max");
      this.max = NaN;
    } else {
      this.input.max = val;
      this.max = parseFloat(val);
    }
    if (this.maxInput && this.maxInput.value !== val) {
      this.maxInput.value = val;
    }
    this.updateFill();
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
    this.updateDisplay(); // step drives displayed precision
  }

  private applySignal(easedValue: number, behaviour: SignalBehaviour) {
    if (!this.hasRange) return;
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

    this.commit(newVal);
  }

  private roundToStep(value: number): number {
    const step = this.input.step;
    if (step === "any" || step === "" || isNaN(parseFloat(step))) {
      return value;
    }

    const stepValue = parseFloat(step);
    const offset = Number.isFinite(this.min) ? this.min : 0;
    return offset + Math.round((value - offset) / stepValue) * stepValue;
  }

  private createSetting(
    label: string,
    initialValue: number | undefined,
    onChange: (val: string) => void,
  ) {
    const settingId = this.subId(label.toLowerCase());
    const labelId = `${settingId}-label`;
    const row = createElement("div", { className: "cp-setting-row" });
    // aria-labelledby rather than `for`, so clicking the label doesn't refocus
    // the input you just clicked away from. See Controller's own label.
    const labelEl = createElement(
      "label",
      { className: "cp-setting-label", id: labelId },
      [label],
    );
    const input = createElement("input", {
      type: "number",
      id: settingId,
      className: "cp-input-number cp-input-small",
      step: "any",
      "aria-labelledby": labelId,
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
    this.input.value = this.value.toFixed(this.decimals);
    this.updateFill();
  }

  save(): RangeControllerState {
    return {
      value: this.value,
      settings: {
        min: this.min,
        max: this.max,
        step: this.input.step,
        signal: this.signalHandler?.save() ?? null,
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
        this.setMin(this.initialOptions.min ?? 0);
      }

      if (settings.max !== undefined) {
        this.setMax(settings.max);
      } else {
        this.setMax(this.initialOptions.max ?? 100);
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
    this.setMin(this.initialOptions.min ?? 0);
    this.setMax(this.initialOptions.max ?? 100);
    this.setStep(this.initialOptions.step);

    this.signalHandler?.reset();
  }
}
