import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { defineVizMeta } from "@swooper/mapgen-core";
import { HYDROLOGY_LAKEINESS_TERMINAL_BASIN_POLICY } from "@mapgen/domain/hydrology/config.js";
import type { HydrologyLakeinessKnob } from "@mapgen/domain/hydrology/config.js";

import { hydrologyHydrographyArtifacts } from "../artifacts.js";
import LakesStepContract from "./lakes.contract.js";

const GROUP_HYDROGRAPHY = "Hydrology / Hydrography";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

export default createStep(LakesStepContract, {
  artifacts: implementArtifacts([hydrologyHydrographyArtifacts.lakePlan], {
    lakePlan: {},
  }),
  normalize: (config, ctx) => {
    const { lakeiness = "normal" as HydrologyLakeinessKnob } = ctx.knobs as {
      lakeiness?: HydrologyLakeinessKnob;
    };
    if (config.planLakes.strategy !== "default") return config;

    const policy = HYDROLOGY_LAKEINESS_TERMINAL_BASIN_POLICY[lakeiness];

    return {
      ...config,
      planLakes: {
        ...config.planLakes,
        config: {
          ...config.planLakes.config,
          maxUpstreamSteps: policy.maxUpstreamSteps,
          sinkDischargePercentileMin: policy.sinkDischargePercentileMin,
          maxLakeLandFraction: policy.maxLakeLandFraction,
        },
      },
    };
  },
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const topography = deps.artifacts.topography.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);
    // Hydrology publishes lake intent before the map stage touches engine terrain.
    // Placement and diagnostics read this truth artifact instead of engine readback.
    const lakePlan = ops.planLakes(
      {
        width,
        height,
        landMask: topography.landMask,
        flowDir: hydrography.flowDir,
        discharge: hydrography.discharge,
        sinkMask: hydrography.sinkMask,
      },
      config.planLakes
    );

    deps.artifacts.lakePlan.publish(context, {
      width,
      height,
      lakeMask: lakePlan.lakeMask,
      plannedLakeTileCount: lakePlan.plannedLakeTileCount,
      sinkLakeCount: lakePlan.sinkLakeCount,
    });

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.lakes.lakePlan",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: lakePlan.lakeMask,
      meta: defineVizMeta("hydrology.lakes.lakePlan", {
        label: "Lake Plan",
        group: GROUP_HYDROGRAPHY,
        palette: "categorical",
      }),
    });
  },
});
