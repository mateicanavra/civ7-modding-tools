// @vitest-environment jsdom

import type { RunInGameOperationStatus } from "@civ7/studio-contract";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "./_setup";

vi.mock("../../src/features/runInGame/api", () => ({ runCurrentConfigInGame: vi.fn() }));
vi.mock("../../src/lib/orpc", () => ({
  orpcClient: {
    runInGame: { diagnostics: vi.fn() },
    studio: { operations: { current: vi.fn() } },
  },
}));

import { type UseRunInGameArgs, useRunInGame } from "../../src/app/hooks/useRunInGame";
import { createStudioEditorCanonicalConfig } from "../../src/features/configAuthoring/canonicalConfig";
import { runCurrentConfigInGame } from "../../src/features/runInGame/api";
import { getRecipeArtifacts } from "../../src/recipes/catalog";
import { DEFAULT_RECIPE_SETTINGS, DEFAULT_WORLD_SETTINGS } from "../../src/ui/constants/defaults";

const recipeId = DEFAULT_RECIPE_SETTINGS.recipe;
const catalog = getRecipeArtifacts(recipeId).studioBuiltInPresets?.[0];
if (!catalog) throw new Error("Expected a generated catalog config for Run in Game tests");
const editor = createStudioEditorCanonicalConfig();
const runRpc = vi.mocked(runCurrentConfigInGame);
const setupConfig = { gameOptions: {}, playerOptions: [{ playerId: 0, options: {} }] };

function runningStatus(requestId = "run-request"): RunInGameOperationStatus {
  return {
    requestId,
    phase: "deploying",
    status: "running",
    recoveryActions: [],
    createdAt: "2026-07-08T12:00:00.000Z",
    updatedAt: "2026-07-08T12:00:01.000Z",
  };
}

function makeArgs(over: Partial<UseRunInGameArgs> = {}): UseRunInGameArgs {
  return {
    recipeSettings: { ...DEFAULT_RECIPE_SETTINGS },
    worldSettings: { ...DEFAULT_WORLD_SETTINGS },
    authoringConfigSource: { kind: "editor", canonicalConfig: editor },
    authoringRevision: 3,
    setupConfig,
    setRecipeSettings: vi.fn(),
    setSetupConfig: vi.fn(),
    liveRuntime: { status: "unknown" },
    liveRuntimeSuggestions: [],
    runInGameOperation: null,
    setRunInGameOperation: vi.fn(),
    runInGameRunning: false,
    saveDeployRunning: false,
    browserRunning: false,
    runInGameSnapshot: null,
    setRunInGameSnapshot: vi.fn(),
    lastRunInGameToastRef: { current: null },
    setLocalError: vi.fn(),
    toast: vi.fn(),
    ...over,
  };
}

function setup(over: Partial<UseRunInGameArgs> = {}) {
  const props = makeArgs(over);
  const view = renderHook((current: UseRunInGameArgs) => useRunInGame(current), {
    initialProps: props,
  });
  return { ...view, props };
}

afterEach(() => vi.clearAllMocks());

describe("useRunInGame source handoff", () => {
  it("sends the editor envelope and retains the exact submitted source snapshot", async () => {
    const admitted = runningStatus("editor-run");
    runRpc.mockResolvedValue(admitted);
    const { result, props } = setup();

    await act(async () => result.current.handleRunInGame());

    expect(runRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        source: { kind: "editor", editorSessionId: "studio-current", canonicalConfig: editor },
      })
    );
    expect(runRpc.mock.calls[0]?.[0].source.canonicalConfig).toBe(editor);
    const snapshot = vi.mocked(props.setRunInGameSnapshot).mock.calls[0]?.[0];
    expect(snapshot).toMatchObject({
      requestId: "editor-run",
      authoringRevision: 3,
      launchEnvelope: {
        source: { kind: "editor", editorSessionId: "studio-current" },
      },
    });
    expect(snapshot?.launchEnvelope.source.canonicalConfig).toEqual(editor);
    expect(snapshot?.launchEnvelope.source.canonicalConfig).not.toBe(editor);
  });

  it("hands the catalog authority to the RPC boundary and snapshots only its sourcePath", async () => {
    runRpc.mockResolvedValue(runningStatus("catalog-run"));
    const { result, props } = setup({
      recipeSettings: {
        ...DEFAULT_RECIPE_SETTINGS,
        preset: `builtin:${catalog.canonicalConfig.id}`,
      },
      authoringConfigSource: { kind: "catalog", sourcePath: catalog.sourcePath },
    });

    await act(async () => result.current.handleRunInGame());

    const source = runRpc.mock.calls[0]?.[0].source;
    expect(source).toEqual({
      kind: "catalog",
      sourcePath: catalog.sourcePath,
      canonicalConfig: catalog.canonicalConfig,
    });
    const snapshot = vi.mocked(props.setRunInGameSnapshot).mock.calls[0]?.[0];
    expect(snapshot?.launchEnvelope.source).toEqual({
      kind: "catalog",
      sourcePath: catalog.sourcePath,
    });
    expect(snapshot?.launchEnvelope.source).not.toHaveProperty("canonicalConfig");
  });

  it("rejects invalid editor drafts before invoking Run in Game RPC", async () => {
    const { result, props } = setup({
      authoringConfigSource: {
        kind: "editor",
        canonicalConfig: { ...editor, config: {} },
      },
    });

    await act(async () => result.current.handleRunInGame());

    expect(runRpc).not.toHaveBeenCalled();
    expect(props.setLocalError).toHaveBeenCalledWith(
      "Run in Game failed: config is invalid for this recipe."
    );
  });

  it("does not fabricate an operation identity when admission fails", async () => {
    runRpc.mockResolvedValue({
      ok: false,
      error: "admission failed",
      safeFailureCategory: "invalid-request",
    });
    const { result, props } = setup();

    await act(async () => result.current.handleRunInGame());

    expect(props.setRunInGameOperation).not.toHaveBeenCalled();
    expect(props.setRunInGameSnapshot).not.toHaveBeenCalled();
  });

  it("blocks a missing persisted catalog source without sending a request", async () => {
    const { result, props } = setup({
      authoringConfigSource: {
        kind: "blocked",
        reason: "missing-catalog-source",
        sourcePath: "mods/mod-swooper-maps/src/maps/configs/removed.config.json",
      },
    });

    await act(async () => result.current.handleRunInGame());

    expect(runRpc).not.toHaveBeenCalled();
    expect(props.setRunInGameOperation).not.toHaveBeenCalled();
  });
});
