import type { PlotEffectKey } from "@mapgen/domain/ecology";

export const PLOT_EFFECT_VIZ_VALUE_BY_KEY: Readonly<Record<PlotEffectKey, number>> = {
  PLOTEFFECT_SNOW_LIGHT_PERMANENT: 1,
  PLOTEFFECT_SNOW_MEDIUM_PERMANENT: 2,
  PLOTEFFECT_SNOW_HEAVY_PERMANENT: 3,
  PLOTEFFECT_SAND: 4,
  PLOTEFFECT_BURNED: 5,
} as const;

export const PLOT_EFFECT_VIZ_CATEGORIES = [
  { value: 0, label: "None/Unknown", color: [148, 163, 184, 0] as [number, number, number, number] },
  { value: 1, label: "Snow (Light)", color: [226, 232, 240, 220] as [number, number, number, number] },
  { value: 2, label: "Snow (Medium)", color: [147, 197, 253, 230] as [number, number, number, number] },
  { value: 3, label: "Snow (Heavy)", color: [255, 255, 255, 240] as [number, number, number, number] },
  { value: 4, label: "Sand", color: [245, 158, 11, 240] as [number, number, number, number] },
  { value: 5, label: "Burned", color: [71, 85, 105, 240] as [number, number, number, number] },
];

export function plotEffectVizValueOrThrow(key: PlotEffectKey): number {
  const value = PLOT_EFFECT_VIZ_VALUE_BY_KEY[key];
  if (value == null) {
    throw new Error(
      `plot effects viz layer missing explicit category mapping for plotEffect=${key}`
    );
  }
  return value;
}

