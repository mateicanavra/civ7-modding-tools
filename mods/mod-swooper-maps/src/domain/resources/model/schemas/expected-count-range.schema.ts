import { type Static, Type } from "@swooper/mapgen-core/authoring/contracts";

const ResourceExpectationRangeEvidenceSchema = Type.Union([
  Type.Literal("source-backed"),
  Type.Literal("inference-backed"),
  Type.Literal("blocked"),
]);

/**
 * Closed count-range evidence carried by each resource expectation: one standard-earthlike
 * baseline, nonnegative min/target/max counts, and the authority strength for that range.
 * Family planners preserve this shape when reporting warning-only coverage.
 */
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
