import hayabusa from "@/assets/hayabusa.jpg";
import h2r from "@/assets/h2r.jpg";
import tomahawk from "@/assets/tomahawk.jpg";
import panigale from "@/assets/panigale.jpg";
import s1000rr from "@/assets/s1000rr.jpg";
import chiron from "@/assets/chiron.jpg";
import chiron300 from "@/assets/chiron300.jpg";
import jesko from "@/assets/jesko.jpg";
import u9 from "@/assets/u9.jpg";
import gls450 from "@/assets/gls450.jpg";
import tesla from "@/assets/tesla.jpg";
import ferrari812 from "@/assets/ferrari812.jpg";
import gt3rs from "@/assets/gt3rs.jpg";
import harley from "@/assets/harley.jpg";
import taycan from "@/assets/taycan.jpg";
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
  {
    id: "chiron300",
    brand: "Bugatti",
    name: "Chiron Super Sport 300+",
    image: chiron300,
    engine: "W16, quad-turbo, 1,578 hp",
    displacement: "7,993 cc",
    cylinders: "16 (W)",
    transmission: "7-speed DCT (sim. 6)",
    idle: 950,
    redline: 6900,
    maxRpm: 7300,
    sound: { cylinders: 16, baseTone: "sawtooth", growl: 0.85, filterBase: 300, filterTop: 3000, exhaustNoise: 0.45, popIntensity: 1.1, subOctave: 0.8, lope: 0.1, supercharger: 0.75, whineRatio: 24 },
  },
  {
    id: "jesko",
    brand: "Koenigsegg",
    name: "Jesko Absolut",
    image: jesko,
    engine: "Twin-turbo flat-plane V8",
    displacement: "5,065 cc",
    cylinders: "8 (V)",
    transmission: "9-speed LST (sim. 6)",
    idle: 1000,
    redline: 8500,
    maxRpm: 8800,
    sound: { cylinders: 8, baseTone: "sawtooth", growl: 0.9, filterBase: 450, filterTop: 5200, exhaustNoise: 0.35, popIntensity: 1.6, subOctave: 0.45, lope: 0.05, supercharger: 0.5, whineRatio: 18 },
  },
  {
    id: "u9",
    brand: "Yangwang",
    name: "U9 Extreme",
    image: u9,
    engine: "Quad electric motors, 3,000 PS",
    displacement: "Electric",
    cylinders: "0 (4 motors)",
    transmission: "Single-speed (sim. 6)",
    idle: 600,
    redline: 18000,
    maxRpm: 20000,
    sound: { cylinders: 2, baseTone: "sine", growl: 0.1, filterBase: 600, filterTop: 7000, exhaustNoise: 0.02, popIntensity: 0.2, subOctave: 0.5, lope: 0, supercharger: 1, whineRatio: 6, electric: true },
  },
  {
    id: "gls450",
    brand: "Mercedes-Benz",
    name: "GLS 450 (2026)",
    image: gls450,
    engine: "Turbo inline-six + EQ Boost",
    displacement: "2,999 cc",
    cylinders: "6 (inline)",
    transmission: "9G-TRONIC (sim. 6)",
    idle: 650,
    redline: 6300,
    maxRpm: 6600,
    sound: { cylinders: 6, baseTone: "triangle", growl: 0.25, filterBase: 260, filterTop: 1900, exhaustNoise: 0.1, popIntensity: 0.25, subOctave: 0.6, lope: 0, supercharger: 0.15, whineRatio: 14 },
  },
  {
    id: "tesla",
    brand: "Tesla",
    name: "Model S Plaid",
    image: tesla,
    engine: "Tri-motor electric, 1,020 hp",
    displacement: "Electric",
    cylinders: "0 (3 motors)",
    transmission: "Single-speed (sim. 6)",
    idle: 500,
    redline: 18000,
    maxRpm: 20000,
    sound: { cylinders: 2, baseTone: "sine", growl: 0.1, filterBase: 500, filterTop: 5000, exhaustNoise: 0.01, popIntensity: 0.2, subOctave: 0.35, lope: 0, supercharger: 0.8, whineRatio: 5, electric: true },
  },
  {
    id: "ferrari812",
    brand: "Ferrari",
    name: "812 Competizione",
    image: ferrari812,
    engine: "Naturally aspirated 65° V12, 830 hp",
    displacement: "6,496 cc",
    cylinders: "12 (V)",
    transmission: "7-speed DCT (sim. 6)",
    idle: 1000,
    redline: 9500,
    maxRpm: 9800,
    sound: { cylinders: 12, baseTone: "sawtooth", growl: 0.7, filterBase: 420, filterTop: 6500, exhaustNoise: 0.3, popIntensity: 1.2, subOctave: 0.4, lope: 0 },
  },
  {
    id: "gt3rs",
    brand: "Porsche",
    name: "911 GT3 RS (992)",
    image: gt3rs,
    engine: "Naturally aspirated flat-six, 518 hp",
    displacement: "3,996 cc",
    cylinders: "6 (flat)",
    transmission: "7-speed PDK (sim. 6)",
    idle: 950,
    redline: 9000,
    maxRpm: 9300,
    sound: { cylinders: 6, baseTone: "sawtooth", growl: 0.75, filterBase: 450, filterTop: 6000, exhaustNoise: 0.32, popIntensity: 1.1, subOctave: 0.35, lope: 0.2 },
  },
  {
    id: "harley",
    brand: "Harley-Davidson",
    name: "Street Glide",
    image: harley,
    engine: "Milwaukee-Eight 117 V-twin, 45°",
    displacement: "1,923 cc",
    cylinders: "2 (45° V)",
    transmission: "6-speed Cruise Drive",
    idle: 850,
    redline: 5500,
    maxRpm: 5800,
    sound: { cylinders: 2, baseTone: "square", growl: 0.6, filterBase: 220, filterTop: 1600, exhaustNoise: 0.22, popIntensity: 1.3, subOctave: 0.85, lope: 1 },
  },
  {
    id: "taycan",
    brand: "Porsche",
    name: "Taycan Turbo GT",
    image: taycan,
    engine: "Dual electric motors, 1,092 PS",
    displacement: "Electric",
    cylinders: "0 (2 motors)",
    transmission: "2-speed rear (sim. 6)",
    idle: 500,
    redline: 16000,
    maxRpm: 18000,
    sound: { cylinders: 2, baseTone: "sine", growl: 0, filterBase: 500, filterTop: 6000, exhaustNoise: 0, popIntensity: 0, subOctave: 0, lope: 0, supercharger: 0.9, whineRatio: 7, electric: true },
  },
];

export const GEARS = ["N", "1", "2", "3", "4", "5", "6"] as const;
export type Gear = (typeof GEARS)[number];

/** How fast RPM climbs per second (fraction of range) in each gear. Neutral is fastest. */
export function revRate(gear: Gear) {
  return { N: 1.6, "1": 1.15, "2": 0.9, "3": 0.72, "4": 0.58, "5": 0.47, "6": 0.38 }[gear];
}
