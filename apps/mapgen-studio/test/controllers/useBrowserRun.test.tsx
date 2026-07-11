// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import type { PipelineConfig } from "@swooper/mapgen-studio-ui/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./_setup";

import { type UseBrowserRunArgs, useBrowserRun } from "../../src/app/hooks/useBrowserRun";
import { createStudioEditorCanonicalConfig } from "../../src/features/configAuthoring/canonicalConfig";
import { getRecipeArtifacts } from "../../src/recipes/catalog";
import { useAuthoringStore } from "../../src/stores/authoringStore";
import { useRunStore } from "../../src/stores/runStore";

const recipeId = "mod-swooper-maps/standard";
const config = getRecipeArtifacts(recipeId).defaultConfig as PipelineConfig;
const editor = createStudioEditorCanonicalConfig();

function resetStores() {
  useAuthoringStore.setState({
    worldSettings: { mapSize: "MAPSIZE_STANDARD", playerCount: 6, resources: "balanced" },
    recipeSettings: { recipe: recipeId, preset: "none", seed: "123" },
    authoringConfigSource: { kind: "editor", canonicalConfig: editor },
    authoringRevision: 0,
    configEditingEnabled: true,
  });
  useRunStore.setState({ lastRunSnapshot: null });
}

function setup(over: Partial<UseBrowserRunArgs> = {}) {
  const runnerActions = { start: vi.fn(), cancel: vi.fn(), clearError: vi.fn() };
  const props: UseBrowserRunArgs = {
    runnerActions,
    browserRunning: false,
    viz: {
      selectedStepId: null,
      selectedLayerKey: null,
      clearStream: vi.fn(),
      setSelectedStepId: vi.fn(),
      setSelectedLayerKey: vi.fn(),
    },
    runInGameRunning: false,
    saveDeployRunning: false,
    pipelineConfig: config,
    toast: vi.fn(),
    setLocalError: vi.fn(),
    ...over,
  };
  const view = renderHook((current: UseBrowserRunArgs) => useBrowserRun(current), {
    initialProps: props,
  });
  return { ...view, props, runnerActions };
}

beforeEach(resetStores);
afterEach(() => vi.clearAllMocks());

describe("useBrowserRun revision state", () => {
  it("runs the current pipeline config and records only its local revision", () => {
    const { result, runnerActions } = setup();

    act(() => result.current.triggerRun());

    expect(runnerActions.start).toHaveBeenCalledWith(
      expect.objectContaining({ recipeId, pipelineConfig: config })
    );
    const snapshot = useRunStore.getState().lastRunSnapshot;
    expect(snapshot).toEqual({ authoringRevision: 0 });
    expect(snapshot).not.toHaveProperty("pipelineConfig");
    expect(snapshot).not.toHaveProperty("recipeSettings");
    expect(snapshot).not.toHaveProperty("worldSettings");
  });

  it("marks authoring dirty after a store-owned authoring edit", () => {
    const { result } = setup();
    expect(result.current.isDirty).toBe(true);

    act(() => result.current.triggerRun());
    expect(result.current.isDirty).toBe(false);

    act(() =>
      useAuthoringStore
        .getState()
        .setRecipeSettings({ recipe: recipeId, preset: "none", seed: "456" })
    );
    expect(result.current.isDirty).toBe(true);
  });

  it("treats the config editing lock as UI state, not config or run authority", () => {
    const { result, runnerActions } = setup();

    act(() => useAuthoringStore.getState().setConfigEditingEnabled(false));
    expect(useAuthoringStore.getState().authoringRevision).toBe(0);

    act(() => result.current.triggerRun());

    expect(runnerActions.start).toHaveBeenCalledTimes(1);
    expect(result.current.isDirty).toBe(false);
  });

  it("rejects an invalid pipeline config before starting the worker", () => {
    const { result, runnerActions, props } = setup({
      pipelineConfig: { invalid: true } as unknown as PipelineConfig,
    });

    act(() => result.current.triggerRun());

    expect(runnerActions.start).not.toHaveBeenCalled();
    expect(useRunStore.getState().lastRunSnapshot).toBeNull();
    expect(props.toast).toHaveBeenCalledWith(
      "Browser run failed: config is invalid for this recipe.",
      { variant: "error" }
    );
  });
});
