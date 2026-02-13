import { ControlPanel } from "../src/ControlPanel";
import factoryPresets from "./presets.json";

const state = {
  number: 50,
  select: "Option 2",
  boolean: true,
  color: "#3498db",
  gradient: "#ff0000",
  arrayColors: "#ff0000,#00ff00,#0000ff",
  rotation: 0,
  scale: 1,
  opacity: 1,
  shape: "circle",
};

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const output = document.getElementById("output") as HTMLDivElement;

canvas.width = canvas.offsetWidth * window.devicePixelRatio;
canvas.height = canvas.offsetHeight * window.devicePixelRatio;
ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

function log(name: string, value: any) {
  const time = new Date().toLocaleTimeString();
  output.textContent = `[${time}] ${name}: ${JSON.stringify(value)}\n${output.textContent}`;
}

function draw() {
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((state.rotation * Math.PI) / 180);
  ctx.scale(state.scale, state.scale);

  ctx.globalAlpha = state.opacity;
  ctx.fillStyle = state.color;
  ctx.strokeStyle = state.gradient;
  ctx.lineWidth = 2;

  const size = 80;
  ctx.beginPath();

  switch (state.shape) {
    case "circle":
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      break;
    case "square":
      ctx.rect(-size, -size, size * 2, size * 2);
      break;
  }

  ctx.fill();
  ctx.stroke();
  ctx.restore();

  requestAnimationFrame(draw);
}

draw();

const controlPanel = new ControlPanel(undefined, { title: "Control Panel" });

// Factory Presets
const factoryPresetsFolder = controlPanel.addFolder("_Factory Presets");
const factoryState = {
  selected: Object.keys(factoryPresets)[0],
};

const factorySelect = factoryPresetsFolder.addSelect(factoryState, "selected", {
  label: "Preset",
  options: Object.keys(factoryPresets),
});

factoryPresetsFolder.addButton("Load", () => {
  const presetName = factoryState.selected;
  const preset = factoryPresets[presetName as keyof typeof factoryPresets];
  controlPanel.load(preset);
  factorySelect.setValue(presetName);
});

controlPanel
  .addNumber(state, "number", { min: 0, max: 100, step: 1 })
  .onChange((v) => log("number", v));
controlPanel
  .addSelect(state, "select", {
    options: ["Option 1", "Option 2", "Option 3"],
  })
  .onChange((v) => log("select", v));
controlPanel.addBoolean(state, "boolean").onChange((v) => log("boolean", v));
controlPanel.addColor(state, "color").onChange((v) => log("color", v));
controlPanel.addButton("Reset", () => controlPanel.reset());

const folder = controlPanel.addFolder("Advanced");

folder
  .addGradient(state, "gradient", {
    stops: [
      { color: "#ff0000", position: 0 },
      { color: "#0000ff", position: 1 },
    ],
  })
  .onChange((v) => log("gradient", v));

folder
  .addArray(state, "arrayColors", { itemType: "color" })
  .onChange((v) => log("arrayColors", v));

const nested = folder.addFolder("Transform");
nested
  .addNumber(state, "rotation", { min: 0, max: 360 })
  .onChange((v) => log("rotation", v));
nested
  .addNumber(state, "scale", { min: 0.1, max: 3, step: 0.1 })
  .onChange((v) => log("scale", v));
nested
  .addNumber(state, "opacity", { min: 0, max: 1, step: 0.01 })
  .onChange((v) => log("opacity", v));
nested
  .addRadio(state, "shape", { options: ["circle", "square"] })
  .onChange((v) => log("shape", v));

const disabled = controlPanel.addFolder("Disabled");
disabled.addNumber(state, "number", { disabled: true, min: 0, max: 100 });
disabled.addSelect(state, "select", { disabled: true, options: ["A", "B"] });
disabled.addBoolean(state, "boolean", { disabled: true });
disabled.addColor(state, "color", { disabled: true });
disabled.addButton("Button", () => {}, { disabled: true });
disabled.addRadio(state, "radio", {
  disabled: true,
  options: ["option a", "option b"],
});

controlPanel.saveDefaultPreset();
