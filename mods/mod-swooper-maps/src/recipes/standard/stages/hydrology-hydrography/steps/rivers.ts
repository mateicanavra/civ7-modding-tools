import { defineVizMeta } from "@swooper/mapgen-core";
import { selectFlowReceiver } from "@swooper/mapgen-core/lib/grid";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { hydrologyHydrographyArtifacts } from "../artifacts.js";
import { validateHydrographyArtifact } from "./rivers.validation.js";
import RiversStepContract from "./rivers.contract.js";
import {
  HYDROLOGY_RIVER_DENSITY_MAJOR_PERCENTILE,
  HYDROLOGY_RIVER_DENSITY_MINOR_PERCENTILE,
} from "@mapgen/domain/hydrology/config.js";
import type { HydrologyRiverDensityKnob } from "@mapgen/domain/hydrology/config.js";

const GROUP_HYDROGRAPHY = "Hydrology / Hydrography";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

function computeFlowDir(options: {
  width: number;
  height: number;
  elevation: Int16Array;
  landMask: Uint8Array;
}): Int32Array {
  const { width, height, elevation, landMask } = options;
  const size = width * height;
  const flowDir = new Int32Array(size);
  for (let i = 0; i < size; i++) flowDir[i] = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (landMask[idx] !== 1) continue;
      flowDir[idx] = selectFlowReceiver(x, y, width, height, elevation);
    }
  }
  return flowDir;
}

export default createStep(RiversStepContract, {
  artifacts: implementArtifacts([hydrologyHydrographyArtifacts.hydrography], {
    hydrography: {
      validate: (value, context) => validateHydrographyArtifact(value, context.dimensions),
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
    const flowDir = computeFlowDir({
      width,
      height,
      elevation: topography.elevation,
      landMask: topography.landMask,
    });

    const discharge = ops.accumulateDischarge(
      {
        width,
        height,
        landMask: topography.landMask,
        flowDir,
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
      },
      config.projectRiverNetwork
    );

    deps.artifacts.hydrography.publish(context, {
      runoff: discharge.runoff,
      discharge: discharge.discharge,
      riverClass: projected.riverClass,
      flowDir,
      sinkMask: discharge.sinkMask,
      outletMask: discharge.outletMask,
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
      values: discharge.sinkMask,
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
      values: discharge.outletMask,
      meta: defineVizMeta("hydrology.hydrography.outletMask", {
        label: "Outlet Mask",
        group: GROUP_HYDROGRAPHY,
        palette: "categorical",
        visibility: "debug",
      }),
    });
  },
});
