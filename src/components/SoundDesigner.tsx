import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { designEngineSound } from "@/lib/sound-ai.functions";
import type { SoundProfile } from "@/lib/engine-audio";

type Props = { vehicle: string; label: string; base: SoundProfile; value: SoundProfile | null; onChange: (p: SoundProfile | null) => void };

const SLIDERS: { key: keyof SoundProfile; label: string; min: number; max: number; step: number }[] = [
  { key: "growl", label: "Growl", min: 0.1, max: 1, step: 0.01 },
  { key: "lope", label: "Pulse", min: 0, max: 1, step: 0.01 },
  { key: "subOctave", label: "Bass", min: 0, max: 1, step: 0.01 },
  { key: "filterTop", label: "Scream", min: 1500, max: 8000, step: 50 },
  { key: "exhaustNoise", label: "Rasp", min: 0, max: 0.6, step: 0.01 },
  { key: "popIntensity", label: "Pops", min: 0.2, max: 2, step: 0.01 },
  { key: "supercharger", label: "Boost whine", min: 0, max: 1, step: 0.01 },
];

export function SoundDesigner({ vehicle, label, base, value, onChange }: Props) {
  const design = useServerFn(designEngineSound);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const cur = value ?? base;

  const generate = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const r = await design({ data: { description: text, vehicle } });
      if (r.error || !r.profile) setMsg(r.error ?? "No result.");
      else {
        const { summary, ...p } = r.profile;
        onChange({ ...base, ...p });
        setMsg(summary);
      }
    } catch {
      setMsg("Couldn't reach the sound designer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass mt-4 rounded-2xl p-4">
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex flex-1 items-center gap-2 text-left font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
          <span className={`inline-block transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
          AI SOUND DESIGNER · {label}{value ? " · CUSTOM" : ""}
        </button>
        {value && (
          <button onClick={() => { onChange(null); setMsg(null); }} className="chip-off rounded-lg px-3 py-1.5 font-mono text-xs font-bold tracking-widest">
            STOCK
          </button>
        )}
      </div>
      {open && (<div className="mt-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && void generate()}
          placeholder="e.g. deep race bark with loud crackles"
          maxLength={500}
          className="flex-1 rounded-lg border border-border bg-background/40 px-3 py-3 text-sm outline-none focus:border-primary"
        />
        <button onClick={generate} disabled={loading || !text.trim()} className="chip-on rounded-lg px-4 py-3 font-mono text-xs font-bold tracking-widest disabled:opacity-50">
          {loading ? "TUNING…" : "GENERATE"}
        </button>
      </div>
      {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {SLIDERS.map((s) => (
          <label key={s.key} className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</span>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={Number(cur[s.key] ?? 0)}
              onChange={(e) => onChange({ ...cur, [s.key]: Number(e.target.value) })}
              className="vol w-full"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
