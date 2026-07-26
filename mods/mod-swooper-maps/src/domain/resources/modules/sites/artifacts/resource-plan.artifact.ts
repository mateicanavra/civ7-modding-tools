import {
  ResourcePlanPerTypeSchema,
  ResourcePlanRegionMinimumSchema,
  ResourcePlanSettingsSchema,
} from "../../../model/atoms/resource-plan-evidence.schema.js";
import {
  type ResourcePlanIntent,
  ResourcePlanIntentSchema,
} from "../../../model/atoms/resource-site-intent.schema.js";
import {
  type ArtifactValidationIssue,
  defineArtifact,
  type Static,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

type ResourcePlan = Readonly<{
  width: number;
  height: number;
  seed: number;
  plannedCount: number;
  rotationCount: number;
  rangeFloorCount: number;
  regionMinimumCount: number;
  siteSpacingTiles: number;
  equitySkippedSiteCount: number;
  intents: readonly ResourcePlanIntent[];
  perType: readonly Static<typeof ResourcePlanPerTypeSchema>[];
  regionMinimums: readonly Static<typeof ResourcePlanRegionMinimumSchema>[];
  settings: Static<typeof ResourcePlanSettingsSchema>;
}>;

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
  refine: (input): readonly ArtifactValidationIssue[] => {
    const value = input as ResourcePlan;
    const issues: ArtifactValidationIssue[] = [];
    const size = value.width * value.height;
    if (!Number.isSafeInteger(size) || size <= 0) {
      return [
        {
          message: `resourcePlan has invalid dimensions ${String(value.width)}x${String(value.height)}.`,
        },
      ];
    }
    if (value.plannedCount !== value.intents.length) {
      issues.push({
        message: `resourcePlan.plannedCount ${String(value.plannedCount)} != intents.length ${value.intents.length}.`,
      });
    }

    const seenPlots = new Set<number>();
    const countsByType = new Map<string, number>();
    for (const intent of value.intents) {
      if (intent.plotIndex >= size) {
        issues.push({
          message: `resourcePlan intent plotIndex ${String(intent.plotIndex)} out of bounds.`,
        });
        continue;
      }
      if (seenPlots.has(intent.plotIndex)) {
        issues.push({ message: `resourcePlan plans two intents on plot ${intent.plotIndex}.` });
      }
      seenPlots.add(intent.plotIndex);
      countsByType.set(intent.resourceType, (countsByType.get(intent.resourceType) ?? 0) + 1);
    }

    for (const row of value.perType) {
      const observed = countsByType.get(row.resourceType) ?? 0;
      if (row.plannedCount !== observed) {
        issues.push({
          message: `resourcePlan perType ${row.resourceType} plannedCount ${row.plannedCount} != intent count ${observed}.`,
        });
      }
      if (row.plannedCount > row.maxCount) {
        issues.push({
          message: `resourcePlan perType ${row.resourceType} plannedCount ${row.plannedCount} exceeds maxCount ${row.maxCount}.`,
        });
      }

      const expectedShortfall = Math.max(0, row.effectiveTargetCount - row.plannedCount);
      if (row.shortfalls.length !== (expectedShortfall > 0 ? 1 : 0)) {
        issues.push({
          message: `resourcePlan perType ${row.resourceType} requires ${expectedShortfall > 0 ? "one" : "no"} terminal shortfall for deficit ${expectedShortfall}.`,
        });
        continue;
      }
      const shortfall = row.shortfalls[0];
      if (!shortfall) continue;
      if (shortfall.resourceType !== row.resourceType) {
        issues.push({
          message: `resourcePlan perType ${row.resourceType} shortfall names another resource type.`,
        });
      }
      if (shortfall.count !== expectedShortfall) {
        issues.push({
          message: `resourcePlan perType ${row.resourceType} shortfall count ${String(shortfall.count)} != terminal deficit ${expectedShortfall}.`,
        });
      }
    }
    return issues;
  },
});
