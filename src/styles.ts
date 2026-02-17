const fontRegular = new URL(
  "./fonts/IosevkaTermNF-Regular.woff2",
  import.meta.url,
).href;
const fontSemiBold = new URL(
  "./fonts/IosevkaTermNFP-SemiBold.woff2",
  import.meta.url,
).href;

const styles = `
@font-face {
  font-family: "IosevkaTermNF";
  src: url("${fontRegular}") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "IosevkaTermNF";
  src: url("${fontSemiBold}") format("woff2");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

.cp-root {
  --cp-scale: 1;
  
  --cp-space-1: calc(1px * var(--cp-scale));
  --cp-space-2: calc(2px * var(--cp-scale));
  --cp-space-4: calc(4px * var(--cp-scale));
  --cp-space-6: calc(6px * var(--cp-scale));
  --cp-space-8: calc(8px * var(--cp-scale));
  
  --cp-border-width: calc(1px * var(--cp-scale));

  --cp-font-size-main: calc(10px * var(--cp-scale));
  --cp-font-size-details: calc(10px * var(--cp-scale));
  
  --cp-swatch-size: calc(14px * var(--cp-scale));
  --cp-controller-min-height: calc(18px * var(--cp-scale));
  --cp-button-delete-width: calc(18px * var(--cp-scale));
  --cp-icon-size: calc(8px * var(--cp-scale));
  --cp-icon-position: calc(4px * var(--cp-scale));
  --cp-select-arrow-space: calc(14px * var(--cp-scale));
  
  --cp-color-1: rgba(255, 255, 255, 0.15);
  --cp-color-2: rgba(255, 255, 255, 0.25);
  --cp-color-3: rgba(255, 255, 255, 0.35);
  --cp-color-4: rgba(255, 255, 255, 0.45);
  --cp-border-radius: 0px;
  --cp-font-weight-bold: 600;
  --cp-padding-v: calc(4px * var(--cp-scale));
  
  position: absolute;
  top: 0;
  right: 0;

  width: min(280px, 90%);
  padding: var(--cp-space-8);
  max-height: 90vh;
  min-width: calc(200px * var(--cp-scale));
  min-height: calc(50px * var(--cp-scale));
  overflow: auto;
  resize: both;

  color: #fff;
  background: transparent;

  font-family:
    var(--cp-font-family), monospace,
    sans-serif;
  font-size: var(--cp-font-size-main);
  line-height: 1.1;
}

/* Apply blend mode to selected children except color inputs */
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
  mix-blend-mode: exclusion;
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
  width: var(--cp-space-1);
  height: var(--cp-space-1);
}
.cp-root::-webkit-scrollbar-track {
  background: transparent;
}
.cp-root::-webkit-scrollbar-thumb {
  background: #777;
}

.cp-summary {
  font-weight: var(--cp-font-weight-bold);
  outline: none;
  cursor: pointer;
  user-select: none;
}

.cp-summary-root {
  position: sticky;
  top: 0;
  cursor: grab;
}

.cp-stats {
  float: right;
  font-weight: normal;
  font-variant-numeric: tabular-nums;
  opacity: 0.5;
}

.cp-content {
  margin-top: var(--cp-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--cp-space-2);
}

.cp-folder {
  width: 100%;
}

.cp-folder-content {
  padding: var(--cp-space-4) 0 0 0;
}

.cp-controller {
  min-height: var(--cp-controller-min-height);
  display: grid;
  grid-template-columns: 50% 50%;
  align-items: center;
}

.cp-label {
  margin: auto 0;
  flex-shrink: 0;
  padding-right: var(--cp-space-8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;
}

.cp-input-number {
  padding: var(--cp-space-2) var(--cp-space-4);
  background: transparent;
  color: inherit;
  border: var(--cp-border-width) solid var(--cp-color-2);
  border-radius: var(--cp-border-radius);
  font-family: inherit;
  font-size: inherit;
  appearance: textfield;
  -moz-appearance: textfield;
}

.cp-input-number::-webkit-outer-spin-button,
.cp-input-number::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.cp-input-number::-moz-number-spin-up,
.cp-input-number::-moz-number-spin-down {
  display: none;
}

.cp-input-number:focus {
  outline: none;
  background: transparent;
  border-color: #fff;
}

.cp-select {
  padding: var(--cp-padding-v) var(--cp-space-4);
  padding-right: calc(var(--cp-space-4) + var(--cp-select-arrow-space));
  color: inherit;
  background: var(--cp-color-1);
  border: none;
  border-radius: var(--cp-border-radius);
  font-size: inherit;
  line-height: inherit;
  font-family: inherit;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%23fff' d='M1 2h6l-3 4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--cp-icon-position) center;
  background-size: var(--cp-icon-size) var(--cp-icon-size);
}

.cp-checkbox {
  margin: auto 0;
  box-sizing: border-box;
  width: var(--cp-swatch-size);
  height: var(--cp-swatch-size);
  padding: 0;
  display: inline-block;
  vertical-align: middle;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  color: transparent;
  background: transparent;
  border: var(--cp-border-width) solid var(--cp-color-2);
  border-radius: var(--cp-border-radius);
  outline: none;
  font-size: 0;
  line-height: 0;
  cursor: pointer;
}

.cp-checkbox:checked {
  background: transparent;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='var(--cp-swatch-size)' height='var(--cp-swatch-size)' viewBox='0 0 8 8'%3E%3Ccircle cx='4' cy='4' r='2' fill='%23fff'/%3E%3C/svg%3E");
}

.cp-button {
  grid-column: 1 / -1;
  padding: var(--cp-padding-v) var(--cp-space-2);
  color: inherit;
  background: var(--cp-color-1);
  border: none;
  border-radius: var(--cp-border-radius);
  text-align: center;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  cursor: pointer;
}

.cp-button:hover {
  background: var(--cp-color-2);
}

.cp-button:active {
  background: var(--cp-color-3);
  transform: translateY(var(--cp-space-1));
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
  width: calc(100% - 2ch);
  min-height: var(--cp-controller-min-height);
  vertical-align: middle;
  display: inline-flex;
  align-items: center;
  gap: var(--cp-space-2);
}

.cp-input-range {
  flex: 1;
  margin: 0;
  vertical-align: middle;
  min-width: 0;
  height: calc(2px * var(--cp-scale));
  -webkit-appearance: none;
  background: var(--cp-color-1);
  cursor: grab;
}
.cp-input-range::-webkit-slider-thumb {
  width: calc(4px * var(--cp-scale));
  height: calc(8px * var(--cp-scale));
  -webkit-appearance: none;
  background: #fff;
  border-radius: var(--cp-border-radius);
  cursor: grab;
}
.cp-input-range::-moz-range-thumb {
  width: calc(4px * var(--cp-scale));
  height: calc(8px * var(--cp-scale));
  background: #fff;
  border: none;
  border-radius: var(--cp-border-radius);
  appearance: none;
  cursor: grab;
}

.cp-input-range:active {
  cursor: grabbing;
}

.cp-value-display {
  min-width: calc(24px * var(--cp-scale));
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-size: var(--cp-font-size-details);
  user-select: none;
}

.cp-number-settings {
  display: flex;
  flex-direction: column;
  gap: var(--cp-space-2);
  background: transparent;
}

.cp-separator {
  margin: var(--cp-space-4) 0;
  width: 100%;
  border: none;
  border-top: var(--cp-border-width) solid var(--cp-color-1);
}

.cp-setting-row {
  display: grid;
  grid-template-columns: calc(50% - (var(--cp-space-2) / 2)) calc(50% - (var(--cp-space-2) / 2));
  align-items: center;
  gap: var(--cp-space-2);
}

.cp-array-row {
  display: grid;
  grid-template-columns: auto 1fr; 
  align-items: stretch;
  gap: var(--cp-space-2);
}

.cp-gradient-stop {
  display: grid;
  grid-template-columns: 50% 50%;
  align-items: stretch;
  gap: var(--cp-space-2);
}

.cp-gradient-stop-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--cp-space-2);
}

.cp-setting-label {
  font-size: var(--cp-font-size-details);
}

.cp-radios {
  display: flex;
  gap: var(--cp-space-2);
  flex-wrap: wrap;
}

.cp-radio {
  flex: 1;
  padding: var(--cp-padding-v) var(--cp-space-2);
  font-size: var(--cp-font-size-details);
}

.cp-radio[data-active="true"] {
  background: var(--cp-color-3);
  border-color: #fff;
  font-weight: var(--cp-font-weight-bold);
}

.cp-button-delete {
  grid-column: auto;
  width: 100%;
  min-width: var(--cp-button-delete-width);
  height: 100%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.cp-input-color {
  width: var(--cp-swatch-size);
  height: var(--cp-swatch-size);
  border: var(--cp-border-width) solid #BBB;
  border-radius: 50%;
  appearance: none;
  -webkit-appearance: none;
  background: none;
  padding: 0;
}
.cp-input-color::-webkit-color-swatch-wrapper {
  padding: 0;
}
.cp-input-color::-webkit-color-swatch {
  border: 1px solid var(--cp-color-1);
  border-radius: 50%;
}
.cp-input-color::-moz-color-swatch {
  border: 1px solid var(--cp-color-1);
  border-radius: 50%;
}

.cp-color-swatch {
  margin-right: var(--cp-space-8);
  width: var(--cp-swatch-size);
  height: var(--cp-swatch-size);
}

.cp-stops-container {
  display: flex;
  flex-direction: column;
  gap: var(--cp-space-2);
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
