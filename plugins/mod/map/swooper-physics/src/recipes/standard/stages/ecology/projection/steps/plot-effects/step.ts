import type { PlotEffectKey } from "@civ7/map-policy";
import type { PlotEffectIntentKey } from "../../../../../../../domain/ecology/modules/plot-effects/model/atoms/index.js";
import { createStep } from "@swooper/mapgen-core/authoring";
import { defineStandardVizCategoryMeta } from "../../../../../viz.js";
import { PLOT_EFFECT_PROJECTION_POLICY } from "../../model/policy/plot-effect-projection.js";
import { config } from "./config.js";
import { PLOT_EFFECT_VIZ_CATEGORIES, plotEffectVizValue } from "./viz.js";

type PlotEffectPlacement = Readonly<{
  x: number;
  y: number;
  plotEffect: PlotEffectIntentKey;
}>;

type PlotEffectEngine = Readonly<{
  getPlotEffectTypeIndex: (key: PlotEffectKey) => number;
  addPlotEffect: (x: number, y: number, plotEffectType: number) => void;
}>;

const resolvePlotEffectIndex = (engine: PlotEffectEngine, key: PlotEffectKey): number => {
  const index = engine.getPlotEffectTypeIndex(key);
  if (typeof index !== "number" || Number.isNaN(index) || index < 0) {
    throw new Error(`PlotEffectsStep: Unknown plot-effect key "${key}".`);
  }
  return index;
};

/**
 * Applies preplanned plot effects to the engine adapter.
 *
 * The placement policy belongs to Ecology; this helper deliberately accepts a
 * readonly artifact snapshot so map-ecology cannot mutate or reinterpret truth
 * while projecting it into Civ7 runtime state.
 */
function applyPlotEffectPlacements(
  engine: PlotEffectEngine,
  placements: readonly PlotEffectPlacement[]
): void {
  const resolved = new Map<PlotEffectKey, number>();

  for (const placement of placements) {
    const engineKey = PLOT_EFFECT_PROJECTION_POLICY[placement.plotEffect].engineKey;
    let plotEffectType = resolved.get(engineKey);
    if (plotEffectType == null) {
      plotEffectType = resolvePlotEffectIndex(engine, engineKey);
      resolved.set(engineKey, plotEffectType);
    }
    engine.addPlotEffect(placement.x, placement.y, plotEffectType);
  }
}

const GROUP_MAP_ECOLOGY = "Map / Ecology (Engine)";

/**
 * Applies the upstream plot-effect intent plan to Civ7 and emits projection
 * evidence; scoring and placement policy remain in Ecology truth.
 */
export const PlotEffectsStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const placements = deps.artifacts.plotEffectPlan.read();

    if (placements.length > 0) {
      applyPlotEffectPlacements(
        {
          getPlotEffectTypeIndex: (key) => deps.engine.getPlotEffectTypeIndex(context, key),
          addPlotEffect: (x, y, plotEffectType) =>
            deps.engine.addPlotEffect(context, x, y, plotEffectType),
        },
        placements
      );
    }
    return placements;
  },
  viz: ({ observation: placements }) => {
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
