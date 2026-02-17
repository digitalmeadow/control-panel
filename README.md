# @digitalmeadow/control-panel

Minimal GUI control panel for creative coding.

## Installation

```bash
npm install @digitalmeadow/control-panel
```

## Features

- Dependency-free
- Minimal API
- Audio and MIDI input signals

## Usage

```typescript
import { ControlPanel } from "@digitalmeadow/control-panel";

const state = {
  number: 50,
  range: 0.5,
  select: "option-a",
  enabled: true,
  color: "#3498db",
  gradient: [
    { color: "#ff0000", position: 0 },
    { color: "#0000ff", position: 1 },
  ],
  array: ["item-1", "item-2"],
  radio: "option-a",
};

const panel = new ControlPanel();

panel
  .addNumber(state, "number", { min: 0, max: 100, step: 1, label: "Number" })
  .onChange((value) => console.log("number changed:", value));

panel.addRange(state, "range", { min: 0, max: 1, step: 0.01 });

panel.addSelect(state, "select", {
  label: "Dropdown",
  options: ["option-a", "option-b", "option-c"],
});

panel.addBoolean(state, "enabled", { label: "Enabled" });

panel.addRadio(state, "radio", {
  label: "Radio",
  options: ["option-a", "option-b"],
});

panel.addColor(state, "color", { label: "Color" });

panel.addGradient(state, "gradient", { label: "Gradient" });

panel.addArray(state, "array", {
  label: "Array",
  itemType: "string",
});

panel.addButton("Reset", () => panel.reset());

const folder = panel.addFolder("Settings");
folder.addNumber(state, "number", { min: 0, max: 100 });
```
