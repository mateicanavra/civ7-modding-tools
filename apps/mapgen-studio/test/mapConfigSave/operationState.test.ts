import { describe, expect, it } from "vitest";

import { createMapConfigSaveDeployOperationStore } from "../../src/server/mapConfigs/operationState";

function createStore() {
  let nowMs = Date.parse("2026-06-01T00:00:00.000Z");
  return {
    advance(ms: number) {
      nowMs += ms;
    },
    store: createMapConfigSaveDeployOperationStore({
      ttlMs: 1_000,
      now: () => new Date(nowMs),
    }),
  };
}

describe("Map config save/deploy operation store", () => {
  it("tracks queued, running, and complete save/deploy status by request id", () => {
    const { store } = createStore();
    const initial = store.create("studio-save-deploy-test");
    expect(initial.phase).toBe("queued");
    expect(store.findActive()?.requestId).toBe("studio-save-deploy-test");

    store.update("studio-save-deploy-test", {
      phase: "saving",
      path: "mods/mod-swooper-maps/src/maps/configs/studio-current.config.json",
    });
    const complete = store.complete("studio-save-deploy-test", {
      path: "mods/mod-swooper-maps/src/maps/configs/studio-current.config.json",
      deploy: {
        build: { task: "mod-swooper-maps#build" },
        targetDir: "/Users/test/Library/Application Support/Civilization VII/Mods/mod-swooper-maps",
        modsDir: "/Users/test/Library/Application Support/Civilization VII/Mods",
        filesCopied: 12,
      },
    });

    expect(complete.status).toBe("complete");
    expect(complete.saved).toBe(true);
    expect(complete.deployed).toBe(true);
    expect(store.findActive()).toBeUndefined();
  });

  it("records failed phase details and prunes stale records", () => {
    const harness = createStore();
    harness.store.create("studio-save-deploy-test");
    const failed = harness.store.fail("studio-save-deploy-test", "deploying", "Deploy failed", {
      path: "mods/mod-swooper-maps/src/maps/configs/studio-current.config.json",
      saved: false,
      deployed: false,
    });

    expect(failed.status).toBe("failed");
    expect(failed.details?.failedAtPhase).toBe("deploying");

    harness.advance(1_001);
    expect(harness.store.get("studio-save-deploy-test")).toBeUndefined();
  });
});
