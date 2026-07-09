// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "./_setup";

// Mock the oRPC-talking run module so the launch result + the materializationMode
// that reaches the daemon are observable. EVERYTHING else (the busy gate, the
// fingerprint/relation memos, the sync-back routing, the suggestion filtering)
// runs for real — the RIG-* contracts must be exercised against the real bodies.
vi.mock("../../src/features/runInGame/api", () => ({
  runCurrentConfigInGame: vi.fn(),
}));

import type { RunInGameOperationStatus } from "@civ7/studio-contract";
import type { PipelineConfig } from "@swooper/mapgen-studio-ui/types";
import { STANDARD_RECIPE_CONFIG } from "mod-swooper-maps/recipes/standard-artifacts";
import { type UseRunInGameArgs, useRunInGame } from "../../src/app/hooks/useRunInGame";
import { LIVE_GAME_PRESET_KEY } from "../../src/features/civ7Setup/livePreset";
import type { Civ7StudioSetupConfig } from "../../src/features/civ7Setup/setupConfig";
import type { LiveRuntimeStatusState } from "../../src/features/liveRuntime/model";
import { runCurrentConfigInGame } from "../../src/features/runInGame/api";
import type { RunInGameSourceSnapshot } from "../../src/features/runInGame/clientState";
import { DEFAULT_RECIPE_SETTINGS, DEFAULT_WORLD_SETTINGS } from "../../src/ui/constants/defaults";

const runRpc = vi.mocked(runCurrentConfigInGame);

const SETUP = { gameOptions: {}, players: [] } as unknown as Civ7StudioSetupConfig;
const PIPELINE = STANDARD_RECIPE_CONFIG as PipelineConfig;

const liveOk = (over: Partial<LiveRuntimeStatusState> = {}): LiveRuntimeStatusState =>
  ({
    status: "ok",
    snapshotStatus: "ok",
    bindingStatus: "bound-studio-run",
    failureCount: 0,
    snapshotId: "snap-1",
    seed: 123,
    ...over,
  }) as LiveRuntimeStatusState;

const provedSource = (over: Partial<RunInGameSourceSnapshot> = {}): RunInGameSourceSnapshot => ({
  requestId: "req-proved-1",
  createdAt: "2026-06-13T00:00:00.000Z",
  recipeSettings: { ...DEFAULT_RECIPE_SETTINGS, seed: "123", preset: "none" },
  worldSettings: { ...DEFAULT_WORLD_SETTINGS, playerCount: 8 },
  pipelineConfig: { proved: true } as unknown as PipelineConfig,
  setupConfig: { proved: "setup" } as unknown as Civ7StudioSetupConfig,
  materializationMode: "disposable",
  ...over,
});

function makeArgs(over: Partial<UseRunInGameArgs> = {}): UseRunInGameArgs {
  return {
    recipeSettings: { ...DEFAULT_RECIPE_SETTINGS, seed: "123", preset: "none" },
    worldSettings: { ...DEFAULT_WORLD_SETTINGS },
    pipelineConfig: PIPELINE,
    overridesDisabled: false,
    setupConfig: SETUP,
    setRecipeSettings: vi.fn(),
    setSetupConfig: vi.fn(),
    runInGameMaterializationMode: "disposable",
    provedRunInGameSource: null,
    liveRuntime: liveOk(),
    liveRuntimeSuggestions: [],
    resolvePreset: vi.fn(() => undefined),
    applyAuthoringSnapshot: vi.fn(),
    runInGameOperation: null,
    setRunInGameOperation: vi.fn(),
    runInGameRunning: false,
    saveDeployRunning: false,
    browserRunning: false,
    runInGameSnapshot: null,
    setRunInGameSnapshot: vi.fn(),
    setLastRunInGameSource: vi.fn(),
    lastRunInGameToastRef: { current: null },
    setLocalError: vi.fn(),
    toast: vi.fn(),
    ...over,
  };
}

function setup(over: Partial<UseRunInGameArgs> = {}) {
  const props = makeArgs(over);
  const { result, rerender } = renderHook((p: UseRunInGameArgs) => useRunInGame(p), {
    initialProps: props,
  });
  return { result, rerender, props };
}

