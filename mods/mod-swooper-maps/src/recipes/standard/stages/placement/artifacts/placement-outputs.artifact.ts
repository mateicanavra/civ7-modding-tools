import {
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

/** Terminal placement summary (`artifact:placementOutputs`). One artifact per file by repo convention. */

export const Schema = Type.Object(
  {
    naturalWondersCount: Type.Integer({ minimum: 0 }),
    resourcesCount: Type.Integer({ minimum: 0 }),
    startsAssigned: Type.Integer({ minimum: 0 }),
    discoveriesCount: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

export type PlacementOutputsV1 = Static<typeof Schema>;

/** Registers the compact terminal count summary used to verify placement completion. */
export const artifact = defineArtifact({
  name: "placementOutputs",
  id: "artifact:placementOutputs",
  schema: Schema,
});

/** Requires every published product total to be a nonnegative integer count. */
export const validate = defineArtifactValidator(artifact);
