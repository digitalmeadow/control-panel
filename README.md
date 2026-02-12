# @digitalmeadow/control-panel

GUI control panel for creative coding.

## Features

- Dependency free
- Minimal API
- Audio and MIDI input signals

## Controllers

- Number
- Select
- Boolean
- Button
- Radio
- Color
- Gradient
- Array

## Usage

```typescript
import { GUI } from "./src/gui";

const state = { number: 50, color: "#3498db", enabled: true };
const gui = new GUI();

gui.addNumber(state, "number", { min: 0, max: 100, step: 1 });
gui.addColor(state, "color");
gui.addBoolean(state, "enabled");
gui.addButton("Reset", () => gui.reset());

gui.saveDefaultPreset();
```

## Folders

```typescript
const folder = gui.addFolder("Settings");
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
gui.addNumber(object, property, options?)
gui.addSelect(object, property, options?)
gui.addBoolean(object, property, options?)
gui.addButton(label, fn, options?)
gui.addRadio(object, property, options?)
gui.addColor(object, property, options?)
gui.addGradient(object, property, options?)
gui.addArray(object, property, options?)
gui.addFolder(title)

gui.save()
gui.load(state)
gui.reset()
gui.saveDefaultPreset()
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
