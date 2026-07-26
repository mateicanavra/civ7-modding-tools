import {
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

const CRUST_ARRAY_FIELDS = [
  ["maturity", Float32Array],
  ["thickness", Float32Array],
  ["thermalAge", Uint8Array],
  ["damage", Uint8Array],
  ["type", Uint8Array],
  ["age", Uint8Array],
  ["buoyancy", Float32Array],
  ["baseElevation", Float32Array],
  ["strength", Float32Array],
] as const;

/** Registers Foundation's evolved crust artifact. */
export const artifact = defineArtifact({
  name: "foundationCrust",
  id: "artifact:foundation.crust",
  schema: Type.Object(
    {
      maturity: TypedArraySchemas.f32({ cardinality: null }),
      thickness: TypedArraySchemas.f32({ cardinality: null }),
      thermalAge: TypedArraySchemas.u8({ cardinality: null }),
      damage: TypedArraySchemas.u8({ cardinality: null }),
      type: TypedArraySchemas.u8({ cardinality: null }),
      age: TypedArraySchemas.u8({ cardinality: null }),
      buoyancy: TypedArraySchemas.f32({ cardinality: null }),
      baseElevation: TypedArraySchemas.f32({ cardinality: null }),
      strength: TypedArraySchemas.f32({ cardinality: null }),
    },
    {
      additionalProperties: false,
      description: "Evolved mesh-space crust fields consumed by Morphology and projection.",
    }
  ),
  refine: (value): readonly ArtifactValidationIssue[] => {
    const candidate = value as Readonly<Record<string, unknown>> & { maturity?: unknown };
    const expectedLength =
      candidate.maturity instanceof Float32Array ? candidate.maturity.length : undefined;
    const issues: ArtifactValidationIssue[] = [];
    if (expectedLength === 0) issues.push({ message: "crust arrays must be nonempty" });
    for (const [key, constructor] of CRUST_ARRAY_FIELDS) {
      appendArtifactTypedArrayIssues(issues, key, candidate[key], constructor, expectedLength);
    }
    return issues;
  },
});
