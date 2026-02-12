import { Controller, type ControllerOptions } from "./Controller";
import { createElement } from "../utils/dom";

export interface SelectControllerOptions<T> extends ControllerOptions {
  options?: T[];
}

export class SelectController<T> extends Controller<T> {
  select: HTMLSelectElement;
  optionValues: T[] = [];

  constructor(
    object: any,
    property: string,
    options: SelectControllerOptions<T>,
  ) {
    super(object, property, options);

    this.select = createElement("select", { className: "cp-select" });

    this.optionValues = options.options || [];

    this.optionValues.forEach((value, index) => {
      const opt = createElement("option", { value: String(index) }, [
        String(value),
      ]);
      this.select.appendChild(opt);
    });

    this.updateDisplay();

    this.select.addEventListener("change", () => {
      const index = parseInt(this.select.value);
      const val = this.optionValues[index];
      this.setValue(val);
    });

    this.appendWidget(this.select);
  }

  setOptions(options: T[]) {
    this.select.innerHTML = "";
    this.optionValues = options;
    this.optionValues.forEach((value, index) => {
      const opt = createElement("option", { value: String(index) }, [
        String(value),
      ]);
      this.select.appendChild(opt);
    });
    this.updateDisplay();
    if (this.select.value === "" && this.optionValues.length > 0) {
      this.setValue(this.optionValues[0]);
    }
  }

  updateDisplay() {
    const index = this.optionValues.indexOf(this.value);
    if (index !== -1) {
      this.select.value = String(index);
    }
  }
}
