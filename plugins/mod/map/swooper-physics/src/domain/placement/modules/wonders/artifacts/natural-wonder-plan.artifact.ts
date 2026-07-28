import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { NaturalWonderPlanIntentSchema } from "../model/atoms/natural-wonder-plan-intent.schema.js";

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
  refine: (value, { dimensions, issues }) => {
    const size = value.width * value.height;
    if (!Number.isSafeInteger(size) || size <= 0) {
      issues.add(
        `naturalWonderPlan has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      );
      return;
    }
    if (dimensions.width !== value.width || dimensions.height !== value.height) {
      issues.add(
        `naturalWonderPlan dimensions ${value.width}x${value.height} do not match execution dimensions ${dimensions.width}x${dimensions.height}.`
      );
    }
    if (value.plannedCount !== value.placements.length) {
      issues.add(
        `plannedCount ${String(value.plannedCount)} != placements.length ${value.placements.length}.`
      );
    }
    if (value.plannedCount > value.targetCount) {
      issues.add(
        `plannedCount ${String(value.plannedCount)} exceeds targetCount ${String(value.targetCount)}.`
      );
    }
    if (value.targetCount > value.wondersCount) {
      issues.add(
        `targetCount ${String(value.targetCount)} exceeds wondersCount ${String(value.wondersCount)}.`
      );
    }
    const seenPlots = new Set<number>();
    for (const placement of value.placements) {
      if (placement.plotIndex >= size) {
        issues.add(`naturalWonderPlan anchor ${String(placement.plotIndex)} out of bounds.`);
        continue;
      }
      if (seenPlots.has(placement.plotIndex)) {
        issues.add(`naturalWonderPlan plans two wonders anchored on plot ${placement.plotIndex}.`);
      }
      seenPlots.add(placement.plotIndex);

      const seenAnchors = new Set<number>([placement.plotIndex]);
      for (const fallback of placement.fallbacks ?? []) {
        if (fallback.plotIndex >= size) {
          issues.add(
            `naturalWonderPlan fallback anchor ${fallback.plotIndex} for primary ${placement.plotIndex} is out of bounds.`
          );
          continue;
        }
        if (seenAnchors.has(fallback.plotIndex)) {
          issues.add(
            `naturalWonderPlan anchor ${fallback.plotIndex} is repeated for primary ${placement.plotIndex}.`
          );
          continue;
        }
        seenAnchors.add(fallback.plotIndex);
      }
    }
  },
});
