export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private _frequencyData: Uint8Array<ArrayBuffer> = new Uint8Array(0);
  private _timeDomainData: Uint8Array<ArrayBuffer> = new Uint8Array(0);

  // Smoothed values for visual use
  private _smoothBass = 0;
  private _smoothMids = 0;
  private _smoothHighs = 0;
  private _smoothVolume = 0;

  get frequencyData(): Uint8Array<ArrayBuffer> {
    return this._frequencyData;
  }

  get timeDomainData(): Uint8Array<ArrayBuffer> {
    return this._timeDomainData;
  }

  get isActive(): boolean {
    return this.audioContext !== null && this.audioContext.state === "running";
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

  get bass(): number { return this._smoothBass; }
  get mids(): number { return this._smoothMids; }
  get highs(): number { return this._smoothHighs; }
  get volume(): number { return this._smoothVolume; }

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
  }
}
