import { CIV7_BROWSER_TABLES_V0, WATER_CLASS_COAST, WATER_CLASS_OCEAN } from "@civ7/map-policy";
import type { MapContext } from "@swooper/mapgen-core";

const DEFAULT_SAMPLE_LIMIT = 16;

interface CoastClassificationSurface {
  waterClass: Uint8Array;
}

type CoastProjectionRepairSample = {
  index: number;
  x: number;
  y: number;
  expectedTerrain: number;
  actualTerrain: number;
};

type CoastProjectionRepairReport = {
  label: string;
  width: number;
  height: number;
  repairedCount: number;
  coastRepairCount: number;
  oceanRepairCount: number;
  samples: CoastProjectionRepairSample[];
};

function expectedTerrainForWaterClass(waterClass: number): number | null {
  if (waterClass === WATER_CLASS_COAST) {
    return CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST;
  }
  if (waterClass === WATER_CLASS_OCEAN) {
    return CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_OCEAN;
  }
  return null;
}

/**
 * Restores the declared map-morphology water terrain surface after adapter-owned
 * maintenance calls such as validateAndFixTerrain(). Land terrain is deliberately
 * skipped so mountains, hills, volcanoes, and natural-wonder terrain remain owned
 * by their projection steps. The coast-classification artifact owns shape and
 * cardinality admission before this repair policy runs.
 */
export function restoreProjectedCoastTerrain(
  context: MapContext,
  coastClassification: CoastClassificationSurface,
  label: string,
  options: { sampleLimit?: number } = {}
): CoastProjectionRepairReport {
  const { width, height } = context.setup.dimensions;
  const sampleLimit = Math.max(0, options.sampleLimit ?? DEFAULT_SAMPLE_LIMIT);
  let repairedCount = 0;
  let coastRepairCount = 0;
  let oceanRepairCount = 0;
  const samples: CoastProjectionRepairSample[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const expectedTerrain = expectedTerrainForWaterClass(
        coastClassification.waterClass[index] | 0
      );
      if (expectedTerrain == null) continue;

      const actualTerrain = context.adapter.getTerrainType(x, y) | 0;
      if (actualTerrain === expectedTerrain) continue;

      context.adapter.setTerrainType(x, y, expectedTerrain);
      repairedCount += 1;
      if (expectedTerrain === CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST) {
        coastRepairCount += 1;
      }
      if (expectedTerrain === CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_OCEAN) {
        oceanRepairCount += 1;
      }
      if (samples.length < sampleLimit) {
        samples.push({ index, x, y, expectedTerrain, actualTerrain });
      }
    }
  }

  if (repairedCount > 0) {
    context.adapter.storeWaterData();
    const payload = {
      type: "map.projection.coastTerrainRestored",
      label,
      width,
      height,
      repairedCount,
      coastRepairCount,
      oceanRepairCount,
      samples,
    };
    context.trace.event(() => payload);
    console.log(`[SWOOPER_MOD] COAST_TERRAIN_RESTORED_V1 ${JSON.stringify(payload)}`);
  }

  return {
    label,
    width,
    height,
    repairedCount,
    coastRepairCount,
    oceanRepairCount,
    samples,
  };
}
