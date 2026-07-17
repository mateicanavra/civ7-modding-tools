import placement from "@mapgen/domain/placement";
import type { Static } from "@swooper/mapgen-core/authoring";

type NaturalWonderPlan = Static<(typeof placement.ops.planNaturalWonders)["output"]>;

export type NaturalWonderPlanRuntimeRow = readonly [
  status: "p",
  plotIndex: number,
  x: number,
  y: number,
  featureType: number,
  direction: number,
  elevation: number | null,
  priorityPpm: number | null,
];

export type NaturalWonderPlanRuntimeTelemetry = {
  version: 1;
  wondersCount: number;
  targetCount: number;
  plannedCount: number;
  planRows: NaturalWonderPlanRuntimeRow[];
  coordinateEvidence: {
    version: 1;
    plannedCount: number;
    plannedHash32: string;
  };
};

const FNV1A_32_OFFSET = 0x811c9dc5;
const FNV1A_32_PRIME = 0x01000193;

function hash32Hex(input: string): string {
  let hash = FNV1A_32_OFFSET;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV1A_32_PRIME);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function normalizeInteger(value: unknown): number | null {
  return Number.isFinite(value) ? Math.trunc(value as number) : null;
}

function normalizePriorityPpm(value: unknown): number | null {
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.min(1_000_000, Math.round((value as number) * 1_000_000)));
}

function naturalWonderPlanCoordinateHash(rows: readonly NaturalWonderPlanRuntimeRow[]): string {
  return hash32Hex(
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
 * Projects a natural-wonder plan into bounded runtime evidence: at most 16
 * placement rows and an order-independent coordinate hash. Invalid optional
 * elevation/priority values remain explicit `null` sentinels.
 */
export function buildNaturalWonderPlanRuntimeTelemetry(
  plan: NaturalWonderPlan
): NaturalWonderPlanRuntimeTelemetry {
  const width = Math.max(1, plan.width | 0);
  const planRows: NaturalWonderPlanRuntimeRow[] = plan.placements.slice(0, 16).map((placement) => {
    const plotIndex = placement.plotIndex | 0;
    const y = (plotIndex / width) | 0;
    const x = plotIndex - y * width;
    return [
      "p",
      plotIndex,
      x,
      y,
      placement.featureType | 0,
      placement.direction | 0,
      normalizeInteger(placement.elevation),
      normalizePriorityPpm(placement.priority),
    ];
  });
  return {
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
  };
}

/** Builds and writes bounded natural-wonder plan evidence under the stable runtime log prefix. */
export function logNaturalWonderPlanRuntimeTelemetry(plan: NaturalWonderPlan): void {
  console.log(
    `[SWOOPER_MOD] NATURAL_WONDER_PLAN_V1 ${JSON.stringify(
      buildNaturalWonderPlanRuntimeTelemetry(plan)
    )}`
  );
}
