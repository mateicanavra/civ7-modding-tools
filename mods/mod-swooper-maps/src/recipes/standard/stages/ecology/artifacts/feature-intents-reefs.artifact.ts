import { FeaturePlacementSchema } from "@mapgen/domain/ecology/model/schemas/index.js";
import {
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

/** Canonical schema entrypoint for registering and validating reef intent. */
export const Schema = Type.Array(FeaturePlacementSchema);

/** Ordered reef intent list consumed later by map-ecology projection. */
export type FeatureIntentsListArtifact = Static<typeof Schema>;

/**
 * Registers deterministic reef-family intent selected from Ecology score and occupancy truth.
 * Map projection consumes these rows later, keeping habitat choice separate from Civ7
 * acceptance.
 */
export const artifact = defineArtifact({
  name: "featureIntentsReefs",
  id: "artifact:ecology.featureIntents.reefs",
  schema: Schema,
});

/** Returns schema issues for reef intent without throwing. */
export const validate = defineArtifactValidator(artifact);
