import type { ResourceCatalogEntry } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import placement from "@mapgen/domain/placement";
import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import type { MapContext } from "@swooper/mapgen-core";
import type { ArtifactValueOf, DeepReadonly, Static } from "@swooper/mapgen-core/authoring";
import { fnv1a32StringHex } from "@swooper/mapgen-core/lib/hash";
import type { StandardNaturalWonderPlanInputMeasurements } from "../../metrics/families/placement/natural-wonder-plan-input.js";

type EngineTerrainWaterObservation = Readonly<{
  terrain: Int32Array;
  waterMask: Uint8Array;
}>;

type NaturalWonderPlan = Static<(typeof placement.wonders.ops.planNaturalWonders)["output"]>;
type ResourcePlacementOutcomes = ArtifactValueOf<
  typeof resourceSiteArtifacts.resourcePlacementOutcomes
>;
type NaturalWonderPlanTelemetryInput = Readonly<{
  width: NaturalWonderPlan["width"];
  wondersCount: NaturalWonderPlan["wondersCount"];
  targetCount: NaturalWonderPlan["targetCount"];
  plannedCount: NaturalWonderPlan["plannedCount"];
  placements: ReadonlyArray<
    Readonly<
      Pick<
        NaturalWonderPlan["placements"][number],
        "plotIndex" | "featureType" | "direction" | "elevation" | "priority"
      >
    >
  >;
}>;

type NaturalWonderPlanRuntimeRow = readonly [
  status: "p",
  plotIndex: number,
  x: number,
  y: number,
  featureType: number,
  direction: number,
  elevation: number | null,
  priorityPpm: number | null,
];

/**
 * Emits placement terrain statistics at sanctioned observation points when verbose tracing is on.
 * The measurement reads one detached Civ7 surface without mutating or reclassifying tiles.
 */
export function logTerrainStats(
  context: MapContext,
  stage: string,
  currentSurface: EngineTerrainWaterObservation
): void {
  context.trace.event(() => {
    const { width, height } = context.setup.dimensions;
    const terrain = CIV7_BROWSER_TABLES_V0.terrainTypeIndices;
    let flat = 0;
    let hill = 0;
    let mountain = 0;
    let water = 0;
    const total = width * height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (currentSurface.waterMask[index] === 1) {
          water++;
          continue;
        }
        const terrainType = currentSurface.terrain[index] ?? 0;
        if (terrainType === terrain.TERRAIN_MOUNTAIN) mountain++;
        else if (terrainType === terrain.TERRAIN_HILL) hill++;
        else flat++;
      }
    }

    const land = Math.max(1, flat + hill + mountain);
    return {
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
    };
  });
}

/**
 * Emits a top-to-bottom odd-q ASCII rendering of final terrain when verbose tracing is on.
 * This is an observation-only projection for live debugging, not a map classification step.
 */
export function logAsciiMap(
  context: MapContext,
  currentSurface: EngineTerrainWaterObservation
): void {
  context.trace.event(() => {
    const { width, height } = context.setup.dimensions;
    const terrain = CIV7_BROWSER_TABLES_V0.terrainTypeIndices;
    const lines: string[] = ["[Placement] Final Map ASCII:"];

    for (let y = height - 1; y >= 0; y--) {
      let row = "";
      if (y % 2 !== 0) row += " ";
      for (let x = 0; x < width; x++) {
        const value = currentSurface.terrain[y * width + x] ?? 0;
        const symbol =
          value === terrain.TERRAIN_MOUNTAIN
            ? "M"
            : value === terrain.TERRAIN_HILL
              ? "^"
              : value === terrain.TERRAIN_FLAT
                ? "."
                : value === terrain.TERRAIN_COAST
                  ? "~"
                  : value === terrain.TERRAIN_OCEAN
                    ? "O"
                    : value === terrain.TERRAIN_NAVIGABLE_RIVER
                      ? "R"
                      : "?";
        row += `${symbol} `;
      }
      lines.push(row);
    }

    return { type: "placement.ascii", lines };
  });
}

/**
 * Projects completed resource-placement evidence into the compact live-log
 * envelope consumed by Studio and Civ7 operational tooling.
 */
