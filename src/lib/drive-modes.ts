import type { SoundProfile } from "./engine-audio";

export type DriveMode = "eco" | "comfort" | "sport" | "offroad";

export const DRIVE_MODES: { id: DriveMode; label: string; hint: string }[] = [
  { id: "eco", label: "ECO", hint: "Soft, quiet, slow revs" },
  { id: "comfort", label: "COMFORT", hint: "Smooth & balanced" },
  { id: "sport", label: "SPORT", hint: "Loud, sharp, fast revs" },
  { id: "offroad", label: "OFF-ROAD", hint: "Low-end grunt, rumble" },
];

/** Multiplier applied to how quickly RPM climbs. */
export const MODE_REV: Record<DriveMode, number> = { eco: 0.6, comfort: 0.85, sport: 1.3, offroad: 0.75 };

export function applyMode(p: SoundProfile, m: DriveMode): SoundProfile {
  switch (m) {
    case "eco":
      return { ...p, growl: p.growl * 0.5, filterTop: p.filterTop * 0.6, exhaustNoise: p.exhaustNoise * 0.5, popIntensity: p.popIntensity * 0.3 };
    case "comfort":
      return { ...p, growl: p.growl * 0.8, filterTop: p.filterTop * 0.85, popIntensity: p.popIntensity * 0.7 };
    case "sport":
      return { ...p, growl: Math.min(1, p.growl * 1.25), filterTop: Math.min(8000, p.filterTop * 1.2), exhaustNoise: Math.min(0.6, p.exhaustNoise * 1.3), popIntensity: Math.min(2, p.popIntensity * 1.4) };
    case "offroad":
      return { ...p, subOctave: Math.min(1, p.subOctave * 1.4 + 0.15), filterBase: p.filterBase * 0.8, filterTop: p.filterTop * 0.75, lope: Math.min(1, (p.lope ?? 0) + 0.25) };
  }
}
