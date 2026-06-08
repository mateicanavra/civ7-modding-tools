import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { Static } from "@swooper/mapgen-core/authoring";

import placement from "@mapgen/domain/placement";

type NaturalWonderPlan = Static<(typeof placement.ops.planNaturalWonders)["output"]>;

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

export type NaturalWonderPlanInputRuntimeTelemetry = {
  version: 1;
  plannedCount: number;
  inputRows: NaturalWonderPlanInputRuntimeRow[];
};

type NaturalWonderPlanInputTelemetryArgs = {
  context: ExtendedMapContext;
  plan: NaturalWonderPlan;
  physical: {
    topography: {
      landMask: Uint8Array;
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
  };
};

function normalizePpm(value: unknown): number {
  return Number.isFinite(value)
    ? Math.max(0, Math.min(1_000_000, Math.round((value as number) * 1_000_000)))
    : 0;
}

function blockedMaskValue(y: number, height: number): number {
  const polarWaterRows = Math.max(0, CIV7_BROWSER_TABLES_V0.mapGlobals.polarWaterRows | 0);
  return polarWaterRows > 0 && (y < polarWaterRows || y >= height - polarWaterRows) ? 1 : 0;
}

export function buildNaturalWonderPlanInputRuntimeTelemetry({
  context,
  plan,
  physical,
}: NaturalWonderPlanInputTelemetryArgs): NaturalWonderPlanInputRuntimeTelemetry {
  const { adapter } = context;
  const { width, height } = context.dimensions;
  const size = width * height;
  const inputRows: NaturalWonderPlanInputRuntimeRow[] = [];
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
      adapter.getTerrainType(x, y) | 0,
      adapter.getBiomeType(x, y) | 0,
      adapter.getFeatureType(x, y) | 0,
      context.buffers.heightfield.elevation[plotIndex] ?? 0,
      normalizePpm(physical.biomeClassification.aridityIndex[plotIndex]),
      physical.hydrography.riverClass[plotIndex] ?? 0,
      physical.lakePlan.lakeMask[plotIndex] ?? 0,
      blockedMaskValue(y, height),
      physical.topography.landMask[plotIndex] ?? 0,
    ]);
  }
  return {
    version: 1,
    plannedCount: Math.max(0, plan.plannedCount | 0),
    inputRows,
  };
}

export function logNaturalWonderPlanInputRuntimeTelemetry(
  telemetry: NaturalWonderPlanInputRuntimeTelemetry
): void {
  console.log(`[SWOOPER_MOD] NATURAL_WONDER_PLAN_INPUT_V1 ${JSON.stringify(telemetry)}`);
}

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
