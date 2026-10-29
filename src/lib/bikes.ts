import hayabusa from "@/assets/hayabusa.jpg";
import h2r from "@/assets/h2r.jpg";
import tomahawk from "@/assets/tomahawk.jpg";
import panigale from "@/assets/panigale.jpg";
import s1000rr from "@/assets/s1000rr.jpg";
import chiron from "@/assets/chiron.jpg";
import type { SoundProfile } from "./engine-audio";

export type Bike = {
  id: string;
  brand: string;
  name: string;
  image: string;
  engine: string;
  displacement: string;
  cylinders: string;
  transmission: string;
  idle: number;
  redline: number;
  maxRpm: number;
  sound: SoundProfile;
};

export const BIKES: Bike[] = [
  {
    id: "hayabusa",
    brand: "Suzuki",
    name: "Hayabusa",
    image: hayabusa,
    engine: "DOHC inline-four, liquid-cooled",
    displacement: "1,340 cc",
    cylinders: "4 (inline)",
    transmission: "6-speed, quickshifter",
    idle: 1100,
    redline: 11000,
    maxRpm: 12000,
    sound: { cylinders: 4, baseTone: "square", growl: 0.35, filterBase: 380, filterTop: 3000, exhaustNoise: 0.18, popIntensity: 1.1, subOctave: 0.6 },
  },
  {
    id: "h2r",
    brand: "Kawasaki",
    name: "Ninja H2R",
    image: h2r,
    engine: "Supercharged inline-four",
    displacement: "998 cc",
    cylinders: "4 (inline)",
    transmission: "6-speed, dog-ring",
    idle: 1300,
    redline: 14000,
    maxRpm: 15000,
    sound: { cylinders: 4, baseTone: "sawtooth", growl: 0.85, filterBase: 700, filterTop: 6000, exhaustNoise: 0.4, popIntensity: 1.4, subOctave: 0.25 },
  },
  {
    id: "tomahawk",
    brand: "Dodge",
    name: "Tomahawk V10",
    image: tomahawk,
    engine: "Viper V10, all-aluminium",
    displacement: "8,277 cc",
    cylinders: "10 (V)",
    transmission: "2-speed manual (sim. 6)",
    idle: 750,
    redline: 6000,
    maxRpm: 6500,
    sound: { cylinders: 10, baseTone: "sawtooth", growl: 0.95, filterBase: 300, filterTop: 2400, exhaustNoise: 0.3, popIntensity: 1.6, subOctave: 0.7 },
  },
  {
    id: "panigale",
    brand: "Ducati",
    name: "Panigale V4 R",
    image: panigale,
    engine: "Desmosedici Stradale R V4",
    displacement: "998 cc",
    cylinders: "4 (90° V)",
    transmission: "6-speed, quickshifter",
    idle: 1400,
    redline: 15500,
    maxRpm: 16500,
    sound: { cylinders: 4, baseTone: "sawtooth", growl: 0.8, filterBase: 420, filterTop: 4800, exhaustNoise: 0.28, popIntensity: 1.5, subOctave: 0.55, lope: 0.75 },
  },
  {
    id: "s1000rr",
    brand: "BMW",
    name: "S 1000 RR",
    image: s1000rr,
    engine: "ShiftCam inline-four, supercharged",
    displacement: "999 cc",
    cylinders: "4 (inline)",
    transmission: "6-speed, quickshifter",
    idle: 1250,
    redline: 14600,
    maxRpm: 15100,
    sound: { cylinders: 4, baseTone: "sawtooth", growl: 0.65, filterBase: 600, filterTop: 6200, exhaustNoise: 0.26, popIntensity: 1.3, subOctave: 0.3, lope: 0.15, supercharger: 1, whineRatio: 7 },
  },
  {
    id: "chiron",
    brand: "Bugatti",
    name: "Chiron",
    image: chiron,
    engine: "W16, quad-turbocharged",
    displacement: "7,993 cc",
    cylinders: "16 (W)",
    transmission: "7-speed DCT (sim. 6)",
    idle: 900,
    redline: 6700,
    maxRpm: 7100,
    sound: { cylinders: 16, baseTone: "sawtooth", growl: 0.75, filterBase: 280, filterTop: 2600, exhaustNoise: 0.4, popIntensity: 0.9, subOctave: 0.75, lope: 0.1, supercharger: 0.6, whineRatio: 22 },
  },
];

export const GEARS = ["N", "1", "2", "3", "4", "5", "6"] as const;
export type Gear = (typeof GEARS)[number];

/** How fast RPM climbs per second (fraction of range) in each gear. Neutral is fastest. */
export function revRate(gear: Gear) {
  return { N: 1.6, "1": 1.15, "2": 0.9, "3": 0.72, "4": 0.58, "5": 0.47, "6": 0.38 }[gear];
}
