import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
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
  readAndAdoptStudioOperationsCurrent,
} from "../../src/app/operationAdoption";
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

  test("keeps browser operation recovery out of persisted storage", () => {
    const srcRoot = join(repoRoot, "apps/mapgen-studio/src");
    const storageOwnerAllowlist = new Set([
      "apps/mapgen-studio/src/features/studioState/persistence.ts",
      "apps/mapgen-studio/src/features/presets/storage.ts",
      "apps/mapgen-studio/src/ui/hooks/useTheme.ts",
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

    expect(studioShell).toContain("setRunInGameSnapshot(snapshot)");
    expect(studioShell).toContain("setLastRunInGameSource(sourceSnapshot)");
    expect(studioShell).toMatch(/session-only UI state/);
    expect(studioShell).not.toMatch(
      /runInGameSnapshot[\s\S]{0,240}(?:localStorage|sessionStorage|persist\s*\(|createJSONStorage\s*\()|lastRunInGameSource[\s\S]{0,240}(?:localStorage|sessionStorage|persist\s*\(|createJSONStorage\s*\()/
    );

    expect(clientState).toContain("parseRunInGameClientSnapshot");
    expect(clientState).toContain("parseRunInGameSourceSnapshot");
    expect(clientState).not.toMatch(/localStorage|sessionStorage|persist\s*\(|createJSONStorage\s*\(/);
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
