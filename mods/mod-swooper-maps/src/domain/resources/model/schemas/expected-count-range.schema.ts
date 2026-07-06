import { type Static, Type } from "@swooper/mapgen-core/authoring/contracts";

export const ResourceExpectationRangeEvidenceSchema = Type.Union([
  Type.Literal("source-backed"),
  Type.Literal("inference-backed"),
  Type.Literal("blocked"),
]);

export const ResourceExpectedCountRangeSchema = Type.Object(
  {
    baseline: Type.Literal("standard-earthlike-map"),
    min: Type.Integer({ minimum: 0 }),
    target: Type.Integer({ minimum: 0 }),
    max: Type.Integer({ minimum: 0 }),
    evidence: ResourceExpectationRangeEvidenceSchema,
  },
  { additionalProperties: false }
);

export type ResourceExpectationRangeEvidence = Static<
  typeof ResourceExpectationRangeEvidenceSchema
>;
export type ResourceExpectedCountRange = Static<typeof ResourceExpectedCountRangeSchema>;
