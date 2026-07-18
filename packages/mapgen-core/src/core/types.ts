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
 * - Context is a stable reference (but buffers/fields are mutable for performance)
 * - Buffers are currently treated as artifacts for pipeline gating and DX
 *   (see ArtifactStore + MapBuffers notes for the temporary exception).
 */

import type { EngineAdapter, MapDimensions } from "@civ7/adapter";
import type { Env } from "@mapgen/core/env.js";
import { initializeTerrainConstants } from "@mapgen/core/terrain-constants.js";
import { createLabelRng, type LabelRng } from "@mapgen/lib/rng/label.js";
import type { TraceScope } from "@mapgen/trace/index.js";
import { createNoopTraceScope } from "@mapgen/trace/index.js";
import type {
  VizDataTypeKey,
  VizDims,
  VizLayerMeta,
  VizScalarFormat,
  VizSpaceId,
  VizValueSpec,
  VizVariantKey,
} from "@swooper/mapgen-viz";

export type {
  Bounds,
  VizBinaryRef,
  VizDataTypeKey,
  VizDims,
  VizLayerCategory,
  VizLayerEmissionV1,
  VizLayerEntryV1,
  VizLayerKey,
  VizLayerKind,
  VizLayerMeta,
  VizLayerVisibility,
  VizManifestV1,
  VizNoDataSpec,
  VizPaletteMode,
  VizScalarFormat,
  VizScalarStats,
  VizScaleType,
  VizSpaceId,
  VizValueDomain,
  VizValueSpec,
  VizValueTransform,
  VizVariantKey,
} from "@swooper/mapgen-viz";

// ============================================================================
// Field Buffer Types
// ============================================================================

/**
 * Typed arrays for terrain data
 */
export interface MapFields {
  rainfall: Uint8Array | null;
  elevation: Int16Array | null;
  temperature: Uint8Array | null;
  biomeId: Uint8Array | null;
  featureType: Int16Array | null;
  terrainType: Uint8Array | null;
}

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
 * Staged climate buffer for rainfall and humidity fields.
 */
export interface ClimateFieldBuffer {
  rainfall: Uint8Array;
  humidity: Uint8Array;
}

/**
 * Collection of reusable buffers shared across generation stages.
 *
 * NOTE:
 * - Buffers are mutable and are updated in-place across steps.
 * - Some buffers are also published as artifacts for gating/typing.
 * - Buffer artifacts are mutable after a single publish; do not republish them.
 * TODO(architecture): redesign buffers as a distinct dependency kind (not artifacts).
 */
export interface MapBuffers {
  heightfield: HeightfieldBuffer;
  climate: ClimateFieldBuffer;
}

/**
 * Store of published artifacts keyed by dependency tag id.
 *
 * Buffer artifacts are a temporary exception: they are published once and then
 * mutated in-place via ctx.buffers for performance. Do not republish buffers.
 * TODO(architecture): split buffers into their own dependency type (not artifacts).
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

export interface VizDumper {
  /**
   * Base directory for run dumps. The concrete run directory is typically
   * resolved as `${outputRoot}/${runId}`.
   *
   * NOTE: this is expected to be injected by local tooling; runtime/game code
   * should not assume it exists.
   */
  outputRoot: string;

  dumpGrid: (
    trace: TraceScope,
    layer: {
      dataTypeKey: VizDataTypeKey;
      variantKey?: VizVariantKey;
      spaceId: VizSpaceId;
      dims: VizDims;
      format: VizScalarFormat;
      values: ArrayBufferView;
      valueSpec?: VizValueSpec;
      meta?: VizLayerMeta;
    }
  ) => void;

  dumpPoints: (
    trace: TraceScope,
    layer: {
      dataTypeKey: VizDataTypeKey;
      variantKey?: VizVariantKey;
      spaceId: VizSpaceId;
      positions: Float32Array; // [x0,y0,x1,y1,...]
      values?: ArrayBufferView;
      valueFormat?: VizScalarFormat;
      valueSpec?: VizValueSpec;
      meta?: VizLayerMeta;
    }
  ) => void;

  dumpSegments: (
    trace: TraceScope,
    layer: {
      dataTypeKey: VizDataTypeKey;
      variantKey?: VizVariantKey;
      spaceId: VizSpaceId;
      segments: Float32Array; // [x0,y0,x1,y1,...] pairs per segment
      values?: ArrayBufferView;
      valueFormat?: VizScalarFormat;
      valueSpec?: VizValueSpec;
      meta?: VizLayerMeta;
    }
  ) => void;

  dumpGridFields: (
    trace: TraceScope,
    layer: {
      dataTypeKey: VizDataTypeKey;
      variantKey?: VizVariantKey;
      spaceId: VizSpaceId;
      dims: VizDims;
      fields: Record<
        string,
        {
          format: VizScalarFormat;
          values: ArrayBufferView;
          valueSpec?: VizValueSpec;
        }
      >;
      vector?: { u: string; v: string; magnitude?: string };
      meta?: VizLayerMeta;
    }
  ) => void;
}

