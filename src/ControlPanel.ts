import { injectStyles } from "./styles";

import { createElement } from "./utils/dom";
import { Controller } from "./controllers/Controller";
import {
  NumberController,
  type NumberControllerOptions,
} from "./controllers/NumberController";
import {
  RangeController,
  type RangeControllerOptions,
} from "./controllers/RangeController";
import {
  SelectController,
  type SelectControllerOptions,
} from "./controllers/SelectController";
import {
  ButtonController,
  type ButtonControllerOptions,
} from "./controllers/ButtonController";
import {
  BooleanController,
  type BooleanControllerOptions,
} from "./controllers/BooleanController";
import {
  RadioController,
  type RadioControllerOptions,
} from "./controllers/RadioController";
import {
  ColorController,
  type ColorControllerOptions,
} from "./controllers/ColorController";
import {
  GradientController,
  type GradientControllerOptions,
} from "./controllers/GradientController";
import {
  ArrayController,
  type ArrayControllerOptions,
} from "./controllers/ArrayController";
import { audioSignals } from "./signals/AudioSignals";
import { Stats } from "./Stats";

export interface ControlPanelOptions {
  title?: string;
  presetsPrefix?: string;
}

export interface ControlPanelSectionState {
  controllers: Record<string, any>;
  folders: Record<string, ControlPanelSectionState>;
}

export abstract class ControlPanelContainer {
  abstract contentElement: HTMLElement;
  controllers: Controller<any>[] = [];
  folders: Folder[] = [];

  addNumber(
    object: any,
    property: string,
    options: NumberControllerOptions = {},
  ) {
    const controller = new NumberController(object, property, options);
    this.contentElement.appendChild(controller.domElement);
    this.controllers.push(controller);
    return controller;
  }

  addRange(
    object: any,
    property: string,
    options: RangeControllerOptions = {},
  ) {
    const controller = new RangeController(object, property, options);
    this.contentElement.appendChild(controller.domElement);
    this.controllers.push(controller);
    return controller;
  }

  addSelect<T>(
    object: any,
    property: string,
    options: SelectControllerOptions<T> = {},
  ) {
    const controller = new SelectController(object, property, options);
    this.contentElement.appendChild(controller.domElement);
    this.controllers.push(controller);
    return controller;
  }

  addBoolean(
    object: any,
    property: string,
    options: BooleanControllerOptions = {},
  ) {
    const controller = new BooleanController(object, property, options);
    this.contentElement.appendChild(controller.domElement);
    this.controllers.push(controller);
    return controller;
  }

  addButton(
    label: string,
    fn: () => void,
    options: ButtonControllerOptions = {},
  ) {
    const controller = new ButtonController(label, fn, options);
    this.contentElement.appendChild(controller.domElement);
    this.controllers.push(controller);
    return controller;
  }

  addRadio<T>(
    object: any,
    property: string,
    options: RadioControllerOptions<T> = {} as RadioControllerOptions<T>,
  ) {
    const controller = new RadioController(object, property, options);
    this.contentElement.appendChild(controller.domElement);
    this.controllers.push(controller);
    return controller;
  }

  addColor(
    object: any,
    property: string,
    options: ColorControllerOptions = {},
  ) {
    const controller = new ColorController(object, property, options);
    this.contentElement.appendChild(controller.domElement);
    this.controllers.push(controller);
    return controller;
  }

  addGradient(
    object: any,
    property: string,
    options: GradientControllerOptions = {},
  ) {
    const controller = new GradientController(object, property, options);
    this.contentElement.appendChild(controller.domElement);
    this.controllers.push(controller);
    return controller;
  }

  addArray(
    object: any,
    property: string,
    options: ArrayControllerOptions = {},
  ) {
    const controller = new ArrayController(object, property, options);
    this.contentElement.appendChild(controller.domElement);
    this.controllers.push(controller);
    return controller;
  }

  addFolder(title: string): Folder {
    const folder = new Folder(title);
    this.addSeparator();
    this.contentElement.appendChild(folder.domElement);
    this.folders.push(folder);
    return folder;
  }

  addSeparator() {
    const hr = createElement("hr", { className: "cp-separator" });
    this.contentElement.appendChild(hr);
  }

