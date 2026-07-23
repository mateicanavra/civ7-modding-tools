import type { ArtifactValidationIssue } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";
import {
  type TectonicProvenanceFields,
  TectonicProvenanceFieldsSchema,
} from "../model/atoms/tectonic-provenance-fields.schema.js";
import { type TracerIndex, TracerIndexSchema } from "../model/atoms/tracer-index.schema.js";

type TectonicProvenance = Readonly<{
  eraCount: number;
  cellCount: number;
  tracerIndex: ReadonlyArray<TracerIndex>;
  provenance: TectonicProvenanceFields;
}>;

/** Registers Foundation's tectonic-provenance artifact. */
export const artifact = defineArtifact({
  name: "foundationTectonicProvenance",
  id: "artifact:foundation.tectonicProvenance",
  schema: Type.Object(
    {
      version: Type.Integer({ minimum: 1 }),
      eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
      cellCount: Type.Integer({ minimum: 1 }),
      tracerIndex: Type.Immutable(Type.Array(TracerIndexSchema)),
      provenance: TectonicProvenanceFieldsSchema,
    },
    {
      additionalProperties: false,
      description: "Advected tracer history and per-cell tectonic lineage evidence.",
    }
  ),
  refine: (value): readonly ArtifactValidationIssue[] => {
    const artifactValue = value as TectonicProvenance;
    const issues: ArtifactValidationIssue[] = [];
    if (artifactValue.tracerIndex.length !== artifactValue.eraCount) {
      issues.push({ message: "tracerIndex length must match eraCount" });
    }
    artifactValue.tracerIndex.forEach((tracer, eraIndex) => {
      appendArtifactTypedArrayIssues(
        issues,
        `tracerIndex[${eraIndex}]`,
        tracer,
        Uint32Array,
        artifactValue.cellCount
      );
    });
    const provenance = artifactValue.provenance;
    for (const [key, constructor] of [
      ["originEra", Uint8Array],
      ["originPlateId", Int16Array],
      ["lastBoundaryEra", Uint8Array],
      ["lastBoundaryType", Uint8Array],
      ["lastBoundaryPolarity", Int8Array],
      ["lastBoundaryIntensity", Uint8Array],
      ["crustAge", Uint8Array],
    ] as const) {
      appendArtifactTypedArrayIssues(
        issues,
        key,
        provenance[key],
        constructor,
        artifactValue.cellCount
      );
    }
    return issues;
  },
});
