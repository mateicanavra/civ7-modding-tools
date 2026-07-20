import { createStep } from "@swooper/mapgen-core/authoring";
import { defineStandardVizCategoryMeta } from "../../../../viz.js";
import { applyPlotEffectPlacements } from "./apply.js";
import { PlotEffectsStepContract } from "./config.js";
import { PLOT_EFFECT_VIZ_CATEGORIES, plotEffectVizValue } from "./viz.js";

const GROUP_MAP_ECOLOGY = "Map / Ecology (Engine)";

/**
 * Applies the upstream plot-effect intent plan to Civ7 and emits projection
 * evidence; scoring and placement policy remain in Ecology truth.
 */
export const PlotEffectsStep = createStep(PlotEffectsStepContract, {
  run: (context, _config, _ops, deps) => {
    const placements = deps.artifacts.plotEffectPlan.read(context);

    if (placements.length > 0) {
      applyPlotEffectPlacements(context, placements);
    }
    return placements;
  },
  viz: ({ result: placements }) => {
    if (placements.length === 0) return [];

    const positions = new Float32Array(placements.length * 2);
    const values = new Uint16Array(placements.length);
    for (let i = 0; i < placements.length; i++) {
      const placement = placements[i]!;
      positions[i * 2] = placement.x;
      positions[i * 2 + 1] = placement.y;
      values[i] = plotEffectVizValue(placement.plotEffect);
    }

    return [
      {
        kind: "points",
        dataTypeKey: "map.ecology.plotEffects.plotEffect",
        spaceId: "tile.hexOddQ",
        positions,
        values: { format: "u16", values },
        meta: defineStandardVizCategoryMeta(
          "map.ecology.plotEffects.plotEffect",
          PLOT_EFFECT_VIZ_CATEGORIES,
          {
            label: "Plot Effects (Engine)",
            group: GROUP_MAP_ECOLOGY,
          }
        ),
      },
    ];
  },
});