  save(): ControlPanelSectionState {
    const state: ControlPanelSectionState = {
      controllers: {},
      folders: {},
    };

    // Save Controllers
    for (const controller of this.controllers) {
      if (typeof controller.value === "function") continue;
      state.controllers[controller.key] = controller.save();
    }

    // Save Folders Recursively
    for (const folder of this.folders) {
      state.folders[folder.title] = folder.save();
    }

    return state;
  }

  load(state: ControlPanelSectionState) {
    // If no state provided, reset everything
    if (!state) {
      this.reset();
      return;
    }

    // Restore Controllers
    // Iterate over all controllers that currently exist in the control panel
    for (const controller of this.controllers) {
      // Skip controllers whose value is a function, as they cannot be meaningfully saved/restored
      if (typeof controller.value === "function") continue;

      // Check if this controller exists in the saved state
      if (state.controllers && controller.key in state.controllers) {
        const savedValue = state.controllers[controller.key];
        if (savedValue !== undefined) {
          controller.load(savedValue);
        }
      } else {
        // If the controller is missing from the state, reset it to default
        // This ensures switching presets clears values not present in the new preset
        controller.reset();
      }
    }

    // Restore Folders Recursively
    for (const folder of this.folders) {
      const folderState = state.folders
        ? state.folders[folder.title]
        : undefined;
      // Even if folderState is undefined, we call load() so it can traverse down and reset its children
      // The recursive call will hit the !state guard at the top
      folder.load(folderState as ControlPanelSectionState);
    }
  }

  reset() {
    // Reset Controllers
    for (const controller of this.controllers) {
      if (typeof controller.value === "function") continue;
      controller.reset();
    }

    // Reset Folders Recursively
    for (const folder of this.folders) {
      folder.reset();
    }
  }
}

export class Folder extends ControlPanelContainer {
  domElement: HTMLDetailsElement;
  contentElement: HTMLElement;
  summaryElement: HTMLElement;
  title: string;

  constructor(title: string) {
    super();
    this.title = title;

    this.domElement = createElement("details", {
      className: "cp-folder",
      open: true,
    });

    this.summaryElement = createElement(
      "summary",
      {
        className: "cp-summary",
      },
      [title],
    );
    this.domElement.appendChild(this.summaryElement);

    this.contentElement = createElement("div", {
      className: "cp-content cp-folder-content",
    });
    this.domElement.appendChild(this.contentElement);
  }
}

export class ControlPanel extends ControlPanelContainer {
  domElement: HTMLDetailsElement;
  summaryElement: HTMLElement;
  contentElement: HTMLElement;
  stats: Stats;
  private presetStoragePrefix: string;

