import { describe, expect, it } from "vitest";

import { createMapConfigSaveDeployOperationStore } from "../../src/server/mapConfigs/operationState";
import type { MapConfigSaveDeployStatus } from "../../src/features/mapConfigSave/status";

function createStore(options: { onChange?: (status: MapConfigSaveDeployStatus) => void } = {}) {
  let nowMs = Date.parse("2026-06-01T00:00:00.000Z");
  return {
    advance(ms: number) {
      nowMs += ms;
    },
    store: createMapConfigSaveDeployOperationStore({
      ttlMs: 1_000,
      now: () => new Date(nowMs),
      onChange: options.onChange,
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

  it("lists retained operations newest first and prunes stale records", () => {
    const harness = createStore();
    harness.store.create("studio-save-deploy-1");
    harness.advance(10);
    harness.store.create("studio-save-deploy-2");

    expect(harness.store.list().map((operation) => operation.requestId)).toEqual([
      "studio-save-deploy-2",
      "studio-save-deploy-1",
    ]);

    harness.advance(1_001);
    expect(harness.store.list()).toEqual([]);
  });

  it("emits transition snapshots for create, update, complete, and fail", () => {
    const events: MapConfigSaveDeployStatus[] = [];
    const { store } = createStore({ onChange: (status) => events.push(status) });

    store.create("studio-save-deploy-1");
    store.update("studio-save-deploy-1", {
      phase: "saving",
      path: "configs/studio-current.config.json",
    });
    store.complete("studio-save-deploy-1", { path: "configs/studio-current.config.json" });
    store.create("studio-save-deploy-2");
    store.fail("studio-save-deploy-2", "deploying", "Deploy failed");

    expect(events.map((event) => [event.requestId, event.phase, event.status])).toEqual([
      ["studio-save-deploy-1", "queued", "running"],
      ["studio-save-deploy-1", "saving", "running"],
      ["studio-save-deploy-1", "complete", "complete"],
      ["studio-save-deploy-2", "queued", "running"],
      ["studio-save-deploy-2", "failed", "failed"],
    ]);
  });

  it("records failed phase details and prunes stale records", () => {
    const harness = createStore();
    harness.store.create("studio-save-deploy-test");
    const failed = harness.store.fail("studio-save-deploy-test", "deploying", "Deploy failed", {
      path: "mods/mod-swooper-maps/src/maps/configs/studio-current.config.json",
      saved: false,
      deployed: false,
      details: {
        code: "save-deploy-existing-config-unavailable",
      },
    });

    expect(failed.status).toBe("failed");
    expect(failed.details?.failedAtPhase).toBe("deploying");
    expect(failed.details?.code).toBe("save-deploy-existing-config-unavailable");
    expect(failed.details?.recoveryActions).toContain("inspect-deploy-output");
    expect(failed.recoveryActions).toEqual([
      "copy-diagnostics",
      "retry-status",
      "retry-save-deploy",
      "inspect-deploy-output",
    ]);

    harness.advance(1_001);
    expect(harness.store.get("studio-save-deploy-test")).toBeUndefined();
  });
});