function expectNoPrivateRunRequestFields(value: unknown) {
  const forbiddenKeys = new Set([
    "attribution",
    "diagnostics",
    "diagnosticsId",
    "exactAuthorshipProof",
    "failureDetails",
    "generatedModRoot",
    "launchEnvelope",
    "localModScript",
    "materialization",
    "resolvedLaunchSource",
    "sourcePath",
    "sourceSnapshot",
  ]);
  const found: string[] = [];
  const visit = (entry: unknown, path: string) => {
    if (path.endsWith("pipelineConfig")) return;
    if (Array.isArray(entry)) {
      entry.forEach((item, index) => visit(item, `${path}[${index}]`));
      return;
    }
    if (!entry || typeof entry !== "object") return;
    for (const [key, child] of Object.entries(entry)) {
      const childPath = path ? `${path}.${key}` : key;
      if (forbiddenKeys.has(key)) found.push(childPath);
      visit(child, childPath);
    }
  };
  visit(value, "");
  expect(found).toEqual([]);
}

function expectNoStringValue(value: unknown, needle: string) {
  const matches: string[] = [];
  const visit = (entry: unknown, path: string) => {
    if (typeof entry === "string") {
      if (entry.includes(needle)) matches.push(path);
      return;
    }
    if (Array.isArray(entry)) {
      entry.forEach((item, index) => visit(item, `${path}[${index}]`));
      return;
    }
    if (!entry || typeof entry !== "object") return;
    for (const [key, child] of Object.entries(entry)) {
      visit(child, path ? `${path}.${key}` : key);
    }
  };
  visit(value, "");
  expect(matches).toEqual([]);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("useRunInGame — browser-originated visible selection handoff", () => {
  it("starts an editor-source run from visible selections and records daemon-admitted identity", async () => {
    const daemonStatus = {
      requestId: "daemon-admitted-editor-42",
      status: "running",
      phase: "deploying",
      recoveryActions: ["retry-run"],
      createdAt: "2026-07-08T12:00:00.000Z",
      updatedAt: "2026-07-08T12:00:01.000Z",
    } satisfies RunInGameOperationStatus;
    const setupConfig = {
      mapScript: "{swooper-maps}/maps/custom-visible-selection.js",
      gameOptions: {
        Difficulty: "DIFFICULTY_PRINCE",
        GameSpeeds: "GAMESPEED_STANDARD",
      },
      playerOptions: [
        {
          playerId: 0,
          options: {
            PlayerLeader: "LEADER_HATSHEPSUT",
            PlayerCivilization: "CIVILIZATION_EGYPT",
          },
        },
      ],
    } satisfies Civ7StudioSetupConfig;
    runRpc.mockResolvedValue(daemonStatus);
    const { result, props } = setup({
      recipeSettings: {
        ...DEFAULT_RECIPE_SETTINGS,
        seed: "987654321",
        preset: "none",
      },
      worldSettings: {
        ...DEFAULT_WORLD_SETTINGS,
        mapSize: "MAPSIZE_SMALL",
        playerCount: 4,
        resources: "abundant",
      },
      pipelineConfig: PIPELINE,
      setupConfig,
      runInGameMaterializationMode: "disposable",
    });

    await act(async () => {
      await result.current.handleRunInGame({ restartCivProcess: true });
    });

    expect(runRpc).toHaveBeenCalledTimes(1);
    const handoff = runRpc.mock.calls[0][0];
    expect(handoff).toEqual(
      expect.objectContaining({
        recipeSettings: {
          preset: "none",
          recipe: "mod-swooper-maps/standard",
          seed: "987654321",
        },
        worldSettings: {
          mapSize: "MAPSIZE_SMALL",
          playerCount: 4,
          resources: "abundant",
        },
        setupConfig,
        restartCivProcess: true,
      })
    );
    expect(handoff.source).toEqual(
      expect.objectContaining({
        kind: "editor",
        editorSessionId: "studio-current",
        payload: expect.objectContaining({
          configId: "studio-current",
          label: "Studio Current",
          mapScript: "{swooper-maps}/maps/studio-current.js",
          pipelineConfig: PIPELINE,
          recipeId: "mod-swooper-maps/standard",
        }),
      })
    );
    expect(handoff).not.toHaveProperty("requestId");
    expectNoPrivateRunRequestFields(handoff);

    expect(props.setRunInGameOperation).toHaveBeenCalledWith(daemonStatus);
    expect(props.setRunInGameSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: "daemon-admitted-editor-42",
        seed: "987654321",
        mapSize: "MAPSIZE_SMALL",
        playerCount: 4,
        resources: "abundant",
        setupConfig,
        materializationMode: "disposable",
      })
    );
    expect(props.setLastRunInGameSource).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: "daemon-admitted-editor-42",
        setupConfig,
        materializationMode: "disposable",
      })
    );
    expect(props.setLastRunInGameSource.mock.calls[0]?.[0].pipelineConfig).toEqual(PIPELINE);
    expect(props.toast).toHaveBeenCalledWith("Run in Game started: daemon-admitted-editor-42", {
      variant: "info",
    });
  });

  it("rejects an editor-source run when the current config is not exact recipe JSON", async () => {
    const invalidConfig = {
      $schema: "https://example.invalid/studio.schema.json",
      continents: { targetLandRatio: 0.42 },
    } as unknown as PipelineConfig;
    const { result, props } = setup({ pipelineConfig: invalidConfig });

    await act(async () => {
      await result.current.handleRunInGame();
    });

    expect(runRpc).not.toHaveBeenCalled();
    expect(props.setLocalError).toHaveBeenCalledWith(
      "Run in Game failed: config is invalid for this recipe."
    );
    expect(props.toast).toHaveBeenCalledWith(
      "Run in Game failed: config is invalid for this recipe.",
      { variant: "error" }
    );
  });

  it("uses a durable catalog source without leaking preset source paths into the public request", async () => {
    const daemonStatus = {
      requestId: "daemon-admitted-catalog-7",
      status: "running",
      phase: "resolving-source",
      recoveryActions: [],
      createdAt: "2026-07-08T12:10:00.000Z",
      updatedAt: "2026-07-08T12:10:01.000Z",
    } satisfies RunInGameOperationStatus;
    const presetSourcePath =
      "/private-sentinel/worktree/mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json";

    runRpc.mockResolvedValue(daemonStatus);
    const { result, props } = setup({
      recipeSettings: {
        ...DEFAULT_RECIPE_SETTINGS,
        seed: "2468",
        preset: "builtin:swooper-earthlike",
      },
      worldSettings: {
        ...DEFAULT_WORLD_SETTINGS,
        mapSize: "MAPSIZE_HUGE",
        playerCount: 10,
        resources: "sparse",
      },
      runInGameMaterializationMode: "durable",
      resolvePreset: vi.fn(() => ({
        id: "swooper-earthlike",
        label: "Swooper Earthlike",
        description: "Durable catalog config",
        sourcePath: presetSourcePath,
        sortIndex: 25,
        latitudeBounds: { min: -65, max: 75 },
      })),
    });

    await act(async () => {
      await result.current.handleRunInGame();
    });

    expect(runRpc).toHaveBeenCalledTimes(1);
    const handoff = runRpc.mock.calls[0][0];
    expect(handoff.source).toEqual({
      kind: "catalog",
      catalogSourceId: "swooper-earthlike",
    });
    expect(handoff).toEqual(
      expect.objectContaining({
        recipeSettings: expect.objectContaining({
          preset: "builtin:swooper-earthlike",
          seed: "2468",
        }),
        worldSettings: {
          mapSize: "MAPSIZE_HUGE",
          playerCount: 10,
          resources: "sparse",
        },
      })
    );
    expectNoPrivateRunRequestFields(handoff);
    expectNoStringValue(handoff, presetSourcePath);

    expect(props.setRunInGameOperation).toHaveBeenCalledWith(daemonStatus);
    expect(props.setRunInGameSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: "daemon-admitted-catalog-7",
        seed: "2468",
        mapSize: "MAPSIZE_HUGE",
        playerCount: 10,
        resources: "sparse",
        materializationMode: "durable",
      })
    );
    expect(props.setLastRunInGameSource).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: "daemon-admitted-catalog-7",
        materializationMode: "durable",
        selectedConfig: expect.objectContaining({
          id: "swooper-earthlike",
          sourcePath: presetSourcePath,
        }),
      })
    );
  });

  it("uses the recipe default editor source when overrides are disabled", async () => {
    const daemonStatus = {
      requestId: "daemon-admitted-default-override-disabled",
      status: "running",
      phase: "deploying",
      recoveryActions: [],
      createdAt: "2026-07-08T12:15:00.000Z",
      updatedAt: "2026-07-08T12:15:01.000Z",
    } satisfies RunInGameOperationStatus;
    runRpc.mockResolvedValue(daemonStatus);
    const { result, props } = setup({
      overridesDisabled: true,
      pipelineConfig: { staleDraft: true } as unknown as PipelineConfig,
      runInGameMaterializationMode: "durable",
      recipeSettings: {
        ...DEFAULT_RECIPE_SETTINGS,
        seed: "2468",
        preset: "builtin:swooper-earthlike",
      },
      resolvePreset: vi.fn(() => ({
        id: "swooper-earthlike",
        label: "Swooper Earthlike",
        sourcePath: "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
        sortIndex: 25,
      })),
    });

    await act(async () => {
      await result.current.handleRunInGame();
    });

    expect(runRpc).toHaveBeenCalledTimes(1);
    const handoff = runRpc.mock.calls[0][0];
    expect(handoff.source).toEqual(
      expect.objectContaining({
        kind: "editor",
        payload: expect.objectContaining({
          pipelineConfig: PIPELINE,
        }),
      })
    );
    const sourceSnapshot = props.setLastRunInGameSource.mock.calls[0]?.[0];
    expect(sourceSnapshot).toEqual(
      expect.objectContaining({
        requestId: "daemon-admitted-default-override-disabled",
        materializationMode: "disposable",
        pipelineConfig: PIPELINE,
      })
    );
    expect(sourceSnapshot).not.toHaveProperty("selectedConfig");
  });
});

