import { collectMaskComponentsOddQ } from "@swooper/mapgen-core/lib/grid";
import { summarizeMetricComponents } from "@swooper/mapgen-metrics";

/** Product-facing land-mask measurements emitted by the Swooper dump analyzer. */
export type SwooperLandMaskSummary = Readonly<{
  land: number;
  water: number;
  pctLand: number;
  landComponents: number;
  largestLandComponent: number;
  largestLandFrac: number;
  totalLand: number;
}>;

/**
 * Summarizes one complete Swooper land mask using the shared periodic Civ7 grid topology.
 * Only the canonical value `1` is land; every other cell remains water evidence.
 */
export function summarizeSwooperLandMask(
  values: Uint8Array,
  width: number,
  height: number
): SwooperLandMaskSummary {
  const expectedSize = width * height;
  if (values.length !== expectedSize) {
    throw new Error(
      `Swooper land-mask size mismatch: values=${values.length} dims=${expectedSize}`
    );
  }

  let land = 0;
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === 1) land += 1;
  }

  const components = summarizeMetricComponents(
    collectMaskComponentsOddQ({ mask: values, width, height })
  );
  const largestLandComponent = components.largestComponentSize;

  return Object.freeze({
    land,
    water: values.length - land,
    pctLand: values.length > 0 ? land / values.length : 0,
    landComponents: components.componentCount,
    largestLandComponent,
    largestLandFrac: land > 0 ? largestLandComponent / land : 0,
    totalLand: land,
  });
}
