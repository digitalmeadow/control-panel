import { createElement } from "./utils/dom";

export class Stats {
  domElement: HTMLElement;
  frames = 0;
  pollingInterval = 1000;
  prevTime = performance.now();
  rafId: number;

  constructor() {
    this.domElement = createElement("span", { className: "cp-stats" });
    this.rafId = requestAnimationFrame(this.render);
  }

  render = () => {
    this.frames++;
    const time = performance.now();

    if (time >= this.prevTime + this.pollingInterval) {
      const fps = Math.round((this.frames * 1000) / (time - this.prevTime));

      let mem = "";
      const memory = (performance as any).memory;
      if (memory) {
        mem = ` / ${Math.round(memory.usedJSHeapSize / 1048576)}MB`;
      }

      this.domElement.textContent = `${fps} FPS${mem}`;

      this.prevTime = time;
      this.frames = 0;
    }

    this.rafId = requestAnimationFrame(this.render);
  };

  destroy() {
    cancelAnimationFrame(this.rafId);
  }
}
