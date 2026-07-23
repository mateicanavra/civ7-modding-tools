import type { ArtifactValidationIssue } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";
import { type Plate, PlateSchema } from "../model/atoms/plate.schema.js";

type PlateGraph = Readonly<{ cellToPlate: Int16Array; plates: ReadonlyArray<Plate> }>;

/** Registers Foundation's plate-graph artifact. */
export const artifact = defineArtifact({
  name: "foundationPlateGraph",
  id: "artifact:foundation.plateGraph",
  schema: Type.Object(
    {
      cellToPlate: TypedArraySchemas.i16({ cardinality: "constructor-only" }),
      plates: Type.Immutable(Type.Array(PlateSchema)),
    },
    {
      additionalProperties: false,
      description: "Mesh-cell plate membership and index-aligned plate identities.",
    }
  ),
  refine: (value): readonly ArtifactValidationIssue[] => {
    const graph = value as PlateGraph;
    const issues: ArtifactValidationIssue[] = [];
    appendArtifactTypedArrayIssues(issues, "cellToPlate", graph.cellToPlate, Int16Array);
    if (graph.plates.length <= 0) issues.push({ message: "plates must be a nonempty array" });
    return issues;
  },
});
