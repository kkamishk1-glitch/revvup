import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DRIVE_MODES, MODE_REV, applyMode, type DriveMode } from "@/lib/drive-modes";
import logo from "@/assets/logo.png";
import { BIKES, GEARS, revRate, type Gear } from "@/lib/bikes";
import { EngineAudio, type SoundProfile } from "@/lib/engine-audio";
import { SoundDesigner } from "@/components/SoundDesigner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "REVVUP — Hayabusa, H2R, Panigale, S1000RR, Tomahawk & Chiron" },
      { name: "description", content: "Turn the ignition, pick a gear and rev the Suzuki Hayabusa, Kawasaki H2R, Ducati Panigale V4 R, BMW S 1000 RR and Dodge Tomahawk in a premium garage." },
      { property: "og:title", content: "REVVUP — Hayabusa, H2R, Panigale, S1000RR, Tomahawk & Chiron" },
      { property: "og:description", content: "Ignition, gears, pops and a high-end RPM dash. Hold to rev." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Garage,
});

function Garage() {
  const [bikeIdx, setBikeIdx] = useState(0);
  const bike = BIKES[bikeIdx] ?? BIKES[0]!;
  const [ignition, setIgnition] = useState(false);
  const [starting, setStarting] = useState(false);
  const [gear, setGear] = useState<Gear>("N");
  const [autoGear, setAutoGear] = useState(false);
  const [holding, setHolding] = useState(false);
  const [rpm, setRpm] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [customSounds, setCustomSounds] = useState<Record<string, SoundProfile>>({});
  const [mode, setMode] = useState<DriveMode>("comfort");
  const sound = useMemo(() => applyMode(customSounds[bike.id] ?? bike.sound, mode), [customSounds, bike, mode]);

  const audio = useRef<EngineAudio | null>(null);
  const s = useRef({ rpm: 0, throttle: 0, holding: false, running: false, gear: "N" as Gear, auto: false, bike, lastShift: 0, crackleAt: 0, mode: "comfort" as DriveMode });
  s.current.bike = bike;
  s.current.auto = autoGear;
  s.current.mode = mode;
  const soundRef = useRef(sound);
  soundRef.current = sound;

  const ensureAudio = useCallback(() => {
    if (!audio.current) {
      audio.current = new EngineAudio(soundRef.current);
      audio.current.setVolume(volume);
      audio.current.setMuted(muted);
    }
    audio.current.resume();
    return audio.current;
  }, [volume, muted]);

  useEffect(() => audio.current?.setVolume(volume), [volume]);
  useEffect(() => audio.current?.setMuted(muted), [muted]);
  useEffect(() => {
    audio.current?.applyProfile(sound);
  }, [sound]);

  const shiftTo = useCallback((g: Gear, withPop = true) => {
    const st = s.current;
    if (st.gear === g) return;
    const from = GEARS.indexOf(st.gear);
    const to = GEARS.indexOf(g);
    st.gear = g;
    setGear(g);
    if (!st.running) return;
    const range = st.bike.maxRpm - st.bike.idle;
    if (to > from && from > 0) st.rpm = Math.max(st.bike.idle, st.rpm - range * 0.28);
    else if (to < from && to > 0) st.rpm = Math.min(st.bike.maxRpm, st.rpm + range * 0.18);
    if (withPop) audio.current?.pop(3 + Math.floor(Math.random() * 3), 1.2);
    st.lastShift = performance.now();
  }, []);

  // main loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let uiTick = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = s.current;
      const b = st.bike;
      const range = b.maxRpm - b.idle;
      st.throttle += ((st.holding ? 1 : 0) - st.throttle) * Math.min(1, dt * 10);
      if (st.running) {
        if (st.holding) {
          const nearLimit = st.rpm > b.redline;
          st.rpm += range * revRate(st.gear) * MODE_REV[st.mode] * dt * st.throttle * (nearLimit ? 0.3 : 1);
          if (st.rpm >= b.maxRpm) {
            st.rpm = b.maxRpm - range * 0.04; // limiter bounce
            audio.current?.pop(1, 0.5);
          }
          if (st.auto && st.gear !== "6" && st.rpm > b.redline * 0.95 && now - st.lastShift > 350) {
            const next = st.gear === "N" ? "1" : (String(Number(st.gear) + 1) as Gear);
            shiftTo(next);
          }
        } else {
          const fall = range * (st.gear === "N" ? 0.9 : 0.6) * dt;
          const prev = st.rpm;
          st.rpm = Math.max(b.idle, st.rpm - fall - (st.rpm - b.idle) * dt * 0.8);
          // decel crackle
          if (prev > b.idle + range * 0.35 && now > st.crackleAt) {
            audio.current?.pop(1 + Math.floor(Math.random() * 2), 0.6);
            st.crackleAt = now + 90 + Math.random() * 160;
          }
          if (st.auto && st.gear !== "N" && st.gear !== "1" && st.rpm < b.idle + range * 0.3 && now - st.lastShift > 300) {
            shiftTo(String(Number(st.gear) - 1) as Gear);
          }
        }
        // idle wobble
        st.rpm += Math.sin(now / 90) * 8;
      } else {
        st.rpm = Math.max(0, st.rpm - b.maxRpm * dt * 1.5);
      }
      const norm = Math.max(0, (st.rpm - b.idle) / range);
      audio.current?.update(Math.max(st.rpm, 1), norm, st.throttle, st.running);
      if (now - uiTick > 33) {
        uiTick = now;
        setRpm(st.rpm);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [shiftTo]);

  useEffect(() => () => audio.current?.close(), []);

  const toggleIgnition = useCallback(() => {
    const a = ensureAudio();
    const st = s.current;
    if (st.running || starting) {
      st.running = false;
      st.holding = false;
      setHolding(false);
      setIgnition(false);
      setStarting(false);
      return;
    }
    setStarting(true);
    setIgnition(true);
    a.starter(0.8);
    window.setTimeout(() => {
      st.running = true;
      st.rpm = st.bike.idle * 2.2; // catch & settle to idle
      a.pop(2, 0.8);
      setStarting(false);
    }, 800);
  }, [ensureAudio, starting]);

  const press = useCallback(() => {
    ensureAudio();
    if (!s.current.running) return;
    s.current.holding = true;
    setHolding(true);
  }, [ensureAudio]);
  const release = useCallback(() => {
    if (!s.current.holding) return;
    s.current.holding = false;
    setHolding(false);
    if (s.current.rpm > s.current.bike.idle + (s.current.bike.maxRpm - s.current.bike.idle) * 0.4) audio.current?.pop(4, 1.3);
  }, []);

  const reset = () => {
    const st = s.current;
    st.running = false;
    st.holding = false;
    st.rpm = 0;
    shiftTo("N", false);
    setHolding(false);
    setIgnition(false);
    setStarting(false);
    setAutoGear(false);
    setVolume(0.8);
    setMuted(false);
  };

  const selectBike = (i: number) => {
    if (i === bikeIdx) return;
    s.current.running = false;
    s.current.holding = false;
    s.current.rpm = 0;
    setHolding(false);
    setIgnition(false);
    setStarting(false);
    shiftTo("N", false);
    setBikeIdx(i);
  };

  // keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" && (e.target as HTMLInputElement).type !== "range") return;
      const k = e.key.toLowerCase();
      if (k === "n") shiftTo("N");
      else if (/^[1-6]$/.test(k)) shiftTo(k as Gear);
      else if (k === " " && !e.repeat) {
        e.preventDefault();
        press();
      } else if (k === "i" && !e.repeat) toggleIgnition();
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === " ") release();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [shiftTo, press, release, toggleIgnition]);

  const norm = Math.min(1, rpm / bike.maxRpm);
  const redNorm = bike.redline / bike.maxRpm;
  const segs = 30;
  const inRed = rpm > bike.redline;

  return (
    <main className="garage-bg min-h-screen pb-10 text-foreground">
      <div className="mx-auto max-w-5xl px-4 pt-5">
        <header className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 font-display text-xl font-bold tracking-[0.25em] sm:text-2xl">
            <img src={logo} alt="" width={32} height={32} className="h-8 w-8" />
            REVV<span className="text-primary">UP</span>
          </h1>
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground sm:text-xs">KEYS: I · N · 1–6 · SPACE</span>
        </header>

        {/* Model selector */}
        <nav className="no-scrollbar -mx-4 mt-4 flex snap-x gap-2 overflow-x-auto px-4">
          {BIKES.map((b, i) => (
            <button
              key={b.id}
              onClick={() => selectBike(i)}
              className={`glass snap-start shrink-0 rounded-xl px-4 py-2.5 text-left transition-all ${i === bikeIdx ? "glass-active" : "opacity-70 hover:opacity-100"}`}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{b.brand}</div>
              <div className="font-display text-sm font-semibold">{b.name}</div>
            </button>
          ))}
        </nav>

        {/* Bike stage */}
        <section className="relative mt-4">
          <div className="stage-glow absolute inset-0" />
          <img
            key={bike.id}
            src={bike.image}
            alt={`${bike.brand} ${bike.name}`}
            width={1280}
            height={768}
            className="relative mx-auto w-full max-w-3xl animate-in fade-in duration-500 rounded-2xl"
          />
          <div className="absolute left-3 top-3 font-display text-3xl font-bold leading-none opacity-90 sm:text-5xl">
            <div className="font-mono text-xs tracking-[0.3em] text-primary">{bike.brand.toUpperCase()}</div>
            {bike.name}
          </div>
        </section>

        {/* Dash */}
        <section className="glass mt-4 rounded-2xl p-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">RPM</div>
              <div className={`font-display text-5xl font-bold tabular-nums sm:text-6xl ${inRed ? "text-destructive" : "text-glow"}`}>
                {Math.round(rpm).toLocaleString()}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground">0 — {bike.maxRpm.toLocaleString()} · REDLINE {bike.redline.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">GEAR</div>
              <div className="gear-big font-display text-6xl font-bold leading-none sm:text-7xl">{gear}</div>
              <div className="font-mono text-[10px] text-primary">{autoGear ? "AUTO" : "MANUAL"}</div>
            </div>
          </div>
          <div className="mt-3 flex h-6 gap-[3px]">
            {Array.from({ length: segs }).map((_, i) => {
              const p = (i + 1) / segs;
              const on = norm >= p - 0.0001;
              const red = p > redNorm;
              return <div key={i} className={`flex-1 rounded-sm transition-colors duration-75 ${on ? (red ? "seg-red" : "seg-on") : "seg-off"}`} />;
            })}
          </div>
        </section>

        <section className="glass mt-4 rounded-2xl p-3">
          <div className="mb-2 px-1 font-mono text-[10px] tracking-[0.3em] text-muted-foreground">DRIVE MODE · {DRIVE_MODES.find((d) => d.id === mode)?.hint}</div>
          <div className="grid grid-cols-4 gap-1.5">
            {DRIVE_MODES.map((d) => (
              <button
                key={d.id}
                onClick={() => setMode(d.id)}
                className={`h-12 rounded-xl font-mono text-xs font-bold tracking-widest transition-all ${mode === d.id ? "gear-on" : "gear-off"}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        <SoundDesigner
          key={bike.id}
          vehicle={`${bike.brand} ${bike.name} — ${bike.engine}, ${bike.displacement}, ${bike.cylinders} cylinders`}
          label={bike.brand.toUpperCase()}
          base={bike.sound}
          value={customSounds[bike.id] ?? null}
          onChange={(p) =>
            setCustomSounds((m) => {
              const n = { ...m };
              if (p) n[bike.id] = p;
              else delete n[bike.id];
              return n;
            })
          }
        />

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.2fr]">
          {/* Ignition — whole card is the control */}
          <button
            type="button"
            onClick={toggleIgnition}
            aria-pressed={ignition}
            className={`glass ignition flex min-h-28 w-full cursor-pointer select-none items-center justify-between rounded-2xl p-5 text-left ${ignition ? "ignition-on" : ""}`}
          >
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">IGNITION · tap anywhere</div>
              <div className="font-display text-3xl font-bold">{starting ? "CRANKING…" : ignition ? "ENGINE ON" : "IGNITION OFF"}</div>
            </div>
            <span className={`ign-dot h-12 w-12 rounded-full ${ignition ? "ign-dot-on" : ""}`} />
          </button>

          {/* Gears */}
          <div className="glass rounded-2xl p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">GEAR SELECTOR</span>
              <button
                onClick={() => setAutoGear((v) => !v)}
                className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold tracking-widest transition-all ${autoGear ? "chip-on" : "chip-off"}`}
              >
                AUTO {autoGear ? "ON" : "OFF"}
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {GEARS.map((g) => (
                <button
                  key={g}
                  onClick={() => shiftTo(g)}
                  className={`h-14 rounded-xl font-display text-xl font-bold transition-all ${gear === g ? "gear-on" : "gear-off"}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* REV */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              press();
            }}
            onPointerUp={release}
            onPointerCancel={release}
            onContextMenu={(e) => e.preventDefault()}
            disabled={!ignition || starting}
            style={{ ["--rev" as string]: norm }}
            className={`rev-btn touch-none select-none ${holding ? "rev-held" : ""}`}
          >
            <span className="font-display text-2xl font-bold tracking-[0.2em]">REV</span>
            <span className="font-mono text-xs tracking-[0.4em]">ENGINE</span>
            {(!ignition || starting) && <span className="mt-1 font-mono text-[10px] opacity-70">IGNITION FIRST</span>}
          </button>
        </div>

        {/* Controls + Specs */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="glass flex flex-wrap items-center gap-3 rounded-2xl p-4">
            <button onClick={() => setMuted((m) => !m)} className={`rounded-lg px-4 py-3 font-mono text-xs font-bold tracking-widest ${muted ? "chip-on" : "chip-off"}`}>
              {muted ? "MUTED" : "MUTE"}
            </button>
            <label className="flex flex-1 items-center gap-3">
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground">VOL</span>
              <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="vol w-full" />
            </label>
            <button onClick={reset} className="chip-off rounded-lg px-4 py-3 font-mono text-xs font-bold tracking-widest">
              RESET
            </button>
          </div>
          <dl className="glass grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl p-4 text-sm">
            {[
              ["Engine", bike.engine],
              ["Displacement", bike.displacement],
              ["Cylinders", bike.cylinders],
              ["Redline", `~${bike.redline.toLocaleString()} rpm`],
              ["Transmission", bike.transmission],
              ["Selected gear", gear === "N" ? "Neutral" : gear],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </main>
  );
}
