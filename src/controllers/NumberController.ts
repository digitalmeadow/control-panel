import { Controller, type ControllerOptions } from "./Controller";
import { createElement } from "../utils/dom";

export interface NumberControllerOptions extends ControllerOptions { }

export class NumberController extends Controller<number> {
  input: HTMLInputElement;

  constructor(
    object: any,
    property: string,
    options: NumberControllerOptions = {},
  ) {
    super(object, property, options);

    this.input = createElement("input", {
      type: "number",
      className: "cp-input-number",
      value: String(this.value),
    });

    this.input.addEventListener("input", () => {
      // Don't update value during typing - just let the input handle it
    });

    this.input.addEventListener("blur", () => {
      const val = parseFloat(this.input.value);
      if (!isNaN(val)) {
        this.setValue(val);
      } else {
        this.input.value = String(this.value);
      }
    });

    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.input.blur();
      }
    });

    this.appendWidget(this.input);
  }

  updateDisplay() {
    this.input.value = String(this.value);
  }
}
