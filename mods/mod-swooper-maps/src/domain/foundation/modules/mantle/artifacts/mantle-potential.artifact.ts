import type { ArtifactValidationIssue } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

type MantlePotential = Readonly<{
  cellCount: number;
  potential: Float32Array;
  sourceCount: number;
  sourceType: Int8Array;
  sourceCell: Uint32Array;
  sourceAmplitude: Float32Array;
  sourceRadius: Float32Array;
}>;

/** Registers Foundation's mantle-potential artifact. */
export const artifact = defineArtifact({
  name: "foundationMantlePotential",
  id: "artifact:foundation.mantlePotential",
  schema: Type.Object(
    {
      version: Type.Integer({ minimum: 1 }),
      cellCount: Type.Integer({ minimum: 1 }),
      potential: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      sourceCount: Type.Integer({ minimum: 0 }),
      sourceType: TypedArraySchemas.i8({ cardinality: "constructor-only" }),
      sourceCell: TypedArraySchemas.u32({ cardinality: "constructor-only" }),
      sourceAmplitude: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      sourceRadius: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
    },
    {
      additionalProperties: false,
      description: "Mantle potential and its deterministic thermal-source population.",
    }
  ),
  refine: (value): readonly ArtifactValidationIssue[] => {
    const mantle = value as MantlePotential;
    const cellCount = mantle.cellCount;
    const sourceCount = mantle.sourceCount;
    const issues: ArtifactValidationIssue[] = [];
    appendArtifactTypedArrayIssues(issues, "potential", mantle.potential, Float32Array, cellCount);
    appendArtifactTypedArrayIssues(issues, "sourceType", mantle.sourceType, Int8Array, sourceCount);
    appendArtifactTypedArrayIssues(
      issues,
      "sourceCell",
      mantle.sourceCell,
      Uint32Array,
      sourceCount
    );
    appendArtifactTypedArrayIssues(
      issues,
      "sourceAmplitude",
      mantle.sourceAmplitude,
      Float32Array,
      sourceCount
    );
    appendArtifactTypedArrayIssues(
      issues,
      "sourceRadius",
      mantle.sourceRadius,
      Float32Array,
      sourceCount
    );
    return issues;
  },
});
