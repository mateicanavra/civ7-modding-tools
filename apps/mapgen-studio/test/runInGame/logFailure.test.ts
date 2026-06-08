import { describe, expect, it } from "vitest";

import {
  classifyCiv7MapgenLogFailure,
  waitForCiv7MapgenLogFailure,
} from "../../src/server/runInGame/logFailure";

describe("Civ7 mapgen log failure classifier", () => {
  it("classifies missing generated map scripts as notification-dismiss retry failures", () => {
    const failure = classifyCiv7MapgenLogFailure(
      [
        "[2026-06-05 01:21:01]\tCreating Context -  MapGeneration",
        "[2026-06-05 01:21:01]\tFailed to open file - fs://game/swooper-maps/maps/studio-current.js",
        "[2026-06-05 01:21:01]\tFailed to load file into script system - fs://game/swooper-maps/maps/studio-current.js",
      ].join("\n"),
      { mapScript: "{swooper-maps}/maps/studio-current.js" },
    );

    expect(failure).toMatchObject({
      code: "map-script-load-failed",
      dismissNotificationRequired: true,
      recoveryBoundary: "civ-notification-dismiss",
      mapScript: "{swooper-maps}/maps/studio-current.js",
    });
    expect(failure?.recoveryHint).toContain("Dismiss the Civ fatal notification");
  });

  it("classifies Swooper recipe exceptions as map generation script failures", () => {
    const failure = classifyCiv7MapgenLogFailure(
      [
        "[2026-06-05 01:33:39]\tCreating Context -  MapGeneration",
        "[2026-06-05 01:33:40]\t[SWOOPER_MOD] [recipe:standard] [44/50] start mod-swooper-maps.standard.placement.place-natural-wonders",
        "StepExecutionError: Step \"mod-swooper-maps.standard.placement.place-natural-wonders\" failed",
      ].join("\n"),
    );

    expect(failure).toMatchObject({
      code: "map-generation-script-failed",
      dismissNotificationRequired: true,
      recoveryBoundary: "civ-notification-dismiss",
    });
  });

  it("ignores unrelated log text", () => {
    expect(classifyCiv7MapgenLogFailure("ordinary shell log text")).toBeUndefined();
  });

  it("waits briefly for a delayed fatal map script log line", async () => {
    let nowMs = 0;
    let reads = 0;

    const failure = await waitForCiv7MapgenLogFailure({
      readFreshLogText: async () => {
        reads += 1;
        return reads < 3
          ? "ordinary shell log text"
          : "[2026-06-07 05:58:53]\tFailed to load file into script system - fs://game/swooper-maps/maps/studio-current.js";
      },
      sleep: async (ms) => {
        nowMs += ms;
      },
      now: () => nowMs,
      timeoutMs: 1_000,
      pollIntervalMs: 250,
      mapScript: "{swooper-maps}/maps/studio-current.js",
    });

    expect(failure).toMatchObject({
      code: "map-script-load-failed",
      mapScript: "{swooper-maps}/maps/studio-current.js",
    });
    expect(reads).toBe(3);
  });
});
