import {
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Runtime contract for Ecology's physically scored resource basins, including member plots,
 * per-plot intensity, and basin-level confidence.
 */
export const Schema = Type.Object({
  basins: Type.Array(
    Type.Object({
      resourceId: Type.String(),
      plots: Type.Array(Type.Integer({ minimum: 0 })),
      intensity: Type.Array(Type.Number({ minimum: 0 })),
      confidence: Type.Number({ minimum: 0 }),
    })
  ),
});

export type ResourceBasinsArtifact = Static<typeof Schema>;

/**
 * Registers Ecology's scored basin groups from pedology, climate, and topography truth.
 * Placement consumes the stable basin evidence without owning or recomputing ecological
 * classification.
 */
export const artifact = defineArtifact({
  name: "resourceBasins",
  id: "artifact:ecology.resourceBasins",
  schema: Schema,
});

/**
 * Reports every schema violation in resource-basin evidence.
 *
 * Spatial grid invariants are deliberately absent: this artifact contains sparse basin members,
 * not map-sized fields. Artifact admission uses the returned issues to refuse malformed basin
 * records without creating a second owner for map-setup dimensions.
 */
export const validate = defineArtifactValidator(artifact);
