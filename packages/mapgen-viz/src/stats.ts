import type { VizNoDataSpec, VizScalarStats } from "./model.js";
import type { VizScalarSource } from "./projection.js";

function isNoData(value: number, noData: VizNoDataSpec | undefined): boolean {
  if (!noData || noData.kind === "none") return false;
  if (noData.kind === "nan") return Number.isNaN(value);
  return value === noData.value;
}

/**
 * Computes truthful scalar bounds directly from a typed projection source.
 *
 * No-data sentinels and non-finite values do not participate. `null` means the source contains no
 * admitted finite observations; callers must not invent replacement statistics.
 */
export function computeVizScalarStats(source: VizScalarSource): VizScalarStats | null {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < source.values.length; index += 1) {
    const value = source.values[index] as number;
    if (isNoData(value, source.valueSpec?.noData) || !Number.isFinite(value)) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }

  return Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null;
}
