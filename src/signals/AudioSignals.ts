import { clamp, map_range } from "../utils/math";

export type AudioInputType = "microphone" | "browser";

export class AudioSignals {
  ctx: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  source: MediaStreamAudioSourceNode | null = null;
  stream: MediaStream | null = null;

  fftSize = 2048;

  dataArray: Uint8Array<ArrayBuffer> = new Uint8Array(1024);
  waveformArray: Uint8Array<ArrayBuffer> = new Uint8Array(1024);

  smoothingTimeConstant = 0.82;
  spectrumBoost = 3.0; // Frequency-dependent boost (1.0 = off, higher = more balanced)

  // Normalized values 0-1
  levels = {
    volume: 0,
    bass: 0,
    mids: 0,
    highs: 0,
  };

  peaks = {
    volume: 0,
    bass: 0,
    mids: 0,
    highs: 0,
  };

  private _isAnalyzing = false;

  private initialized = false;

  // deferred so importing the package never constructs an AudioContext
  ensureInit() {
    if (this.initialized) return;
    this.initialized = true;

    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = this.fftSize;
    analyser.smoothingTimeConstant = this.smoothingTimeConstant;

    this.ctx = ctx;
    this.analyser = analyser;
    this.dataArray = new Uint8Array(analyser.frequencyBinCount);
    this.waveformArray = new Uint8Array(analyser.frequencyBinCount);
  }

  setFFTSize(size: 256 | 512 | 1024 | 2048) {
    this.fftSize = size;
    if (!this.analyser) return; // applied on init
    this.analyser.fftSize = size;
    // Recreate arrays with new size
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.waveformArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  setSmoothing(value: number) {
    this.smoothingTimeConstant = value;
    if (this.analyser) this.analyser.smoothingTimeConstant = value;
  }

  async setInput(type: AudioInputType) {
    this.ensureInit();
    const ctx = this.ctx!;
    const analyser = this.analyser!;

    try {
      let streamPromise: Promise<MediaStream>;

      if (type === "browser") {
        // Browser
        streamPromise = navigator.mediaDevices.getDisplayMedia({
          audio: true,
          video: true,
        });
      } else {
        // Microphone
        streamPromise = navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      }

      const newStream = await streamPromise;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Cleanup old stream
      if (this.source) {
        this.source.disconnect();
      }
      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
      }

      this.stream = newStream;
      this.source = ctx.createMediaStreamSource(this.stream);
      this.source.connect(analyser);
      this._isAnalyzing = true;
      this.loop();
    } catch (err) {
      console.error("Error accessing audio input:", err);
      this._isAnalyzing = false;
    }
  }

  loop = () => {
    if (!this._isAnalyzing) return;
    requestAnimationFrame(this.loop);
    this.update();
  };

  update() {
    if (!this.analyser) return;
    this.analyser.getByteFrequencyData(this.dataArray);
    this.analyser.getByteTimeDomainData(this.waveformArray);

    // Apply frequency-dependent scaling to balance spectrum
    if (this.spectrumBoost !== 1.0) {
      const binCount = this.dataArray.length;
      for (let i = 0; i < binCount; i++) {
        // Calculate scaling multiplier that increases with frequency
        // Low frequencies (i=0) get divided more, high frequencies get boosted
        const frequencyPosition = i / binCount; // 0 to 1
        const multiplier = 1.0 + frequencyPosition * (this.spectrumBoost - 1.0);

        // Apply multiplier and clamp to valid range
        this.dataArray[i] = Math.min(255, this.dataArray[i] * multiplier);
      }
    }

    // Simple averaging for bands
    const bassRange = [2, 10];
    const midsRange = [10, 150];
    const highsRange = [150, 600];

    // Get raw 0-1 values
    const rawBass = this.getAverage(bassRange[0], bassRange[1]);
    const rawMids = this.getAverage(midsRange[0], midsRange[1]);
    const rawHighs = this.getAverage(highsRange[0], highsRange[1]);
    const rawVolume = this.getAverage(0, highsRange[1]);

    // Normalize against dynamic peaks
    this.processLevel("bass", rawBass);
    this.processLevel("mids", rawMids);
    this.processLevel("highs", rawHighs);
    this.processLevel("volume", rawVolume);
  }

  private processLevel(key: keyof typeof this.levels, rawValue: number) {
    // Slowly reduce peak over time to adapt to lower volumes
    this.peaks[key] -= 0.0005;

    // Clamp peak to a reasonable minimum to pick up quiet signals
    this.peaks[key] = clamp(this.peaks[key], 0.1, 1.0);

    // Update peak if current value is higher
    if (rawValue > this.peaks[key]) {
      this.peaks[key] = rawValue;
    }

    // Normalize value based on dynamic peak
    this.levels[key] = clamp(
      map_range(rawValue, [0, this.peaks[key]], [0, 1]),
      0,
      1,
    );
  }

  private getAverage(start: number, end: number): number {
    let sum = 0;
    const count = end - start;
    if (count <= 0) return 0;

    for (let i = start; i < end; i++) {
      sum += this.dataArray[i];
    }
    // Normalize 0-255 to 0-1
    return sum / count / 255;
  }

  getSignal(type: "bass" | "mids" | "highs" | "volume") {
    return () => this.levels[type];
  }
}

export const audioSignals = new AudioSignals();
