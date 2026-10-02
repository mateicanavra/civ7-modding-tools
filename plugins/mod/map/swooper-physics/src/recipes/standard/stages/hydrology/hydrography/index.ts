import { createStage, Type } from "@swooper/mapgen-core/authoring";
import morphology from "../../../../../domain/morphology/index.js";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import {
  HYDROLOGY_RIVER_DENSITY_MAJOR_PERCENTILE,
  HYDROLOGY_RIVER_DENSITY_MINOR_PERCENTILE,
} from "./model/policy/hydrography-knob-policy.js";
import { NetworkStep } from "./steps/network/step.js";

const envelopes = NetworkStep.contract.schema.properties;

/** Composes the physical basin operations and the product's river-density adjustment. */
export default createStage({
  id: "hydrology-hydrography",
  knobsSchema: Type.Object({
    riverDensity: Type.Union(
      [Type.Literal("sparse"), Type.Literal("normal"), Type.Literal("dense")],
      { default: "normal", description: "Adjusts minor and major channel discharge thresholds relative to authored values." }
    ),
  }, {
    additionalProperties: false,
    description: "Product-level adjustments to the physical channel classification.",
  }),
  public: Type.Object({
    water: Type.Object({
      model: Type.Literal("certified-sill-spill"),
      computeLocalRunoff: envelopes.computeLocalRunoff,
      computeDrainageBasins: envelopes.computeDrainageBasins,
      computeBasinNetwork: envelopes.computeBasinNetwork,
      classifyBasinRiverNetwork: envelopes.classifyBasinRiverNetwork,
    }, {
      additionalProperties: false,
      description: "Certified basin geometry, runoff, storage and river classification operations.",
    }),
    projectRiverNetwork: envelopes.projectRiverNetwork,
    terrainEvolution: Type.Object({
      cycles: envelopes.terrainEvolution.properties.cycles,
      computeChannelIncision: envelopes.computeChannelIncision,
    }, {
      additionalProperties: false,
      description: "Fixed-forcing terrain evolution using the certified physical network, independent of river classes.",
    }),
  }, { additionalProperties: false }),
  compile: ({ config, knobs }) => {
    const authored = config.projectRiverNetwork;
    const minorDelta = HYDROLOGY_RIVER_DENSITY_MINOR_PERCENTILE[knobs.riverDensity] - HYDROLOGY_RIVER_DENSITY_MINOR_PERCENTILE.normal;
    const majorDelta = HYDROLOGY_RIVER_DENSITY_MAJOR_PERCENTILE[knobs.riverDensity] - HYDROLOGY_RIVER_DENSITY_MAJOR_PERCENTILE.normal;
    const { model: _model, ...water } = config.water;
    return {
      network: {
        ...water,
        terrainEvolution: { cycles: config.terrainEvolution.cycles },
        computeChannelIncision: config.terrainEvolution.computeChannelIncision,
        computeChannelTopography: morphology.erosion.ops.computeChannelTopography.defaultConfig,
        projectRiverNetwork: {
          ...authored,
          config: {
            ...authored.config,
            minorPercentile: Math.max(0, Math.min(1, authored.config.minorPercentile + minorDelta)),
            majorPercentile: Math.max(0, Math.min(1, authored.config.majorPercentile + majorDelta)),
          },
        },
      },
    };
  },
  steps: orderStandardStageSteps("hydrology-hydrography", { network: NetworkStep }),
});
