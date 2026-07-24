import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";

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
import { artifact as scoreLayers } from "./score-layers.artifact.js";

/** Immutable feature scoring, intent, and occupancy evidence owned by the feature branch. */
export const artifacts = defineArtifactCatalog({
  scoreLayers,
  featureIntentsFloodplains,
  featureIntentsWetlands,
  featureIntentsReefs,
  featureIntentsIce,
  featureIntentsVegetation,
  occupancyBase,
  occupancyFloodplains,
  occupancyWetlands,
  occupancyReefs,
  occupancyIce,
});
