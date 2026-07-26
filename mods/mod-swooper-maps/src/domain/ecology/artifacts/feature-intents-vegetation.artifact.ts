import {
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";
import { FeaturePlacementSchema } from "../model/schemas/index.js";

/** Closed row contract for one vegetation placement intent selected by Ecology. */
export type FeaturePlacementIntent = Static<typeof FeaturePlacementSchema>;

/** Canonical schema entrypoint for registering and validating vegetation intent. */
export const Schema = Type.Array(FeaturePlacementSchema);

/** Ordered vegetation intent list consumed later by map-ecology projection. */
export type FeatureIntentsListArtifact = Static<typeof Schema>;

/**
 * Registers deterministic vegetation-family intent selected from Ecology habitat scores and
 * occupancy truth. Map projection consumes these rows later, keeping ecotype choice separate
 * from Civ7 acceptance.
 */
export const artifact = defineArtifact({
  name: "featureIntentsVegetation",
  id: "artifact:ecology.featureIntents.vegetation",
  schema: Schema,
});

/** Returns schema issues for vegetation intent without throwing. */
export const validate = defineArtifactValidator(artifact);
