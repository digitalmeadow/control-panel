import { clamp, map_range } from "../utils/math";

export type AudioInputType = "microphone" | "browser";

export class AudioSignals {
  ctx: AudioContext;
  analyser: AnalyserNode;
  source: MediaStreamAudioSourceNode | null = null;
  stream: MediaStream | null = null;

  fftSize = 2048;
  dataArray: Uint8Array<ArrayBuffer>;
  waveformArray: Uint8Array<ArrayBuffer>;

  // Spectrum normalization parameters
  smoothingTimeConstant = 0.92;
  spectrumBoost = 2.0; // Frequency-dependent boost (1.0 = off, higher = more balanced)

  // Normalized values 0-1
  levels = {
    bass: 0,
    mids: 0,
    highs: 0,
    volume: 0,
  };

  peaks = {
    bass: 0,
    mids: 0,
    highs: 0,
    volume: 0,
  };

  private _isAnalyzing = false;

  constructor() {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = this.fftSize;
    this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.waveformArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  setFFTSize(size: 256 | 512 | 1024 | 2048) {
    this.fftSize = size;
    this.analyser.fftSize = size;
    // Recreate arrays with new size
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.waveformArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  async setInput(type: AudioInputType) {
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

      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      // Cleanup old stream
      if (this.source) {
        this.source.disconnect();
      }
      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
      }

      this.stream = newStream;
      this.source = this.ctx.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);
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
