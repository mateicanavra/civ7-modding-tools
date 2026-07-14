// @vitest-environment jsdom

import type { PipelineConfig } from "@swooper/mapgen-studio-ui/types";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./_setup";

vi.mock("../../src/features/civ7Setup/seedPolicy", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/features/civ7Setup/seedPolicy")>();
  return { ...actual, randomCiv7StudioSeed: vi.fn(() => "456") };
});

import { type UseBrowserRunArgs, useBrowserRun } from "../../src/app/hooks/useBrowserRun";
import { getRecipeArtifacts } from "../../src/recipes/catalog";
import { useAuthoringStore } from "../../src/stores/authoringStore";
import { useRunStore } from "../../src/stores/runStore";
import { useViewStore } from "../../src/stores/viewStore";

const recipeId = "standard";
const canonicalConfig = getRecipeArtifacts(recipeId).defaultCanonicalConfig;
const config = canonicalConfig.config as PipelineConfig;

function resetStores() {
  useAuthoringStore.setState({
    worldSettings: { mapSize: "MAPSIZE_STANDARD", playerCount: 6, resources: "balanced" },
    seed: "123",
    setupConfig: { gameOptions: {}, playerOptions: [{ playerId: 0, options: {} }] },
    canonicalConfig,
    authoringRevision: 0,
  });
  useViewStore.setState({ configEditingEnabled: true });
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
afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("useBrowserRun revision state", () => {
  it("runs the current pipeline config and records the observed authoring values", () => {
    const { result, runnerActions } = setup();

    act(() => result.current.triggerRun());

    expect(runnerActions.start).toHaveBeenCalledWith(
      expect.objectContaining({ recipeId, pipelineConfig: config })
    );
    const snapshot = useRunStore.getState().lastRunSnapshot;
    expect(snapshot).toEqual({
      authoringRevision: 0,
      seed: "123",
      worldSettings: { mapSize: "MAPSIZE_STANDARD", playerCount: 6, resources: "balanced" },
    });
    expect(snapshot).not.toHaveProperty("pipelineConfig");
    expect(snapshot).not.toHaveProperty("recipeSettings");
  });

  it("keeps browser-run history stable after later authoring edits", () => {
    const { result } = setup();
    act(() => result.current.triggerRun());

    act(() => {
      useAuthoringStore.getState().setSeed("789");
      useAuthoringStore.getState().setWorldSettings({
        mapSize: "MAPSIZE_HUGE",
        playerCount: 10,
        resources: "abundant",
      });
    });

    expect(useRunStore.getState().lastRunSnapshot).toEqual({
      authoringRevision: 0,
      seed: "123",
      worldSettings: { mapSize: "MAPSIZE_STANDARD", playerCount: 6, resources: "balanced" },
    });
  });

  it("marks authoring dirty after a store-owned authoring edit", () => {
    const { result } = setup();
    expect(result.current.isDirty).toBe(true);

    act(() => result.current.triggerRun());
    expect(result.current.isDirty).toBe(false);

    act(() => useAuthoringStore.getState().setSeed("456"));
    expect(result.current.isDirty).toBe(true);
  });

  it("treats the config editing lock as UI state, not config or run authority", () => {
    const { result, runnerActions } = setup();

    act(() => useViewStore.getState().setConfigEditingEnabled(false));
    expect(useAuthoringStore.getState().authoringRevision).toBe(0);

    act(() => result.current.triggerRun());

    expect(runnerActions.start).toHaveBeenCalledTimes(1);
    expect(result.current.isDirty).toBe(false);
  });

  it("rejects an invalid pipeline config before starting the worker", () => {
    useAuthoringStore.setState({
      canonicalConfig: { ...canonicalConfig, config: { invalid: true } as PipelineConfig },
    });
    const { result, runnerActions, props } = setup();

    act(() => result.current.triggerRun());

    expect(runnerActions.start).not.toHaveBeenCalled();
    expect(useRunStore.getState().lastRunSnapshot).toBeNull();
    expect(props.toast).toHaveBeenCalledWith(
      "Browser run failed: config is invalid for this recipe.",
      { variant: "error" }
    );
  });

  it("rerolls to one persisted seed and revision with Auto-run disabled", () => {
    const { result, runnerActions } = setup();

    act(() => result.current.reroll());

    const authored = useAuthoringStore.getState();
    expect(authored.seed).toBe("456");
    expect(authored.authoringRevision).toBe(1);
    expect(useRunStore.getState().lastRunSnapshot).toEqual({
      authoringRevision: 1,
      seed: "456",
      worldSettings: { mapSize: "MAPSIZE_STANDARD", playerCount: 6, resources: "balanced" },
    });
    expect(runnerActions.start).toHaveBeenCalledTimes(1);
    expect(runnerActions.start).toHaveBeenCalledWith(expect.objectContaining({ seed: 456 }));
  });

  it("reconciles an Auto-run reroll through terminal state without starting again", () => {
    vi.useFakeTimers();
    const { result, rerender, props, runnerActions } = setup();

    act(() => result.current.triggerRun());
    runnerActions.start.mockClear();
    act(() => result.current.setAutoRunEnabled(true));

    act(() => result.current.reroll());
    expect(runnerActions.start).toHaveBeenCalledTimes(1);
    expect(useRunStore.getState().lastRunSnapshot).toEqual({
      authoringRevision: useAuthoringStore.getState().authoringRevision,
      seed: "456",
      worldSettings: { mapSize: "MAPSIZE_STANDARD", playerCount: 6, resources: "balanced" },
    });

    rerender({ ...props, browserRunning: true });
    rerender({ ...props, browserRunning: false });
    act(() => vi.runAllTimers());

    expect(runnerActions.start).toHaveBeenCalledTimes(1);
  });

  it("keeps ordinary authoring edits on the debounced Auto-run path", () => {
    vi.useFakeTimers();
    const { result, runnerActions } = setup();

    act(() => result.current.triggerRun());
    runnerActions.start.mockClear();
    act(() => result.current.setAutoRunEnabled(true));
    act(() => useAuthoringStore.getState().setSeed("789"));

    act(() => vi.advanceTimersByTime(299));
    expect(runnerActions.start).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(runnerActions.start).toHaveBeenCalledTimes(1);
    expect(runnerActions.start).toHaveBeenCalledWith(expect.objectContaining({ seed: 789 }));
  });

  it("refuses reroll while another Studio operation is running", () => {
    const { result, runnerActions, props } = setup({ runInGameRunning: true });

    act(() => result.current.reroll());

    expect(useAuthoringStore.getState().seed).toBe("123");
    expect(useAuthoringStore.getState().authoringRevision).toBe(0);
    expect(runnerActions.start).not.toHaveBeenCalled();
    expect(props.toast).toHaveBeenCalledWith(
      "Finish the current Studio operation before rerolling.",
      { variant: "info" }
    );
  });
});