  constructor(container?: HTMLElement, options: ControlPanelOptions = {}) {
    super();

    injectStyles();

    this.domElement = createElement("details", {
      className: "cp-root",
      open: true,
    });

    this.summaryElement = createElement("summary", {
      className: "cp-summary cp-summary-root",
    });
    this.domElement.appendChild(this.summaryElement);

    const titleSpan = createElement("span", {}, [
      options.title || "ControlPanel",
    ]);
    this.summaryElement.appendChild(titleSpan);

    this.stats = new Stats();
    this.summaryElement.appendChild(this.stats.domElement);

    // Drag functionality
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let panelStartX = 0;
    let panelStartY = 0;

    this.summaryElement.addEventListener("mousedown", (e) => {
      // Only drag if clicking on the summary itself, not the stats
      if (e.target !== this.summaryElement && e.target !== titleSpan) return;

      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      const rect = this.domElement.getBoundingClientRect();
      panelStartX = rect.left;
      panelStartY = rect.top;

      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;

      const newX = panelStartX + deltaX;
      const newY = panelStartY + deltaY;

      this.domElement.style.left = `${newX}px`;
      this.domElement.style.top = `${newY}px`;
      this.domElement.style.right = "auto";
      this.domElement.style.bottom = "auto";
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        this.savePositionAndSize();
      }
    });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (!isDragging) {
        this.savePositionAndSize();
      }
    });
    resizeObserver.observe(this.domElement);

    // Restore position and size from sessionStorage
    this.restorePositionAndSize();

    this.contentElement = createElement("div", { className: "cp-content" });
    this.domElement.appendChild(this.contentElement);

    // Permanent folders
    // Signals
    const signalsFolder = this.addFolder("_Signals");
    const singals = {
      audioInput: null,
      fftSize: 2048,
    };

    signalsFolder
      .addRadio(singals, "audioInput", {
        label: "Audio Signal",
        options: ["microphone", "browser"],
      })
      .onChange((value) => {
        audioSignals.setInput(value as any);
      });

    signalsFolder
      .addSelect(singals, "fftSize", {
        label: "FFT Size",
        options: [256, 512, 1024, 2048],
      })
      .onChange((value) => {
        audioSignals.setFFTSize(value as any);
      });

    signalsFolder
      .addRange(audioSignals, "smoothingTimeConstant", {
        min: 0,
        max: 0.99,
        step: 0.01,
        label: "Smoothing",
      })
      .onChange((value) => {
        audioSignals.analyser.smoothingTimeConstant = value;
      });

    signalsFolder.addRange(audioSignals, "spectrumBoost", {
      min: 1.0,
      max: 5.0,
      step: 0.1,
      label: "Compression",
    });

    if (container) {
      container.appendChild(this.domElement);
    } else {
      document.body.appendChild(this.domElement);
    }

    // Presets Manager
    const presetsTitle = options.title || "ControlPanel";
    this.presetStoragePrefix = `cp-presets-${presetsTitle}-`;

    // Presets Folder
    const presetsFolder = this.addFolder("_User Presets");

    // Scan localStorage for presets matching the prefix
    const scanPresets = (): string[] => {
      const found: string[] = ["Default"];
      if (typeof localStorage === "undefined") return found;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.presetStoragePrefix)) {
          const name = key.substring(this.presetStoragePrefix.length);
          if (name !== "Default" && !found.includes(name)) {
            found.push(name);
          }
        }
      }
      return found.sort();
    };

    const presetsState = {
      selected: "Default",
      save: () => {
        const name = prompt("Preset Name:", presetsState.selected);
        if (name) {
          if (name === "Default") {
            alert("Cannot overwrite Default preset");
            return;
          }
          // Save using consistent prefix
          const key = this.presetStoragePrefix + name;
          this.saveToLocalStorage(key);

          // Refresh list
          const list = scanPresets();
          presetSelect.setOptions(list);

          // Select new
          presetsState.selected = name;
          presetSelect.setValue(name);
        }
      },
      load: () => {
        const selectedPreset = presetsState.selected;
        const key = this.presetStoragePrefix + selectedPreset;
        this.loadFromLocalStorage(key);

        // Restore selection after load (prevents it from resetting to Default)
        presetsState.selected = selectedPreset;
        presetSelect.setValue(selectedPreset);
      },
      delete: () => {
        if (presetsState.selected === "Default") {
          alert("Cannot delete Default preset");
          return;
        }
        if (confirm(`Delete preset "${presetsState.selected}"?`)) {
          const key = this.presetStoragePrefix + presetsState.selected;
          localStorage.removeItem(key);

          // Refresh list
          const list = scanPresets();
          presetSelect.setOptions(list);

          // Reset selection
          presetsState.selected = "Default";
          presetSelect.setValue("Default");
          this.reset();
        }
      },
      export: () => {
        const state = this.save();

        // Filter out internal folders/controllers (prefixed with _)
        const filterUIState = (
          section: ControlPanelSectionState,
        ): ControlPanelSectionState => {
          const filtered: ControlPanelSectionState = {
            controllers: {},
            folders: {},
          };

          // Copy controllers that don't start with underscore
          for (const [key, value] of Object.entries(section.controllers)) {
            if (!key.startsWith("_")) {
              filtered.controllers[key] = value;
            }
          }

          // Recursively filter folders that don't start with underscore
          for (const [folderName, folderState] of Object.entries(
            section.folders,
          )) {
            if (!folderName.startsWith("_")) {
              filtered.folders[folderName] = filterUIState(folderState);
            }
          }

          return filtered;
        };

        const cleanedState = filterUIState(state);

        // Create export object with helpful metadata
        const exportData = {
          _presetName: presetsState.selected || "CustomPreset",
          _exportDate: new Date().toISOString(),
          _instructions:
            "To add as factory preset: Copy 'controllers' and 'folders' fields into the presets.json file",
          ...cleanedState,
        };

        // Format as readable JSON
        const json = JSON.stringify(exportData, null, 2);

        // Create downloadable file
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        // Filename: {controlPanelTitle}-preset-{presetName}-{timestamp}.json
        const timestamp = new Date().toISOString().split("T")[0];
        const sanitizedName = presetsState.selected
          .replace(/[^a-z0-9]/gi, "-")
          .toLowerCase();
        a.download = `${presetsTitle.toLowerCase()}-preset-${sanitizedName}-${timestamp}.json`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      import: () => {
        // Create hidden file input
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";

        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const json = event.target?.result as string;
              const data = JSON.parse(json);

              // Extract state (skip metadata fields starting with _)
              const state: ControlPanelSectionState = {
                controllers: data.controllers || {},
                folders: data.folders || {},
              };

              // Validate structure
              if (!state.controllers || !state.folders) {
                alert(
                  "Invalid preset file: missing 'controllers' or 'folders'",
                );
                return;
              }

              // Apply the preset
              this.load(state);

              // Optionally save to localStorage
              const name = data._presetName || "ImportedPreset";
              const shouldSave = confirm(
                `Preset loaded! Save as "${name}" to User Presets?`,
              );
              if (shouldSave) {
                const key = this.presetStoragePrefix + name;
                this.saveToLocalStorage(key);

                // Refresh list
                const list = scanPresets();
                presetSelect.setOptions(list);
                presetsState.selected = name;
                presetSelect.setValue(name);
              }
            } catch (error) {
              alert(
                `Failed to import preset: ${error instanceof Error ? error.message : "Invalid JSON"}`,
              );
              console.error("Import error:", error);
            }
          };

          reader.readAsText(file);
        };

        input.click();
      },
    };

    const initialPresets = scanPresets();
    const presetSelect = presetsFolder.addSelect(presetsState, "selected", {
      label: "Preset",
      options: initialPresets,
    });

    presetsFolder.addButton("Load", () => presetsState.load());
    presetsFolder.addButton("Save", () => presetsState.save());
    presetsFolder.addButton("Delete", () => presetsState.delete());
    presetsFolder.addButton("Export", () => presetsState.export());
    presetsFolder.addButton("Import", () => presetsState.import());
  }

  saveToLocalStorage(key: string) {
    const state = this.save();
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn("ControlPanel: Failed to save to localStorage", e);
    }
  }

  loadFromLocalStorage(key: string) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const state = JSON.parse(raw);
        this.load(state);
      }
    } catch (e) {
      console.warn("ControlPanel: Failed to load from localStorage", e);
    }
  }

  saveDefaultPreset() {
    // Save current state as "Default" preset
    // Should be called after all controllers are initialized
    const defaultKey = this.presetStoragePrefix + "Default";
    this.save();
    this.saveToLocalStorage(defaultKey);
  }

  private savePositionAndSize() {
    const rect = this.domElement.getBoundingClientRect();
    const key = `cp-position-${this.presetStoragePrefix}`;
    const state = {
      left: rect.left,
      top: rect.top,
      width: this.domElement.offsetWidth,
      height: this.domElement.offsetHeight,
    };
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save panel position/size", e);
    }
  }

  private restorePositionAndSize() {
    const key = `cp-position-${this.presetStoragePrefix}`;
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const state = JSON.parse(raw);
        this.domElement.style.left = `${state.left}px`;
        this.domElement.style.top = `${state.top}px`;
        this.domElement.style.right = "auto";
        this.domElement.style.bottom = "auto";
        this.domElement.style.width = `${state.width}px`;
        this.domElement.style.height = `${state.height}px`;
      }
    } catch (e) {
      console.warn("Failed to restore panel position/size", e);
    }
  }

  destroy() {
    this.stats.destroy();
    this.domElement.remove();
    this.controllers = [];
    this.folders = [];
  }
}