describe("useRunInGame — RIG-5 (syncStudioFromLiveGame proved path → applyAuthoringSnapshot)", () => {
  it("routes the proved restore through applyAuthoringSnapshot as the SINGLE ordered authoring action, correctly shaped", () => {
    // Oracle: with a proved source + a matching live seed, sync calls
    // applyAuthoringSnapshot ONCE with {key, worldSettings, pipelineConfig,
    // setupConfig, recipeSettings:{...source, seed, preset}} — and NEVER touches the
    // raw 5 setters directly (the ordered write lives in the contract owner). The
    // recorded pipelineConfig is referentially the proved config (live-sync identity).
    // Falsifier: an inline 5-setter block (re-implemented here) would call
    // setWorldSettings/setPipelineConfig/setSetupConfig directly and bypass the
    // single authoring action.
    const source = provedSource();
    const { result, props } = setup({
      provedRunInGameSource: source,
      liveRuntime: liveOk({ seed: 123, snapshotId: "snap-1" }),
      resolvePreset: vi.fn(() => undefined),
    });

    act(() => {
      result.current.syncStudioFromLiveGame();
    });

    expect(props.applyAuthoringSnapshot).toHaveBeenCalledTimes(1);
    const snapshot = vi.mocked(props.applyAuthoringSnapshot).mock.calls[0][0];
    // Shape: key (LIVE_GAME_PRESET_KEY, since resolvePreset returns undefined) +
    // the four authoring branches + recipeSettings with the proved seed/preset.
    expect(snapshot.key).toBe(LIVE_GAME_PRESET_KEY);
    expect(snapshot.worldSettings).toBe(source.worldSettings);
    expect(snapshot.pipelineConfig).toBe(source.pipelineConfig);
    expect(snapshot.setupConfig).toBe(source.setupConfig);
    expect(snapshot.recipeSettings).toEqual({
      ...source.recipeSettings,
      seed: "123",
      preset: LIVE_GAME_PRESET_KEY,
    });
    // The single authoring action is applyAuthoringSnapshot — the caller does NOT
    // re-implement the ordered write via the raw authoring setters.
    expect(props.setRecipeSettings).not.toHaveBeenCalled();
    expect(props.setSetupConfig).not.toHaveBeenCalled();
    // Success toast, no error toast.
    expect(props.toast).toHaveBeenCalledWith(expect.stringContaining("synced to live game"), {
      variant: "success",
    });
  });

  it("uses the durable preset key when the proved source is durable and the preset resolves", () => {
    // RIG-5 shape branch: durable materialization → builtin:<id> key (if resolvable).
    const source = provedSource({
      materializationMode: "durable",
      selectedConfig: { id: "earthlike" },
    });
    const { result, props } = setup({
      provedRunInGameSource: source,
      liveRuntime: liveOk({ seed: 123 }),
      // resolvePreset must resolve the durable key for the branch to choose it.
      resolvePreset: vi.fn((key) =>
        key === "builtin:earthlike" ? ({ id: "earthlike" } as never) : undefined
      ),
    });

    act(() => {
      result.current.syncStudioFromLiveGame();
    });

    const snapshot = vi.mocked(props.applyAuthoringSnapshot).mock.calls[0][0];
    expect(snapshot.key).toBe("builtin:earthlike");
    expect(snapshot.recipeSettings.preset).toBe("builtin:earthlike");
  });
});

