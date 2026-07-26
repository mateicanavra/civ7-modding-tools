type MapDimensions = Readonly<{ width: number; height: number }>;

/** Detached full-width adapter observation retained for placement visualization. */
export type EngineHeightfieldObservation = Readonly<{
  terrain: Int32Array;
  elevation: Int16Array;
  landMask: Uint8Array;
}>;

/** Narrow current engine heightfield captured for terrain/elevation parity. */
export type CurrentEngineHeightfield = Readonly<{
  width: number;
  height: number;
  terrain: Int32Array;
  elevation: Int16Array;
  waterMask: Uint8Array;
}>;

/** Narrow current engine classification captured around terrain maintenance. */
export type CurrentEngineTerrainClassification = Readonly<{
  width: number;
  height: number;
  terrain: Int32Array;
  waterMask: Uint8Array;
  lakeMask: Uint8Array;
}>;

/** Fresh engine identity channels consumed together by placement legality planning. */
export type CurrentEnginePlacementTypes = Readonly<{
  terrainType: Int32Array;
  biomeType: Int32Array;
  featureType: Int32Array;
}>;

/** Copies the engine water classification into Morphology's land-mask convention. */
export function engineLandMaskFromWaterMask(waterMask: Uint8Array): Uint8Array {
  return Uint8Array.from(waterMask, (isWater) => (isWater === 1 ? 0 : 1));
}

/** Captures only the current water classification when a full engine-surface read is unnecessary. */
export function captureEngineWaterMask(
  dimensions: MapDimensions,
  isWater: (x: number, y: number) => boolean
): Uint8Array {
  const { width, height } = dimensions;
  const waterMask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      waterMask[y * width + x] = isWater(x, y) ? 1 : 0;
    }
  }
  return waterMask;
}

/** Captures current full-width Civ7 terrain IDs without acquiring unrelated engine layers. */
export function captureEngineTerrainTypes(
  dimensions: MapDimensions,
  getTerrainType: (x: number, y: number) => number
): Int32Array {
  const { width, height } = dimensions;
  const terrain = new Int32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      terrain[y * width + x] = getTerrainType(x, y) | 0;
    }
  }
  return terrain;
}

/** Captures current full-width Civ7 feature IDs after the feature projection boundary. */
export function captureEngineFeatureTypes(
  dimensions: MapDimensions,
  getFeatureType: (x: number, y: number) => number
): Int32Array {
  const { width, height } = dimensions;
  const featureType = new Int32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      featureType[y * width + x] = getFeatureType(x, y) | 0;
    }
  }
  return featureType;
}

/** Captures the exact current engine IDs used by placement's legality oracle. */
export function captureEnginePlacementTypes(
  dimensions: MapDimensions,
  engine: Readonly<{
    getTerrainType: (x: number, y: number) => number;
    getBiomeType: (x: number, y: number) => number;
    getFeatureType: (x: number, y: number) => number;
  }>
): CurrentEnginePlacementTypes {
  const { width, height } = dimensions;
  const size = width * height;
  const terrainType = new Int32Array(size);
  const biomeType = new Int32Array(size);
  const featureType = new Int32Array(size);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      terrainType[index] = engine.getTerrainType(x, y) | 0;
      biomeType[index] = engine.getBiomeType(x, y) | 0;
      featureType[index] = engine.getFeatureType(x, y) | 0;
    }
  }
  return { terrainType, biomeType, featureType };
}

/** Captures only terrain, elevation, and water evidence needed by heightfield parity consumers. */
export function captureEngineHeightfield(
  dimensions: MapDimensions,
  engine: Readonly<{
    getTerrainType: (x: number, y: number) => number;
    getElevation: (x: number, y: number) => number;
    isWater: (x: number, y: number) => boolean;
  }>
): CurrentEngineHeightfield {
  const { width, height } = dimensions;
  const size = width * height;
  const terrain = new Int32Array(size);
  const elevation = new Int16Array(size);
  const waterMask = new Uint8Array(size);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      terrain[index] = engine.getTerrainType(x, y) | 0;
      elevation[index] = engine.getElevation(x, y) | 0;
      waterMask[index] = engine.isWater(x, y) ? 1 : 0;
    }
  }
  return { width, height, terrain, elevation, waterMask };
}

/** Captures terrain plus water/lake classification around engine maintenance boundaries. */
export function captureEngineTerrainClassification(
  dimensions: MapDimensions,
  engine: Readonly<{
    getTerrainType: (x: number, y: number) => number;
    isWater: (x: number, y: number) => boolean;
    isLake: (x: number, y: number) => boolean;
  }>
): CurrentEngineTerrainClassification {
  const { width, height } = dimensions;
  const size = width * height;
  const terrain = new Int32Array(size);
  const waterMask = new Uint8Array(size);
  const lakeMask = new Uint8Array(size);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      terrain[index] = engine.getTerrainType(x, y) | 0;
      waterMask[index] = engine.isWater(x, y) ? 1 : 0;
      lakeMask[index] = engine.isLake(x, y) ? 1 : 0;
    }
  }
  return { width, height, terrain, waterMask, lakeMask };
}
