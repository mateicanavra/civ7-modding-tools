export type WetlandSubstrateMasks = Readonly<{
  lowlandMask: Uint8Array;
  floodplainMask: Uint8Array;
  intertidalCoastMask: Uint8Array;
  sinkBasinMask: Uint8Array;
  hydromorphicMask: Uint8Array;
  wellDrainedMask: Uint8Array;
  isolatedWaterPointMask: Uint8Array;
}>;

/**
 * Wet features need waterlogged or water-source substrate before climate can
 * choose a feature identity. These masks encode that policy once at the feature
 * substrate owner so marsh, bog, mangrove, oasis, and watering-hole scoring do
 * not each invent a different hydrology/topography proxy.
 */
export function computeWetlandSubstrateMasks(args: Readonly<{
  width: number;
  height: number;
  landMask: Uint8Array;
  elevation: Int16Array;
  seaLevel: number;
  riverClass: Uint8Array;
  discharge: Float32Array;
  sinkMask: Uint8Array;
  nearRiverMask: Uint8Array;
  isolatedRiverMask: Uint8Array;
  coastalLandMask: Uint8Array;
  nearRiverRadius: number;
  lowlandMaxElevationAboveSeaM: number;
  intertidalMaxElevationAboveSeaM: number;
  floodplainDischargeMin: number;
}>): WetlandSubstrateMasks {
  const width = args.width | 0;
  const height = args.height | 0;
  const size = Math.max(0, width * height);
  const riverRadius = Math.max(0, args.nearRiverRadius | 0);
  const lowlandMax = Math.max(0, args.lowlandMaxElevationAboveSeaM | 0);
  const intertidalMax = Math.max(0, args.intertidalMaxElevationAboveSeaM | 0);
  const dischargeMin = Math.max(0, args.floodplainDischargeMin);

  const lowlandMask = new Uint8Array(size);
  const floodplainMask = new Uint8Array(size);
  const intertidalCoastMask = new Uint8Array(size);
  const sinkBasinMask = new Uint8Array(size);
  const hydromorphicMask = new Uint8Array(size);
  const wellDrainedMask = new Uint8Array(size);
  const isolatedWaterPointMask = new Uint8Array(size);

  for (let y = 0; y < height; y++) {
    const y0 = Math.max(0, y - riverRadius);
    const y1 = Math.min(height - 1, y + riverRadius);
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (args.landMask[i] !== 1) continue;

      const heightAboveSeaM = (args.elevation[i] ?? 0) - args.seaLevel;
      const isLowland = heightAboveSeaM >= 0 && heightAboveSeaM <= lowlandMax;
      lowlandMask[i] = isLowland ? 1 : 0;

      const isIntertidal =
        args.coastalLandMask[i] === 1 &&
        heightAboveSeaM >= 0 &&
        heightAboveSeaM <= intertidalMax;
      intertidalCoastMask[i] = isIntertidal ? 1 : 0;

      const hasNearbyFlow = hasRiverFlowNear({
        x,
        y,
        width,
        x0: Math.max(0, x - riverRadius),
        x1: Math.min(width - 1, x + riverRadius),
        y0,
        y1,
        riverClass: args.riverClass,
        discharge: args.discharge,
        dischargeMin,
      });
      const isFloodplain = isLowland && args.nearRiverMask[i] === 1 && hasNearbyFlow;
      floodplainMask[i] = isFloodplain ? 1 : 0;

      const isSinkBasin = isLowland && args.sinkMask[i] === 1;
      sinkBasinMask[i] = isSinkBasin ? 1 : 0;

      const hydromorphic = isFloodplain || isIntertidal || isSinkBasin;
      hydromorphicMask[i] = hydromorphic ? 1 : 0;
      wellDrainedMask[i] = hydromorphic ? 0 : 1;

      // Oases and watering holes are point-scale arid water-source candidates:
      // isolated river influence is allowed, but broad floodplains are not.
      isolatedWaterPointMask[i] =
        (isLowland && args.isolatedRiverMask[i] === 1 && !isFloodplain) || isSinkBasin ? 1 : 0;
    }
  }

  return {
    lowlandMask,
    floodplainMask,
    intertidalCoastMask,
    sinkBasinMask,
    hydromorphicMask,
    wellDrainedMask,
    isolatedWaterPointMask,
  };
}

function hasRiverFlowNear(args: Readonly<{
  x: number;
  y: number;
  width: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  riverClass: Uint8Array;
  discharge: Float32Array;
  dischargeMin: number;
}>): boolean {
  for (let ny = args.y0; ny <= args.y1; ny++) {
    const row = ny * args.width;
    for (let nx = args.x0; nx <= args.x1; nx++) {
      const idx = row + nx;
      if ((args.riverClass[idx] ?? 0) === 0) continue;
      if (args.dischargeMin <= 0 || (args.discharge[idx] ?? 0) >= args.dischargeMin) {
        return true;
      }
    }
  }
  return false;
}
