import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { TectonicProvenanceFieldsSchema } from "../model/atoms/tectonic-provenance-fields.schema.js";
import { TracerIndexSchema } from "../model/atoms/tracer-index.schema.js";

const TECTONIC_PROVENANCE_FIELD_KEYS = [
  "originEra",
  "originPlateId",
  "lastBoundaryEra",
  "lastBoundaryType",
  "lastBoundaryPolarity",
  "lastBoundaryIntensity",
  "crustAge",
] as const;

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
  refine: (value, { issues }) => {
    if (value.tracerIndex.length !== value.eraCount) {
      issues.add("tracerIndex length must match eraCount");
    }
    value.tracerIndex.forEach((tracer, eraIndex) => {
      if (tracer.length !== value.cellCount) {
        issues.add(
          `Expected tracerIndex[${eraIndex}] length ${value.cellCount} (received ${tracer.length}).`
        );
      }
    });
    for (const key of TECTONIC_PROVENANCE_FIELD_KEYS) {
      if (value.provenance[key].length !== value.cellCount) {
        issues.add(
          `Expected ${key} length ${value.cellCount} (received ${value.provenance[key].length}).`
        );
      }
    }
  },
});
