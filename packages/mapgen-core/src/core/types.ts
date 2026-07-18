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
 * - Context is a stable reference (but the remaining morphology buffer is mutable for performance)
 */

import type { EngineAdapter, MapDimensions } from "@civ7/adapter";
import type { Env } from "@mapgen/core/env.js";
import { initializeTerrainConstants } from "@mapgen/core/terrain-constants.js";
import { createLabelRng, type LabelRng } from "@mapgen/lib/rng/label.js";
import type { TraceScope } from "@mapgen/trace/index.js";
import { createNoopTraceScope } from "@mapgen/trace/index.js";

/**
 * Primary morphology staging buffer.
 * Captures the heightfield before flushing to engine.
 */
export interface HeightfieldBuffer {
  elevation: Int16Array;
  terrain: Uint8Array;
  landMask: Uint8Array;
}

/**
 * Mutable morphology staging memory retained until topography moves to explicit artifact vintages.
 *
 * NOTE:
 * - The heightfield is mutable and updated in-place across Morphology steps.
 * - Climate no longer uses this surface; Hydrology communicates through write-once artifacts.
 */
export interface MapBuffers {
  heightfield: HeightfieldBuffer;
}

/**
 * Store of published artifacts keyed by dependency tag id.
 *
 * Morphology's remaining heightfield buffer is not a dependency identity; steps
 * publish their durable outputs as admitted artifacts.
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
  /**
   * Mutable generation buffer retained only for Morphology heightfield staging.
   */
  buffers: MapBuffers;
}

// ============================================================================
// Factory Functions
// ============================================================================

const EMPTY_FROZEN_OBJECT = Object.freeze({});

/**
 * Create a new ExtendedMapContext with its remaining morphology buffer and empty artifact store.
 */
export function createExtendedMapContext(
  dimensions: MapDimensions,
  adapter: EngineAdapter,
  env: Env
): ExtendedMapContext {
  initializeTerrainConstants(adapter);
  const { width, height } = dimensions;
  const size = width * height;

  const heightfield: HeightfieldBuffer = {
    elevation: new Int16Array(size),
    terrain: new Uint8Array(size),
    landMask: new Uint8Array(size),
  };

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
    buffers: { heightfield },
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
