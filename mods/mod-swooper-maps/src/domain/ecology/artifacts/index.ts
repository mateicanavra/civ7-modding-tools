import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as biomeClassification } from "./biome-classification.artifact.js";
import { artifact as featureIntentsFloodplains } from "./feature-intents-floodplains.artifact.js";
import { artifact as featureIntentsIce } from "./feature-intents-ice.artifact.js";
import { artifact as featureIntentsReefs } from "./feature-intents-reefs.artifact.js";
import { artifact as featureIntentsVegetation } from "./feature-intents-vegetation.artifact.js";
import { artifact as featureIntentsWetlands } from "./feature-intents-wetlands.artifact.js";
import { artifact as occupancyBase } from "./occupancy-base.artifact.js";
import { artifact as occupancyFloodplains } from "./occupancy-floodplains.artifact.js";
import { artifact as occupancyIce } from "./occupancy-ice.artifact.js";
import { artifact as occupancyReefs } from "./occupancy-reefs.artifact.js";
import { artifact as occupancyWetlands } from "./occupancy-wetlands.artifact.js";
import { artifact as pedology } from "./pedology.artifact.js";
import { artifact as plotEffectPlan } from "./plot-effect-plan.artifact.js";
import { artifact as scoreLayers } from "./score-layers.artifact.js";

/** Ecology artifact authorities consumed by recipe steps through declared dependencies. */
export const artifacts = defineArtifactCatalog({
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
