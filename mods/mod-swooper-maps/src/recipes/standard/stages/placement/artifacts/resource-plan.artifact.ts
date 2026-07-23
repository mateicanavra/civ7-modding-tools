import resources from "@mapgen/domain/resources";
import {
  type ArtifactValidationIssue,
  defineArtifact,
  type Static,
} from "@swooper/mapgen-core/authoring/contracts";

/** Site-selection resource plan (`artifact:placement.resourcePlan`). One artifact per file by repo convention. */

const Schema = resources.ops.selectResourceSites.output;

/** Registers authoritative per-plot resource intents before start-support adjustment. */
export const artifact = defineArtifact({
  name: "resourcePlan",
  id: "artifact:placement.resourcePlan",
  schema: Schema,
  refine: validateLocal,
});

function issue(message: string): ArtifactValidationIssue {
  return { message };
}

/**
 * Validate hooks for the resource planning artifacts (placement-realignment
 * S3 artifact hygiene: placement previously registered zero validators).
 * These check cross-field invariants the schemas cannot express.
 */

/**
 * Validates map bounds, unique intent plots, count coherence, declared maxima, and the exact
 * terminal shortfall implied by each resource type's effective target.
 */
function validateLocal(input: unknown): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const size = value.width * value.height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(`resourcePlan has invalid dimensions ${String(value.width)}x${String(value.height)}.`),
    ];
  }
  const { intents, perType } = value;

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
    const { plotIndex } = intent;
    if (plotIndex >= size) {
      issues.push(
        issue(`resourcePlan intent plotIndex ${String(intent.plotIndex)} out of bounds.`)
      );
      continue;
    }
    if (seenPlots.has(plotIndex)) {
      issues.push(issue(`resourcePlan plans two intents on plot ${plotIndex}.`));
    }
    seenPlots.add(plotIndex);
    const type = intent.resourceType;
    countsByType.set(type, (countsByType.get(type) ?? 0) + 1);
  }

  for (const row of perType) {
    const type = row.resourceType;
    const planned = row.plannedCount;
    const observed = countsByType.get(type) ?? 0;
    if (planned !== observed) {
      issues.push(
        issue(`resourcePlan perType ${type} plannedCount ${planned} != intent count ${observed}.`)
      );
    }
    const maxCount = row.maxCount;
    if (planned > maxCount) {
      issues.push(
        issue(`resourcePlan perType ${type} plannedCount ${planned} exceeds maxCount ${maxCount}.`)
      );
    }

    const effectiveTarget = row.effectiveTargetCount;
    const expectedShortfall = Math.max(0, effectiveTarget - planned);
    const { shortfalls } = row;
    if (shortfalls.length !== (expectedShortfall > 0 ? 1 : 0)) {
      issues.push(
        issue(
          `resourcePlan perType ${type} requires ${expectedShortfall > 0 ? "one" : "no"} terminal shortfall for deficit ${expectedShortfall}.`
        )
      );
      continue;
    }
    const shortfall = shortfalls[0];
    if (!shortfall) continue;
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
