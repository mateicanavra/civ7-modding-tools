import { describe, expect, it } from "bun:test";

import {
  aggregatePlacementMetrics,
  PLACEMENT_METRICS_SCHEMA_VERSION,
  type PlacementMetricStatus,
  runPlacementMetrics,
} from "../../src/dev/diagnostics/placement-metrics.js";

/**
 * S0 harness self-test (placement-realignment).
 *
 * Asserts the harness WORKS: every expectation ID is reported, computed
 * summaries are finite, and the schema is stable. It deliberately does NOT
 * assert that the expectation ranges pass — current placement behavior is
 * known-broken (docs/projects/placement-realignment/diagnosis.md) and the S0
 * harness reports, it never gates.
 */

const EXPECTED_METRIC_IDS = [
  "E1.1",
  "E1.2",
  "E1.3",
  "E1.4",
  "E1.5",
  "E1.6",
  "E1.7",
  "E1.8",
  "E2.1",
  "E2.2",
  "E2.3",
  "E2.4",
  "E2.5",
  "E2.6",
  "E2.7",
  "E2.8",
  "E2.9",
  "E3.1",
  "E3.2",
  "E3.3",
  "E3.4",
  "E4.1",
  "E4.2",
  "E4.3",
  "E4.4",
] as const;

const VALID_STATUSES: ReadonlySet<PlacementMetricStatus> = new Set([
  "computed",
  "pending-s2",
  "pending-s3",
  "pending-s4",
  "requires-live-engine",
  "requires-studio-dump",
]);

describe("placement metrics harness (S0)", () => {
  const run = runPlacementMetrics({
    seed: 1337,
    width: 52,
    height: 32,
    playersLandmass1: 2,
    playersLandmass2: 2,
  });

  it("reports a stable schema", () => {
    expect(run.schemaVersion).toBe(PLACEMENT_METRICS_SCHEMA_VERSION);
    expect(run.options.seed).toBe(1337);
    expect(run.options.intendedPlayerCount).toBe(4);
    expect(Object.keys(run.metrics).sort()).toEqual([...EXPECTED_METRIC_IDS].sort());
  });

  it("labels every metric with its expectation ID and a declared status", () => {
    for (const id of EXPECTED_METRIC_IDS) {
      const result = run.metrics[id];
      expect(result).toBeDefined();
      expect(result!.id).toBe(id);
      expect(result!.expectation.length).toBeGreaterThan(0);
      expect(VALID_STATUSES.has(result!.status)).toBe(true);
    }
  });

  it("marks non-computable metrics explicitly instead of omitting them", () => {
    for (const id of EXPECTED_METRIC_IDS) {
      const result = run.metrics[id]!;
      if (result.status === "computed") continue;
      // Skipped metrics must say why (pending slice or live-engine/studio-only).
      expect(result.note ?? "").not.toBe("");
    }
  });

  it("produces finite numeric summaries for computed metrics", () => {
    let computedCount = 0;
    for (const id of EXPECTED_METRIC_IDS) {
      const result = run.metrics[id]!;
      if (result.status !== "computed") continue;
      computedCount++;
      expect(Object.keys(result.summary).length).toBeGreaterThan(0);
      for (const [key, value] of Object.entries(result.summary)) {
        if (typeof value === "number") {
          expect(Number.isFinite(value)).toBe(true);
        } else {
          expect(value === null || typeof value === "boolean").toBe(true);
        }
        expect(key.length).toBeGreaterThan(0);
      }
    }
    // The S0 harness must compute the core E1/E2/E3 set offline.
    expect(computedCount).toBeGreaterThanOrEqual(12);
  });

  it("computes the S3 resource expectation set offline (no pending-s3 left)", () => {
    const s3Set = ["E2.1", "E2.2", "E2.3", "E2.4", "E2.5", "E2.6", "E2.7", "E2.8", "E2.9", "E3.4"];
    for (const id of s3Set) {
      expect(run.metrics[id]!.status, id).toBe("computed");
    }
  });

  it("is deterministic for a fixed seed", () => {
    const rerun = runPlacementMetrics({
      seed: 1337,
      width: 52,
      height: 32,
      playersLandmass1: 2,
      playersLandmass2: 2,
    });
    for (const id of EXPECTED_METRIC_IDS) {
      expect(rerun.metrics[id]!.summary).toEqual(run.metrics[id]!.summary);
    }
  });

  it("aggregates runs across seeds with min/mean/max per summary key", () => {
    const second = runPlacementMetrics({
      seed: 1338,
      width: 52,
      height: 32,
      playersLandmass1: 2,
      playersLandmass2: 2,
    });
    const aggregate = aggregatePlacementMetrics([run, second]);
    expect(aggregate.schemaVersion).toBe(PLACEMENT_METRICS_SCHEMA_VERSION);
    expect(aggregate.runCount).toBe(2);
    expect(aggregate.seeds).toEqual([1337, 1338]);
    expect(Object.keys(aggregate.metrics).sort()).toEqual([...EXPECTED_METRIC_IDS].sort());
    const seated = aggregate.metrics["E1.2"]!.summary.seatedCount!;
    expect(seated.min).not.toBeNull();
    expect(seated.max).not.toBeNull();
    expect(seated.mean).not.toBeNull();
    if (seated.min != null && seated.max != null && seated.mean != null) {
      expect(seated.min).toBeLessThanOrEqual(seated.mean);
      expect(seated.mean).toBeLessThanOrEqual(seated.max);
    }
  });
});
