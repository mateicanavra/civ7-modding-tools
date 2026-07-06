import {
  HYDROLOGY_RIVER_DENSITY_MAJOR_PERCENTILE,
  HYDROLOGY_RIVER_DENSITY_MINOR_PERCENTILE,
} from "@mapgen/domain/hydrology/model/policy/hydrography-knob-policy.js";
import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import {
  artifacts as hydrologyHydrographyArtifacts,
  validators as hydrologyHydrographyArtifactValidators,
} from "../artifacts/index.js";
import RiversStepContract from "./rivers.contract.js";

type HydrologyRiverDensityKnob = "sparse" | "normal" | "dense";

const GROUP_HYDROGRAPHY = "Hydrology / Hydrography";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

export default createStep(RiversStepContract, {
  artifacts: implementArtifacts([hydrologyHydrographyArtifacts.hydrography], {
    hydrography: {
      validate: hydrologyHydrographyArtifactValidators.hydrography,
    },
  }),
  normalize: (config, ctx) => {
    const { riverDensity } = ctx.knobs as { riverDensity: HydrologyRiverDensityKnob };
    if (config.projectRiverNetwork.strategy !== "default") return config;

    const minorDelta =
      HYDROLOGY_RIVER_DENSITY_MINOR_PERCENTILE[riverDensity] -
      HYDROLOGY_RIVER_DENSITY_MINOR_PERCENTILE.normal;
    const majorDelta =
      HYDROLOGY_RIVER_DENSITY_MAJOR_PERCENTILE[riverDensity] -
      HYDROLOGY_RIVER_DENSITY_MAJOR_PERCENTILE.normal;

    const minorPercentile = Math.max(
      0,
      Math.min(1, config.projectRiverNetwork.config.minorPercentile + minorDelta)
    );
    const majorPercentile = Math.max(
      0,
      Math.min(1, config.projectRiverNetwork.config.majorPercentile + majorDelta)
    );

    return {
      ...config,
      projectRiverNetwork: {
        ...config.projectRiverNetwork,
        config: { ...config.projectRiverNetwork.config, minorPercentile, majorPercentile },
      },
    };
  },
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const topography = deps.artifacts.topography.read(context) as {
      elevation: Int16Array;
      landMask: Uint8Array;
    };
    const climateField = deps.artifacts.climateField.read(context) as {
      rainfall: Uint8Array;
      humidity: Uint8Array;
    };
    const routing = ops.drainageRouting(
      {
        width,
        height,
        elevation: topography.elevation,
        landMask: topography.landMask,
      },
      config.drainageRouting
    );

    const discharge = ops.accumulateDischarge(
      {
        width,
        height,
        landMask: topography.landMask,
        flowDir: routing.flowDir,
        rainfall: climateField.rainfall,
        humidity: climateField.humidity,
      },
      config.accumulateDischarge
    );

    const projected = ops.projectRiverNetwork(
      {
        width,
        height,
        landMask: topography.landMask,
        discharge: discharge.discharge,
        flowDir: routing.flowDir,
      },
      config.projectRiverNetwork
    );

    deps.artifacts.hydrography.publish(context, {
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

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.hydrography.runoff",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: discharge.runoff,
      meta: defineVizMeta("hydrology.hydrography.runoff", {
        label: "Runoff",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.hydrography.discharge",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: discharge.discharge,
      meta: defineVizMeta("hydrology.hydrography.discharge", {
        label: "Discharge",
        group: GROUP_HYDROGRAPHY,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.hydrography.riverClass",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: projected.riverClass,
      meta: defineVizMeta("hydrology.hydrography.riverClass", {
        label: "River Class",
        group: GROUP_HYDROGRAPHY,
        palette: "categorical",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.hydrography.sinkMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: routing.sinkMask,
      meta: defineVizMeta("hydrology.hydrography.sinkMask", {
        label: "Sink Mask",
        group: GROUP_HYDROGRAPHY,
        palette: "categorical",
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.hydrography.outletMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: routing.outletMask,
      meta: defineVizMeta("hydrology.hydrography.outletMask", {
        label: "Outlet Mask",
        group: GROUP_HYDROGRAPHY,
        palette: "categorical",
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.hydrography.basinId",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i32",
      values: routing.basinId,
      meta: defineVizMeta("hydrology.hydrography.basinId", {
        label: "Drainage Basin Id",
        group: GROUP_HYDROGRAPHY,
        palette: "categorical",
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.hydrography.depressionDepth",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: routing.depressionDepth,
      meta: defineVizMeta("hydrology.hydrography.depressionDepth", {
        label: "Drainage Conditioning Depth",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.hydrography.terminalType",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: routing.terminalType,
      meta: defineVizMeta("hydrology.hydrography.terminalType", {
        label: "Drainage Terminal Type",
        group: GROUP_HYDROGRAPHY,
        palette: "categorical",
        visibility: "debug",
      }),
    });
  },
});
