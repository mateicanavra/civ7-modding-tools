import { defineVizMeta, dumpScalarFieldVariants } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import { artifactModules as ecologyArtifactModules } from "../../../ecology/artifacts/index.js";
import PedologyStepContract from "./contract.js";

const GROUP_PEDOLOGY = "Ecology / Pedology";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

function computeLocalReliefProxy(args: {
  width: number;
  height: number;
  landMask: Uint8Array;
  elevation: Int16Array;
}): Float32Array {
  const { width, height, landMask, elevation } = args;
  const size = width * height;
  const maxDropByTile = new Float32Array(size);
  let maxDrop = 1;

  for (let i = 0; i < size; i++) {
    if (landMask[i] !== 1) continue;
    const x = i % width;
    const y = Math.floor(i / width);
    const here = elevation[i] ?? 0;
    let localMaxDrop = 0;
    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const ni = ny * width + nx;
      if (landMask[ni] !== 1) return;
      localMaxDrop = Math.max(localMaxDrop, Math.abs(here - (elevation[ni] ?? 0)));
    });
    maxDropByTile[i] = localMaxDrop;
    maxDrop = Math.max(maxDrop, localMaxDrop);
  }

  const invMaxDrop = 1 / maxDrop;
  for (let i = 0; i < size; i++) {
    maxDropByTile[i] *= invMaxDrop;
  }
  return maxDropByTile;
}

/**
 * Derives canonical soil type and fertility from substrate, topography, and
 * baseline climate so biome and resource-basin consumers share one soil vintage.
 */
export default createStep(PedologyStepContract, {
  artifacts: [ecologyArtifactModules.pedology],
  run: (context, config, ops, deps) => {
    const climateField = deps.artifacts.climateField.read(context);
    const topography = deps.artifacts.topography.read(context);
    const substrate = deps.artifacts.substrate.read(context);
    const { width, height } = context.dimensions;
    const slope = computeLocalReliefProxy({
      width,
      height,
      landMask: topography.landMask,
      elevation: topography.elevation,
    });

    const result = ops.classify(
      {
        width,
        height,
        landMask: topography.landMask,
        elevation: topography.elevation,
        rainfall: climateField.rainfall,
        humidity: climateField.humidity,
        sedimentDepth: substrate.sedimentDepth,
        slope,
      },
      config.classify
    );

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "ecology.pedology.soilType",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: result.soilType,
      meta: defineVizMeta("ecology.pedology.soilType", {
        label: "Soil Type",
        group: GROUP_PEDOLOGY,
        palette: "categorical",
      }),
    });
    dumpScalarFieldVariants(context.trace, context.viz, {
      dataTypeKey: "ecology.pedology.fertility",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      field: { format: "f32", values: result.fertility },
      label: "Fertility",
      group: GROUP_PEDOLOGY,
      points: {},
    });

    deps.artifacts.pedology.publish(context, {
      width,
      height,
      ...result,
    });
  },
});
