import { createStep } from "@swooper/mapgen-core/authoring";
import { defineStandardVizMeta } from "../../../../../viz.js";
import {
  HYDROLOGY_RIVER_DENSITY_MAJOR_PERCENTILE,
  HYDROLOGY_RIVER_DENSITY_MINOR_PERCENTILE,
} from "../../model/policy/hydrography-knob-policy.js";
import { config } from "./config.js";

type HydrologyRiverDensityKnob = "sparse" | "normal" | "dense";

const GROUP_HYDROGRAPHY = "Hydrology / Hydrography";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Computes drainage, discharge, and river classes from climate and topography,
 * establishing hydrography evidence before any engine river projection.
 */
export const RiversStep = createStep(config, {
  normalize: (stepConfig, ctx) => {
    const { riverDensity } = ctx.knobs as { riverDensity: HydrologyRiverDensityKnob };
    if (stepConfig.projectRiverNetwork.strategy !== "discharge-percentiles") return stepConfig;

    const minorDelta =
      HYDROLOGY_RIVER_DENSITY_MINOR_PERCENTILE[riverDensity] -
      HYDROLOGY_RIVER_DENSITY_MINOR_PERCENTILE.normal;
    const majorDelta =
      HYDROLOGY_RIVER_DENSITY_MAJOR_PERCENTILE[riverDensity] -
      HYDROLOGY_RIVER_DENSITY_MAJOR_PERCENTILE.normal;

    const minorPercentile = Math.max(
      0,
      Math.min(1, stepConfig.projectRiverNetwork.config.minorPercentile + minorDelta)
    );
    const majorPercentile = Math.max(
      0,
      Math.min(1, stepConfig.projectRiverNetwork.config.majorPercentile + majorDelta)
    );

    return {
      ...stepConfig,
      projectRiverNetwork: {
        ...stepConfig.projectRiverNetwork,
        config: { ...stepConfig.projectRiverNetwork.config, minorPercentile, majorPercentile },
      },
    };
  },
  run: (context, stepConfig, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const topography = deps.artifacts.topography.read();
    const baselineClimateField = deps.artifacts.baselineClimateField.read();
    const routing = ops.drainageRouting(
      {
        width,
        height,
        elevation: topography.elevation,
        landMask: topography.landMask,
      },
      stepConfig.drainageRouting
    );

    const discharge = ops.accumulateDischarge(
      {
        width,
        height,
        landMask: topography.landMask,
        flowDir: routing.flowDir,
        rainfall: baselineClimateField.rainfall,
        humidity: baselineClimateField.humidity,
      },
      stepConfig.accumulateDischarge
    );

    const projected = ops.projectRiverNetwork(
      {
        width,
        height,
        landMask: topography.landMask,
        discharge: discharge.discharge,
        flowDir: routing.flowDir,
      },
      stepConfig.projectRiverNetwork
    );

    return deps.artifacts.hydrography.publish({
      runoff: discharge.runoff,
      discharge: discharge.discharge,
      riverClass: projected.riverClass,
      flowDir: routing.flowDir,
      sinkMask: routing.sinkMask,
      outletMask: routing.outletMask,
      basinId: routing.basinId,
      routingElevation: routing.routingElevation,
      depressionDepth: routing.depressionDepth,
      terminalType: routing.terminalType,
    });
  },
  viz: ({ result: hydrography, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.runoff",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: hydrography.runoff },
      meta: defineStandardVizMeta("hydrology.hydrography.runoff", "field.intensity", {
        label: "Runoff",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.discharge",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: hydrography.discharge },
      meta: defineStandardVizMeta("hydrology.hydrography.discharge", "field.intensity", {
        label: "Discharge",
        group: GROUP_HYDROGRAPHY,
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.riverClass",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: hydrography.riverClass },
      meta: defineStandardVizMeta("hydrology.hydrography.riverClass", "category.distinct", {
        label: "River Class",
        group: GROUP_HYDROGRAPHY,
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.sinkMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: hydrography.sinkMask },
      meta: defineStandardVizMeta("hydrology.hydrography.sinkMask", "category.distinct", {
        label: "Sink Mask",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.outletMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: hydrography.outletMask },
      meta: defineStandardVizMeta("hydrology.hydrography.outletMask", "category.distinct", {
        label: "Outlet Mask",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.basinId",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "i32", values: hydrography.basinId },
      meta: defineStandardVizMeta("hydrology.hydrography.basinId", "category.distinct", {
        label: "Drainage Basin Id",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.depressionDepth",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: hydrography.depressionDepth },
      meta: defineStandardVizMeta("hydrology.hydrography.depressionDepth", "field.intensity", {
        label: "Drainage Conditioning Depth",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.terminalType",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: hydrography.terminalType },
      meta: defineStandardVizMeta("hydrology.hydrography.terminalType", "category.distinct", {
        label: "Drainage Terminal Type",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    },
  ],
});