export function buildResourcePlacementRuntimeTelemetry(
  runtimeCatalog: readonly ResourceCatalogEntry[],
  placementOutcomes: DeepReadonly<ResourcePlacementOutcomes>
): Record<string, unknown> {
  const { summary, reconciliation, outcomes } = placementOutcomes;
  const runtimeByIndex = new Map(runtimeCatalog.map((row) => [row.index, row]));
  const plannedResourceTypes = summary.byResource.filter((row) => row.plannedCount > 0);
  const placedResourceTypes = summary.byResource.filter((row) => row.placedCount > 0);
  const rejectedResourceTypes = summary.byResource.filter((row) => row.rejectedCount > 0);
  const placedCounts = placedResourceTypes.map((row) => row.placedCount);
  const unmappedResourceTypes = summary.byResource.filter(
    (row) => row.placedCount > 0 && !runtimeByIndex.has(row.resourceType)
  );
  const rejectionRows = outcomes
    .filter((outcome) => outcome.status !== "placed")
    .slice(0, 8)
    .map((outcome) => ({
      status: outcome.status,
      resourceType: outcome.resourceType,
      resource: runtimeByIndex.get(outcome.resourceType)?.resourceType ?? null,
      plotIndex: outcome.plotIndex,
      x: outcome.x,
      y: outcome.y,
      reason: outcome.reason ?? null,
      ...(outcome.observedResourceType === undefined
        ? {}
        : {
            observedResourceType: outcome.observedResourceType,
            observedResource:
              runtimeByIndex.get(outcome.observedResourceType)?.resourceType ?? null,
          }),
    }));

  return {
    version: 1,
    plannedCount: summary.plannedCount,
    placedCount: summary.placedCount,
    rejectedCount: summary.rejectedCount,
    mismatchCount: summary.mismatchCount,
    uniquePlannedTypes: plannedResourceTypes.length,
    uniquePlacedTypes: placedResourceTypes.length,
    minPlacedCountByType: placedCounts.length > 0 ? Math.min(...placedCounts) : 0,
    maxPlacedCountByType: placedCounts.length > 0 ? Math.max(...placedCounts) : 0,
    runtimeCatalogCount: runtimeCatalog.length,
    coordinateEvidence: {
      version: summary.coordinateEvidence.version,
      placedCount: summary.coordinateEvidence.placed.count,
      placedHash32: summary.coordinateEvidence.placed.hash32,
      ...(summary.coordinateEvidence.rejected.count > 0
        ? {
            rejectedCount: summary.coordinateEvidence.rejected.count,
            rejectedHash32: summary.coordinateEvidence.rejected.hash32,
          }
        : {}),
      ...(summary.coordinateEvidence.mismatch.count > 0
        ? {
            mismatchCount: summary.coordinateEvidence.mismatch.count,
            mismatchHash32: summary.coordinateEvidence.mismatch.hash32,
          }
        : {}),
    },
    rejectedResourceTypes: rejectedResourceTypes.map((row) => row.resourceType),
    ...(rejectionRows.length === 0
      ? {}
      : { rejectionExampleCount: rejectionRows.length, rejectionRows }),
    ...(unmappedResourceTypes.length === 0
      ? {}
      : { unmappedPlacedResourceTypes: unmappedResourceTypes.map((row) => row.resourceType) }),
    reconciliation: {
      plannedCount: reconciliation.plannedCount,
      placedCount: reconciliation.placedCount,
      rejectedCount: reconciliation.rejectedCount,
      byPhase: reconciliation.byPhase,
      ...(reconciliation.shortfalls.length > 0 ? { shortfalls: reconciliation.shortfalls } : {}),
    },
    byReason: summary.byReason,
  };
}

/**
 * Writes resource-placement evidence under the stable live-runtime prefix.
 * An empty runtime catalog remains silent because no official resource
 * identity can be reported.
 */
export function logResourcePlacementRuntimeTelemetry(
  runtimeCatalog: readonly ResourceCatalogEntry[],
  placementOutcomes: DeepReadonly<ResourcePlacementOutcomes>
): void {
  if (runtimeCatalog.length === 0) return;
  console.log(
    `[SWOOPER_MOD] RESOURCE_PLACEMENT_V1 ${JSON.stringify(
      buildResourcePlacementRuntimeTelemetry(runtimeCatalog, placementOutcomes)
    )}`
  );
}

function normalizeInteger(value: unknown): number | null {
  return Number.isFinite(value) ? Math.trunc(value as number) : null;
}

function normalizePpm(value: unknown): number {
  return Number.isFinite(value)
    ? Math.max(0, Math.min(1_000_000, Math.round((value as number) * 1_000_000)))
    : 0;
}

function normalizeOptionalPpm(value: unknown): number | null {
  return Number.isFinite(value) ? normalizePpm(value) : null;
}

function naturalWonderPlanCoordinateHash(rows: readonly NaturalWonderPlanRuntimeRow[]): string {
  return fnv1a32StringHex(
    rows
      .slice()
      .sort((a, b) => {
        if (a[1] !== b[1]) return a[1] - b[1];
        if (a[4] !== b[4]) return a[4] - b[4];
        return a[5] - b[5];
      })
      .map((row) => row.join(":"))
      .join("|")
  );
}

/**
 * Preserves the bounded natural-wonder planning log consumed by current live
 * operational tooling. This is diagnostic serialization, not a causal product
 * or a trace-backed data transport.
 */
export function logNaturalWonderPlanRuntimeTelemetry(plan: NaturalWonderPlanTelemetryInput): void {
  const planRows: NaturalWonderPlanRuntimeRow[] = plan.placements.slice(0, 16).map((placement) => {
    const plotIndex = placement.plotIndex | 0;
    const y = (plotIndex / plan.width) | 0;
    const x = plotIndex - y * plan.width;
    return [
      "p",
      plotIndex,
      x,
      y,
      placement.featureType | 0,
      placement.direction | 0,
      normalizeInteger(placement.elevation),
      normalizeOptionalPpm(placement.priority),
    ];
  });
  const telemetry = {
    version: 1,
    wondersCount: Math.max(0, plan.wondersCount | 0),
    targetCount: Math.max(0, plan.targetCount | 0),
    plannedCount: Math.max(0, plan.plannedCount | 0),
    planRows,
    coordinateEvidence: {
      version: 1,
      plannedCount: planRows.length,
      plannedHash32: naturalWonderPlanCoordinateHash(planRows),
    },
  } as const;
  console.log(`[SWOOPER_MOD] NATURAL_WONDER_PLAN_V1 ${JSON.stringify(telemetry)}`);
}

/**
 * Serializes the recipe-owned planning-input measurement unchanged so every
 * consumer admits the same product contract rather than a second wire model.
 */
export function logNaturalWonderPlanInputRuntimeTelemetry(
  measurements: StandardNaturalWonderPlanInputMeasurements
): void {
  console.log(`[SWOOPER_MOD] NATURAL_WONDER_PLAN_INPUT_V2 ${JSON.stringify(measurements)}`);
}
