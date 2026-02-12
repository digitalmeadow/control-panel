import { Controller, type ControllerOptions } from "./Controller";
import { createElement } from "../utils/dom";

export interface RadioControllerOptions<T> extends ControllerOptions {
  options?: T[];
}

export class RadioController<T> extends Controller<T> {
  container: HTMLElement;
  buttons: HTMLButtonElement[] = [];
  optionValues: T[] = [];

  constructor(
    object: any,
    property: string,
    options: RadioControllerOptions<T>,
  ) {
    super(object, property, options);

    this.container = createElement("div", { className: "cp-radios" });

    this.optionValues = options.options || [];

    this.optionValues.forEach((value) => {
      const btn = createElement("button", { className: "cp-button cp-radio" }, [
        String(value),
      ]);

      btn.addEventListener("click", () => {
        this.setValue(value);
      });

      this.container.appendChild(btn);
      this.buttons.push(btn);
    });

    this.updateDisplay();
    this.appendWidget(this.container);
  }

  updateDisplay() {
    const currentValue = this.value;
    this.buttons.forEach((btn, index) => {
      const val = this.optionValues[index];
      if (val === currentValue) {
        btn.setAttribute("data-active", "true");
      } else {
        btn.removeAttribute("data-active");
      }
    });
  }
}