// ============================================================================
// Extended MapContext
// ============================================================================

/**
 * Extended MapContext with all generation state.
 */
export interface ExtendedMapContext {
  dimensions: MapDimensions;
  fields: MapFields;
  rng: RNGState;
  env: Env;
  trace: TraceScope;
  viz?: VizDumper;
  adapter: EngineAdapter;
  /**
   * Published data products keyed by dependency tag (e.g. "artifact:climateField").
   * Used by PipelineExecutor for runtime requires/provides gating.
   */
  artifacts: ArtifactStore;
  /**
   * Mutable generation buffers for heightfield and climate staging.
   *
   * Some buffers are currently mirrored as artifacts for gating, but they remain
   * mutable after the initial publish. Do not republish buffer artifacts.
   */
  buffers: MapBuffers;
}

// ============================================================================
// Factory Functions
// ============================================================================

const EMPTY_FROZEN_OBJECT = Object.freeze({});

/**
 * Create a new ExtendedMapContext with default/empty fields.
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

  const rainfall = new Uint8Array(size);
  const climate: ClimateFieldBuffer = {
    rainfall,
    humidity: new Uint8Array(size),
  };

  return {
    dimensions,
    fields: {
      rainfall,
      elevation: new Int16Array(size),
      temperature: new Uint8Array(size),
      biomeId: new Uint8Array(size),
      featureType: new Int16Array(size),
      terrainType: new Uint8Array(size),
    },
    rng: {
      callCounts: new Map(),
      seed: env.seed,
      nextInt: createLabelRng(env.seed),
    },
    env,
    trace: createNoopTraceScope(),
    adapter,
    artifacts: new ArtifactStore(),
    buffers: {
      heightfield,
      climate,
    },
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

// ============================================================================
// Climate Writer
// ============================================================================

export interface ClimateWriteOptions {
  rainfall?: number;
  humidity?: number;
}

/**
 * Write staged climate values and mirror to engine adapter.
 */
export function writeClimateField(
  ctx: ExtendedMapContext,
  x: number,
  y: number,
  options: ClimateWriteOptions
): void {
  if (!ctx || !options) return;
  const { width } = ctx.dimensions;
  const idxValue = y * width + x;
  const climate = ctx.buffers?.climate;

  if (climate) {
    if (typeof options.rainfall === "number") {
      const rf = Math.max(0, Math.min(200, options.rainfall)) | 0;
      climate.rainfall[idxValue] = rf & 0xff;
      if (ctx.fields?.rainfall) {
        ctx.fields.rainfall[idxValue] = rf & 0xff;
      }
    }
    if (typeof options.humidity === "number") {
      const hum = Math.max(0, Math.min(255, options.humidity)) | 0;
      climate.humidity[idxValue] = hum & 0xff;
    }
  }

  if (typeof options.rainfall === "number") {
    ctx.adapter.setRainfall(x, y, Math.max(0, Math.min(200, options.rainfall)) | 0);
  }
}
