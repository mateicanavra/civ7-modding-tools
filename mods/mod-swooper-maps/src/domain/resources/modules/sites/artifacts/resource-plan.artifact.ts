import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  ResourcePlanPerTypeSchema,
  ResourcePlanRegionMinimumSchema,
  ResourcePlanSettingsSchema,
} from "../../../model/atoms/resource-plan-evidence.schema.js";
import { ResourcePlanIntentSchema } from "../../../model/atoms/resource-site-intent.schema.js";

/** Registers authoritative per-plot resource intents before start-support adjustment. */
export const artifact = defineArtifact({
  name: "resourcePlan",
  id: "artifact:placement.resourcePlan",
  schema: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      seed: Type.Integer(),
      plannedCount: Type.Integer({ minimum: 0 }),
      rotationCount: Type.Integer({ minimum: 0 }),
      rangeFloorCount: Type.Integer({ minimum: 0 }),
      regionMinimumCount: Type.Integer({ minimum: 0 }),
      siteSpacingTiles: Type.Integer({ minimum: 0 }),
      equitySkippedSiteCount: Type.Integer({ minimum: 0 }),
      intents: Type.Array(ResourcePlanIntentSchema),
      perType: Type.Array(ResourcePlanPerTypeSchema),
      regionMinimums: Type.Array(ResourcePlanRegionMinimumSchema),
      settings: ResourcePlanSettingsSchema,
    },
    {
      additionalProperties: false,
      description:
        "Authoritative symbolic resource-site plan retained before bounded start-support adjustment.",
    }
  ),
  refine: (value, { issues }) => {
    const size = value.width * value.height;
    if (!Number.isSafeInteger(size) || size <= 0) {
      issues.add(
        `resourcePlan has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      );
      return;
    }
    if (value.plannedCount !== value.intents.length) {
      issues.add(
        `resourcePlan.plannedCount ${String(value.plannedCount)} != intents.length ${value.intents.length}.`
      );
    }

    const seenPlots = new Set<number>();
    const countsByType = new Map<string, number>();
    for (const intent of value.intents) {
      if (intent.plotIndex >= size) {
        issues.add(`resourcePlan intent plotIndex ${String(intent.plotIndex)} out of bounds.`);
        continue;
      }
      if (seenPlots.has(intent.plotIndex)) {
        issues.add(`resourcePlan plans two intents on plot ${intent.plotIndex}.`);
      }
      seenPlots.add(intent.plotIndex);
      countsByType.set(intent.resourceType, (countsByType.get(intent.resourceType) ?? 0) + 1);
    }

    for (const row of value.perType) {
      const observed = countsByType.get(row.resourceType) ?? 0;
      if (row.plannedCount !== observed) {
        issues.add(
          `resourcePlan perType ${row.resourceType} plannedCount ${row.plannedCount} != intent count ${observed}.`
        );
      }
      if (row.plannedCount > row.maxCount) {
        issues.add(
          `resourcePlan perType ${row.resourceType} plannedCount ${row.plannedCount} exceeds maxCount ${row.maxCount}.`
        );
      }

      const expectedShortfall = Math.max(0, row.effectiveTargetCount - row.plannedCount);
      if (row.shortfalls.length !== (expectedShortfall > 0 ? 1 : 0)) {
        issues.add(
          `resourcePlan perType ${row.resourceType} requires ${expectedShortfall > 0 ? "one" : "no"} terminal shortfall for deficit ${expectedShortfall}.`
        );
        continue;
      }
      const shortfall = row.shortfalls[0];
      if (!shortfall) continue;
      if (shortfall.resourceType !== row.resourceType) {
        issues.add(
          `resourcePlan perType ${row.resourceType} shortfall names another resource type.`
        );
      }
      if (shortfall.count !== expectedShortfall) {
        issues.add(
          `resourcePlan perType ${row.resourceType} shortfall count ${String(shortfall.count)} != terminal deficit ${expectedShortfall}.`
        );
      }
    }
  },
});
