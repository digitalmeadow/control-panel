import { Controller, type ControllerOptions } from "./Controller";
import { createElement } from "../utils/dom";

export interface BooleanControllerOptions extends ControllerOptions {}

export class BooleanController extends Controller<boolean> {
  input: HTMLInputElement;

  constructor(
    object: any,
    property: string,
    options: BooleanControllerOptions = {},
  ) {
    super(object, property, options);

    this.input = createElement("input", {
      type: "checkbox",
      className: "cp-checkbox",
    });

    this.input.checked = this.value;

    this.input.addEventListener("change", () => {
      this.setValue(this.input.checked);
    });

    this.appendWidget(this.input);
  }

  updateDisplay() {
    this.input.checked = this.value;
  }
}
