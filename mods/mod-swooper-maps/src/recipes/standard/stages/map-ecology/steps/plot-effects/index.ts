import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { buildPlotEffectsInput } from "./inputs.js";
import { applyPlotEffectPlacements } from "./apply.js";
import { logSnowEligibilitySummary } from "./diagnostics.js";
import PlotEffectsStepContract from "./contract.js";

const GROUP_MAP_ECOLOGY = "Map / Ecology (Engine)";

export default createStep(PlotEffectsStepContract, {
  run: (context, config, ops, deps) => {
    const artifacts = {
      classification: deps.artifacts.biomeClassification.read(context),
      heightfield: context.buffers.heightfield,
    };
    const input = buildPlotEffectsInput(context, artifacts);
    const result = ops.plotEffects(input, config.plotEffects);

    if (context.trace.isVerbose) {
      logSnowEligibilitySummary(
        context.trace,
        input,
        config.plotEffects.config,
        result.placements,
        artifacts.heightfield.terrain
      );
    }

    if (result.placements.length > 0) {
      const positions = new Float32Array(result.placements.length * 2);
      const values = new Uint16Array(result.placements.length);
      const valueByKey = new Map<string, number>();
      for (let i = 0; i < result.placements.length; i++) {
        const placement = result.placements[i]!;
        positions[i * 2] = placement.x;
        positions[i * 2 + 1] = placement.y;

        const key = placement.plotEffect;
        let value = valueByKey.get(key);
        if (value == null) {
          value = valueByKey.size + 1;
          valueByKey.set(key, value);
        }
        values[i] = value;
      }

      context.viz?.dumpPoints(context.trace, {
        dataTypeKey: "map.ecology.plotEffects.plotEffect",
        spaceId: "tile.hexOddR",
        positions,
        values,
        valueFormat: "u16",
        meta: defineVizMeta("map.ecology.plotEffects.plotEffect", {
          label: "Plot Effects (Engine)",
          group: GROUP_MAP_ECOLOGY,
          palette: "categorical",
        }),
      });
    }

    if (result.placements.length > 0) {
      applyPlotEffectPlacements(context, result.placements);
    }
  },
});
