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

/** Registers the initial Foundation crust vintage that seeds tectonic evolution. */
export const artifact = defineArtifact({
  name: "foundationInitialCrust",
  id: "artifact:foundation.initialCrust",
  schema: Type.Object(
    {
      maturity: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      thickness: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      thermalAge: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      damage: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      type: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      age: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      buoyancy: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      baseElevation: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      strength: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
    },
    {
      additionalProperties: false,
      description: "Initial mesh-space crust fields before tectonic evolution.",
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
