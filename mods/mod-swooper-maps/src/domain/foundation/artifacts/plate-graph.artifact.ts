import type { ArtifactValidationIssue, Static } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

const PlateSchema = Type.Object(
  {
    id: Type.Integer({ minimum: 0 }),
    role: Type.Union([
      Type.Literal("polarCap"),
      Type.Literal("polarMicroplate"),
      Type.Literal("tectonic"),
    ]),
    kind: Type.Union([Type.Literal("major"), Type.Literal("minor")]),
    seedX: Type.Number(),
    seedY: Type.Number(),
  },
  { additionalProperties: false }
);

/** Structural contract for cell-to-plate membership and plate identity metadata. */
const Schema = Type.Object(
  {
    cellToPlate: TypedArraySchemas.i16({ cardinality: null }),
    plates: Type.Immutable(Type.Array(PlateSchema)),
  },
  { additionalProperties: false }
);

/** Plate graph state published by Foundation. */
export type Artifact = Static<typeof Schema>;

/** Registers Foundation's plate-graph artifact. */
export const artifact = defineArtifact({
  name: "foundationPlateGraph",
  id: "artifact:foundation.plateGraph",
  schema: Schema,
  refine: validateLocal,
});

/** Validates exact membership-array construction and nonempty plate cardinality. */
function validateLocal(value: unknown): readonly ArtifactValidationIssue[] {
  const graph = value as Artifact;
  const issues: ArtifactValidationIssue[] = [];

  appendArtifactTypedArrayIssues(issues, "cellToPlate", graph.cellToPlate, Int16Array);
  if (graph.plates.length <= 0) {
    issues.push({ message: "plates must be a nonempty array" });
  }
  return issues;
}
