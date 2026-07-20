/**
 * Engine-safe warn logging for placement steps.
 *
 * The Civ7 live scripting runtime exposes `console.log` but NOT
 * `console.warn` (discovered during the Milestone A live evidence:
 * `place-resources` failed the whole generation with
 * "console.warn is not a function"). Loud fallback/shortfall reporting must
 * stay visible on live runs, so it routes through `console.warn` where it
 * exists (tests, browser studio, node) and falls back to `console.log` in
 * the engine.
 */
export function warnLog(message: string): void {
  const sink = console as unknown as {
    warn?: (msg: string) => void;
    log: (msg: string) => void;
  };
  if (typeof sink.warn === "function") {
    sink.warn(message);
    return;
  }
  sink.log(`[warn] ${message}`);
}

/**
 * Runs one placement product effect under the stage's shared trace and abort policy.
 * Mutating steps remain the behavior owners while every failure is emitted and rethrown
 * with the same placement boundary semantics.
 */
export function runPlacementProductStep<T>(
  stepId: string,
  emit: (payload: Record<string, unknown>) => void,
  fn: () => T
): T {
  try {
    return fn();
  } catch (error) {
    const message = toErrorMessage(error);
    emit({ type: `${stepId}.error`, error: message });
    throw new Error(`[SWOOPER_MOD] Aborting placement: ${stepId} failed (${message}).`);
  }
}

/**
 * Emits placement terrain statistics at sanctioned observation points when verbose tracing is on.
 * The measurement reads the projected adapter surface without mutating or reclassifying tiles.
 */
export function logTerrainStats(
  trace: TraceScope | null | undefined,
  adapter: ExtendedMapContext["adapter"],
  width: number,
  height: number,
  stage: string
): void {
  if (!trace?.isVerbose) return;
  let flat = 0;
  let hill = 0;
  let mountain = 0;
  let water = 0;
  const total = width * height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (adapter.isWater(x, y)) {
        water++;
        continue;
      }
      const terrainType = adapter.getTerrainType(x, y);
      if (terrainType === MOUNTAIN_TERRAIN) mountain++;
      else if (terrainType === HILL_TERRAIN) hill++;
      else flat++;
    }
  }

  const land = Math.max(1, flat + hill + mountain);
  trace.event(() => ({
    type: "placement.terrainStats",
    stage,
    totals: {
      water: Number(((water / total) * 100).toFixed(1)),
      land: Number(((land / total) * 100).toFixed(1)),
      landTiles: land,
    },
    shares: {
      mountains: Number(((mountain / land) * 100).toFixed(1)),
      hills: Number(((hill / land) * 100).toFixed(1)),
      flat: Number(((flat / land) * 100).toFixed(1)),
    },
  }));
}

/**
 * Emits a top-to-bottom odd-q ASCII rendering of final terrain when verbose tracing is on.
 * This is an observation-only projection for live debugging, not a map classification step.
 */
export function logAsciiMap(
  trace: TraceScope | null | undefined,
  adapter: ExtendedMapContext["adapter"],
  width: number,
  height: number
): void {
  if (!trace?.isVerbose) return;
  const lines: string[] = ["[Placement] Final Map ASCII:"];

  for (let y = height - 1; y >= 0; y--) {
    let row = "";
    if (y % 2 !== 0) row += " ";
    for (let x = 0; x < width; x++) {
      row += `${getTerrainSymbol(adapter.getTerrainType(x, y))} `;
    }
    lines.push(row);
  }

  trace.event(() => ({ type: "placement.ascii", lines }));
}

import type { ExtendedMapContext, TraceScope } from "@swooper/mapgen-core";
import { getTerrainSymbol, HILL_TERRAIN, MOUNTAIN_TERRAIN } from "@swooper/mapgen-core";

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
