import type { FeatureData } from "@civ7/adapter";
import { MOUNTAIN_TERRAIN, VOLCANO_FEATURE, defineVizMeta, logVolcanoSummary, xyFromIndex } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import PlotVolcanoesStepContract from "./plotVolcanoes.contract.js";
import { assertNoWaterDrift } from "./assertions.js";

const GROUP_MAP_PROJECTION = "Morphology / Map Projection";

export default createStep(PlotVolcanoesStepContract, {
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const plan = deps.artifacts.volcanoes.read(context);
    const { width, height } = context.dimensions;

    const positions = new Float32Array(plan.volcanoes.length * 2);
    const strengths = new Float32Array(plan.volcanoes.length);
    for (let i = 0; i < plan.volcanoes.length; i++) {
      const entry = plan.volcanoes[i]!;
      const { x, y } = xyFromIndex(entry.tileIndex, width);
      positions[i * 2] = x;
      positions[i * 2 + 1] = y;
      strengths[i] = entry.strength01;
    }
    context.viz?.dumpPoints(context.trace, {
      layerId: "map.morphology.volcanoes.points",
      positions,
      values: strengths,
      valueFormat: "f32",
      meta: defineVizMeta("map.morphology.volcanoes.points", {
        label: "Volcano Points (Projection)",
        group: GROUP_MAP_PROJECTION,
        space: "tile",
      }),
    });

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
  },
});
