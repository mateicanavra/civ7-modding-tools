import { FeaturePlacementSchema } from "@mapgen/domain/ecology/model/schemas/index.js";
import {
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

/** Canonical schema entrypoint for registering and validating wetland intent. */
export const Schema = Type.Array(FeaturePlacementSchema);

/** Ordered wetland intent list consumed later by map-ecology projection. */
export type FeatureIntentsListArtifact = Static<typeof Schema>;

/**
 * Registers deterministic wetland-family intent selected from Ecology score, hydrology, and
 * occupancy truth. Map projection consumes these rows later, keeping habitat choice separate
 * from Civ7 acceptance.
 */
export const artifact = defineArtifact({
  name: "featureIntentsWetlands",
  id: "artifact:ecology.featureIntents.wetlands",
  schema: Schema,
});

/** Returns schema issues for wetland intent without throwing. */
export const validate = defineArtifactValidator(artifact);
