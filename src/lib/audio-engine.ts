export type BeatCallback = (bpm: number, beatCount: number) => void;

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private _frequencyData: Uint8Array<ArrayBuffer> = new Uint8Array(0);
  private _timeDomainData: Uint8Array<ArrayBuffer> = new Uint8Array(0);

  // Smoothed values
  private _smoothBass = 0;
  private _smoothMids = 0;
  private _smoothHighs = 0;
  private _smoothVolume = 0;

  // Beat detection
  private _beatCallbacks: BeatCallback[] = [];
  private _energyHistory: number[] = [];
  private _beatTimes: number[] = [];
  private _lastBeatTime = 0;
  private _beatCount = 0;
  private _bpm = 0;
  private _isBeat = false;
  private _beatCooldownMs = 120; // min ms between beats (~200bpm max)
  private _beatThreshold = 1.3; // energy must exceed avg * threshold

  get frequencyData(): Uint8Array<ArrayBuffer> { return this._frequencyData; }
  get timeDomainData(): Uint8Array<ArrayBuffer> { return this._timeDomainData; }
  get isActive(): boolean { return this.audioContext !== null && this.audioContext.state === "running"; }
  get bass(): number { return this._smoothBass; }
  get mids(): number { return this._smoothMids; }
  get highs(): number { return this._smoothHighs; }
  get volume(): number { return this._smoothVolume; }
  get bpm(): number { return this._bpm; }
  get beatCount(): number { return this._beatCount; }
  get isBeat(): boolean { return this._isBeat; }

  onBeat(cb: BeatCallback) {
    this._beatCallbacks.push(cb);
    return () => {
      this._beatCallbacks = this._beatCallbacks.filter((c) => c !== cb);
    };
  }

  setBeatThreshold(value: number) {
    this._beatThreshold = Math.max(1.05, Math.min(3, value));
  }

  async startMicrophone(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.initAnalyser();
    } catch (err) {
      console.error("Failed to access microphone:", err);
      throw err;
    }
  }

  async startSystemAudio(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true,
      });
      stream.getVideoTracks().forEach((t) => t.stop());
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error("No audio track captured. Share a tab with audio.");
      }
      this.stream = new MediaStream(audioTracks);
      this.initAnalyser();
    } catch (err) {
      console.error("Failed to capture system audio:", err);
      throw err;
    }
  }

  private initAnalyser() {
    if (!this.stream) return;
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.source.connect(this.analyser);
    const bufferLength = this.analyser.frequencyBinCount;
    this._frequencyData = new Uint8Array(bufferLength);
    this._timeDomainData = new Uint8Array(bufferLength);
  }

  setSmoothing(value: number) {
    if (this.analyser) {
      this.analyser.smoothingTimeConstant = Math.max(0, Math.min(1, value));
    }
  }

  update() {
    if (!this.analyser) return;
    this.analyser.getByteFrequencyData(this._frequencyData);
    this.analyser.getByteTimeDomainData(this._timeDomainData);

    const lerp = 0.15;
    this._smoothBass += (this.getRawBass() - this._smoothBass) * lerp;
    this._smoothMids += (this.getRawMids() - this._smoothMids) * lerp;
    this._smoothHighs += (this.getRawHighs() - this._smoothHighs) * lerp;
    this._smoothVolume += (this.getRawVolume() - this._smoothVolume) * lerp;

    this.detectBeat();
  }

  private detectBeat() {
    // Use bass + low-mids energy for beat detection (kick drums live here)
    const energy = this.getAverageFrequency(0, 0.12);
    this._isBeat = false;

    // Rolling window of energy values (~0.4s at 60fps = 24 frames)
    this._energyHistory.push(energy);
    if (this._energyHistory.length > 24) this._energyHistory.shift();

    // Need minimal history before detecting
    if (this._energyHistory.length < 4) return;

    // Average energy over the window
    const avg = this._energyHistory.reduce((a, b) => a + b, 0) / this._energyHistory.length;

    const now = performance.now();
    const timeSinceLastBeat = now - this._lastBeatTime;

    // Beat = current energy exceeds avg by threshold AND cooldown has passed
    if (energy > avg * this._beatThreshold && timeSinceLastBeat > this._beatCooldownMs && energy > 0.05) {
      this._isBeat = true;
      this._beatCount++;
      this._lastBeatTime = now;

      // Track beat times for BPM calculation
      this._beatTimes.push(now);
      // Keep last 12 beats for BPM averaging
      if (this._beatTimes.length > 12) this._beatTimes.shift();

      this.calculateBPM();

      // Fire callbacks
      for (const cb of this._beatCallbacks) {
        cb(this._bpm, this._beatCount);
      }
    }
  }

  private calculateBPM() {
    if (this._beatTimes.length < 3) return;

    // Calculate intervals between consecutive beats
    const intervals: number[] = [];
    for (let i = 1; i < this._beatTimes.length; i++) {
      intervals.push(this._beatTimes[i] - this._beatTimes[i - 1]);
    }

    // Filter out outliers (intervals too short or too long for music: 40-220 BPM = 273-1500ms)
    const valid = intervals.filter((ms) => ms >= 273 && ms <= 1500);
    if (valid.length < 2) return;

    const avgInterval = valid.reduce((a, b) => a + b, 0) / valid.length;
    this._bpm = Math.round(60000 / avgInterval);
  }

  private getAverageFrequency(startRatio: number, endRatio: number): number {
    if (this._frequencyData.length === 0) return 0;
    const start = Math.floor(startRatio * this._frequencyData.length);
    const end = Math.floor(endRatio * this._frequencyData.length);
    let sum = 0;
    for (let i = start; i < end; i++) sum += this._frequencyData[i];
    return sum / ((end - start) * 255);
  }

  private getRawBass(): number { return this.getAverageFrequency(0, 0.08); }
  private getRawMids(): number { return this.getAverageFrequency(0.08, 0.4); }
  private getRawHighs(): number { return this.getAverageFrequency(0.4, 1); }
  private getRawVolume(): number { return this.getAverageFrequency(0, 1); }

  getBand(band: string): number {
    switch (band) {
      case "bass": return this.bass;
      case "mids": return this.mids;
      case "highs": return this.highs;
      case "volume": return this.volume;
      default: return 0;
    }
  }

  stop() {
    this.source?.disconnect();
    this.source = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.audioContext?.close();
    this.audioContext = null;
    this.analyser = null;
    this._frequencyData = new Uint8Array(0);
    this._timeDomainData = new Uint8Array(0);
    this._smoothBass = 0;
    this._smoothMids = 0;
    this._smoothHighs = 0;
    this._smoothVolume = 0;
    this._energyHistory = [];
    this._beatTimes = [];
    this._lastBeatTime = 0;
    this._beatCount = 0;
    this._bpm = 0;
    this._isBeat = false;
    this._beatCallbacks = [];
  }
}
