import type { PlotEffectKey } from "@civ7/map-policy";
import type { PlotEffectIntentKey } from "@mapgen/domain/ecology";
import type { MapContext } from "@swooper/mapgen-core";

/**
 * Exhaustive projection from Ecology plot-effect intent to Civ7 runtime keys. Keeping this map
 * explicit prevents the projection stage from reinterpreting semantic effect choices.
 */
export const PLOT_EFFECT_KEY_BY_INTENT: Readonly<Record<PlotEffectIntentKey, PlotEffectKey>> = {
  "snow-light": "PLOTEFFECT_SNOW_LIGHT_PERMANENT",
  "snow-medium": "PLOTEFFECT_SNOW_MEDIUM_PERMANENT",
  "snow-heavy": "PLOTEFFECT_SNOW_HEAVY_PERMANENT",
  sand: "PLOTEFFECT_SAND",
  burned: "PLOTEFFECT_BURNED",
  frostbite: "PLOTEFFECT_FROSTBITE",
  "desert-heat": "PLOTEFFECT_DESERT_HEAT",
  "jungle-fever": "PLOTEFFECT_JUNGLE_FEVER",
};

type PlotEffectPlacement = {
  x: number;
  y: number;
  plotEffect: PlotEffectIntentKey;
};

const resolvePlotEffectIndex = (context: MapContext, key: PlotEffectKey): number => {
  const index = context.adapter.getPlotEffectTypeIndex(key);
  if (typeof index !== "number" || Number.isNaN(index) || index < 0) {
    throw new Error(`PlotEffectsStep: Unknown plot-effect key "${key}".`);
  }
  return index;
};

/**
 * Applies preplanned plot effects to the engine adapter.
 *
 * The placement policy belongs to Ecology; this helper deliberately accepts a
 * readonly artifact snapshot so map-ecology cannot mutate or reinterpret truth
 * while projecting it into Civ7 runtime state.
 */
export function applyPlotEffectPlacements(
  context: MapContext,
  placements: ReadonlyArray<PlotEffectPlacement>
): void {
  const resolved = new Map<PlotEffectKey, number>();

  for (const placement of placements) {
    const engineKey = PLOT_EFFECT_KEY_BY_INTENT[placement.plotEffect];
    let plotEffectType = resolved.get(engineKey);
    if (plotEffectType == null) {
      plotEffectType = resolvePlotEffectIndex(context, engineKey);
      resolved.set(engineKey, plotEffectType);
    }
    context.adapter.addPlotEffect(placement.x, placement.y, plotEffectType);
  }
}
