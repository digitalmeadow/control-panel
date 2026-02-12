import { Controller, type ControllerOptions } from "./Controller";
import { createElement } from "../utils/dom";

export interface ColorControllerOptions extends ControllerOptions {}

export class ColorController extends Controller<string> {
  input: HTMLInputElement;

  constructor(
    object: any,
    property: string,
    options: ColorControllerOptions = {},
  ) {
    super(object, property, options);

    this.input = createElement("input", {
      type: "color",
      className: "cp-input-color",
      value: this.value || "#000000",
    });

    this.appendWidget(this.input);

    this.input.addEventListener("input", (e: Event) => {
      const target = e.target as HTMLInputElement;
      this.setValue(target.value);
    });

    this.updateDisplay();
  }

  updateDisplay() {
    this.input.value = this.value;
  }
}
