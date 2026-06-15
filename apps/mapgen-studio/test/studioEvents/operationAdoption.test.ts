import type {
  MapConfigSaveDeployStatus,
  RunInGameOperationStatus,
  StudioLiveGameEvent,
  StudioOperationEvent,
  StudioOperationsCurrent,
} from "@civ7/studio-server";
import { describe, expect, test } from "vitest";

import {
  STUDIO_EVENT_STREAM_RETRY_ATTEMPTS,
  studioEventsWatchClientContext,
  studioEventsWatchLiveOptions,
} from "../../src/app/hooks/useStudioEvents";
import {
  adoptStudioOperationsCurrent,
  applyStudioLiveGameEvent,
  applyStudioOperationEvent,
} from "../../src/app/operationAdoption";
import type { LiveRuntimeStatusState } from "../../src/features/liveRuntime/model";

describe("Studio event operation adoption", () => {
  test("adopts daemon current operations and marks terminal run-in-game toast as handled", () => {
    const state = adoptionState();

    adoptStudioOperationsCurrent(
      currentOperations({
        runInGame: {
          active: {
            ok: true,
            requestId: "run-1",
            phase: "complete",
            status: "complete",
            startedAt: "2026-06-13T00:00:00.000Z",
            updatedAt: "2026-06-13T00:00:01.000Z",
            completedPhases: ["materializing", "complete"],
          },
          recent: [],
        },
        saveDeploy: {
          active: null,
          recent: [
            {
              ok: true,
              requestId: "save-1",
              phase: "complete",
              status: "complete",
              startedAt: "2026-06-13T00:00:00.000Z",
              updatedAt: "2026-06-13T00:00:01.000Z",
              saved: true,
              deployed: true,
            },
          ],
        },
      }),
      state.targets
    );

    expect(state.runInGame?.requestId).toBe("run-1");
    expect(state.saveDeploy?.requestId).toBe("save-1");
    expect(state.handledRunInGameToasts).toEqual(["run-1"]);
  });

  test("clears stale displayed operations when daemon current truth is empty", () => {
    const state = adoptionState({
      runInGame: {
        ok: true,
        requestId: "stale-run",
        phase: "materializing",
        status: "running",
        startedAt: "2026-06-13T00:00:00.000Z",
        updatedAt: "2026-06-13T00:00:00.000Z",
        completedPhases: [],
      },
      saveDeploy: {
        ok: true,
        requestId: "stale-save",
        phase: "deploying",
        status: "running",
        startedAt: "2026-06-13T00:00:00.000Z",
        updatedAt: "2026-06-13T00:00:00.000Z",
      },
    });

    adoptStudioOperationsCurrent(currentOperations(), state.targets);

    expect(state.runInGame).toBeNull();
    expect(state.saveDeploy).toBeNull();
  });

  test("applies pushed Run in Game operation events without pre-handling terminal toasts", () => {
    const state = adoptionState();

    applyStudioOperationEvent(
      operationEvent({
        kind: "run-in-game",
        status: {
          ok: true,
          requestId: "run-pushed-1",
          phase: "complete",
          status: "complete",
          startedAt: "2026-06-13T00:00:00.000Z",
          updatedAt: "2026-06-13T00:00:01.000Z",
          completedPhases: ["materializing", "complete"],
        },
      }),
      state.targets
    );

    expect(state.runInGame?.requestId).toBe("run-pushed-1");
    expect(state.handledRunInGameToasts).toEqual([]);
  });

  test("applies pushed Save&Deploy operation events", () => {
    const state = adoptionState();

    applyStudioOperationEvent(
      operationEvent({
        kind: "save-deploy",
        status: {
          ok: true,
          requestId: "save-pushed-1",
          phase: "complete",
          status: "complete",
          startedAt: "2026-06-13T00:00:00.000Z",
          updatedAt: "2026-06-13T00:00:01.000Z",
          saved: true,
          deployed: true,
        },
      }),
      state.targets
    );

    expect(state.saveDeploy?.requestId).toBe("save-pushed-1");
  });

  test("applies pushed live-game events", () => {
    let liveRuntime: LiveRuntimeStatusState | null = null;

    applyStudioLiveGameEvent(
      liveGameEvent({
        status: "ok",
        turn: 12,
        gameHash: 987654,
        seed: 123,
        readiness: "ready",
        snapshotStatus: "idle",
        snapshotId: "status:12:abcdef01",
        snapshotHash: "abcdef01",
        bindingStatus: "unbound-runtime",
        failureCount: 0,
      }),
      {
        applyLiveGameState(state) {
          liveRuntime = state;
        },
      }
    );

    expect(liveRuntime?.status).toBe("ok");
    expect(liveRuntime?.turn).toBe(12);
    expect(liveRuntime?.snapshotId).toBe("status:12:abcdef01");
  });

  test("builds live event query options with scoped stream retry context", () => {
    const options = studioEventsWatchLiveOptions();

    expect(studioEventsWatchClientContext()).toEqual({
      retry: Number.POSITIVE_INFINITY,
    });
    expect(STUDIO_EVENT_STREAM_RETRY_ATTEMPTS).toBe(Number.POSITIVE_INFINITY);
    expect(JSON.stringify(options.queryKey)).toContain('"live"');
    expect(JSON.stringify(options.queryKey)).toContain('"studio"');
    expect(JSON.stringify(options.queryKey)).toContain('"events"');
    expect(JSON.stringify(options.queryKey)).toContain('"watch"');
    expect(typeof options.queryFn).toBe("function");
  });
});

function adoptionState(initial?: {
  runInGame?: RunInGameOperationStatus | null;
  saveDeploy?: MapConfigSaveDeployStatus | null;
}) {
  const state = {
    runInGame: initial?.runInGame ?? null,
    saveDeploy: initial?.saveDeploy ?? null,
    handledRunInGameToasts: [] as string[],
    targets: {
      setRunInGameOperation(operation: RunInGameOperationStatus | null) {
        state.runInGame = operation;
      },
      setSaveDeployOperation(operation: MapConfigSaveDeployStatus | null) {
        state.saveDeploy = operation;
      },
      markRunInGameToastHandled(requestId: string) {
        state.handledRunInGameToasts.push(requestId);
      },
    },
  };
  return state;
}

function operationEvent(
  event: Omit<StudioOperationEvent, "type" | "observedAt">
): StudioOperationEvent {
  return {
    type: "operation",
    observedAt: "2026-06-13T00:00:02.000Z",
    ...event,
  } as StudioOperationEvent;
}

function liveGameEvent(state: StudioLiveGameEvent["state"]): StudioLiveGameEvent {
  return {
    type: "live-game",
    observedAt: "2026-06-13T00:00:02.000Z",
    state,
  };
}

function currentOperations(overrides?: Partial<StudioOperationsCurrent>): StudioOperationsCurrent {
  return {
    ok: true,
    serverInstanceId: "studio-test",
    serverStartedAt: "2026-06-13T00:00:00.000Z",
    observedAt: "2026-06-13T00:00:00.000Z",
    runInGame: {
      active: null,
      recent: [],
    },
    saveDeploy: {
      active: null,
      recent: [],
    },
    ...overrides,
  };
}
