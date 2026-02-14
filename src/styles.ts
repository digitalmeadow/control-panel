const styles = `
.cp-root {
  --cp-color-1: rgba(255, 255, 255, 0.15);
  --cp-color-2: rgba(255, 255, 255, 0.25);
  --cp-color-3: rgba(255, 255, 255, 0.35);
  --cp-color-4: rgba(255, 255, 255, 0.45);
  --cp-border-radius: 0px;
  --cp-swatch-size: 14px;
  --cp-font-size-main: 10px;
  --cp-font-size-details: 1.0em;
  --cp-font-weight-bold: 500;
  --cp-padding-v: 4px;
  
  position: absolute;
  top: 0;
  right: 0;
  width: min(280px, 90%);
  max-height: 90vh;
  overflow: auto;
  background: transparent;
  resize: both;
  color: #fff;
  min-width: 200px;
  min-height: 50px;
  font-family:
    var(--cp-font-family), monospace,
    sans-serif;
  font-size: var(--cp-font-size-main);
  line-height: 1;
  padding: 8px;
}

/* Apply blend mode to all children except color inputs */
.cp-root .cp-label, 
.cp-root .cp-setting-label,
.cp-root .cp-summary,
.cp-root .cp-controller-summary,
.cp-root .cp-separator,
.cp-root .cp-value-display,
.cp-root .cp-button,
.cp-root .cp-input-number,
.cp-root .cp-input-range,
.cp-root .cp-select,
.cp-root .cp-radio,
.cp-root .cp-checkbox
{
  mix-blend-mode: difference;
}

.cp-root .cp-input-color,
.cp-root .cp-color-swatch {
  mix-blend-mode: normal;
  isolation: isolate;
}

.cp-root:not([open]) .cp-summary-root {
  opacity: 0.5;
}

.cp-root::-webkit-scrollbar {
  width: 1px;
  height: 1px;
}
.cp-root::-webkit-scrollbar-track {
  background: transparent;
}
.cp-root::-webkit-scrollbar-thumb {
  background: var(--cp-color-4);
}

.cp-summary {
  cursor: pointer;
  user-select: none;
  font-weight: var(--cp-font-weight-bold);
  outline: none;
}

.cp-summary-root {
  position: sticky;
  top: 0;
  cursor: grab;
}

.cp-stats {
  float: right;
  font-weight: normal;
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
}

.cp-content {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cp-folder {
  width: 100%;
}

.cp-folder-content {
  margin: 0 0 6px 0;
  padding: 4px 0 0 0px;
}

.cp-controller {
  min-height: 18px;
  display: grid;
  grid-template-columns: 50% 50%;
  align-items: center;
}

.cp-label {
  margin: auto 0;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;
  padding-right: 8px;
  opacity: 0.8;
}

.cp-input-number {
  background: transparent;
  border: 1px solid var(--cp-color-2);
  color: inherit;
  padding: 2px 4px;
  border-radius: var(--cp-border-radius);
  font-family: inherit;
  font-size: inherit;
  height: 100%;
  box-sizing: border-box;
}
}

.cp-input-number:focus {
  outline: none;
  border-color: #fff;
  background: transparent;
}

.cp-select {
  color: inherit;
  background: var(--cp-color-1);
  border: none;
  padding: var(--cp-padding-v) 4px;
  padding-right: 18px;
  border-radius: var(--cp-border-radius);
  font-size: inherit;
  line-height: inherit;
  font-family: inherit;
  box-sizing: border-box;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%23fff' d='M1 2h6l-3 4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 4px center;
}

.cp-checkbox {
  margin: auto 0;
  width: 14px;
  height: 14px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  border: none !important;
  border-radius: var(--cp-border-radius);
  background: var(--cp-color-1) !important;
  cursor: pointer;
  padding: 0;
  outline: none;
  font-size: 0;
  line-height: 0;
  color: transparent;
}

.cp-checkbox:checked {
  background: var(--cp-color-3) !important;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 2 L8 8 M8 2 L2 8' stroke='%23fff' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  background-size: 8px 8px !important;
}

.cp-button {
  grid-column: 1 / -1;
  color: inherit;
  background: var(--cp-color-1);
  border: none;
  padding: var(--cp-padding-v) 2px;
  border-radius: var(--cp-border-radius);
  cursor: pointer;
  text-align: center;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

.cp-button:hover {
  background: var(--cp-color-2);
}

.cp-button:active {
  background: var(--cp-color-3);
  transform: translateY(1px);
}

.cp-controller[data-disabled="true"] {
  color: var(--cp-color-1);
  pointer-events: none;
}

.cp-controller-details {
}

.cp-controller-summary {
  cursor: pointer;
  outline: none;
}

.cp-controller-summary-content {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: calc(100% - 10px);
  min-height: 18px;
  vertical-align: middle;
}

.cp-input-range {
  -webkit-appearance: none;
  flex: 1;
  min-width: 0;
  height: 2px;
  background: var(--cp-color-1);
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
  font-size: var(--cp-font-size-details);
  opacity: 0.8;
  user-select: none;
}

.cp-number-settings {
  margin-top: 4px;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cp-separator {
  border: none;
  border-top: 1px solid var(--cp-color-1);
  margin: 4px 0;
  width: 100%;
}

.cp-setting-row {
  display: grid;
  grid-template-columns: 50% 50%;
  align-items: center;
  gap: 2px;
}

.cp-array-row {
  display: grid;
  grid-template-columns: 50% 50%;
  align-items: stretch;
  gap: 2px;
}

.cp-gradient-stop {
  display: grid;
  grid-template-columns: 50% 50%;
  align-items: stretch;
  gap: 2px;
}

.cp-setting-label {
  font-size: var(--cp-font-size-details);
  opacity: 0.7;
}

.cp-input-small {
}

.cp-radios {
  display: flex;
  gap: 2px;
}

.cp-radio {
  flex: 1;
  font-size: var(--cp-font-size-details);
  padding: var(--cp-padding-v) 2px;
}

.cp-radio[data-active="true"] {
  background: var(--cp-color-3);
  border-color: #fff;
  font-weight: var(--cp-font-weight-bold);
}

.cp-button-delete {
  grid-column: auto;
  width: 24px;
  padding: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
  line-height: 1;
  height: 100%;
}

.cp-input-color {
  width: var(--cp-swatch-size);
  height: var(--cp-swatch-size);
  border: 1px solid var(--cp-color-1);
  -webkit-appearance: none;
}
.cp-input-color::-webkit-color-swatch-wrapper {
  padding: 0;
}
.cp-input-color::-webkit-color-swatch {
  border: none;
  border-radius: var(--cp-border-radius);
}

.cp-checkbox {
  margin: auto 0;
  width: 14px;
  height: 14px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  border: 1px solid var(--cp-color-1);
  border-radius: var(--cp-border-radius);
  background: transparent;
  cursor: pointer;
  padding: 0;
  outline: none;
  font-size: 0;
  line-height: 0;
  color: transparent;
  vertical-align: middle;
  display: inline-block;
  box-sizing: border-box;
}

.cp-checkbox:checked {
  background: var(--cp-color-1);
}

.cp-color-swatch {
  width: var(--cp-swatch-size);
  height: var(--cp-swatch-size);
  margin-right: 8px;
}

.cp-stops-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
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
