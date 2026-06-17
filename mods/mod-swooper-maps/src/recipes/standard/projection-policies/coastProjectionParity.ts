import { COAST_TERRAIN, type ExtendedMapContext, OCEAN_TERRAIN } from "@swooper/mapgen-core";

const WATER_CLASS_COAST = 1;
const WATER_CLASS_OCEAN = 2;
const DEFAULT_SAMPLE_LIMIT = 16;

export interface CoastClassificationSurface {
  width: number;
  height: number;
  waterClass: Uint8Array;
}

export interface CoastProjectionRepairSample {
  index: number;
  x: number;
  y: number;
  expectedTerrain: number;
  actualTerrain: number;
}

export interface CoastProjectionRepairReport {
  label: string;
  width: number;
  height: number;
  repairedCount: number;
  coastRepairCount: number;
  oceanRepairCount: number;
  samples: CoastProjectionRepairSample[];
}

function validateCoastSurface(
  context: ExtendedMapContext,
  coastClassification: CoastClassificationSurface,
  label: string
): void {
  const { width, height } = context.dimensions;
  const size = Math.max(0, (width | 0) * (height | 0));
  if ((coastClassification.width | 0) !== (width | 0)) {
    throw new Error(
      `[${label}] coastClassification width ${coastClassification.width} does not match ${width}.`
    );
  }
  if ((coastClassification.height | 0) !== (height | 0)) {
    throw new Error(
      `[${label}] coastClassification height ${coastClassification.height} does not match ${height}.`
    );
  }
  if (!(coastClassification.waterClass instanceof Uint8Array)) {
    throw new Error(`[${label}] coastClassification.waterClass must be a Uint8Array.`);
  }
  if (coastClassification.waterClass.length !== size) {
    throw new Error(
      `[${label}] coastClassification.waterClass length ${coastClassification.waterClass.length} does not match ${size}.`
    );
  }
}

function expectedTerrainForWaterClass(waterClass: number): number | null {
  if (waterClass === WATER_CLASS_COAST) return COAST_TERRAIN;
  if (waterClass === WATER_CLASS_OCEAN) return OCEAN_TERRAIN;
  return null;
}

/**
 * Restores the declared map-morphology water terrain surface after adapter-owned
 * maintenance calls such as validateAndFixTerrain(). Land terrain is deliberately
 * skipped so mountains, hills, volcanoes, and natural-wonder terrain remain owned
 * by their projection steps.
 */
export function restoreProjectedCoastTerrain(
  context: ExtendedMapContext,
  coastClassification: CoastClassificationSurface,
  label: string,
  options: { sampleLimit?: number } = {}
): CoastProjectionRepairReport {
  validateCoastSurface(context, coastClassification, label);

  const { width, height } = context.dimensions;
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
      if (expectedTerrain === COAST_TERRAIN) coastRepairCount += 1;
      if (expectedTerrain === OCEAN_TERRAIN) oceanRepairCount += 1;
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
