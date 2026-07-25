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
  refine: (input): readonly ArtifactValidationIssue[] => {
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
    }
    return issues;
  },
});
