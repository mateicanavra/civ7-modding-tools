import { biomeSymbolFromIndex } from "../../domain/ecology/types.js";

export type EarthMetricsInput = {
  width: number;
  height: number;
  landMask: Uint8Array;
  lakeMask?: Uint8Array;
  riverClass?: Uint8Array;
  biomeIndex?: Uint8Array;
};

export type EarthMetrics = {
  landShare: number;
  lakeShare: number;
  riverClassShare: number;
  biomeDiversity: number;
  dominantBiome: string | null;
};

export function computeEarthMetrics(input: EarthMetricsInput): EarthMetrics {
  const width = input.width | 0;
  const height = input.height | 0;
  const size = Math.max(0, width * height);
  if (input.landMask.length !== size) {
    throw new Error(
      `[Diagnostics] landMask length mismatch (expected ${size}, got ${input.landMask.length}).`
    );
  }
  if (input.lakeMask && input.lakeMask.length !== size) {
    throw new Error(
      `[Diagnostics] lakeMask length mismatch (expected ${size}, got ${input.lakeMask.length}).`
    );
  }
  if (input.riverClass && input.riverClass.length !== size) {
    throw new Error(
      `[Diagnostics] riverClass length mismatch (expected ${size}, got ${input.riverClass.length}).`
    );
  }
  if (input.biomeIndex && input.biomeIndex.length !== size) {
    throw new Error(
      `[Diagnostics] biomeIndex length mismatch (expected ${size}, got ${input.biomeIndex.length}).`
    );
  }

  let landTiles = 0;
  let lakeTiles = 0;
  let riverTiles = 0;
  const biomeCounts = new Map<string, number>();

  for (let i = 0; i < size; i++) {
    if ((input.landMask[i] ?? 0) === 1) landTiles += 1;
    if ((input.lakeMask?.[i] ?? 0) === 1) lakeTiles += 1;
    if ((input.riverClass?.[i] ?? 0) > 0) riverTiles += 1;
    if (input.biomeIndex && (input.landMask[i] ?? 0) === 1) {
      const symbol = biomeSymbolFromIndex(input.biomeIndex[i] ?? 0);
      biomeCounts.set(symbol, (biomeCounts.get(symbol) ?? 0) + 1);
    }
  }

  let dominantBiome: string | null = null;
  let dominantCount = -1;
  for (const [symbol, count] of biomeCounts.entries()) {
    if (count > dominantCount) {
      dominantBiome = symbol;
      dominantCount = count;
    }
  }

  const denom = Math.max(1, size);
  return {
    landShare: landTiles / denom,
    lakeShare: lakeTiles / denom,
    riverClassShare: riverTiles / denom,
    biomeDiversity: biomeCounts.size,
    dominantBiome,
  };
}
