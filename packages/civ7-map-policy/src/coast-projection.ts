import { WATER_CLASS_COAST, WATER_CLASS_LAND, WATER_CLASS_OCEAN } from "./coast-classification.js";
import { applyCiv7CoastRingPolicy } from "./coast-ring.js";

/** Immutable Civ7 coast projection derived from Morphology land and shelf products. */
export type Civ7CoastProjection = Readonly<{
  width: number;
  height: number;
  baseWaterClass: Uint8Array;
  sourceCoastMask: Uint8Array;
  waterClass: Uint8Array;
  coastRingMask: Uint8Array;
  promotedOceanToCoast: number;
}>;

/** Inputs required to derive the complete Civ7 coast projection without reading engine state. */
export type Civ7CoastProjectionInput = Readonly<{
  width: number;
  height: number;
  landMask: ArrayLike<number>;
  shelfMask: ArrayLike<number>;
  coastalWater: ArrayLike<number>;
}>;

function assertGridLength(label: string, value: ArrayLike<number>, size: number): void {
  if (value.length !== size) {
    throw new Error(`[coastProjection] ${label} length ${value.length} does not match ${size}.`);
  }
}

/**
 * Derives the deterministic Civ7 water classes that projection steps stamp and later restore.
 *
 * Morphology owns land and shelf truth. This policy translates those products into Civ7's
 * land/coast/ocean classes, then applies the engine-required single shoreline ring. The result
 * is pure projection intent: callers may recompute it whenever they need the stable intended
 * surface rather than persisting an engine-shaped artifact.
 */
export function deriveCiv7CoastProjection(input: Civ7CoastProjectionInput): Civ7CoastProjection {
  const width = Math.max(0, input.width | 0);
  const height = Math.max(0, input.height | 0);
  const size = width * height;
  assertGridLength("landMask", input.landMask, size);
  assertGridLength("shelfMask", input.shelfMask, size);
  assertGridLength("coastalWater", input.coastalWater, size);

  const baseWaterClass = new Uint8Array(size);
  const sourceCoastMask = new Uint8Array(size);
  for (let index = 0; index < size; index++) {
    const isLand = input.landMask[index] === 1;
    const isSourceCoast =
      !isLand && (input.coastalWater[index] === 1 || input.shelfMask[index] === 1);
    if (isSourceCoast) sourceCoastMask[index] = 1;
    baseWaterClass[index] = isLand
      ? WATER_CLASS_LAND
      : isSourceCoast
        ? WATER_CLASS_COAST
        : WATER_CLASS_OCEAN;
  }

  const coastRing = applyCiv7CoastRingPolicy({
    width,
    height,
    waterClass: baseWaterClass,
  });

  return {
    width,
    height,
    baseWaterClass,
    sourceCoastMask,
    waterClass: coastRing.waterClass,
    coastRingMask: coastRing.coastRingMask,
    promotedOceanToCoast: coastRing.promotedOceanToCoast,
  };
}
