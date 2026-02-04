import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import type { TraceEvent } from "@swooper/mapgen-core";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { realismEarthlikeConfig } from "../../src/maps/presets/realism/earthlike.config.js";

type DualReadSummary = {
  kind: "morphology.dualRead.summary";
  boundaryMatchFraction?: number;
  upliftMeanAbsDiff?: number;
  riftMeanAbsDiff?: number | null;
  provenanceBoundaryMatchFraction?: number | null;
};

function isDualReadSummary(value: unknown): value is DualReadSummary {
  return Boolean(value) && typeof value === "object" && (value as DualReadSummary).kind === "morphology.dualRead.summary";
}

describe("Morphology dual-read diagnostics", () => {
  it("emits a quantitative summary with non-trivial deltas", () => {
    const width = 24;
    const height = 14;
    const seed = 424242;

    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -60,
      MaxLatitude: 60,
      PlayersLandmass1: 4,
      PlayersLandmass2: 4,
      StartSectorRows: 4,
      StartSectorCols: 4,
    };

    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: {
        topLatitude: mapInfo.MaxLatitude,
        bottomLatitude: mapInfo.MinLatitude,
      },
      trace: {
        steps: {
          "mod-swooper-maps.standard.morphology-coasts.landmass-plates": "verbose",
        },
      },
    };

    const adapter = createMockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createExtendedMapContext({ width, height }, adapter, env);
    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]", storyEnabled: true });

    const events: TraceEvent[] = [];
    standardRecipe.run(context, env, realismEarthlikeConfig, {
      log: () => {},
      traceSink: { emit: (event) => events.push(event) },
    });

    const summary = events
      .filter((event) => event.kind === "step.event")
      .map((event) => event.data)
      .find(isDualReadSummary);

    expect(summary).toBeTruthy();
    expect(summary?.boundaryMatchFraction).toBeGreaterThanOrEqual(0);
    expect(summary?.boundaryMatchFraction).toBeLessThanOrEqual(1);
    expect(summary?.upliftMeanAbsDiff).toBeGreaterThan(0);
    expect(summary?.provenanceBoundaryMatchFraction).not.toBeNull();
  });
});
