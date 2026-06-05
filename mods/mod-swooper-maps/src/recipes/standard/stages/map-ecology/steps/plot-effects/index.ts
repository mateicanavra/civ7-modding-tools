import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { applyPlotEffectPlacements } from "./apply.js";
import PlotEffectsStepContract from "./contract.js";
import { PLOT_EFFECT_VIZ_CATEGORIES, plotEffectVizValueOrThrow } from "./viz.js";

const GROUP_MAP_ECOLOGY = "Map / Ecology (Engine)";

export default createStep(PlotEffectsStepContract, {
  run: (context, _config, _ops, deps) => {
    const placements = deps.artifacts.plotEffectPlan.read(context);

    if (placements.length > 0) {
      const positions = new Float32Array(placements.length * 2);
      const values = new Uint16Array(placements.length);
      for (let i = 0; i < placements.length; i++) {
        const placement = placements[i]!;
        positions[i * 2] = placement.x;
        positions[i * 2 + 1] = placement.y;

        values[i] = plotEffectVizValueOrThrow(placement.plotEffect);
      }

      context.viz?.dumpPoints(context.trace, {
        dataTypeKey: "map.ecology.plotEffects.plotEffect",
        spaceId: "tile.hexOddQ",
        positions,
        values,
        valueFormat: "u16",
        meta: defineVizMeta("map.ecology.plotEffects.plotEffect", {
          label: "Plot Effects (Engine)",
          group: GROUP_MAP_ECOLOGY,
          categories: PLOT_EFFECT_VIZ_CATEGORIES,
        }),
      });
    }

    if (placements.length > 0) {
      applyPlotEffectPlacements(context, placements);
    }
  },
});
