import {
  type ArtifactValidationIssue,
  defineArtifact,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";
import {
  type NaturalWonderPlanIntent,
  NaturalWonderPlanIntentSchema,
} from "../model/atoms/natural-wonder-plan-intent.schema.js";

type NaturalWonderPlan = Readonly<{
  width: number;
  height: number;
  wondersCount: number;
  targetCount: number;
  plannedCount: number;
  placements: readonly NaturalWonderPlanIntent[];
}>;

/** Registers the bounded, scored natural-wonder intent consumed by Civ7 materialization. */
export const artifact = defineArtifact({
  name: "naturalWonderPlan",
  id: "artifact:placement.naturalWonderPlan",
  schema: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      wondersCount: Type.Integer({ minimum: 0 }),
      targetCount: Type.Integer({ minimum: 0 }),
      plannedCount: Type.Integer({ minimum: 0 }),
      placements: Type.Array(NaturalWonderPlanIntentSchema),
    },
    {
      additionalProperties: false,
      description:
        "Bounded natural-wonder plan whose ranked symbolic intents are stamped without changing wonder identity.",
    }
  ),
  refine: (input, context): readonly ArtifactValidationIssue[] => {
    const value = input as NaturalWonderPlan;
    const issues: ArtifactValidationIssue[] = [];
    const size = value.width * value.height;
    if (!Number.isSafeInteger(size) || size <= 0) {
      return [
        {
          message: `naturalWonderPlan has invalid dimensions ${String(value.width)}x${String(value.height)}.`,
        },
      ];
    }
    const executionDimensions = context?.dimensions;
    if (
      executionDimensions &&
      (executionDimensions.width !== value.width || executionDimensions.height !== value.height)
    ) {
      issues.push({
        message: `naturalWonderPlan dimensions ${value.width}x${value.height} do not match execution dimensions ${executionDimensions.width}x${executionDimensions.height}.`,
      });
    }
    if (value.plannedCount !== value.placements.length) {
      issues.push({
        message: `plannedCount ${String(value.plannedCount)} != placements.length ${value.placements.length}.`,
      });
    }
    if (value.plannedCount > value.targetCount) {
      issues.push({
        message: `plannedCount ${String(value.plannedCount)} exceeds targetCount ${String(value.targetCount)}.`,
      });
    }
    if (value.targetCount > value.wondersCount) {
      issues.push({
        message: `targetCount ${String(value.targetCount)} exceeds wondersCount ${String(value.wondersCount)}.`,
      });
    }
    const seenPlots = new Set<number>();
    for (const placement of value.placements) {
      if (placement.plotIndex >= size) {
        issues.push({
          message: `naturalWonderPlan anchor ${String(placement.plotIndex)} out of bounds.`,
        });
        continue;
      }
      if (seenPlots.has(placement.plotIndex)) {
        issues.push({
          message: `naturalWonderPlan plans two wonders anchored on plot ${placement.plotIndex}.`,
        });
      }
      seenPlots.add(placement.plotIndex);

      const seenAnchors = new Set<number>([placement.plotIndex]);
      for (const fallbackPlotIndex of placement.fallbackPlotIndices ?? []) {
        if (fallbackPlotIndex >= size) {
          issues.push({
            message: `naturalWonderPlan fallback anchor ${fallbackPlotIndex} for primary ${placement.plotIndex} is out of bounds.`,
          });
          continue;
        }
        if (seenAnchors.has(fallbackPlotIndex)) {
          issues.push({
            message: `naturalWonderPlan anchor ${fallbackPlotIndex} is repeated for primary ${placement.plotIndex}.`,
          });
          continue;
        }
        seenAnchors.add(fallbackPlotIndex);
      }
    }
    return issues;
  },
});
