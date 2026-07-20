/**
 * Histogram utilities for data distribution analysis.
 *
 * Provides helpers to build and log histograms for rainfall,
 * foundation metrics, and other numeric data.
 *
 * @module dev/histograms
 */

import type { EngineAdapter } from "@civ7/adapter";
import { devLog, devLogJson } from "@mapgen/dev/logging.js";
import type { TraceScope } from "@mapgen/trace/index.js";

/**
 * Build a histogram from a value array.
 *
 * @param values Array of numeric values
 * @param bins Number of bins (default: 10)
 * @param range Optional [min, max] range (auto-detected if not provided)
 * @returns Histogram with bin counts and metadata
 */
export function buildHistogram(
  values: number[] | Uint8Array | Int16Array | Float32Array,
  bins: number = 10,
  range?: [number, number]
): {
  counts: number[];
  total: number;
  min: number;
  max: number;
  binWidth: number;
} {
  const n = values.length;
  if (n === 0) {
    return { counts: new Array(bins).fill(0), total: 0, min: 0, max: 0, binWidth: 0 };
  }

  // Determine range
  let min: number, max: number;
  if (range) {
    [min, max] = range;
  } else {
    min = values[0];
    max = values[0];
    for (let i = 1; i < n; i++) {
      if (values[i] < min) min = values[i];
      if (values[i] > max) max = values[i];
    }
  }

  const binWidth = max > min ? (max - min) / bins : 1;
  const counts = new Array(bins).fill(0);

  for (let i = 0; i < n; i++) {
    const v = values[i];
    const binIdx = Math.min(bins - 1, Math.max(0, Math.floor((v - min) / binWidth)));
    counts[binIdx]++;
  }

  return { counts, total: n, min, max, binWidth };
}

/**
 * Format histogram as percentage strings.
 */
export function formatHistogramPercent(counts: number[], total: number): string[] {
  if (total === 0) return counts.map(() => "0.0%");
  return counts.map((c) => `${((c / total) * 100).toFixed(1)}%`);
}

/**
 * Log a rainfall histogram over non-water tiles.
 */
export function logRainfallHistogram(
  trace: TraceScope | null | undefined,
  adapter: EngineAdapter,
  width: number,
  height: number,
  options: { bins?: number } = {}
): void {
  if (!trace?.isVerbose) return;

  const bins = Math.max(5, Math.min(20, options.bins ?? 10));
  const values: number[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (adapter.isWater(x, y)) continue;
      values.push(adapter.getRainfall(x, y));
    }
  }

  if (values.length === 0) {
    devLog(trace, "[rainfall] histogram: No land samples");
    return;
  }

  const hist = buildHistogram(values, bins, [0, 200]);
  const pct = formatHistogramPercent(hist.counts, hist.total);

  devLogJson(trace, "rainfall histogram", {
    samples: hist.total,
    bins,
    distribution: pct,
  });
}

/**
 * Log rainfall statistics (min/max/avg/buckets).
 */
export function logRainfallStats(
  trace: TraceScope | null | undefined,
  adapter: EngineAdapter,
  width: number,
  height: number,
  label: string = "rainfall"
): void {
  if (!trace?.isVerbose) return;

  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let landTiles = 0;

  const buckets = { arid: 0, semiArid: 0, temperate: 0, wet: 0, lush: 0 };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (adapter.isWater(x, y)) continue;

      const value = adapter.getRainfall(x, y);
      landTiles++;
      if (value < min) min = value;
      if (value > max) max = value;
      sum += value;

      // Bucket classification
      if (value < 25) buckets.arid++;
      else if (value < 60) buckets.semiArid++;
      else if (value < 95) buckets.temperate++;
      else if (value < 130) buckets.wet++;
      else buckets.lush++;
    }
  }

  if (landTiles === 0) {
    devLog(trace, `[${label}] stats: No land tiles`);
    return;
  }

  devLogJson(trace, `${label} stats`, {
    landTiles,
    min,
    max,
    avg: Number((sum / landTiles).toFixed(2)),
    buckets,
  });
}

/**
 * Log foundation uplift/rift potential histograms.
 */
export function logFoundationHistograms(
  trace: TraceScope | null | undefined,
  width: number,
  height: number,
  foundation: {
    upliftPotential?: Uint8Array;
    riftPotential?: Uint8Array;
  },
  options: { bins?: number } = {}
): void {
  if (!trace?.isVerbose) return;

  const { upliftPotential, riftPotential } = foundation;
  if (!upliftPotential || !riftPotential) {
    devLog(trace, "[foundation] histograms: Missing uplift/rift data");
    return;
  }

  const bins = Math.max(5, Math.min(20, options.bins ?? 10));
  const size = Math.min(width * height, upliftPotential.length, riftPotential.length);

  // Collect values
  const upliftValues = Array.from(upliftPotential.slice(0, size));
  const riftValues = Array.from(riftPotential.slice(0, size));

  const upliftHist = buildHistogram(upliftValues, bins, [0, 255]);
  const riftHist = buildHistogram(riftValues, bins, [0, 255]);

  devLogJson(trace, "foundation uplift histogram", {
    samples: upliftHist.total,
    distribution: formatHistogramPercent(upliftHist.counts, upliftHist.total),
  });

  devLogJson(trace, "foundation rift histogram", {
    samples: riftHist.total,
    distribution: formatHistogramPercent(riftHist.counts, riftHist.total),
  });
}
