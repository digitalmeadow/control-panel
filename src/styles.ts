const styles = `
.cp-root {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 280px;
  max-height: 90vh;
  overflow: auto;
  background: transparent;
  color: #fff;
  mix-blend-mode: exclusion;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
  font-size: 10px;
  line-height: 1.2;
  padding: 8px;
  z-index: 100;
}

.cp-root::-webkit-scrollbar {
  width: 1px;
}
.cp-root::-webkit-scrollbar-track {
  background: transparent;
}
.cp-root::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.5);
}

.cp-summary {
  cursor: pointer;
  user-select: none;
  font-weight: bold;
  outline: none;
}

.cp-summary-root {
  position: sticky;
  top: 0;
}

.cp-stats {
  float: right;
  font-weight: normal;
  opacity: 0.6;
  font-size: 0.9em;
  font-variant-numeric: tabular-nums;
}

.cp-content {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cp-folder {
  width: 100%;
}

.cp-folder-content {
  margin: 0 0 6px 0;
  padding: 4px 0 0 9px;
}

.cp-controller {
  display: flex;
}

.cp-label {
  margin: auto 0;
  width: 50%;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;
  padding-right: 8px;
  opacity: 0.8;
}

.cp-input-number {
  width: 50%;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: inherit;
  padding: 2px 4px;
  border-radius: 2px;
  font-family: inherit;
  font-size: inherit;
}

.cp-input-number:focus {
  outline: none;
  border-color: #fff;
  background: transparent;
}

.cp-select {
  width: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  padding: 2px 4px;
  border-radius: 2px;
  font-family: inherit;
  font-size: inherit;
}

.cp-checkbox {
  margin: auto 0;
}

.cp-button {
  width: 100%;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  padding: 4px 2px;
  border-radius: 2px;
  cursor: pointer;
  text-align: center;
  font-family: inherit;
  font-size: inherit;
  transition: background 0.1s;
}

.cp-button:hover {
  background: rgba(255, 255, 255, 0.4);
}

.cp-button:active {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(1px);
}

.cp-controller[data-disabled="true"] {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}

.cp-controller-details {
  width: 50%;
}

.cp-controller-summary {
  cursor: pointer;
  outline: none;
}

.cp-controller-summary-content {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: calc(100% - 16px);
  vertical-align: middle;
}

.cp-input-range {
  -webkit-appearance: none;
  flex: 1;
  min-width: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0;
  vertical-align: middle;
  cursor: grab;
}
.cp-input-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 4px;
  height: 8px;
  border-radius: 1px;
  background: #fff;
  cursor: grab;
}
.cp-input-range::-moz-range-thumb {
  width: 4px;
  height: 16px;
  background: #fff;
  cursor: grab;
}

.cp-input-range:active {
  cursor: grabbing;
}

.cp-value-display {
  min-width: 24px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-size: 0.9em;
  opacity: 0.8;
  user-select: none;
}

.cp-number-settings {
  margin-top: 4px;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cp-separator {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  margin: 4px 0;
  width: 100%;
}

.cp-setting-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cp-setting-label {
  width: 50%;
  font-size: 0.9em;
  opacity: 0.7;
}

.cp-input-small {
  width: 50%;
}

.cp-radios {
  width: 50%;
  display: flex;
  gap: 2px;
}

.cp-radio {
  flex: 1;
  font-size: 0.9em;
  padding: 4px 2px;
  height: 100%;
}

.cp-radio[data-active="true"] {
  background: rgba(255, 255, 255, 0.2);
  border-color: #fff;
  font-weight: bold;
}

.cp-button-delete {
  width: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.cp-input-color {
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  outline: none;

  isolation: isolate;
  mix-blend-mode: normal;
  cursor: pointer;
}

.cp-color-swatch {
  width: 10px;
  height: 10px;
  margin-right: 8px;
}

.cp-stops-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
`;

let stylesInjected = false;

export function injectStyles() {
  if (stylesInjected) return;

  const styleElement = document.createElement("style");
  styleElement.id = "control-panel-styles";
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);

  stylesInjected = true;
}
