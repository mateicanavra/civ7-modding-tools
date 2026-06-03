import type { PlanIslandChainsTypes } from "../types.js";

type LabelRng = (range: number, label: string) => number;

type IslandConfig = PlanIslandChainsTypes["config"]["default"]["islands"];

/**
 * Ensures island-chain inputs match the expected map size.
 */
export function validateIslandInputs(
  input: PlanIslandChainsTypes["input"]
): {
  size: number;
  landMask: Uint8Array;
  boundaryCloseness: Uint8Array;
  boundaryType: Uint8Array;
  volcanism: Uint8Array;
  movementU: Int8Array;
  movementV: Int8Array;
} {
  const { width, height } = input;
  const size = Math.max(0, (width | 0) * (height | 0));
  const landMask = input.landMask as Uint8Array;
  const boundaryCloseness = input.boundaryCloseness as Uint8Array;
  const boundaryType = input.boundaryType as Uint8Array;
  const volcanism = input.volcanism as Uint8Array;
  const movementU = input.movementU as Int8Array;
  const movementV = input.movementV as Int8Array;
  if (
    landMask.length !== size ||
    boundaryCloseness.length !== size ||
    boundaryType.length !== size ||
    volcanism.length !== size ||
    movementU.length !== size ||
    movementV.length !== size
  ) {
    throw new Error("[IslandChains] Input tensors must match width*height.");
  }
  return { size, landMask, boundaryCloseness, boundaryType, volcanism, movementU, movementV };
}

/**
 * Normalizes island placement tunables from authored config.
 */
export function normalizeIslandTunables(config: PlanIslandChainsTypes["config"]["default"]): {
  threshold: number;
  minDist: number;
  baseDenActive: number;
  baseDenElse: number;
  hotspotDenom: number;
  microcontinentChance: number;
} {
  const islandsCfg = config.islands;
  return {
    threshold: islandsCfg.fractalThresholdPercent / 100,
    minDist: Math.max(0, islandsCfg.minDistFromLandRadius | 0),
    baseDenActive: Math.max(1, islandsCfg.baseIslandDenNearActive | 0),
    baseDenElse: Math.max(1, islandsCfg.baseIslandDenElse | 0),
    hotspotDenom: Math.max(1, islandsCfg.hotspotSeedDenom | 0),
    microcontinentChance: islandsCfg.microcontinentChance,
  };
}

/**
 * Determines whether a tile can seed an island chain.
 */
export function shouldSeedIsland(params: {
  noiseValue: number;
  threshold: number;
  baseDenom: number;
  hotspotSignal: number;
  hotspotDenom: number;
  microcontinentChance: number;
  rng: LabelRng;
}): boolean {
  const { noiseValue, threshold, baseDenom, hotspotSignal, hotspotDenom, microcontinentChance, rng } = params;
  const baseAllowed = noiseValue >= threshold && rng(baseDenom, "island-seed") === 0;
  const hotspotWeight = Math.max(0, Math.min(1, hotspotSignal));
  const hotspotDenomUsed = Math.max(1, Math.round(hotspotDenom / Math.max(0.1, hotspotWeight)));
  const hotspotAllowed = hotspotWeight > 0 && rng(hotspotDenomUsed, "hotspot-seed") === 0;
  const microAllowed =
    microcontinentChance > 0 && rng(1000, "microcontinent") / 1000 < microcontinentChance;
  return baseAllowed || hotspotAllowed || microAllowed;
}

/**
 * Chooses island terrain kind based on volcanism signal.
 */
export function selectIslandKind(params: {
  hotspotSignal: number;
  rng: LabelRng;
}): "coast" | "peak" {
  const { hotspotSignal, rng } = params;
  if (hotspotSignal <= 0) return "coast";
  const peakChance = Math.max(0, Math.min(1, 0.15 + hotspotSignal * 0.55));
  return rng(1000, "hotspot-peak") / 1000 < peakChance ? "peak" : "coast";
}

/**
 * Resolves cluster size for island seeds.
 */
export function resolveClusterCount(islands: IslandConfig, rng: LabelRng): number {
  const clusterMax = Math.max(1, islands.clusterMax | 0);
  return 1 + rng(clusterMax, "island-cluster");
}
