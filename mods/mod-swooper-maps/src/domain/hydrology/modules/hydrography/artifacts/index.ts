import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";

import { artifact as hydrography } from "./hydrography.artifact.js";
import { artifact as lakePlan } from "./lake-plan.artifact.js";
import { artifact as projectedLakes } from "./projected-lakes.artifact.js";
import { artifact as projectedNavigableRivers } from "./projected-navigable-rivers.artifact.js";
import { artifact as riverNetwork } from "./river-network.artifact.js";

/** Immutable drainage, lake, and river evidence owned by the Hydrology hydrography branch. */
export const artifacts = defineArtifactCatalog({
  hydrography,
  lakePlan,
  projectedLakes,
  projectedNavigableRivers,
  riverNetwork,
});
