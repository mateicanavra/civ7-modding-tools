import type { PlotEffectIntentKey } from "@mapgen/domain/ecology";

export const PLOT_EFFECT_VIZ_VALUE_BY_KEY: Readonly<Record<string, number>> = {
  "snow-light": 1,
  "snow-medium": 2,
  "snow-heavy": 3,
  sand: 4,
  burned: 5,
  "desert-heat": 6,
  frostbite: 7,
  "jungle-fever": 8,
} as const;

export const PLOT_EFFECT_VIZ_CATEGORIES = [
  {
    value: 0,
    label: "None/Unknown",
    color: [148, 163, 184, 0] as [number, number, number, number],
  },
  {
    value: 1,
    label: "Snow (Light)",
    color: [226, 232, 240, 220] as [number, number, number, number],
  },
  {
    value: 2,
    label: "Snow (Medium)",
    color: [147, 197, 253, 230] as [number, number, number, number],
  },
  {
    value: 3,
    label: "Snow (Heavy)",
    color: [255, 255, 255, 240] as [number, number, number, number],
  },
  { value: 4, label: "Sand", color: [245, 158, 11, 240] as [number, number, number, number] },
  { value: 5, label: "Burned", color: [71, 85, 105, 240] as [number, number, number, number] },
  {
    value: 6,
    label: "Desert Heat (Hazard)",
    color: [220, 38, 38, 240] as [number, number, number, number],
  },
  {
    value: 7,
    label: "Frostbite (Hazard)",
    color: [37, 99, 235, 240] as [number, number, number, number],
  },
  {
    value: 8,
    label: "Jungle Fever (Hazard)",
    color: [22, 163, 74, 240] as [number, number, number, number],
  },
];

export function plotEffectVizValueOrThrow(key: PlotEffectIntentKey): number {
  const value = PLOT_EFFECT_VIZ_VALUE_BY_KEY[key];
  return value ?? 0;
}
