import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";

import { artifact as featureSuitability } from "./feature-suitability.artifact.js";
import { artifact as floodplainIntents } from "./floodplain-intents.artifact.js";
import { artifact as iceIntents } from "./ice-intents.artifact.js";
import { artifact as reefIntents } from "./reef-intents.artifact.js";
import { artifact as vegetationIntents } from "./vegetation-intents.artifact.js";
import { artifact as wetlandIntents } from "./wetland-intents.artifact.js";

/** Immutable suitability and placement intent evidence owned by the feature branch. */
export const artifacts = defineArtifactCatalog({
  featureSuitability,
  floodplainIntents,
  iceIntents,
  reefIntents,
  wetlandIntents,
  vegetationIntents,
});
