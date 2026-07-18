import type { PlotEffectIntentKey } from "@mapgen/domain/ecology";

type PlotEffectVizSpec = Readonly<{
  value: number;
  label: string;
  color: [number, number, number, number];
}>;

const PLOT_EFFECT_VIZ_SPEC_BY_KEY = {
  "snow-light": {
    value: 1,
    label: "Snow (Light)",
    color: [226, 232, 240, 220] as [number, number, number, number],
  },
  "snow-medium": {
    value: 2,
    label: "Snow (Medium)",
    color: [147, 197, 253, 230] as [number, number, number, number],
  },
  "snow-heavy": {
    value: 3,
    label: "Snow (Heavy)",
    color: [255, 255, 255, 240] as [number, number, number, number],
  },
  sand: {
    value: 4,
    label: "Sand",
    color: [245, 158, 11, 240] as [number, number, number, number],
  },
  burned: {
    value: 5,
    label: "Burned",
    color: [71, 85, 105, 240] as [number, number, number, number],
  },
  "desert-heat": {
    value: 6,
    label: "Desert Heat (Hazard)",
    color: [220, 38, 38, 240] as [number, number, number, number],
  },
  frostbite: {
    value: 7,
    label: "Frostbite (Hazard)",
    color: [37, 99, 235, 240] as [number, number, number, number],
  },
  "jungle-fever": {
    value: 8,
    label: "Jungle Fever (Hazard)",
    color: [22, 163, 74, 240] as [number, number, number, number],
  },
} as const satisfies Record<PlotEffectIntentKey, PlotEffectVizSpec>;

/**
 * Stable numeric visualization identity for each Ecology plot-effect intent. Values are
 * presentation-only and deliberately independent of Civ7's runtime plot-effect representation.
 */
export const PLOT_EFFECT_VIZ_VALUE_BY_KEY = Object.fromEntries(
  Object.entries(PLOT_EFFECT_VIZ_SPEC_BY_KEY).map(([key, spec]) => [key, spec.value] as const)
) as Readonly<Record<PlotEffectIntentKey, number>>;

/**
 * Deterministic labels and RGBA colors for every plot-effect visualization value. Keeping the
 * legend beside the value map prevents Studio colors from drifting between runs.
 */
export const PLOT_EFFECT_VIZ_CATEGORIES = [
  {
    value: 0,
    label: "None/Unknown",
    color: [148, 163, 184, 0] as [number, number, number, number],
  },
  ...Object.values(PLOT_EFFECT_VIZ_SPEC_BY_KEY),
] as const satisfies readonly [PlotEffectVizSpec, ...PlotEffectVizSpec[]];

/** Returns the stable visualization value for a canonically typed plot-effect intent. */
export function plotEffectVizValue(key: PlotEffectIntentKey): number {
  return PLOT_EFFECT_VIZ_SPEC_BY_KEY[key].value;
}
