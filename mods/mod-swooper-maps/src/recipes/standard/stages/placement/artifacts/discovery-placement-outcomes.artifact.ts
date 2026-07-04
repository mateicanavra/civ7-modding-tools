import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Discovery placement summary (`artifact:placement.discoveryPlacementOutcomes`).
 *
 * Discoveries are placed by Civ7's official discovery generator (run through the
 * adapter), whose type/site selection is a live narrative-system product. The
 * mod therefore records observed COUNTS rather than per-tile intent
 * reconciliation: `plannedCount` is the number of `addDiscovery` attempts the
 * generator made, `placedCount` is how many the engine accepted, and
 * `rejectedCount = plannedCount - placedCount` is the engine-side shortfall
 * (commonly narrative-budget exhaustion). One artifact per file by repo convention.
 */
const DiscoveryPlacementSummarySchema = Type.Object(
  {
    plannedCount: Type.Integer({ minimum: 0 }),
    placedCount: Type.Integer({ minimum: 0 }),
    rejectedCount: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

const DiscoveryPlacementOutcomesArtifactSchema = Type.Object(
  {
    summary: DiscoveryPlacementSummarySchema,
  },
  {
    additionalProperties: false,
    description:
      "Observed discovery placement counts from the official generator: attempts (plannedCount), engine-accepted placements (placedCount), and the rejected shortfall.",
  }
);

export const Schema = DiscoveryPlacementOutcomesArtifactSchema;

export const artifact = defineArtifact({
  name: "discoveryPlacementOutcomes",
  id: "artifact:placement.discoveryPlacementOutcomes",
  schema: Schema,
});

type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

/**
 * Validate hook for the discovery placement summary artifact. Discoveries are
 * placed by the official generator, so this checks count coherence only:
 * non-negative integers, placed within planned (attempts), and
 * planned = placed + rejected.
 */

function validatePayload(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("discoveryPlacementOutcomes artifact must be an object.")];
  const summary = isRecord(value.summary) ? value.summary : null;
  if (!summary) return [issue("discoveryPlacementOutcomes.summary must be an object.")];

  const issues: ValidationIssue[] = [];
  const { plannedCount, placedCount, rejectedCount } = summary;
  for (const [name, count] of [
    ["plannedCount", plannedCount],
    ["placedCount", placedCount],
    ["rejectedCount", rejectedCount],
  ] as const) {
    if (!isCount(count)) {
      issues.push(issue(`summary.${name} must be a non-negative integer (got ${String(count)}).`));
    }
  }
  if (isCount(plannedCount) && isCount(placedCount) && placedCount > plannedCount) {
    issues.push(
      issue(`summary.placedCount ${placedCount} exceeds summary.plannedCount ${plannedCount}.`)
    );
  }
  if (
    isCount(plannedCount) &&
    isCount(placedCount) &&
    isCount(rejectedCount) &&
    placedCount + rejectedCount !== plannedCount
  ) {
    issues.push(
      issue(
        `summary.placedCount ${placedCount} + rejectedCount ${rejectedCount} != plannedCount ${plannedCount}.`
      )
    );
  }
  return issues;
}

export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
