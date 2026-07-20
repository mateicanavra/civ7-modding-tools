import type { VizLayerCategory, VizProjection } from "@swooper/mapgen-viz";
import {
  buildPlacementPointBuffers,
  definePlacementVizCategoryMeta,
  definePlacementVizMeta,
  PLACEMENT_TILE_SPACE_ID,
  placementCategoryColor,
  resourceTypeLabel,
  UNIT_SCORE_VALUE_SPEC,
} from "../../viz.js";
import type { HabitatIntensityFields, ResourceDemandBuildResult } from "./planning.js";

type ResourcePlanIntentRow = Readonly<{
  plotIndex: number;
  resourceType: string;
  phase: "rotation" | "range-floor" | "region-minimum";
}>;

const HABITAT_FAMILY_FIELDS = [
  ["aquatic", "aquaticIntensity"],
  ["cultivated", "cultivatedIntensity"],
  ["terrestrial", "terrestrialIntensity"],
  ["geological", "geologicalIntensity"],
] as const;

/**
 * Projects completed resource-site decisions, eligibility counts, and habitat intensities.
 * All derived arrays are visualization-only views; the admitted plan and habitat evidence are borrowed.
 */
export function projectResourcePlanViz(input: {
  dimensions: Readonly<{ width: number; height: number }>;
  intents: ReadonlyArray<ResourcePlanIntentRow>;
  demands: ResourceDemandBuildResult["demands"];
  summaries: ResourceDemandBuildResult["summaries"];
  habitat: HabitatIntensityFields;
}): readonly VizProjection[] {
  const { width, height } = input.dimensions;
  const size = width * height;
  const projections: VizProjection[] = [];

  const typeOrder = input.summaries.map((row) => row.resourceType);
  const valueByType = new Map<string, number>();
  for (let i = 0; i < typeOrder.length; i++) valueByType.set(typeOrder[i]!, i + 1);
  const categories: VizLayerCategory[] = typeOrder.map((resourceType, index) => ({
    value: index + 1,
    label: resourceTypeLabel(resourceType),
    color: placementCategoryColor(index),
  }));
  const [firstCategory, ...otherCategories] = categories;
  if (firstCategory) {
    const rows = input.intents.map((intent) => ({
      plotIndex: intent.plotIndex,
      value: valueByType.get(intent.resourceType) ?? 0,
    }));
    const { positions, values } = buildPlacementPointBuffers(rows, width);
    projections.push({
      kind: "points",
      dataTypeKey: "placement.resources.intents",
      spaceId: PLACEMENT_TILE_SPACE_ID,
      positions,
      values: { format: "u16", values },
      meta: definePlacementVizCategoryMeta(
        "placement.resources.intents",
        [firstCategory, ...otherCategories],
        {
          label: "Planned Resource Sites",
          description:
            "Typed per-plot resource intents from site selection, colored by resource type (policy-table identity). Phase provenance (rotation / range-floor / region-minimum) lives in the resourcePlan artifact.",
        }
      ),
    });
  }

  const legalTypeCount = new Uint16Array(size);
  const eligibleTypeCount = new Uint16Array(size);
  for (const demand of input.demands) {
    for (let i = 0; i < size; i++) {
      if (demand.legalMask[i] !== 0) {
        legalTypeCount[i] += 1;
        if (demand.habitatMask[i] !== 0) eligibleTypeCount[i] += 1;
      }
    }
  }
  const countValueSpec = {
    scale: "linear" as const,
    domain: {
      kind: "explicit" as const,
      min: 0,
      max: Math.max(1, input.demands.length),
    },
    units: "resource types",
  };
  projections.push(
    {
      kind: "grid",
      dataTypeKey: "placement.resources.eligibleTypeCount",
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: input.dimensions,
      field: { format: "u16", values: eligibleTypeCount, valueSpec: countValueSpec },
      meta: definePlacementVizMeta("placement.resources.eligibleTypeCount", "field.intensity", {
        label: "Resource Eligibility (Types per Tile)",
        description:
          "How many planned resource types pass BOTH the policy legality tables and their habitat lane on each tile — the surface site selection actually chose from.",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "placement.resources.legalTypeCount",
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: input.dimensions,
      field: { format: "u16", values: legalTypeCount, valueSpec: countValueSpec },
      meta: definePlacementVizMeta("placement.resources.legalTypeCount", "field.intensity", {
        label: "Resource Policy Legality (Types per Tile)",
        description:
          "How many planned resource types the official Resource_ValidPlacements policy tables allow on each tile, before the habitat gate.",
        visibility: "debug",
      }),
    }
  );

  for (const [family, fieldKey] of HABITAT_FAMILY_FIELDS) {
    const values = input.habitat[fieldKey];
    if (!(values instanceof Float32Array) || values.length !== size) continue;
    const dataTypeKey = `placement.resources.habitat.${family}`;
    projections.push({
      kind: "grid",
      dataTypeKey,
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: input.dimensions,
      field: { format: "f32", values, valueSpec: UNIT_SCORE_VALUE_SPEC },
      meta: definePlacementVizMeta(dataTypeKey, "field.intensity", {
        label: `Habitat Intensity: ${family[0]!.toUpperCase()}${family.slice(1)}`,
        description: `Habitat lane intensity (0..1) for the ${family} resource family; site selection thins acceptance by this field inside the lane.`,
      }),
    });
  }

  return projections;
}
