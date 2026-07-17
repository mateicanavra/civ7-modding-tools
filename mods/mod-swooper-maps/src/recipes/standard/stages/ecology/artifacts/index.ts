import * as biomeBindings from "./biome-bindings.artifact.js";
import * as biomeClassification from "./biome-classification.artifact.js";
import * as featureApplyDiagnostics from "./feature-apply-diagnostics.artifact.js";
import * as featureIntentsFloodplains from "./feature-intents-floodplains.artifact.js";
import * as featureIntentsIce from "./feature-intents-ice.artifact.js";
import * as featureIntentsReefs from "./feature-intents-reefs.artifact.js";
import * as featureIntentsVegetation from "./feature-intents-vegetation.artifact.js";
import * as featureIntentsWetlands from "./feature-intents-wetlands.artifact.js";
import * as occupancyBase from "./occupancy-base.artifact.js";
import * as occupancyFloodplains from "./occupancy-floodplains.artifact.js";
import * as occupancyIce from "./occupancy-ice.artifact.js";
import * as occupancyReefs from "./occupancy-reefs.artifact.js";
import * as occupancyVegetation from "./occupancy-vegetation.artifact.js";
import * as occupancyWetlands from "./occupancy-wetlands.artifact.js";
import * as pedology from "./pedology.artifact.js";
import * as plotEffectPlan from "./plot-effect-plan.artifact.js";
import * as resourceBasins from "./resource-basins.artifact.js";
import * as scoreLayers from "./score-layers.artifact.js";

export {
  biomeBindings,
  biomeClassification,
  featureApplyDiagnostics,
  featureIntentsFloodplains,
  featureIntentsIce,
  featureIntentsReefs,
  featureIntentsVegetation,
  featureIntentsWetlands,
  occupancyBase,
  occupancyFloodplains,
  occupancyIce,
  occupancyReefs,
  occupancyVegetation,
  occupancyWetlands,
  pedology,
  plotEffectPlan,
  resourceBasins,
  scoreLayers,
};

/**
 * Full Ecology artifact modules for consumers that need schemas, registered handles, and
 * validators rather than only publication identities.
 */
export const artifactContracts = {
  biomeBindings,
  biomeClassification,
  featureApplyDiagnostics,
  featureIntentsFloodplains,
  featureIntentsIce,
  featureIntentsReefs,
  featureIntentsVegetation,
  featureIntentsWetlands,
  occupancyBase,
  occupancyFloodplains,
  occupancyIce,
  occupancyReefs,
  occupancyVegetation,
  occupancyWetlands,
  pedology,
  plotEffectPlan,
  resourceBasins,
  scoreLayers,
} as const;

/**
 * Ecology artifact handles consumed by recipe steps, diagnostics, and map projection. This
 * curated catalog keeps every consumer on the same registered contract while the sibling
 * validator catalog owns admission.
 */
export const artifacts = {
  biomeBindings: biomeBindings.artifact,
  biomeClassification: biomeClassification.artifact,
  featureApplyDiagnostics: featureApplyDiagnostics.artifact,
  featureIntentsFloodplains: featureIntentsFloodplains.artifact,
  featureIntentsIce: featureIntentsIce.artifact,
  featureIntentsReefs: featureIntentsReefs.artifact,
  featureIntentsVegetation: featureIntentsVegetation.artifact,
  featureIntentsWetlands: featureIntentsWetlands.artifact,
  occupancyBase: occupancyBase.artifact,
  occupancyFloodplains: occupancyFloodplains.artifact,
  occupancyIce: occupancyIce.artifact,
  occupancyReefs: occupancyReefs.artifact,
  occupancyVegetation: occupancyVegetation.artifact,
  occupancyWetlands: occupancyWetlands.artifact,
  pedology: pedology.artifact,
  plotEffectPlan: plotEffectPlan.artifact,
  resourceBasins: resourceBasins.artifact,
  scoreLayers: scoreLayers.artifact,
} as const;

/** Validators keyed exactly like the Ecology artifact catalog for runtime payload admission. */
export const validators = {
  biomeBindings: biomeBindings.validate,
  biomeClassification: biomeClassification.validate,
  featureApplyDiagnostics: featureApplyDiagnostics.validate,
  featureIntentsFloodplains: featureIntentsFloodplains.validate,
  featureIntentsIce: featureIntentsIce.validate,
  featureIntentsReefs: featureIntentsReefs.validate,
  featureIntentsVegetation: featureIntentsVegetation.validate,
  featureIntentsWetlands: featureIntentsWetlands.validate,
  occupancyBase: occupancyBase.validate,
  occupancyFloodplains: occupancyFloodplains.validate,
  occupancyIce: occupancyIce.validate,
  occupancyReefs: occupancyReefs.validate,
  occupancyVegetation: occupancyVegetation.validate,
  occupancyWetlands: occupancyWetlands.validate,
  pedology: pedology.validate,
  plotEffectPlan: plotEffectPlan.validate,
  resourceBasins: resourceBasins.validate,
  scoreLayers: scoreLayers.validate,
} as const;
