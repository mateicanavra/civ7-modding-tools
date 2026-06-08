import { Civ7DirectControlError } from "@civ7/direct-control";
import { describe, expect, it } from "vitest";

import {
  RunInGameHttpError,
  createRunInGameOperationStore,
} from "../../src/server/runInGame/operationState";

function createStore() {
  let nowMs = Date.parse("2026-06-01T00:00:00.000Z");
  return {
    advance(ms: number) {
      nowMs += ms;
    },
    store: createRunInGameOperationStore({
      serverInstanceId: "studio-server-test",
      serverStartedAt: "2026-06-01T00:00:00.000Z",
      ttlMs: 1_000,
      now: () => new Date(nowMs),
    }),
  };
}

describe("Run in Game operation store", () => {
  it("records phase progress and preserves request setup metadata", () => {
    const { store } = createStore();
    store.create("request-1", {
      recipeId: "mod-swooper-maps/standard",
      seed: 123,
      mapSize: "MAPSIZE_STANDARD",
      playerCount: 8,
      resources: "balanced",
      materializationMode: "disposable",
    });
    store.update("request-1", { phase: "deploying" });
    const complete = store.complete("request-1", { ok: true });

    expect(complete.status).toBe("complete");
    expect(complete.completedPhases).toEqual(["materializing", "deploying"]);
    expect(complete.request).toMatchObject({ seed: 123, mapSize: "MAPSIZE_STANDARD" });
    expect(complete.serverInstanceId).toBe("studio-server-test");
  });

  it("returns the active running operation so duplicate clicks do not enqueue another mutation", () => {
    const { store } = createStore();
    const first = store.create("request-1");

    expect(store.findActive()?.requestId).toBe(first.requestId);
    store.complete("request-1", { ok: true });
    expect(store.findActive()).toBeUndefined();
  });

  it("classifies row visibility failures as blocked with recovery actions", () => {
    const { store } = createStore();
    store.create("request-1");
    const failed = store.fail("request-1", "checking-civ7", new RunInGameHttpError(409, "row missing", {
      code: "setup-map-row-not-visible",
      reloadRequired: true,
    }));

    expect(failed.status).toBe("blocked");
    expect(failed.details?.code).toBe("setup-map-row-not-visible");
    expect(failed.recoveryActions).toContain("exit-to-shell-and-continue");
  });

  it("surfaces process restart recovery when setup row reload requires a Civ process boundary", () => {
    const { store } = createStore();
    store.create("request-1");
    const failed = store.fail("request-1", "checking-civ7", new RunInGameHttpError(409, "row missing", {
      code: "setup-map-row-not-visible",
      reloadRequired: true,
      reloadBoundary: "process-restart-required",
    }));

    expect(failed.status).toBe("blocked");
    expect(failed.recoveryActions).toContain("exit-to-shell-and-continue");
    expect(failed.recoveryActions).toContain("restart-civ-process-and-retry");
  });

  it("surfaces Civ notification dismissal recovery for map script fatal failures", () => {
    const { store } = createStore();
    store.create("request-1");
    const failed = store.fail("request-1", "waiting-for-proof", new RunInGameHttpError(500, "Civ7 could not load generated map script", {
      code: "map-script-load-failed",
      dismissNotificationRequired: true,
      recoveryBoundary: "civ-notification-dismiss",
    }));

    expect(failed.status).toBe("failed");
    expect(failed.recoveryActions).toContain("dismiss-civ-notification-and-retry");
    expect(failed.recoveryActions).not.toContain("restart-civ-process-and-retry");
  });

  it("classifies socket uncertainty after start without replaying the mutation", () => {
    const { store } = createStore();
    store.create("request-1");
    const failed = store.fail(
      "request-1",
      "starting-game",
      new Civ7DirectControlError("socket-closed", "socket closed after start request")
    );

    expect(failed.status).toBe("uncertain");
    expect(failed.details?.directControlCode).toBe("socket-closed");
    expect(store.findActive()).toBeUndefined();
  });

  it("prunes stale operation records after the configured ttl", () => {
    const harness = createStore();
    harness.store.create("request-1");
    harness.advance(1_001);

    expect(harness.store.get("request-1")).toBeUndefined();
  });
});
