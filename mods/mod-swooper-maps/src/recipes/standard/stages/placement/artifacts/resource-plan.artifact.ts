import resources from "@mapgen/domain/resources";
import { defineArtifact, validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

/** Site-selection resource plan (`artifact:placement.resourcePlan`). One artifact per file by repo convention. */

export const Schema = resources.ops.selectResourceSites.output;

/** Registers authoritative per-plot resource intents before start-support adjustment. */
export const artifact = defineArtifact({
  name: "resourcePlan",
  id: "artifact:placement.resourcePlan",
  schema: Schema,
});

type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validate hooks for the resource planning artifacts (placement-realignment
 * S3 artifact hygiene: placement previously registered zero validators).
 * These check cross-field invariants the schemas cannot express.
 */

function validatePayload(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("resourcePlan artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(`resourcePlan has invalid dimensions ${String(value.width)}x${String(value.height)}.`),
    ];
  }
  const intents = Array.isArray(value.intents) ? value.intents : null;
  const perType = Array.isArray(value.perType) ? value.perType : null;
  if (!intents) return [issue("resourcePlan.intents must be an array.")];
  if (!perType) return [issue("resourcePlan.perType must be an array.")];

  if (value.plannedCount !== intents.length) {
    issues.push(
      issue(
        `resourcePlan.plannedCount ${String(value.plannedCount)} != intents.length ${intents.length}.`
      )
    );
  }

  const seenPlots = new Set<number>();
  const countsByType = new Map<string, number>();
  for (const intent of intents) {
    if (!isRecord(intent)) continue;
    const plotIndex = Number(intent.plotIndex);
    if (!Number.isInteger(plotIndex) || plotIndex < 0 || plotIndex >= size) {
      issues.push(
        issue(`resourcePlan intent plotIndex ${String(intent.plotIndex)} out of bounds.`)
      );
      continue;
    }
    if (seenPlots.has(plotIndex)) {
      issues.push(issue(`resourcePlan plans two intents on plot ${plotIndex}.`));
    }
    seenPlots.add(plotIndex);
    const type = String(intent.resourceType);
    countsByType.set(type, (countsByType.get(type) ?? 0) + 1);
  }

  for (const row of perType) {
    if (!isRecord(row)) continue;
    const type = String(row.resourceType);
    const planned = Number(row.plannedCount);
    const observed = countsByType.get(type) ?? 0;
    if (planned !== observed) {
      issues.push(
        issue(`resourcePlan perType ${type} plannedCount ${planned} != intent count ${observed}.`)
      );
    }
    const maxCount = Number(row.maxCount);
    if (planned > maxCount) {
      issues.push(
        issue(`resourcePlan perType ${type} plannedCount ${planned} exceeds maxCount ${maxCount}.`)
      );
    }

    const effectiveTarget = Number(row.effectiveTargetCount);
    const expectedShortfall = Math.max(0, effectiveTarget - planned);
    const shortfalls = Array.isArray(row.shortfalls) ? row.shortfalls : null;
    if (!Number.isSafeInteger(expectedShortfall) || !shortfalls) continue;
    if (shortfalls.length !== (expectedShortfall > 0 ? 1 : 0)) {
      issues.push(
        issue(
          `resourcePlan perType ${type} requires ${expectedShortfall > 0 ? "one" : "no"} terminal shortfall for deficit ${expectedShortfall}.`
        )
      );
      continue;
    }
    const shortfall = shortfalls[0];
    if (!isRecord(shortfall)) continue;
    if (shortfall.resourceType !== row.resourceType) {
      issues.push(issue(`resourcePlan perType ${type} shortfall names another resource type.`));
    }
    if (shortfall.count !== expectedShortfall) {
      issues.push(
        issue(
          `resourcePlan perType ${type} shortfall count ${String(shortfall.count)} != terminal deficit ${expectedShortfall}.`
        )
      );
    }
  }
  return issues;
}

/**
 * Validates map bounds, unique intent plots, count coherence, declared maxima, and the exact
 * terminal shortfall implied by each resource type's effective target.
 */
export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
