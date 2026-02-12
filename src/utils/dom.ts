export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Record<string, string | number | boolean | object> = {},
  children: (string | HTMLElement)[] = [],
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);

  for (const [key, val] of Object.entries(attributes)) {
    if (key === "className") {
      el.className = String(val);
    } else if (key === "style" && typeof val === "object") {
      Object.assign(el.style, val);
    } else if (key === "open" && typeof val === "boolean") {
      if (val) {
        el.setAttribute("open", "");
      } else {
        el.removeAttribute("open");
      }
    } else if (typeof val !== "object") {
      el.setAttribute(key, String(val));
    }
  }

  for (const child of children) {
    if (typeof child === "string") {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  }

  return el;
}

export function createDeleteButton(onClick: () => void): HTMLButtonElement {
  const button = createElement(
    "button",
    {
      className: "cp-button cp-button-delete",
    },
    ["×"],
  );
  button.addEventListener("click", onClick);
  return button;
}
