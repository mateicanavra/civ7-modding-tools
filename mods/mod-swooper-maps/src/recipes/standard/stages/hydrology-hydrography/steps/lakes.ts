import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { defineVizMeta } from "@swooper/mapgen-core";
import { HYDROLOGY_LAKEINESS_TERMINAL_BASIN_POLICY } from "@mapgen/domain/hydrology/config.js";
import type { HydrologyLakeinessKnob } from "@mapgen/domain/hydrology/config.js";

import { hydrologyHydrographyArtifacts } from "../artifacts.js";
import LakesStepContract from "./lakes.contract.js";

const GROUP_HYDROGRAPHY = "Hydrology / Hydrography";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

export default createStep(LakesStepContract, {
  artifacts: implementArtifacts(
    [hydrologyHydrographyArtifacts.lakePlan, hydrologyHydrographyArtifacts.riverNetworkMetrics],
    {
      lakePlan: {},
      riverNetworkMetrics: {},
    }
  ),
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
    if (!(topography.landMask instanceof Uint8Array) || !(topography.elevation instanceof Int16Array)) {
      throw new Error("[Hydrology] Missing topography inputs for hydrology-hydrography/lakes.");
    }
    if (
      !(hydrography.routingElevation instanceof Float32Array) ||
      !(hydrography.depressionDepth instanceof Float32Array) ||
      !(hydrography.basinId instanceof Int32Array) ||
      !(hydrography.terminalType instanceof Uint8Array)
    ) {
      throw new Error("[Hydrology] Missing routing diagnostics for hydrology-hydrography/lakes.");
    }
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

    const riverNetworkMetrics = ops.computeRiverNetworkMetrics(
      {
        width,
        height,
        landMask: topography.landMask,
        elevation: topography.elevation,
        routingElevation: hydrography.routingElevation,
        depressionDepth: hydrography.depressionDepth,
        runoff: hydrography.runoff,
        discharge: hydrography.discharge,
        riverClass: hydrography.riverClass,
        flowDir: hydrography.flowDir,
        basinId: hydrography.basinId,
        terminalType: hydrography.terminalType,
        lakeMask: lakePlan.lakeMask,
      },
      config.computeRiverNetworkMetrics
    );

    deps.artifacts.riverNetworkMetrics.publish(context, riverNetworkMetrics);

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
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.hydrography.upstreamArea",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i32",
      values: riverNetworkMetrics.upstreamArea,
      meta: defineVizMeta("hydrology.hydrography.upstreamArea", {
        label: "Upstream Area",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.hydrography.streamOrderProxy",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: riverNetworkMetrics.streamOrderProxy,
      meta: defineVizMeta("hydrology.hydrography.streamOrderProxy", {
        label: "Stream Order Proxy",
        group: GROUP_HYDROGRAPHY,
        palette: "categorical",
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.hydrography.mouthType",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: riverNetworkMetrics.mouthType,
      meta: defineVizMeta("hydrology.hydrography.mouthType", {
        label: "River Mouth Type",
        group: GROUP_HYDROGRAPHY,
        palette: "categorical",
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.hydrography.slopeClass",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: riverNetworkMetrics.slopeClass,
      meta: defineVizMeta("hydrology.hydrography.slopeClass", {
        label: "River Slope Class",
        group: GROUP_HYDROGRAPHY,
        palette: "categorical",
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.hydrography.flowPermanenceProxy",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: riverNetworkMetrics.flowPermanenceProxy,
      meta: defineVizMeta("hydrology.hydrography.flowPermanenceProxy", {
        label: "Flow Permanence Proxy",
        group: GROUP_HYDROGRAPHY,
        palette: "categorical",
        visibility: "debug",
      }),
    });
  },
});
