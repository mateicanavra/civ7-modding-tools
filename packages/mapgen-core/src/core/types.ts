/**
 * Core Types — ExtendedMapContext and transitional data contracts
 *
 * Purpose:
 * - Define the seam between pure logic and engine coupling
 * - ExtendedMapContext holds the generation state used by authored passes
 * - EngineAdapter abstracts read/write operations (enables testing, replay, diffing)
 *
 * Invariants:
 * - Passes should ONLY access engine APIs via the adapter
 * - RNG calls should go through ctxRandom/ctxStepSeed for deterministic replay
 * - Context is a stable reference; pipeline evidence flows through write-once artifacts
 */

import type { EngineAdapter, MapDimensions } from "@civ7/adapter";
import type { Env } from "@mapgen/core/env.js";
import { initializeTerrainConstants } from "@mapgen/core/terrain-constants.js";
import { createLabelRng, type LabelRng } from "@mapgen/lib/rng/label.js";
import type { TraceScope } from "@mapgen/trace/index.js";
import { createNoopTraceScope } from "@mapgen/trace/index.js";

/**
 * Store of published artifacts keyed by dependency tag id.
 */
export class ArtifactStore extends Map<string, unknown> {}

// ============================================================================
// RNG Types
// ============================================================================

/**
 * RNG state for deterministic replay.
 *
 * MapGen-authored randomness is seeded from `Env.seed`; the Civ7 adapter RNG is
 * reserved for adapter-owned engine compatibility surfaces.
 */
export interface RNGState {
  callCounts: Map<string, number>;
  seed: number;
  nextInt: LabelRng;
}

// ============================================================================
// Extended MapContext
// ============================================================================

/**
 * Extended MapContext with all generation state.
 */
export interface ExtendedMapContext {
  dimensions: MapDimensions;
  rng: RNGState;
  env: Env;
  trace: TraceScope;
  adapter: EngineAdapter;
  /**
   * Published data products keyed by dependency tag.
   * Used by PipelineExecutor for runtime requires/provides gating.
   */
  artifacts: ArtifactStore;
}

// ============================================================================
// Factory Functions
// ============================================================================

const EMPTY_FROZEN_OBJECT = Object.freeze({});

/**
 * Creates a new ExtendedMapContext with deterministic RNG state and an empty artifact store.
 */
export function createExtendedMapContext(
  dimensions: MapDimensions,
  adapter: EngineAdapter,
  env: Env
): ExtendedMapContext {
  initializeTerrainConstants(adapter);
  return {
    dimensions,
    rng: {
      callCounts: new Map(),
      seed: env.seed,
      nextInt: createLabelRng(env.seed),
    },
    env,
    trace: createNoopTraceScope(),
    adapter,
    artifacts: new ArtifactStore(),
  };
}

/**
 * Deterministic RNG helper for MapContext.
 *
 * Tracks call counts per label for debugging and replay. This deliberately
 * derives from `ctx.env.seed`, not `ctx.adapter.getRandomNumber`, so browser,
 * tests, and Civ7 runtime all consume the same authored entropy stream.
 */
export function ctxRandom(ctx: ExtendedMapContext, label: string, max: number): number {
  const count = ctx.rng.callCounts.get(label) || 0;
  ctx.rng.callCounts.set(label, count + 1);
  return ctx.rng.nextInt(max, `${label}_${count}`);
}

/**
 * Canonical ctxRandom label for op-level seed derivation.
 * Format: "<stepId>:<opName>:<suffix>" (default suffix = "rngSeed").
 */
export function ctxRandomLabel(stepId: string, opName: string, suffix = "rngSeed"): string {
  return `${stepId}:${opName}:${suffix}`;
}

/**
 * Canonical helper for deriving op-level seeds from a MapGen context.
 *
 * Standard recipe code should prefer this over direct `ctxRandom(ctxRandomLabel(...), ...)`
 * so authored entropy is visible in the context RNG ledger and remains isolated
 * from Civ adapter RNG.
 */
export function ctxStepSeed(
  ctx: ExtendedMapContext,
  stepId: string,
  opName: string,
  suffix = "rngSeed"
): number {
  return ctxRandom(ctx, ctxRandomLabel(stepId, opName, suffix), 2_147_483_647);
}
