import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  MapConfigSaveDeployStatus,
  RunInGameOperationStatus,
  StudioLiveGameEvent,
  StudioOperationEvent,
  StudioOperationsCurrent,
} from "@civ7/studio-contract";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { describe, expect, test } from "vitest";

import {
  STUDIO_EVENT_STREAM_RETRY_ATTEMPTS,
  studioEventsWatchClientContext,
  studioEventsWatchLiveOptions,
  studioEventsWatchLiveOptionsFor,
} from "../../src/app/hooks/useStudioEvents";
import {
  adoptStudioOperationsCurrent,
  applyStudioLiveGameEvent,
  applyStudioOperationEvent,
  readAndAdoptStudioOperationsCurrent,
} from "../../src/app/operationAdoption";
import {
  formatStudioDaemonIdentityMismatch,
  formatStudioEventStreamError,
  identityFromStudioOperationsCurrent,
  sameStudioDaemonIdentity,
  studioBusyGateMessage,
  studioEventClearsStreamError,
} from "../../src/app/studioEventRecovery";
import type { LiveRuntimeStatusState } from "../../src/features/liveRuntime/model";

const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));

describe("Studio event operation adoption", () => {
  test("adopts active daemon current operations without marking terminal toasts", () => {
    const state = adoptionState();

    adoptStudioOperationsCurrent(
      currentOperations({
        runInGame: {
          active: {
            ok: true,
            requestId: "run-1",
            phase: "deploying",
            status: "running",
            startedAt: "2026-06-13T00:00:00.000Z",
            updatedAt: "2026-06-13T00:00:01.000Z",
            completedPhases: ["materializing"],
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
    expect(state.handledRunInGameToasts).toEqual([]);
  });

  test("adopts retained terminal current operations as recent display state", () => {
    const state = adoptionState();

    adoptStudioOperationsCurrent(
      currentOperations({
        runInGame: {
          active: null,
          recent: [
            {
              ok: true,
              requestId: "run-terminal",
              phase: "complete",
              status: "complete",
              startedAt: "2026-06-13T00:00:00.000Z",
              updatedAt: "2026-06-13T00:00:01.000Z",
              completedPhases: ["materializing", "complete"],
            },
          ],
        },
      }),
      state.targets
    );

    expect(state.runInGame?.requestId).toBe("run-terminal");
    expect(state.handledRunInGameToasts).toEqual(["run-terminal"]);
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

  test("does not erase newer local terminal Run in Game diagnostics with older current truth", () => {
    const state = adoptionState({
      runInGame: {
        ok: false,
        requestId: "run-local-failed",
        phase: "failed",
        status: "failed",
        startedAt: "2026-06-13T00:00:02.000Z",
        updatedAt: "2026-06-13T00:00:03.000Z",
        completedPhases: ["materializing", "deploying", "preparing-setup"],
        error: "Civ7 setup cannot see {swooper-maps}/maps/studio-current.js",
      },
    });

    adoptStudioOperationsCurrent(currentOperations(), state.targets, {
      currentRunInGameOperation: state.runInGame,
    });

    expect(state.runInGame?.requestId).toBe("run-local-failed");
    expect(state.runInGame?.error).toContain("{swooper-maps}/maps/studio-current.js");
  });

  test("does not replace newer local terminal Run in Game diagnostics with an older recent operation", () => {
    const state = adoptionState({
      runInGame: {
        ok: false,
        requestId: "run-local-failed",
        phase: "failed",
        status: "failed",
        startedAt: "2026-06-13T00:00:02.000Z",
        updatedAt: "2026-06-13T00:00:05.000Z",
        completedPhases: ["materializing", "deploying", "preparing-setup"],
        error: "Civ7 setup cannot see {swooper-maps}/maps/studio-current.js",
      },
    });

    adoptStudioOperationsCurrent(
      currentOperations({
        observedAt: "2026-06-13T00:00:06.000Z",
        runInGame: {
          active: null,
          recent: [
            {
              ok: true,
              requestId: "older-terminal",
              phase: "complete",
              status: "complete",
              startedAt: "2026-06-13T00:00:00.000Z",
              updatedAt: "2026-06-13T00:00:01.000Z",
              completedPhases: ["complete"],
            },
          ],
        },
      }),
      state.targets,
      { currentRunInGameOperation: state.runInGame }
    );

    expect(state.runInGame?.requestId).toBe("run-local-failed");
  });

  test("adopts newer active current operations over local terminal state", () => {
    const state = adoptionState({
      runInGame: {
        ok: false,
        requestId: "run-local-failed",
        phase: "failed",
        status: "failed",
        startedAt: "2026-06-13T00:00:02.000Z",
        updatedAt: "2026-06-13T00:00:05.000Z",
        completedPhases: ["materializing"],
        error: "old local error",
      },
    });

    adoptStudioOperationsCurrent(
      currentOperations({
        observedAt: "2026-06-13T00:00:06.000Z",
        runInGame: {
          active: {
            ok: true,
            requestId: "run-active-new",
            phase: "deploying",
            status: "running",
            startedAt: "2026-06-13T00:00:06.000Z",
            updatedAt: "2026-06-13T00:00:07.000Z",
            completedPhases: ["materializing"],
          },
          recent: [],
        },
      }),
      state.targets,
      { currentRunInGameOperation: state.runInGame }
    );

    expect(state.runInGame?.requestId).toBe("run-active-new");
  });

  test("shell boot adoption reads daemon current without status replay", async () => {
    const state = adoptionState();
    let currentReads = 0;

    await readAndAdoptStudioOperationsCurrent({
      readCurrent: async () => {
        currentReads += 1;
        return currentOperations({
          runInGame: {
            active: {
              ok: true,
              requestId: "run-active",
              phase: "starting-game",
              status: "running",
              startedAt: "2026-06-13T00:00:00.000Z",
              updatedAt: "2026-06-13T00:00:01.000Z",
              completedPhases: ["materializing"],
            },
            recent: [],
          },
        });
      },
      targets: state.targets,
      onError: () => {
        throw new Error("unexpected current read failure");
      },
    });

    expect(currentReads).toBe(1);
    expect(state.runInGame?.requestId).toBe("run-active");

    const adoptionSource = readFileSync(
      join(repoRoot, "apps/mapgen-studio/src/app/operationAdoption.ts"),
      "utf8"
    );
    expect(adoptionSource).not.toMatch(
      /fetchRunInGameStatus|fetchSaveDeployStatus|runInGame\.status|mapConfigs\.status/
    );

    const shellSource = readFileSync(
      join(repoRoot, "apps/mapgen-studio/src/app/StudioShell.tsx"),
      "utf8"
    );
    const bootEffect = sourceBlockAround(shellSource, "void readAndAdoptStudioOperationsCurrent");
    expect(bootEffect).toContain("orpcClient.studio.operations.current({})");
    expect(bootEffect).not.toMatch(
      /fetchRunInGameStatus|fetchSaveDeployStatus|runInGame\.status|mapConfigs\.status/
    );
  });

  test("current adoption reads latest local operation at adoption time", async () => {
    const state = adoptionState();
    let localOperation: RunInGameOperationStatus | null = null;
    let resolveCurrent: ((current: StudioOperationsCurrent) => void) | null = null;
    const currentPromise = new Promise<StudioOperationsCurrent>((resolve) => {
      resolveCurrent = resolve;
    });

    const read = readAndAdoptStudioOperationsCurrent({
      readCurrent: () => currentPromise,
      targets: state.targets,
      getCurrentRunInGameOperation: () => localOperation,
      onError: () => {
        throw new Error("unexpected current read failure");
      },
    });

    localOperation = {
      ok: false,
      requestId: "run-local-after-read-start",
      phase: "failed",
      status: "failed",
      startedAt: "2026-06-13T00:00:02.000Z",
      updatedAt: "2026-06-13T00:00:03.000Z",
      completedPhases: ["materializing", "deploying", "preparing-setup"],
      error: "Civ7 setup cannot see {swooper-maps}/maps/studio-current.js",
    };
    resolveCurrent?.(currentOperations());
    await read;

    expect(state.runInGame?.requestId).toBe("run-local-after-read-start");
  });

  test("classifies stream recovery, daemon identity mismatch, and busy gates", () => {
    const hello: TestStudioEvent = {
      type: "hello",
      serverInstanceId: "studio-a",
      serverStartedAt: "2026-06-13T00:00:00.000Z",
      observedAt: "2026-06-13T00:00:01.000Z",
    };
    const current = currentOperations({
      serverInstanceId: "studio-a",
      serverStartedAt: "2026-06-13T00:00:00.000Z",
    });
    const restarted = currentOperations({
      serverInstanceId: "studio-b",
      serverStartedAt: "2026-06-13T00:00:02.000Z",
    });

    expect(formatStudioEventStreamError(new Error("stream down"))).toBe("stream down");
    expect(studioEventClearsStreamError(hello)).toBe(true);
    expect(sameStudioDaemonIdentity(identityFromStudioOperationsCurrent(current), hello)).toBe(
      true
    );
    expect(
      formatStudioDaemonIdentityMismatch(hello, identityFromStudioOperationsCurrent(restarted))
    ).toContain("Studio daemon restarted");
    expect(studioBusyGateMessage({ subject: "Explore", runInGameRunning: true })).toContain(
      "Run in Game"
    );
  });

  test("StudioShell operation freshness stays on current plus pushed events", () => {
    const shellSource = readFileSync(
      join(repoRoot, "apps/mapgen-studio/src/app/StudioShell.tsx"),
      "utf8"
    );
    const eventHookSource = readFileSync(
      join(repoRoot, "apps/mapgen-studio/src/app/hooks/useStudioEvents.ts"),
      "utf8"
    );
    const runApiSource = readFileSync(
      join(repoRoot, "apps/mapgen-studio/src/features/runInGame/api.ts"),
      "utf8"
    );
    const saveApiSource = readFileSync(
      join(repoRoot, "apps/mapgen-studio/src/features/mapConfigSave/api.ts"),
      "utf8"
    );
    // The save/deploy waiter machinery moved into `useSaveDeploy` (slice 2.9); the
    // event-driven (no-polling) contract is now pinned against that hook's source.
    const saveDeploySource = readFileSync(
      join(repoRoot, "apps/mapgen-studio/src/app/hooks/useSaveDeploy.ts"),
      "utf8"
    );

    expect(shellSource).toContain("void readAndAdoptStudioOperationsCurrent");
    expect(shellSource).toContain("useStudioEvents({");
    const operationEffect = sourceBlockAround(eventHookSource, "applyStudioOperationEvent(event");
    expect(operationEffect).toContain('event?.type !== "operation"');
    expect(operationEffect).toContain("setRunInGameOperation");
    expect(operationEffect).toContain("setSaveDeployOperation");
    expect(operationEffect).not.toMatch(
      /applyStudioLiveGameEvent|readAndAdoptStudioOperationsCurrent/
    );
    expect(shellSource).not.toMatch(
      /fetchRunInGameStatus|fetchSaveDeployStatus|useOperationStatusPolls|useDaemonInstanceWatchdog|serverInfo\s*\(|runInGame\.status|mapConfigs\.status/
    );
    expect(runApiSource).not.toMatch(/fetchRunInGameStatus|runInGame\.status/);
    expect(saveApiSource).not.toMatch(/fetchSaveDeployStatus|mapConfigs\.status/);

    const saveStartResponse = sourceSliceAround(saveApiSource, "args.onStatus?.(status)");
    expect(saveStartResponse).not.toMatch(/setTimeout|setInterval|sleep|while\s*\(/);

    const eventWaiter = sourceSliceAround(saveDeploySource, "waitForSaveDeployTerminalEvent");
    expect(eventWaiter).toContain("saveDeployWaitersRef");
    expect(eventWaiter).not.toMatch(/orpcClient|mapConfigs\.status|fetchSaveDeployStatus/);
  });

  test("keeps browser operation recovery out of persisted storage", () => {
    const srcRoot = join(repoRoot, "apps/mapgen-studio/src");
    const storageOwnerAllowlist = new Set([
      "apps/mapgen-studio/src/features/studioState/persistence.ts",
      "apps/mapgen-studio/src/features/presets/storage.ts",
      "apps/mapgen-studio/src/ui/hooks/useTheme.ts",
      "apps/mapgen-studio/src/storybook/storeReset.ts",
      "apps/mapgen-studio/src/stores/authoringStore.ts",
    ]);
    const storageApiPattern =
      /\b(?:window\.)?(?:localStorage|sessionStorage)\s*\.|\bpersist\s*\(|\bcreateJSONStorage\s*\(/;
    const operationRecoveryPattern =
      /runInGameRequestId|saveDeployRequestId|sourceSnapshotStorage|readStoredRunInGameSourceSnapshot|RUN_IN_GAME_LAST|MAP_CONFIG_SAVE_LAST_REQUEST/;

    const offenders = sourceFiles(srcRoot)
      .map((file) => ({
        file,
        relativePath: relative(repoRoot, file),
        text: readFileSync(file, "utf8"),
      }))
      .filter(({ relativePath, text }) => {
        if (storageOwnerAllowlist.has(relativePath)) return false;
        return storageApiPattern.test(text) || operationRecoveryPattern.test(text);
      })
      .map(({ relativePath }) => relativePath);

    expect(offenders).toEqual([]);
  });

  test("classifies retained Run in Game snapshot helpers as session-only proof state", () => {
    const runStore = readFileSync(
      join(repoRoot, "apps/mapgen-studio/src/stores/runStore.ts"),
      "utf8"
    );
    const studioShell = readFileSync(
      join(repoRoot, "apps/mapgen-studio/src/app/StudioShell.tsx"),
      "utf8"
    );
    // `handleRunInGame` (which records the session-only snapshots) moved into
    // `useRunInGame` (slice 2.11); the snapshot-write assertions are pinned against
    // that hook's source. The host still owns the store-read declarations + the
    // "session-only UI state" comment.
    const runInGameHook = readFileSync(
      join(repoRoot, "apps/mapgen-studio/src/app/hooks/useRunInGame.ts"),
      "utf8"
    );
    const clientState = readFileSync(
      join(repoRoot, "apps/mapgen-studio/src/features/runInGame/clientState.ts"),
      "utf8"
    );

    expect(runStore).toContain("runInGameSnapshot");
    expect(runStore).toContain("lastRunInGameSource");
    expect(runStore).toContain("setRunInGameSnapshot");
    expect(runStore).toContain("setLastRunInGameSource");
    expect(runStore).toMatch(/session-only aids/);
    expect(runStore).not.toMatch(/localStorage|sessionStorage|persist\s*\(|createJSONStorage\s*\(/);

    expect(runInGameHook).toContain("setRunInGameSnapshot(snapshot)");
    expect(runInGameHook).toContain("setLastRunInGameSource(sourceSnapshot)");
    expect(studioShell).toMatch(/session-only UI state/);
    expect(studioShell).not.toMatch(
      /runInGameSnapshot[\s\S]{0,240}(?:localStorage|sessionStorage|persist\s*\(|createJSONStorage\s*\()|lastRunInGameSource[\s\S]{0,240}(?:localStorage|sessionStorage|persist\s*\(|createJSONStorage\s*\()/
    );

    expect(clientState).toContain("parseRunInGameClientSnapshot");
    expect(clientState).toContain("parseRunInGameSourceSnapshot");
    expect(clientState).not.toMatch(
      /localStorage|sessionStorage|persist\s*\(|createJSONStorage\s*\(/
    );
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

  test("StudioShell live-game events trigger bounded follow-up reads without a cadence", () => {
    // The live-runtime read functions moved into `useLiveRuntime` (slice 2.10); the
    // bounded-read / no-cadence (LR-8) contract is now pinned against the hook source.
    const shellSource = readFileSync(
      join(repoRoot, "apps/mapgen-studio/src/app/hooks/useLiveRuntime.ts"),
      "utf8"
    );

    const applyLiveGameState = sourceSliceAround(shellSource, "const applyLiveGameState", 1_600);
    expect(applyLiveGameState).toContain("buildLiveRuntimeSnapshotRequest");
    expect(applyLiveGameState).toContain("void refreshLiveSetupFromEvent(statusState)");
    expect(applyLiveGameState).toContain("void readLiveRuntimeSnapshot(snapshotRequest)");
    expect(applyLiveGameState).not.toMatch(
      /setTimeout|setInterval|civ7\.live\.status|liveControlPort\.readiness\.current|refetchInterval/
    );

    const setupFollowUp = sourceSliceAround(shellSource, "const refreshLiveSetupFromEvent", 1_600);
    expect(setupFollowUp).toContain("buildLiveRuntimeSetupRequestKey(statusState)");
    expect(setupFollowUp).toContain("shouldCommitLiveRuntimeSetup");
    expect(setupFollowUp).toContain("activeLiveSetupRequestKeyRef.current");
    expect(setupFollowUp).not.toMatch(
      /setTimeout|setInterval|civ7\.live\.status|liveControlPort\.readiness\.current|refetchInterval/
    );
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

  test("live event query function invokes watch with scoped stream retry context", async () => {
    const calls: Array<{ input: unknown; options: { signal?: AbortSignal; context?: unknown } }> =
      [];
    const fakeClient = {
      studio: {
        events: {
          watch: async (
            input: unknown,
            options: { signal?: AbortSignal; context?: unknown } = {}
          ) => {
            calls.push({ input, options });
            return oneEventIterator({
              type: "hello",
              serverInstanceId: "studio-test",
              serverStartedAt: "2026-06-13T00:00:00.000Z",
              observedAt: "2026-06-13T00:00:01.000Z",
            });
          },
        },
      },
    };
    const fakeOrpc = createTanstackQueryUtils(fakeClient);
    const options = studioEventsWatchLiveOptionsFor(fakeOrpc.studio.events.watch);
    if (typeof options.queryFn !== "function") {
      throw new Error("expected a live query function");
    }

    await options.queryFn({
      signal: new AbortController().signal,
      queryKey: options.queryKey,
      client: {
        setQueryData() {
          return undefined;
        },
      },
    } as Parameters<typeof options.queryFn>[0]);

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input).toEqual({});
    expect(calls[0]?.options.context).toMatchObject({
      retry: STUDIO_EVENT_STREAM_RETRY_ATTEMPTS,
    });
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

type TestStudioEvent =
  | StudioLiveGameEvent
  | StudioOperationEvent
  | { type: "hello"; serverInstanceId: string; serverStartedAt: string; observedAt: string };

async function* oneEventIterator(event: TestStudioEvent) {
  yield event;
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

function sourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (!entry.isFile() || (!path.endsWith(".ts") && !path.endsWith(".tsx"))) return [];
    return [path];
  });
}

function sourceBlockAround(source: string, marker: string): string {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing source marker: ${marker}`);
  const effectStart = source.lastIndexOf("useEffect(() =>", markerIndex);
  if (effectStart < 0) throw new Error(`Missing useEffect before marker: ${marker}`);
  const nextEffect = source.indexOf("useEffect(() =>", markerIndex + marker.length);
  return source.slice(effectStart, nextEffect < 0 ? undefined : nextEffect);
}

function sourceSliceAround(source: string, marker: string, radius = 900): string {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing source marker: ${marker}`);
  return source.slice(Math.max(0, markerIndex - radius), markerIndex + marker.length + radius);
}
