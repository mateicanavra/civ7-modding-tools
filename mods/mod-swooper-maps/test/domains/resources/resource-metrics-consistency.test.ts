import { describe, expect, it } from "bun:test";
import { canonicalRecipeConfig } from "../../../src/maps/configs/canonical.js";
import swooperEarthlikeConfigRaw from "../../../src/maps/configs/swooper-earthlike.config.json";
import { collectWorldBalanceStats } from "../../support/world-balance-stats.js";

function sumRecordValues(record: Readonly<Record<string, number>>): number {
  return Object.values(record).reduce((sum, value) => sum + value, 0);
}

describe("resource metrics consistency", () => {
  it("reconciles planned, placed, rejected, and final resource counts", () => {
    const stats = collectWorldBalanceStats({
      label: "swooper-earthlike:resource-metrics",
      config: canonicalRecipeConfig(swooperEarthlikeConfigRaw),
      seed: 1018,
      width: 106,
      height: 66,
    });

    expect(stats.resourcePlannedCount).toBe(
      stats.resourcePlacedCount + stats.resourceRejectedCount + stats.resourceMismatchCount
    );
    expect(stats.resourceDemandTypeCount).toBeGreaterThan(0);
    expect(stats.resourcePlacedCount).toBeGreaterThan(0);
    expect(stats.resourceMismatchCount).toBe(0);
    expect(sumRecordValues(stats.resourcePlanTypeCounts)).toBe(stats.resourcePlannedCount);
    expect(sumRecordValues(stats.resourcePlacedTypeCounts)).toBe(stats.resourcePlacedCount);
    expect(sumRecordValues(stats.finalResourceTypeCounts)).toBe(stats.resourcePlacedCount);
  }, 30_000);
});
