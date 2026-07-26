import placement from "@mapgen/domain/placement";
import {
  type ArtifactValidationIssue,
  defineArtifact,
  type Static,
} from "@swooper/mapgen-core/authoring/contracts";

/** Natural-wonder plan (`artifact:placement.naturalWonderPlan`). One artifact per file by repo convention. */

const Schema = placement.wonders.ops.planNaturalWonders.output;

/** Registers the bounded, scored natural-wonder intent consumed by stamping. */
export const artifact = defineArtifact({
  name: "naturalWonderPlan",
  id: "artifact:placement.naturalWonderPlan",
  schema: Schema,
  refine: validateLocal,
});

function issue(message: string): ArtifactValidationIssue {
  return { message };
}

/**
 * Validates map dimensions, placement-count agreement, the target ceiling,
 * and unique in-bounds anchors.
 */
function validateLocal(input: unknown): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const size = value.width * value.height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(
        `naturalWonderPlan has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      ),
    ];
  }
  const { placements } = value;
  if (value.plannedCount !== placements.length) {
    issues.push(
      issue(`plannedCount ${String(value.plannedCount)} != placements.length ${placements.length}.`)
    );
  }
  if (value.plannedCount > value.targetCount) {
    issues.push(
      issue(
        `plannedCount ${String(value.plannedCount)} exceeds targetCount ${String(value.targetCount)}.`
      )
    );
  }
  const seenPlots = new Set<number>();
  for (const placement of placements) {
    const { plotIndex } = placement;
    if (plotIndex >= size) {
      issues.push(issue(`naturalWonderPlan anchor ${String(placement.plotIndex)} out of bounds.`));
      continue;
    }
    if (seenPlots.has(plotIndex)) {
      issues.push(issue(`naturalWonderPlan plans two wonders anchored on plot ${plotIndex}.`));
    }
    seenPlots.add(plotIndex);
  }
  return issues;
}
