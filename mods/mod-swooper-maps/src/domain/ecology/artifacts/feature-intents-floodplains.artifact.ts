import {
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";
import { FeaturePlacementSchema } from "../model/schemas/index.js";

/** Canonical schema entrypoint for registering and validating floodplain intent. */
export const Schema = Type.Array(FeaturePlacementSchema);

/** Ordered floodplain intent list consumed later by map-ecology projection. */
export type FeatureIntentsListArtifact = Static<typeof Schema>;

/**
 * Registers deterministic floodplain intent selected from Ecology score and occupancy truth.
 * Map projection consumes these rows later, keeping feature choice separate from Civ7
 * acceptance.
 */
export const artifact = defineArtifact({
  name: "featureIntentsFloodplains",
  id: "artifact:ecology.featureIntents.floodplains",
  schema: Schema,
});

/** Returns schema issues for floodplain intent without throwing. */
export const validate = defineArtifactValidator(artifact);
