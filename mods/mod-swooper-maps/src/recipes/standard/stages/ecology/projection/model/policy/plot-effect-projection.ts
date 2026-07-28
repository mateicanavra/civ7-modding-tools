import type { PlotEffectKey } from "@civ7/map-policy";
import type { PlotEffectIntentKey } from "@mapgen/domain/ecology/modules/plot-effects/model/atoms/index.js";

type CustomPlotEffectHazardDefinition = Readonly<{
  localizationTag: string;
  localizationText: string;
  timeDecay: false;
  unoccupiedDecay: false;
  timeValue: 1;
  damage: 11;
  defense: 0;
  allowOnWater: false;
}>;

type PlotEffectProjectionDefinition = Readonly<{
  engineKey: PlotEffectKey;
  customHazard?: CustomPlotEffectHazardDefinition;
}>;

function definePermanentLandHazard(
  localizationTag: string,
  localizationText: string
): CustomPlotEffectHazardDefinition {
  return Object.freeze({
    localizationTag,
    localizationText,
    timeDecay: false,
    unoccupiedDecay: false,
    timeValue: 1,
    damage: 11,
    defense: 0,
    allowOnWater: false,
  });
}

function definePlotEffectProjection(
  engineKey: PlotEffectKey,
  customHazard?: CustomPlotEffectHazardDefinition
): PlotEffectProjectionDefinition {
  return Object.freeze(customHazard === undefined ? { engineKey } : { engineKey, customHazard });
}

/**
 * Complete Standard Ecology binding from semantic plot-effect intent to Civ7 runtime data.
 * Custom hazard metadata lives beside its engine key so runtime placement and generated mod
 * artifacts cannot choose different identities or gameplay behavior.
 */
export const PLOT_EFFECT_PROJECTION_POLICY: Readonly<
  Record<PlotEffectIntentKey, PlotEffectProjectionDefinition>
> = Object.freeze({
  "snow-light": definePlotEffectProjection("PLOTEFFECT_SNOW_LIGHT_PERMANENT"),
  "snow-medium": definePlotEffectProjection("PLOTEFFECT_SNOW_MEDIUM_PERMANENT"),
  "snow-heavy": definePlotEffectProjection("PLOTEFFECT_SNOW_HEAVY_PERMANENT"),
  sand: definePlotEffectProjection("PLOTEFFECT_SAND"),
  burned: definePlotEffectProjection("PLOTEFFECT_BURNED"),
  "desert-heat": definePlotEffectProjection(
    "PLOTEFFECT_DESERT_HEAT",
    definePermanentLandHazard("LOC_PLOTEFFECT_DESERT_HEAT_NAME", "Deep Desert Heat")
  ),
  frostbite: definePlotEffectProjection(
    "PLOTEFFECT_FROSTBITE",
    definePermanentLandHazard("LOC_PLOTEFFECT_FROSTBITE_NAME", "Killing Frost")
  ),
  "jungle-fever": definePlotEffectProjection(
    "PLOTEFFECT_JUNGLE_FEVER",
    definePermanentLandHazard("LOC_PLOTEFFECT_JUNGLE_FEVER_NAME", "Jungle Fever")
  ),
});

function hasCustomHazard(projection: PlotEffectProjectionDefinition): projection is Readonly<{
  engineKey: PlotEffectKey;
  customHazard: CustomPlotEffectHazardDefinition;
}> {
  return projection.customHazard !== undefined;
}

/**
 * Ordered custom hazard projections used to render Civ7 gameplay and localization rows.
 * This shipped XML order intentionally differs from the full intent map and remains stable so
 * generated catalog artifacts stay byte-for-byte reproducible.
 */
export const CUSTOM_PLOT_EFFECT_HAZARD_PROJECTIONS = Object.freeze(
  Object.values(PLOT_EFFECT_PROJECTION_POLICY).filter(hasCustomHazard)
);
