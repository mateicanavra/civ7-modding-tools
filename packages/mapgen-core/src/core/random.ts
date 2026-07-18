import { drawMapContextRandomInternal, type MapContext } from "@mapgen/core/map-context.js";

/**
 * Draws deterministic MapGen-authored randomness and records per-label call order.
 *
 * The stream is seeded from `context.setup.mapSeed`, never the adapter RNG, so browsers, tests, and
 * Civ7 consume the same authored entropy sequence.
 */
export function ctxRandom(context: MapContext, label: string, max: number): number {
  return drawMapContextRandomInternal(context, label, max);
}

/** Builds the canonical label used to isolate an operation's deterministic random stream. */
export function ctxRandomLabel(stepId: string, opName: string, suffix = "rngSeed"): string {
  return `${stepId}:${opName}:${suffix}`;
}

/**
 * Derives one operation seed through the context RNG ledger.
 *
 * Keeping operation seeds in the shared ledger makes authored entropy order observable and keeps it
 * isolated from adapter-owned engine compatibility randomness.
 */
export function ctxStepSeed(
  context: MapContext,
  stepId: string,
  opName: string,
  suffix = "rngSeed"
): number {
  return ctxRandom(context, ctxRandomLabel(stepId, opName, suffix), 2_147_483_647);
}
