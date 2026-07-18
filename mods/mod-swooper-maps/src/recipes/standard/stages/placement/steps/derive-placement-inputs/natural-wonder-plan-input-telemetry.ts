import placement from "@mapgen/domain/placement";
import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { Static } from "@swooper/mapgen-core/authoring";

type NaturalWonderPlan = Static<(typeof placement.ops.planNaturalWonders)["output"]>;

/** Stable tuple emitted for each bounded natural-wonder planning input sample. */
export type NaturalWonderPlanInputRuntimeRow = readonly [
  status: "p",
  plotIndex: number,
  x: number,
  y: number,
  featureType: number,
  terrainType: number,
  biomeType: number,
  occupiedFeatureType: number,
  elevation: number,
  aridityPpm: number,
  riverClass: number,
  lakeMask: number,
  blockedMask: number,
  landMask: number,
];

/** Versioned runtime evidence for the exact surfaces consumed by wonder planning. */
export type NaturalWonderPlanInputRuntimeTelemetry = {
  version: 1;
  plannedCount: number;
  surfaceDigests: NaturalWonderPlanInputSurfaceDigests;
  inputRows: NaturalWonderPlanInputRuntimeRow[];
};

/** Deterministic hashes of each planning surface; field identity is part of the log contract. */
export type NaturalWonderPlanInputSurfaceDigests = {
  version: 1;
  plotCount: number;
  landMaskHash32: string;
  elevationHash32: string;
  aridityPpmHash32: string;
  riverClassHash32: string;
  lakeMaskHash32: string;
  blockedMaskHash32: string;
  terrainTypeHash32: string;
  biomeTypeHash32: string;
  featureTypeHash32: string;
};

type NaturalWonderPlanInputTelemetryArgs = {
  context: ExtendedMapContext;
  plan: NaturalWonderPlan;
  physical: {
    topography: {
      landMask: Uint8Array;
      elevation: Int16Array;
    };
    hydrography: {
      riverClass: Uint8Array;
    };
    lakePlan: {
      lakeMask: Uint8Array;
    };
    biomeClassification: {
      aridityIndex: Float32Array;
    };
    naturalWonderPlanSurfaces: {
      terrainType: Uint8Array;
      biomeType: Uint8Array;
      featureType: Int16Array;
      blockedMask: Uint8Array;
    };
  };
};

function normalizePpm(value: unknown): number {
  return Number.isFinite(value)
    ? Math.max(0, Math.min(1_000_000, Math.round((value as number) * 1_000_000)))
    : 0;
}

function hash32Values(values: Iterable<number>): string {
  let hash = 0x811c9dc5;
  for (const value of values) {
    hash ^= value & 0xff;
    hash = Math.imul(hash, 0x01000193);
    hash ^= (value >> 8) & 0xff;
    hash = Math.imul(hash, 0x01000193);
    hash ^= (value >> 16) & 0xff;
    hash = Math.imul(hash, 0x01000193);
    hash ^= (value >> 24) & 0xff;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Captures deterministic digests for the selected planning surfaces plus at
 * most the first 16 planned-site rows. Aridity is quantized to parts per
 * million so log evidence is stable across JSON serialization without
 * mutating source fields.
 */
export function buildNaturalWonderPlanInputRuntimeTelemetry({
  context,
  plan,
  physical,
}: NaturalWonderPlanInputTelemetryArgs): NaturalWonderPlanInputRuntimeTelemetry {
  const { width, height } = context.dimensions;
  const size = width * height;
  const inputRows: NaturalWonderPlanInputRuntimeRow[] = [];
  const { terrainType, biomeType, featureType, blockedMask } = physical.naturalWonderPlanSurfaces;
  const aridityPpm = new Uint32Array(size);
  for (let plotIndex = 0; plotIndex < size; plotIndex += 1) {
    aridityPpm[plotIndex] = normalizePpm(physical.biomeClassification.aridityIndex[plotIndex]);
  }
  for (const placementPlan of plan.placements.slice(0, 16)) {
    const plotIndex = placementPlan.plotIndex | 0;
    if (plotIndex < 0 || plotIndex >= size) continue;
    const y = (plotIndex / width) | 0;
    const x = plotIndex - y * width;
    inputRows.push([
      "p",
      plotIndex,
      x,
      y,
      placementPlan.featureType | 0,
      terrainType[plotIndex] ?? 0,
      biomeType[plotIndex] ?? 0,
      featureType[plotIndex] ?? 0,
      physical.topography.elevation[plotIndex] ?? 0,
      aridityPpm[plotIndex] ?? 0,
      physical.hydrography.riverClass[plotIndex] ?? 0,
      physical.lakePlan.lakeMask[plotIndex] ?? 0,
      blockedMask[plotIndex] ?? 0,
      physical.topography.landMask[plotIndex] ?? 0,
    ]);
  }
  return {
    version: 1,
    plannedCount: Math.max(0, plan.plannedCount | 0),
    surfaceDigests: {
      version: 1,
      plotCount: size,
      landMaskHash32: hash32Values(physical.topography.landMask),
      elevationHash32: hash32Values(physical.topography.elevation),
      aridityPpmHash32: hash32Values(aridityPpm),
      riverClassHash32: hash32Values(physical.hydrography.riverClass),
      lakeMaskHash32: hash32Values(physical.lakePlan.lakeMask),
      blockedMaskHash32: hash32Values(blockedMask),
      terrainTypeHash32: hash32Values(terrainType),
      biomeTypeHash32: hash32Values(biomeType),
      featureTypeHash32: hash32Values(featureType),
    },
    inputRows,
  };
}

/** Writes selected surface digests and a bounded planned-site sample under the runtime prefix. */
export function logNaturalWonderPlanInputRuntimeTelemetry(
  telemetry: NaturalWonderPlanInputRuntimeTelemetry
): void {
  console.log(`[SWOOPER_MOD] NATURAL_WONDER_PLAN_INPUT_V1 ${JSON.stringify(telemetry)}`);
}

/** Emits the same bounded planning telemetry only when verbose tracing is enabled. */
export function traceNaturalWonderPlanInputRuntimeTelemetry(
  context: ExtendedMapContext,
  telemetry: NaturalWonderPlanInputRuntimeTelemetry
): void {
  if (!context.trace?.isVerbose) return;
  context.trace.event(() => ({
    type: "naturalWonder.planInput",
    ...telemetry,
  }));
}
