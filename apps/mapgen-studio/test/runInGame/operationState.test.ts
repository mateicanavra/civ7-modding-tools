import { Civ7DirectControlError } from "@civ7/direct-control";
import { describe, expect, it } from "vitest";

import { createRunInGameOperationStore } from "../../src/server/runInGame/operationState";
import { StudioEngineError } from "../../src/server/studio/engineErrors";
import { formatRunInGameDiagnostics } from "../../src/features/runInGame/status";
import type { RunInGameOperationState } from "../../src/server/runInGame/operationState";

function createStore(options: { onChange?: (state: RunInGameOperationState) => void } = {}) {
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
      onChange: options.onChange,
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

  it("emits transition snapshots for create, update, complete, and fail", () => {
    const events: RunInGameOperationState[] = [];
    const { store } = createStore({ onChange: (state) => events.push(state) });

    store.create("request-1");
    store.update("request-1", { phase: "deploying" });
    store.complete("request-1", { ok: true });
    store.create("request-2");
    store.fail("request-2", "starting-game", new Error("launch failed"));

    expect(events.map((event) => [event.requestId, event.phase, event.status])).toEqual([
      ["request-1", "materializing", "running"],
      ["request-1", "deploying", "running"],
      ["request-1", "complete", "complete"],
      ["request-2", "materializing", "running"],
      ["request-2", "failed", "failed"],
    ]);
  });

  it("lists retained operations newest first and prunes stale records", () => {
    const harness = createStore();
    harness.store.create("request-1");
    harness.advance(10);
    harness.store.create("request-2");

    expect(harness.store.list().map((operation) => operation.requestId)).toEqual([
      "request-2",
      "request-1",
    ]);

    harness.advance(1_001);
    expect(harness.store.list()).toEqual([]);
  });

  it("classifies row visibility failures as blocked with recovery actions", () => {
    const { store } = createStore();
    store.create("request-1");
    const failed = store.fail("request-1", "checking-civ7", new StudioEngineError(409, "row missing", {
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
    const failed = store.fail("request-1", "checking-civ7", new StudioEngineError(409, "row missing", {
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
    const failed = store.fail("request-1", "waiting-for-proof", new StudioEngineError(500, "Civ7 could not load generated map script", {
      code: "map-script-load-failed",
      dismissNotificationRequired: true,
      recoveryBoundary: "civ-notification-dismiss",
    }));

    expect(failed.status).toBe("failed");
    expect(failed.recoveryActions).toContain("dismiss-civ-notification-and-retry");
    expect(failed.recoveryActions).not.toContain("restart-civ-process-and-retry");
  });

  it("surfaces Civ notification dismissal recovery for start-phase map script load failures", () => {
    const { store } = createStore();
    store.create("request-1");
    store.update("request-1", {
      phase: "restarting-civ",
      processRestart: {
        command: "open steam://rungameid/1295660",
        launchAttempts: [{ attempt: 1, processStart: { started: true } }],
      },
    });
    const failed = store.fail("request-1", "starting-game", new StudioEngineError(500, "Civ7 could not load generated map script", {
      code: "map-script-load-failed",
      dismissNotificationRequired: true,
      recoveryBoundary: "civ-notification-dismiss",
    }));

    expect(failed.status).toBe("failed");
    expect(failed.phase).toBe("failed");
    expect(failed.details?.phase).toBe("starting-game");
    expect(failed.processRestart).toMatchObject({
      command: "open steam://rungameid/1295660",
      launchAttempts: [{ attempt: 1, processStart: { started: true } }],
    });
    expect(failed.recoveryActions).toContain("dismiss-civ-notification-and-retry");
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

  it("keeps raw tuner command payloads out of public timeout status", () => {
    const { store } = createStore();
    store.create("request-1");
    const failed = store.fail(
      "request-1",
      "starting-game",
      new Civ7DirectControlError(
        "response-timeout",
        "Timed out waiting for Civ7 tuner response to CMD:65535:(() => { Game.turn; UI.notifyUIReady(); })()",
        {
          details: {
            message: "Civ7 tuner socket is closed before CMD:1:Game.turn",
            command: "Game.turn",
            state: { id: 1, name: "Tuner" },
            session: { stateName: "App UI", listenerId: 65_535 },
            nested: {
              rawCommand: "CMD:65535:UI.notifyUIReady()",
              sessionSelection: { state: "Tuner" },
              output: "before LSQ:state-list",
            },
          },
        },
      ),
    );

    expect(failed.status).toBe("uncertain");
    expect(failed.error).toBe("Civ7 did not respond during game start; status is uncertain.");
    expect(failed.details).toMatchObject({
      code: "response-timeout",
      directControlCode: "response-timeout",
      failureClass: "uncertain",
      phase: "starting-game",
    });

    const diagnostics = formatRunInGameDiagnostics(failed);
    expect(diagnostics).toContain("response-timeout");
    expect(diagnostics).toContain("redacted-runtime-command");
    expect(diagnostics).not.toContain("CMD:");
    expect(diagnostics).not.toContain("Game.turn");
    expect(diagnostics).not.toContain("UI.notifyUIReady");
    expect(diagnostics).not.toContain("rawCommand");
    expect(diagnostics).not.toContain('"command"');
    expect(diagnostics).not.toContain('"state"');
    expect(diagnostics).not.toContain('"stateName"');
    expect(diagnostics).not.toContain('"session"');
    expect(diagnostics).not.toContain('"sessionSelection"');
    expect(diagnostics).not.toContain('"Tuner"');
    expect(diagnostics).not.toContain('"App UI"');
  });

  it("prunes stale operation records after the configured ttl", () => {
    const harness = createStore();
    harness.store.create("request-1");
    harness.advance(1_001);

    expect(harness.store.get("request-1")).toBeUndefined();
  });
});
