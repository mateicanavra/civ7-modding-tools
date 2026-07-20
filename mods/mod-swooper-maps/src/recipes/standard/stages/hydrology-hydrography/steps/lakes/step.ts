import { HYDROLOGY_LAKEINESS_TERMINAL_BASIN_POLICY } from "@mapgen/domain/hydrology/model/policy/hydrography-knob-policy.js";
import { createStep } from "@swooper/mapgen-core/authoring";
import { defineStandardVizMeta } from "../../../../viz.js";
import { LakesStepContract } from "./config.js";

type HydrologyLakeinessKnob = "few" | "normal" | "many";

const GROUP_HYDROGRAPHY = "Hydrology / Hydrography";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Derives deterministic lake intent and river-network metrics from canonical
 * hydrography; engine water materialization remains owned by map-hydrology.
 */
export const LakesStep = createStep(LakesStepContract, {
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
    if (
      !(topography.landMask instanceof Uint8Array) ||
      !(topography.elevation instanceof Int16Array)
    ) {
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

    const publishedLakePlan = {
      width,
      height,
      lakeMask: lakePlan.lakeMask,
      plannedLakeTileCount: lakePlan.plannedLakeTileCount,
      sinkLakeCount: lakePlan.sinkLakeCount,
    };
    deps.artifacts.lakePlan.publish(context, publishedLakePlan);

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
    return { lakePlan: publishedLakePlan, riverNetworkMetrics };
  },
  viz: ({ result: { lakePlan, riverNetworkMetrics }, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "hydrology.lakes.lakePlan",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: lakePlan.lakeMask },
      meta: defineStandardVizMeta("hydrology.lakes.lakePlan", "category.distinct", {
        label: "Lake Plan",
        group: GROUP_HYDROGRAPHY,
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.upstreamArea",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "i32", values: riverNetworkMetrics.upstreamArea },
      meta: defineStandardVizMeta("hydrology.hydrography.upstreamArea", "field.intensity", {
        label: "Upstream Area",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.streamOrderProxy",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: riverNetworkMetrics.streamOrderProxy },
      meta: defineStandardVizMeta("hydrology.hydrography.streamOrderProxy", "category.distinct", {
        label: "Stream Order Proxy",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.mouthType",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: riverNetworkMetrics.mouthType },
      meta: defineStandardVizMeta("hydrology.hydrography.mouthType", "category.distinct", {
        label: "River Mouth Type",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.slopeClass",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: riverNetworkMetrics.slopeClass },
      meta: defineStandardVizMeta("hydrology.hydrography.slopeClass", "category.distinct", {
        label: "River Slope Class",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.flowPermanenceProxy",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: riverNetworkMetrics.flowPermanenceProxy },
      meta: defineStandardVizMeta(
        "hydrology.hydrography.flowPermanenceProxy",
        "category.distinct",
        {
          label: "Flow Permanence Proxy",
          group: GROUP_HYDROGRAPHY,
          visibility: "debug",
        }
      ),
    },
  ],
});