describe("useRunInGame — RIG-6 (sync busy-gate + silent when status ≠ ok)", () => {
  it("busy (browser/run/save) → no setter, no applyAuthoringSnapshot, info toast", () => {
    // Oracle: when any busy flag is true, sync emits exactly the info busy-toast and
    // writes NOTHING. Falsifier: a one-render-late busy flag would let the write
    // through during an in-flight operation.
    for (const busy of [
      { browserRunning: true },
      { runInGameRunning: true },
      { saveDeployRunning: true },
    ] as const) {
      const { result, props } = setup({
        provedRunInGameSource: provedSource(),
        liveRuntime: liveOk(),
        ...busy,
      });
      act(() => {
        result.current.syncStudioFromLiveGame();
      });
      expect(props.applyAuthoringSnapshot).not.toHaveBeenCalled();
      expect(props.setRecipeSettings).not.toHaveBeenCalled();
      expect(props.setSetupConfig).not.toHaveBeenCalled();
      expect(props.toast).toHaveBeenCalledTimes(1);
      expect(props.toast).toHaveBeenCalledWith(
        "Finish the current Studio operation before syncing from the live game.",
        { variant: "info" }
      );
    }
  });

  it("status idle (≠ ok) → no setter AND no toast (fully silent early return)", () => {
    // Oracle: the leading `if (liveRuntime.status !== 'ok') return;` returns before any
    // toast or write. Falsifier: dropping that guard would let an idle/error live
    // runtime produce spurious suggestion toasts / writes.
    const { result, props } = setup({
      provedRunInGameSource: provedSource(),
      liveRuntime: { status: "idle" } as unknown as LiveRuntimeStatusState,
    });
    act(() => {
      result.current.syncStudioFromLiveGame();
    });
    expect(props.applyAuthoringSnapshot).not.toHaveBeenCalled();
    expect(props.setRecipeSettings).not.toHaveBeenCalled();
    expect(props.setSetupConfig).not.toHaveBeenCalled();
    expect(props.toast).not.toHaveBeenCalled();
  });
});

