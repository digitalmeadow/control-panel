import { Controller, type ControllerOptions } from "./Controller";
import { createElement, createDeleteButton } from "../utils/dom";

export type ArrayItemType = "color" | "number" | "string";

export interface ArrayControllerOptions extends ControllerOptions {
  itemType?: ArrayItemType;
}

export class ArrayController extends Controller<string> {
  items: string[] = [];
  itemType: ArrayItemType;
  itemsContainer: HTMLElement;
  private initialOptions: ArrayControllerOptions;

  constructor(
    object: any,
    property: string,
    options: ArrayControllerOptions = {},
  ) {
    super(object, property, options);
    this.initialOptions = options;
    this.itemType = options.itemType || "string";

    // Parse initial value (comma-separated string)
    this.items = this.parseValue(this.value);

    const details = createElement("details", {
      className: "cp-controller-details",
    });
    const summary = createElement("summary", {
      className: "cp-controller-summary",
    });

    // Display summary showing item count
    const summaryContent = createElement("div", {
      className: "cp-controller-summary-content",
    });

    const display = createElement("span", { className: "cp-value-display" }, [
      `${this.items.length} items`,
    ]);

    summaryContent.appendChild(display);
    summary.appendChild(summaryContent);
    details.appendChild(summary);

    // Settings
    const settings = createElement("div", { className: "cp-number-settings" });

    // Items container
    this.itemsContainer = createElement("div", {
      className: "cp-stops-container",
    });
    this.renderItems();
    settings.appendChild(this.itemsContainer);

    // Add button
    const addBtn = createElement(
      "button",
      {
        className: "cp-button cp-input-small",
        style: "margin-top: 8px; width: 100%;",
      },
      ["+ Add Item"],
    );
    addBtn.addEventListener("click", () => {
      this.addItem();
    });
    settings.appendChild(addBtn);

    details.appendChild(settings);
    this.appendWidget(details);
  }

  private parseValue(value: string): string[] {
    if (!value || value.trim() === "") return [];
    return value.split(",").map((s) => s.trim());
  }

  private serializeValue(): string {
    return this.items.join(",");
  }

  private getDefaultItemValue(): string {
    switch (this.itemType) {
      case "color":
        return "#ffffff";
      case "number":
        return "0";
      default:
        return "";
    }
  }

  private addItem(value?: string) {
    const itemValue = value !== undefined ? value : this.getDefaultItemValue();
    this.items.push(itemValue);
    this.renderItems();
    this.updateValue();
  }

  private updateValue() {
    const newValue = this.serializeValue();
    this.setValue(newValue);
    this.updateSummary();
  }

  private updateSummary() {
    const display = this.domElement.querySelector(".cp-value-display");
    if (display) {
      display.textContent = `${this.items.length} items`;
    }
  }

  renderItems() {
    this.itemsContainer.innerHTML = "";

    this.items.forEach((item, index) => {
      const row = createElement("div", { className: "cp-setting-row" });

      // Item input based on type
      let input: HTMLInputElement;

      if (this.itemType === "color") {
        input = createElement("input", {
          type: "color",
          className: "cp-input-color",
          value: item,
        });
      } else if (this.itemType === "number") {
        input = createElement("input", {
          type: "number",
          className: "cp-input-number cp-input-small",
          step: "any",
          value: item,
        });
      } else {
        input = createElement("input", {
          type: "text",
          className: "cp-input-number cp-input-small",
          value: item,
        });
      }

      input.addEventListener("input", (e) => {
        this.items[index] = (e.target as HTMLInputElement).value;
        this.updateValue();
      });

      // Delete button
      const delBtn = createDeleteButton(() => {
        this.items.splice(index, 1);
        this.renderItems();
        this.updateValue();
      });

      row.appendChild(input);
      row.appendChild(delBtn);
      this.itemsContainer.appendChild(row);
    });
  }

  updateDisplay() {
    // Update is handled by renderItems and updateSummary
  }

  save(): string[] {
    return [...this.items];
  }

  load(data: any) {
    if (Array.isArray(data)) {
      this.items = [...data];
    } else if (typeof data === "string") {
      this.items = this.parseValue(data);
    }
    this.renderItems();
    this.updateValue();
  }

  reset() {
    const initialValue = this.initialValue || "";
    this.items = this.parseValue(initialValue);
    this.renderItems();
    this.updateValue();
  }
}
