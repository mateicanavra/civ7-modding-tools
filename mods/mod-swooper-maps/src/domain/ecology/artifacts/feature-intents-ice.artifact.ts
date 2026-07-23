import {
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";
import { FeaturePlacementSchema } from "../model/schemas/index.js";

/** Canonical schema entrypoint for registering and validating ice intent. */
export const Schema = Type.Array(FeaturePlacementSchema);

/** Ordered ice intent list consumed later by map-ecology projection. */
export type FeatureIntentsListArtifact = Static<typeof Schema>;

/**
 * Registers deterministic ice intent selected from Ecology score, biome, and occupancy truth.
 * Map projection consumes these rows later, keeping feature choice separate from Civ7
 * acceptance.
 */
export const artifact = defineArtifact({
  name: "featureIntentsIce",
  id: "artifact:ecology.featureIntents.ice",
  schema: Schema,
});

/** Returns schema issues for ice intent without throwing. */
export const validate = defineArtifactValidator(artifact);