describe("useRunInGame — RIG-7 (non-proved path applies seed + setup suggestions only)", () => {
  it("proved null + seed suggestion → only setRecipeSettings(seed); never world/pipeline/overrides", () => {
    // Oracle: with no proved source but a current-snapshot seed suggestion, the path
    // applies ONLY the seed via setRecipeSettings — no applyAuthoringSnapshot, no
    // setWorldSettings/setPipelineConfig/setOverridesDisabled (those aren't even
    // threaded to the non-proved branch). Falsifier: adding a pipelineConfig write to
    // the non-proved path overwrites the user's authored config.
    const seedSuggestion = {
      id: "s1",
      sourceSnapshotId: "snap-1",
      createdAt: "2026-06-13T00:00:00.000Z",
      confidence: "observed-runtime" as const,
      affectedConfigPath: "recipeSettings.seed",
      value: "456",
      applyPath: "visible-studio-control" as const,
    };
    const { result, props } = setup({
      provedRunInGameSource: null,
      liveRuntime: liveOk({ snapshotId: "snap-1" }),
      liveRuntimeSuggestions: [seedSuggestion],
    });

    act(() => {
      result.current.syncStudioFromLiveGame();
    });

    expect(props.applyAuthoringSnapshot).not.toHaveBeenCalled();
    expect(props.setRecipeSettings).toHaveBeenCalledTimes(1);
    // setRecipeSettings is called with an updater; apply it to confirm only the seed
    // is touched.
    const updater = vi.mocked(props.setRecipeSettings).mock.calls[0][0] as (
      prev: typeof props.recipeSettings
    ) => typeof props.recipeSettings;
    expect(updater(props.recipeSettings)).toEqual({ ...props.recipeSettings, seed: "456" });
    expect(props.setSetupConfig).not.toHaveBeenCalled();
    expect(props.toast).toHaveBeenCalledWith(expect.stringContaining("seed suggestion applied"), {
      variant: "success",
    });
  });

  it("proved null + setup suggestion → only setSetupConfig (normalized); no recipe/world/pipeline", () => {
    const setupSuggestion = {
      id: "s2",
      sourceSnapshotId: "snap-1",
      createdAt: "2026-06-13T00:00:00.000Z",
      confidence: "observed-runtime" as const,
      affectedConfigPath: "setupConfig",
      value: { gameOptions: { Difficulty: "hard" }, players: [] },
      applyPath: "visible-studio-control" as const,
    };
    const { result, props } = setup({
      provedRunInGameSource: null,
      liveRuntime: liveOk({ snapshotId: "snap-1" }),
      liveRuntimeSuggestions: [setupSuggestion],
    });

    act(() => {
      result.current.syncStudioFromLiveGame();
    });

    expect(props.applyAuthoringSnapshot).not.toHaveBeenCalled();
    expect(props.setSetupConfig).toHaveBeenCalledTimes(1);
    expect(props.setRecipeSettings).not.toHaveBeenCalled();
  });
});

