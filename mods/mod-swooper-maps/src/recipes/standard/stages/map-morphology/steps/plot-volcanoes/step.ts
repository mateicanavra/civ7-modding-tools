import type { FeatureData } from "@civ7/adapter";
import {
  logVolcanoSummary,
  MOUNTAIN_TERRAIN,
  VOLCANO_FEATURE,
  xyFromIndex,
} from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { assertNoWaterDrift } from "../../../../projection-policies/noWaterDrift.js";
import { defineStandardVizMeta } from "../../../../viz.js";
import { PlotVolcanoesStepContract } from "./config.js";

const GROUP_MAP_MORPHOLOGY = "Map / Morphology (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Stamps the upstream volcano plan after continent terrain is stable and marks
 * projection completion without taking ownership of volcano selection.
 */
export const PlotVolcanoesStep = createStep(PlotVolcanoesStepContract, {
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const plan = deps.artifacts.volcanoes.read(context);
    const { width, height } = context.dimensions;

    for (const entry of plan.volcanoes) {
      const index = entry.tileIndex | 0;
      const y = (index / width) | 0;
      const x = index - y * width;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      context.adapter.setTerrainType(x, y, MOUNTAIN_TERRAIN);
      const featureData: FeatureData = { Feature: VOLCANO_FEATURE, Direction: -1, Elevation: 0 };
      context.adapter.setFeatureType(x, y, featureData);
    }

    const volcanoId = context.adapter.getFeatureTypeIndex?.("FEATURE_VOLCANO") ?? -1;
    logVolcanoSummary(context.trace, context.adapter, width, height, volcanoId);
    assertNoWaterDrift(context, topography.landMask, "map-morphology/plot-volcanoes");
    return plan;
  },
  viz: ({ result: plan, dimensions }) => {
    const positions = new Float32Array(plan.volcanoes.length * 2);
    const strengths = new Float32Array(plan.volcanoes.length);
    for (let i = 0; i < plan.volcanoes.length; i++) {
      const entry = plan.volcanoes[i]!;
      const { x, y } = xyFromIndex(entry.tileIndex, dimensions.width);
      positions[i * 2] = x;
      positions[i * 2 + 1] = y;
      strengths[i] = entry.strength01;
    }
    return [
      {
        kind: "points",
        dataTypeKey: "map.morphology.volcanoes.points",
        spaceId: TILE_SPACE_ID,
        positions,
        values: { format: "f32", values: strengths },
        meta: defineStandardVizMeta("map.morphology.volcanoes.points", "field.intensity", {
          label: "Volcano Points (Planned)",
          group: GROUP_MAP_MORPHOLOGY,
        }),
      },
    ];
  },
});
