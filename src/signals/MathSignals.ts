export type MathSignalType =
  | "constant"
  | "sine"
  | "sawtooth"
  | "triangle"
  | "square"
  | "random";

export interface MathSignalConfig {
  frequency: number; // Hz or cycles per second
  amplitude: number; // 0-1, multiplier for output
  offset: number; // 0-1, adds to output
  phase: number; // 0-1, shifts the wave
}

export class MathSignals {
  private startTime: number;
  private configs: Map<MathSignalType, MathSignalConfig> = new Map();
  private lastRandomUpdateTime = 0;
  private currentRandomValue = 0;

  constructor() {
    this.startTime = performance.now();

    // Default configurations
    this.configs.set("constant", {
      frequency: 0.1, // Units per second
      amplitude: 1.0,
      offset: 0.0,
      phase: 0.0,
    });
    this.configs.set("sine", {
      frequency: 0.1,
      amplitude: 1.0,
      offset: 0.0,
      phase: 0.0,
    });
    this.configs.set("sawtooth", {
      frequency: 0.1,
      amplitude: 1.0,
      offset: 0.0,
      phase: 0.0,
    });
    this.configs.set("triangle", {
      frequency: 0.1,
      amplitude: 1.0,
      offset: 0.0,
      phase: 0.0,
    });
    this.configs.set("square", {
      frequency: 0.1,
      amplitude: 1.0,
      offset: 0.0,
      phase: 0.0,
    });
    this.configs.set("random", {
      frequency: 10.0, // Updates per second
      amplitude: 1.0,
      offset: 0.0,
      phase: 0.0,
    });
  }

  setConfig(type: MathSignalType, config: Partial<MathSignalConfig>) {
    const current = this.configs.get(type)!;
    this.configs.set(type, { ...current, ...config });
  }

  getConfig(type: MathSignalType): MathSignalConfig {
    return { ...this.configs.get(type)! };
  }

  private getTime(): number {
    return (performance.now() - this.startTime) / 1000; // seconds
  }

  private normalizeOutput(value: number, config: MathSignalConfig): number {
    const scaled = value * config.amplitude + config.offset;
    return Math.max(0, Math.min(1, scaled)); // Clamp to 0-1
  }

  constant(config?: Partial<MathSignalConfig>): number {
    const cfg = config
      ? { ...this.configs.get("constant")!, ...config }
      : this.configs.get("constant")!;
    const t = this.getTime();
    const value = (t * cfg.frequency) % 1.0;
    return this.normalizeOutput(value, cfg);
  }

  sine(config?: Partial<MathSignalConfig>): number {
    const cfg = config
      ? { ...this.configs.get("sine")!, ...config }
      : this.configs.get("sine")!;
    const t = this.getTime();
    const phase = cfg.phase * Math.PI * 2;
    const value = Math.sin(t * cfg.frequency * Math.PI * 2 + phase);
    // Convert -1 to 1 range to 0 to 1
    const normalized = (value + 1) / 2;
    return this.normalizeOutput(normalized, cfg);
  }

  sawtooth(config?: Partial<MathSignalConfig>): number {
    const cfg = config
      ? { ...this.configs.get("sawtooth")!, ...config }
      : this.configs.get("sawtooth")!;
    const t = this.getTime();
    const phaseShift = cfg.phase;
    const value = ((t * cfg.frequency + phaseShift) % 1.0) + (phaseShift % 1.0);
    return this.normalizeOutput(value % 1.0, cfg);
  }

  triangle(config?: Partial<MathSignalConfig>): number {
    const cfg = config
      ? { ...this.configs.get("triangle")!, ...config }
      : this.configs.get("triangle")!;
    const t = this.getTime();
    const phaseShift = cfg.phase;
    const rawValue = (t * cfg.frequency + phaseShift) % 1.0;
    // Triangle: goes up 0->1 then down 1->0
    const value = rawValue < 0.5 ? rawValue * 2 : 2 - rawValue * 2;
    return this.normalizeOutput(value, cfg);
  }

  square(config?: Partial<MathSignalConfig>): number {
    const cfg = config
      ? { ...this.configs.get("square")!, ...config }
      : this.configs.get("square")!;
    const t = this.getTime();
    const phaseShift = cfg.phase;
    const rawValue = (t * cfg.frequency + phaseShift) % 1.0;
    const value = rawValue < 0.5 ? 0 : 1;
    return this.normalizeOutput(value, cfg);
  }

  random(config?: Partial<MathSignalConfig>): number {
    const cfg = config
      ? { ...this.configs.get("random")!, ...config }
      : this.configs.get("random")!;
    const now = performance.now();
    const interval = 1000 / cfg.frequency; // Convert frequency to ms interval

    if (now - this.lastRandomUpdateTime > interval) {
      this.currentRandomValue = Math.random();
      this.lastRandomUpdateTime = now;
    }

    return this.normalizeOutput(this.currentRandomValue, cfg);
  }

  getSignal(type: MathSignalType) {
    switch (type) {
      case "constant":
        return () => this.constant();
      case "sine":
        return () => this.sine();
      case "sawtooth":
        return () => this.sawtooth();
      case "triangle":
        return () => this.triangle();
      case "square":
        return () => this.square();
      case "random":
        return () => this.random();
    }
  }

  reset() {
    this.startTime = performance.now();
    this.lastRandomUpdateTime = 0;
    this.currentRandomValue = 0;
  }
}

export const mathSignals = new MathSignals();
