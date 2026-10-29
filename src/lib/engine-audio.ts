// Synthesized engine sound system. Each bike has its own sound profile (slot).
export type SoundProfile = {
  cylinders: number; // firing pulses per 2 revs
  baseTone: OscillatorType;
  growl: number; // distortion amount
  filterBase: number; // lowpass at idle (Hz)
  filterTop: number; // lowpass at redline (Hz)
  exhaustNoise: number; // breathy noise level
  popIntensity: number;
  subOctave: number; // low rumble mix
};

function makeCurve(amount: number) {
  const n = 2048;
  const c = new Float32Array(n);
  const k = amount * 100;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    c[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
  }
  return c;
}

export class EngineAudio {
  ctx: AudioContext;
  master: GainNode;
  private engineGain: GainNode;
  private filter: BiquadFilterNode;
  private shaper: WaveShaperNode;
  private oscA: OscillatorNode;
  private oscB: OscillatorNode;
  private oscSub: OscillatorNode;
  private subGain: GainNode;
  private noiseGain: GainNode;
  private noiseFilter: BiquadFilterNode;
  private noiseBuf: AudioBuffer;
  private profile: SoundProfile;
  private volume = 0.8;
  private muted = false;

  constructor(profile: SoundProfile) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    this.profile = profile;
    const ctx = this.ctx;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -10;
    comp.ratio.value = 4;
    this.master = ctx.createGain();
    this.master.gain.value = this.volume;
    comp.connect(this.master).connect(ctx.destination);

    this.engineGain = ctx.createGain();
    this.engineGain.gain.value = 0;
    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.Q.value = 6;
    this.shaper = ctx.createWaveShaper();
    this.shaper.oversample = "4x";

    this.oscA = ctx.createOscillator();
    this.oscB = ctx.createOscillator();
    this.oscSub = ctx.createOscillator();
    this.oscSub.type = "sine";
    this.subGain = ctx.createGain();

    const mixA = ctx.createGain();
    mixA.gain.value = 0.5;
    const mixB = ctx.createGain();
    mixB.gain.value = 0.35;
    this.oscA.connect(mixA).connect(this.shaper);
    this.oscB.connect(mixB).connect(this.shaper);
    this.oscSub.connect(this.subGain).connect(this.filter);
    this.shaper.connect(this.filter).connect(this.engineGain).connect(comp);

    // exhaust noise
    this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuf;
    noise.loop = true;
    this.noiseFilter = ctx.createBiquadFilter();
    this.noiseFilter.type = "bandpass";
    this.noiseFilter.Q.value = 1.2;
    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0;
    noise.connect(this.noiseFilter).connect(this.noiseGain).connect(this.engineGain);

    this.applyProfile(profile);
    this.oscA.start();
    this.oscB.start();
    this.oscSub.start();
    noise.start();
  }

  applyProfile(p: SoundProfile) {
    this.profile = p;
    this.oscA.type = p.baseTone;
    this.oscB.type = "square";
    this.shaper.curve = makeCurve(p.growl);
    this.subGain.gain.value = p.subOctave;
  }

  resume() {
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setVolume(v: number) {
    this.volume = v;
    this.updateMaster();
  }
  setMuted(m: boolean) {
    this.muted = m;
    this.updateMaster();
  }
  private updateMaster() {
    this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume * 1.4, this.ctx.currentTime, 0.03);
  }

  /** rpm, normalized 0..1 of redline, throttle 0..1, running flag */
  update(rpm: number, norm: number, throttle: number, running: boolean) {
    const t = this.ctx.currentTime;
    const p = this.profile;
    const fire = Math.max(8, (rpm / 60) * (p.cylinders / 2));
    this.oscA.frequency.setTargetAtTime(fire, t, 0.015);
    this.oscB.frequency.setTargetAtTime(fire * 0.5 * 1.006, t, 0.015);
    this.oscSub.frequency.setTargetAtTime(fire * 0.25, t, 0.02);
    this.filter.frequency.setTargetAtTime(p.filterBase + (p.filterTop - p.filterBase) * norm * (0.6 + 0.4 * throttle), t, 0.03);
    this.noiseFilter.frequency.setTargetAtTime(400 + norm * 3000, t, 0.03);
    this.noiseGain.gain.setTargetAtTime(running ? p.exhaustNoise * (0.3 + throttle * 0.9) : 0, t, 0.04);
    const g = running ? 0.35 + norm * 0.35 + throttle * 0.3 : 0;
    this.engineGain.gain.setTargetAtTime(g, t, running ? 0.04 : 0.25);
  }

  /** Exhaust pop / crackle burst */
  pop(count = 3, strength = 1) {
    const ctx = this.ctx;
    const p = this.profile;
    for (let i = 0; i < count; i++) {
      const at = ctx.currentTime + i * (0.04 + Math.random() * 0.07);
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = "lowpass";
      bp.frequency.value = 900 + Math.random() * 1800;
      const g = ctx.createGain();
      const peak = (0.9 + Math.random() * 0.8) * p.popIntensity * strength;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(peak, at + 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.06 + Math.random() * 0.05);
      // thump
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(140, at);
      o.frequency.exponentialRampToValueAtTime(40, at + 0.08);
      const og = ctx.createGain();
      og.gain.setValueAtTime(peak * 0.8, at);
      og.gain.exponentialRampToValueAtTime(0.001, at + 0.1);
      src.connect(bp).connect(g).connect(this.master);
      o.connect(og).connect(this.master);
      src.start(at, Math.random());
      src.stop(at + 0.15);
      o.start(at);
      o.stop(at + 0.12);
    }
  }

  /** Starter motor whine */
  starter(duration = 0.9) {
    const ctx = this.ctx;
    const at = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(60, at);
    o.frequency.linearRampToValueAtTime(110, at + duration);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 14;
    const lg = ctx.createGain();
    lg.gain.value = 0.12;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, at);
    g.gain.linearRampToValueAtTime(0, at + duration);
    lfo.connect(lg).connect(g.gain);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 900;
    o.connect(f).connect(g).connect(this.master);
    o.start(at);
    lfo.start(at);
    o.stop(at + duration);
    lfo.stop(at + duration);
  }

  close() {
    void this.ctx.close();
  }
}
