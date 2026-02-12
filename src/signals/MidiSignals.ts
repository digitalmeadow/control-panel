export class MidiSignals {
  midiAccess: any = null;
  values: Map<string, number> = new Map();
  isListening = false;
  resolveListen: ((id: string) => void) | null = null;
  listeningCallback: (() => void) | null = null;

  constructor() {
    this.init();
  }

  async init() {
    if (
      typeof navigator !== "undefined" &&
      (navigator as any).requestMIDIAccess
    ) {
      try {
        this.midiAccess = await (navigator as any).requestMIDIAccess();
        this.setupInputs();

        this.midiAccess.onstatechange = (e: any) => {
          if (e.port.type === "input" && e.port.state === "connected") {
            this.setupInputs();
          }
        };
      } catch (err) {
        console.warn("MIDI Access failed", err);
      }
    }
  }

  setupInputs() {
    if (!this.midiAccess) return;
    const inputs = this.midiAccess.inputs.values();
    for (const input of inputs) {
      input.onmidimessage = this.handleMessage.bind(this);
    }
  }

  handleMessage(message: any) {
    const data = message.data;
    const [status] = data;
    const type = status & 0xf0;
    // const channel = status & 0x0f;

    // Filter out clock/active sensing if needed
    if (type >= 0xf0) return;

    const id = this.getIdFromMessage(message);
    const value = this.normalizeValue(data);

    this.values.set(id, value);

    if (this.isListening && this.resolveListen) {
      // Don't learn note-off (0) as the primary trigger if possible,
      // but usually for learning we just take the first event.
      // Better UX: Wait for a non-zero value for CC, or NoteOn.
      if (value > 0) {
        this.resolveListen(id);
        this.isListening = false;
        this.resolveListen = null;
        if (this.listeningCallback) this.listeningCallback();
      }
    }
  }

  getIdFromMessage(message: any) {
    const data = message.data;
    const [status, data1] = data;
    const type = status & 0xf0;
    const name = message.currentTarget.name || "unknown";

    const eventType = type === 0x90 || type === 0x80 ? "note" : "ctrl";

    // Format: [number]_[type]_[device]
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, "");
    return `${data1}_${eventType}_${cleanName}`;
  }

  normalizeValue(data: Uint8Array) {
    const [status, data1, data2] = data;
    const type = status & 0xf0;

    if (type === 0x90) {
      // Note On
      return data2 > 0 ? 1 : 0; // Velocity > 0 is on
    } else if (type === 0x80) {
      // Note Off
      return 0;
    } else if (type === 0xb0) {
      // Control Change
      return data2 / 127;
    }
    return 0;
  }

  listen(): Promise<string> {
    // If already listening, cancel previous?
    this.isListening = true;
    return new Promise((resolve) => {
      this.resolveListen = resolve;
    });
  }

  cancelListen() {
    this.isListening = false;
    this.resolveListen = null;
  }

  getSignal(id: string) {
    return () => this.values.get(id) ?? 0;
  }
}

export const midiSignals = new MidiSignals();
