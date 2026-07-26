import { compareExactNumericGrids } from "@swooper/mapgen-diagnostics";
import {
  STANDARD_PARITY_SURFACE_KEYS,
  type StandardFinalSurfaceCapture,
  type StandardParityComparison,
  type StandardParitySurfaceKey,
} from "./types.js";

/** Bounded cell witness explaining one final-surface mismatch or missing readback. */
export type StandardSurfaceMismatchExample = Readonly<{
  x: number;
  y: number;
  local: number | null;
  live: number | null;
  classification: "value-mismatch" | "missing-live-readback";
}>;

/** Exact-grid comparison projected into Standard product terminology and evidence links. */
export type StandardSurfaceComparison = Readonly<{
  key: StandardParitySurfaceKey;
  claim: StandardParityComparison;
  compared: number;
  missingLive: number;
  mismatches: number;
  mismatchRatio: number;
  examples: ReadonlyArray<StandardSurfaceMismatchExample>;
  pairCounts: ReadonlyArray<Readonly<{ local: number | null; live: number | null; count: number }>>;
}>;

/** Compares the four product-owned Standard final surfaces through diagnostics' canonical grid comparator. */
export function compareStandardFinalSurfaces(
  local: StandardFinalSurfaceCapture,
  live: StandardFinalSurfaceCapture,
  options: Readonly<{ maxExamples?: number; maxPairs?: number }> = {}
): Readonly<Record<StandardParitySurfaceKey, StandardSurfaceComparison>> {
  return Object.fromEntries(
    STANDARD_PARITY_SURFACE_KEYS.map((key) => {
      const comparison = compareExactNumericGrids(local.grids[key], live.grids[key], options);
      if (comparison.outcome === "incompatible") {
        const report: StandardSurfaceComparison = {
          key,
          claim: {
            status: "fail",
            reason: `Local and live ${key} surfaces have incompatible dimensions or cardinality.`,
            evidenceLinks: [`surface.${key}.dimensions`],
          },
          compared: 0,
          missingLive: 0,
          mismatches: 0,
          mismatchRatio: 1,
          examples: [],
          pairCounts: [],
        };
        return [key, report] as const;
      }

      const failureLinks = [...(comparison.mismatches > 0 ? [`surface.${key}.mismatch`] : [])];
      const unresolvedLinks = [
        ...(comparison.missingObserved > 0 ? [`surface.${key}.live-readback`] : []),
      ];
      const evidenceLinks = [...failureLinks, ...unresolvedLinks];
      const report: StandardSurfaceComparison = {
        key,
        claim:
          evidenceLinks.length === 0
            ? {
                status: "pass",
                reason: `The complete live ${key} grid exactly matches the Standard replay.`,
                evidenceLinks: [`surface.${key}`],
              }
            : {
                status: comparison.missingObserved > 0 ? "unresolved" : "fail",
                reason:
                  comparison.missingObserved > 0 && comparison.mismatches > 0
                    ? `The live ${key} readback omits cells and diverges at other observed cells.`
                    : comparison.missingObserved > 0
                      ? `The live ${key} readback omitted one or more cells.`
                      : `The live ${key} grid diverges from the Standard replay.`,
                evidenceLinks,
                failureLinks,
                unresolvedLinks,
              },
        compared: comparison.compared,
        missingLive: comparison.missingObserved,
        mismatches: comparison.mismatches,
        mismatchRatio: comparison.mismatchRatio,
        examples: comparison.examples.map(({ x, y, expected, observed, reason }) => ({
          x,
          y,
          local: expected,
          live: observed,
          classification:
            reason === "missing-observation" ? "missing-live-readback" : "value-mismatch",
        })),
        pairCounts: comparison.pairCounts.map(({ expected, observed, count }) => ({
          local: expected,
          live: observed,
          count,
        })),
      };
      return [key, report] as const;
    })
  ) as Readonly<Record<StandardParitySurfaceKey, StandardSurfaceComparison>>;
}
