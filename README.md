# @digitalmeadow/control-panel

GUI control panel for creative coding.

## Installation
```bash
npm install @digitalmeadow/control-panel
```

## Features

- Dependency free
- Minimal API
- Audio and MIDI input signals

## Controllers

- Number
- Range
- Select
- Boolean
- Button
- Radio
- Color
- Gradient
- Array

## Usage

```typescript
import { ControlPanel } from "@digitalmeadow/control-panel";

const state = { number: 50, color: "#3498db", enabled: true };
const controlPanel = new ControlPanel();

controlPanel.addRange(state, "number", { min: 0, max: 100, step: 1 });
controlPanel.addColor(state, "color");
controlPanel.addBoolean(state, "enabled");
controlPanel.addButton("Reset", () => controlPanel.reset());

controlPanel.saveDefaultPreset();
```

## Folders

```typescript
const folder = controlPanel.addFolder("Settings");
folder.addNumber(state, "value", { min: 0, max: 100 });

const nested = folder.addFolder("Advanced");
nested.addNumber(state, "other", { min: 0, max: 100 });
```

## Development

```bash
pnpm dev
pnpm build
```

## API

```typescript
controlPanel.addNumber(object, property, options?)
controlPanel.addRange(object, property, options?)
controlPanel.addSelect(object, property, options?)
controlPanel.addBoolean(object, property, options?)
controlPanel.addButton(label, fn, options?)
controlPanel.addRadio(object, property, options?)
controlPanel.addColor(object, property, options?)
controlPanel.addGradient(object, property, options?)
controlPanel.addArray(object, property, options?)
controlPanel.addFolder(title)

controlPanel.save()
controlPanel.load(state)
controlPanel.reset()
controlPanel.saveDefaultPreset()
```

## Options

All controllers:
- `label?: string`
- `disabled?: boolean`
- `id?: string`

Number:
- `min?: number`
- `max?: number`
- `step?: number`

Select/Radio:
- `options?: T[]`

Gradient:
- `stops?: ColorStop[]`

Array:
- `itemType?: "color" | "number" | "string"`
