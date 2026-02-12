import { Controller, type ControllerOptions } from "./Controller";
import { createElement } from "../utils/dom";

export interface ButtonControllerOptions extends ControllerOptions {}

export class ButtonController extends Controller<() => void> {
  button: HTMLButtonElement;

  constructor(
    label: string,
    fn: () => void,
    options: ButtonControllerOptions = {},
  ) {
    // Create a dummy object to hold the function
    const object = { action: fn };
    super(object, "action", options);

    const buttonText = options.label ?? label;
    this.button = createElement("button", { className: "cp-button" }, [
      String(buttonText),
    ]);

    this.button.addEventListener("click", () => {
      const fn = this.value;
      if (typeof fn === "function") {
        fn();
      }
      this.emitChange(fn);
    });

    this.appendWidget(this.button);
  }

  updateDisplay() {}
}