describe("useRunInGame — RIG-2 (materializationMode is a render-time prop, selects source)", () => {
  it("threads the durable/disposable PROP into the launch source (never an effect-ref)", async () => {
    // Oracle: handleRunInGame reads `runInGameMaterializationMode` straight from props
    // (render scope) and uses it to select the public launch source while recording
    // the private/client source snapshot. Flipping the prop flips the source kind in
    // the same render, no effect-ref lag.
    runRpc.mockResolvedValue({
      requestId: "req-1",
      materialization: { mode: "disposable", mapScript: "studio-current.js" },
    } as never);

    const durable = setup({
      runInGameMaterializationMode: "durable",
      resolvePreset: vi.fn(() => ({
        id: "swooper-earthlike",
        label: "Swooper Earthlike",
        sourcePath: "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
        sortIndex: 100,
      })),
    });
    await act(async () => {
      await durable.result.current.handleRunInGame();
    });
    expect(runRpc).toHaveBeenLastCalledWith(
      expect.objectContaining({
        source: {
          kind: "catalog",
          catalogSourceId: "swooper-earthlike",
        },
      })
    );
    expect(vi.mocked(durable.props.setLastRunInGameSource)).toHaveBeenCalledWith(
      expect.objectContaining({ materializationMode: "durable" })
    );

    runRpc.mockClear();

    const disposable = setup({ runInGameMaterializationMode: "disposable" });
    await act(async () => {
      await disposable.result.current.handleRunInGame();
    });
    expect(runRpc).toHaveBeenLastCalledWith(
      expect.objectContaining({
        source: expect.objectContaining({
          kind: "editor",
          payload: expect.objectContaining({
            pipelineConfig: PIPELINE,
          }),
        }),
      })
    );
    expect(vi.mocked(disposable.props.setLastRunInGameSource)).toHaveBeenCalledWith(
      expect.objectContaining({ materializationMode: "disposable" })
    );
  });
});
