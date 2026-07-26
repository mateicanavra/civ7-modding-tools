import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as biomeClassification from "./biome-classification.artifact.js";
import * as featureIntentsFloodplains from "./feature-intents-floodplains.artifact.js";
import * as featureIntentsIce from "./feature-intents-ice.artifact.js";
import * as featureIntentsReefs from "./feature-intents-reefs.artifact.js";
import * as featureIntentsVegetation from "./feature-intents-vegetation.artifact.js";
import * as featureIntentsWetlands from "./feature-intents-wetlands.artifact.js";
import * as occupancyBase from "./occupancy-base.artifact.js";
import * as occupancyFloodplains from "./occupancy-floodplains.artifact.js";
import * as occupancyIce from "./occupancy-ice.artifact.js";
import * as occupancyReefs from "./occupancy-reefs.artifact.js";
import * as occupancyWetlands from "./occupancy-wetlands.artifact.js";
import * as pedology from "./pedology.artifact.js";
import * as plotEffectPlan from "./plot-effect-plan.artifact.js";
import * as scoreLayers from "./score-layers.artifact.js";

const catalog = defineArtifactCatalog({
  biomeClassification,
  featureIntentsFloodplains,
  featureIntentsIce,
  featureIntentsReefs,
  featureIntentsVegetation,
  featureIntentsWetlands,
  occupancyBase,
  occupancyFloodplains,
  occupancyIce,
  occupancyReefs,
  occupancyWetlands,
  pedology,
  plotEffectPlan,
  scoreLayers,
});

/** Ecology artifact modules pairing every semantic data product with its admission validator. */
export const artifactModules = catalog.modules;

/** Ecology artifact handles consumed by recipe steps through declared dependencies. */
export const artifacts = catalog.artifacts;
