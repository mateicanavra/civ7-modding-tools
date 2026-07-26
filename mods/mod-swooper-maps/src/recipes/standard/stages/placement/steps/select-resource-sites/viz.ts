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

type ResourcePlanIntentRow = Readonly<{
  plotIndex: number;
  resourceType: string;
  phase: "rotation" | "range-floor" | "region-minimum";
}>;

type ResourceDemandVizRow = Readonly<{
  resourceType: string;
  family: "aquatic" | "cultivated" | "terrestrial" | "geological";
  habitatMask: Uint8Array;
  legalMask: Uint8Array;
  intensity: Float32Array;
}>;

const RESOURCE_FAMILIES = ["aquatic", "cultivated", "terrestrial", "geological"] as const;

/**
 * Projects selected resource intents and the admitted demand surface that constrained them.
 * Demand fields are borrowed directly from the published ledger rather than recomputed for Studio.
 */
export function projectResourceSiteSelectionViz(input: {
  dimensions: Readonly<{ width: number; height: number }>;
  intents: ReadonlyArray<ResourcePlanIntentRow>;
  demands: readonly ResourceDemandVizRow[];
}): readonly VizProjection[] {
  const { width, height } = input.dimensions;
  const size = width * height;
  const projections: VizProjection[] = [];

  const typeOrder = input.demands.map((row) => row.resourceType);
  const valueByType = new Map<string, number>();
  for (let index = 0; index < typeOrder.length; index += 1) {
    valueByType.set(typeOrder[index]!, index + 1);
  }
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
    for (let index = 0; index < size; index += 1) {
      if (demand.legalMask[index] !== 0) {
        legalTypeCount[index] += 1;
        if (demand.habitatMask[index] !== 0) eligibleTypeCount[index] += 1;
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
          "How many admitted resource types pass both the policy legality tables and their habitat lane on each tile: the surface site selection actually chose from.",
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
          "How many admitted resource types the official Resource_ValidPlacements policy tables allow on each tile, before the habitat gate.",
        visibility: "debug",
      }),
    }
  );

  for (const family of RESOURCE_FAMILIES) {
    const values = input.demands.find((demand) => demand.family === family)?.intensity;
    if (!values || values.length !== size) continue;
    const dataTypeKey = `placement.resources.habitat.${family}`;
    projections.push({
      kind: "grid",
      dataTypeKey,
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: input.dimensions,
      field: { format: "f32", values, valueSpec: UNIT_SCORE_VALUE_SPEC },
      meta: definePlacementVizMeta(dataTypeKey, "field.intensity", {
        label: `Habitat Intensity: ${family[0]!.toUpperCase()}${family.slice(1)}`,
        description: `Shared habitat intensity (0..1) for admitted ${family} demands; site selection thins acceptance by this field inside each resource lane.`,
      }),
    });
  }

  return projections;
}
