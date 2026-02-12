import { createElement } from "../utils/dom";
import { formatStringCamelToSentence } from "../utils/strings";
import { audioSignals } from "../signals/AudioSignals";
import { midiSignals } from "../signals/MidiSignals";

export type ChangeCallback<T> = (value: T) => void;

export interface ControllerOptions {
  label?: string;
  disabled?: boolean;
  id?: string;
}

export abstract class Controller<T> {
  static audio = audioSignals;
  static midi = midiSignals;

  public readonly key: string;
  public readonly initialValue: T;
  domElement: HTMLElement;
  protected object: any;
  protected property: string;
  protected changeFns: Set<ChangeCallback<T>> = new Set();

  constructor(object: any, property: string, options: ControllerOptions = {}) {
    this.object = object;
    this.property = property;
    this.key = options.id ?? property;
    this.initialValue = this.object[this.property];

    this.domElement = createElement("div", { className: "cp-controller" });

    const labelText = options.label ?? formatStringCamelToSentence(property);
    const label = createElement("label", { className: "cp-label" }, [
      String(labelText),
    ]);
    label.setAttribute("title", String(labelText));
    this.domElement.appendChild(label);

    if (options.disabled) {
      this.domElement.setAttribute("data-disabled", "true");
    }
  }

  get value(): T {
    return this.object[this.property];
  }

  setValue(value: T, shouldEmit = true) {
    this.object[this.property] = value;
    if (shouldEmit) {
      this.emitChange(value);
    }
    this.updateDisplay();
  }

  save(): any {
    return this.value;
  }

  load(data: any): void {
    this.setValue(data);
  }

  reset(): void {
    this.setValue(this.initialValue);
  }

  abstract updateDisplay(): void;

  onChange(fn: ChangeCallback<T>) {
    this.changeFns.add(fn);
    return this;
  }

  protected emitChange(value: T) {
    for (const fn of this.changeFns) {
      fn(value);
    }
  }

  protected appendWidget(widget: HTMLElement) {
    this.domElement.appendChild(widget);
  }
}
