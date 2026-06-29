// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseCiv7StudioSeed } from "../../src/features/civ7Setup/seedPolicy";
import { useBrowserRun, type UseBrowserRunArgs } from "../../src/app/hooks/useBrowserRun";
import { useAuthoringStore } from "../../src/stores/authoringStore";
import { useRunStore } from "../../src/stores/runStore";
import "./_setup";

// randomCiv7StudioSeed is mocked to a fixed value so BR-6 can prove the rerolled
// seed (not the stale store seed) reaches `start`. parse/format stay real.
vi.mock("../../src/features/civ7Setup/seedPolicy", async (orig) => {
  const actual = await orig<typeof import("../../src/features/civ7Setup/seedPolicy")>();
  return { ...actual, randomCiv7StudioSeed: vi.fn(() => "999") };
});

// Default authoring state captured once (the recipe-derived default pipelineConfig
// is a real, migratable config — reused as the per-test baseline).
const DEFAULT_RECIPE = useAuthoringStore.getState().recipeSettings.recipe;
const DEFAULT_CONFIG = useAuthoringStore.getState().pipelineConfig;

function resetStores() {
  useAuthoringStore.setState({
    worldSettings: { mapSize: "MAPSIZE_STANDARD", playerCount: 6, resources: "balanced" },
    recipeSettings: { recipe: DEFAULT_RECIPE, preset: "none", seed: "123" },
    pipelineConfig: DEFAULT_CONFIG,
    overridesDisabled: false,
  });
  useRunStore.setState({ lastRunSnapshot: null });
}

beforeEach(() => resetStores());

function makeRunnerActions() {
  return { start: vi.fn(), cancel: vi.fn(), clearError: vi.fn() };
}

function makeViz(): UseBrowserRunArgs["viz"] {
  return {
    selectedStepId: null,
    selectedLayerKey: null,
    clearStream: vi.fn(),
    setSelectedStepId: vi.fn(),
    setSelectedLayerKey: vi.fn(),
  };
}

/**
 * Render harness with stable spies across rerenders. `update(patch)` rerenders
 * the hook with new args (e.g. flipping `browserRunning`) while keeping the same
 * spy identities so assertions accumulate across the sequence.
 */
function renderBrowserRun(initial: Partial<UseBrowserRunArgs> = {}) {
  const runnerActions = makeRunnerActions();
  const toast = vi.fn();
  const setLocalError = vi.fn();
  const viz = makeViz();
  let args: UseBrowserRunArgs = {
    runnerActions,
    browserRunning: false,
    viz,
    runInGameRunning: false,
    saveDeployRunning: false,
    toast,
    setLocalError,
    ...initial,
  };
  const view = renderHook((p: UseBrowserRunArgs) => useBrowserRun(p), { initialProps: args });
  const update = (patch: Partial<UseBrowserRunArgs>) => {
    args = { ...args, ...patch };
    act(() => view.rerender(args));
  };
  return { view, runnerActions, toast, setLocalError, viz, update };
}

// ---------------------------------------------------------------------------
// Run actions — reroll / triggerRun (BR-6, BR-7)
// ---------------------------------------------------------------------------
describe("useBrowserRun — run actions (BR-6 / BR-7)", () => {
  it("BR-6: reroll passes the freshly-generated seed directly to start, not the stale store seed", () => {
    const { view, runnerActions } = renderBrowserRun();
    act(() => view.result.current.reroll());

    // The mocked random seed is "999"; the store seed before reroll was "123".
    expect(useAuthoringStore.getState().recipeSettings.seed).toBe("999");
    expect(runnerActions.start).toHaveBeenCalledTimes(1);
    // start receives the rerolled seed parsed — proving the override arg, not a
    // closure read of the (async-updated) store seed which would still be 123.
    expect(runnerActions.start.mock.calls[0][0].seed).toBe(
      (parseCiv7StudioSeed("999") as { ok: true; value: number }).value
    );
  });

  it("BR-7: reroll and triggerRun are blocked (toast, no run) while an operation is busy", () => {
    const runInGame = renderBrowserRun({ runInGameRunning: true });
    act(() => runInGame.view.result.current.triggerRun());
    act(() => runInGame.view.result.current.reroll());
    expect(runInGame.runnerActions.start).not.toHaveBeenCalled();
    expect(runInGame.toast).toHaveBeenCalledTimes(2);
    expect(runInGame.toast.mock.calls[0][1]).toMatchObject({ variant: "info" });

    const saveDeploy = renderBrowserRun({ saveDeployRunning: true });
    act(() => saveDeploy.view.result.current.triggerRun());
    expect(saveDeploy.runnerActions.start).not.toHaveBeenCalled();
    expect(saveDeploy.toast).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// startBrowserRun internals — overrides + seed validation (BR-8, BR-9)
// ---------------------------------------------------------------------------
describe("useBrowserRun — startBrowserRun config + seed (BR-8 / BR-9)", () => {
  it("BR-8: passes configOverrides:undefined when overrides are disabled, migrated config when enabled", () => {
    const disabled = renderBrowserRun();
    act(() => useAuthoringStore.setState({ overridesDisabled: true }));
    act(() => disabled.view.result.current.triggerRun());
    expect(disabled.runnerActions.start).toHaveBeenCalledTimes(1);
    expect(disabled.runnerActions.start.mock.calls[0][0].configOverrides).toBeUndefined();

    const enabled = renderBrowserRun();
    act(() => useAuthoringStore.setState({ overridesDisabled: false }));
    act(() => enabled.view.result.current.triggerRun());
    expect(enabled.runnerActions.start).toHaveBeenCalledTimes(1);
    expect(enabled.runnerActions.start.mock.calls[0][0].configOverrides).not.toBeUndefined();
  });

  it("BR-9: aborts on an invalid seed — sets localError, toasts, and never calls start", () => {
    for (const badSeed of ["", "abc", "-1", "0x8000_0000"]) {
      resetStores();
      act(() => useAuthoringStore.setState({ recipeSettings: { recipe: DEFAULT_RECIPE, preset: "none", seed: badSeed } }));
      const { view, runnerActions, toast, setLocalError } = renderBrowserRun();
      act(() => view.result.current.triggerRun());
      expect(runnerActions.start, `seed=${JSON.stringify(badSeed)}`).not.toHaveBeenCalled();
      expect(setLocalError, `seed=${JSON.stringify(badSeed)}`).toHaveBeenCalled();
      expect(toast, `seed=${JSON.stringify(badSeed)}`).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ variant: "error" })
      );
    }
  });
});

// ---------------------------------------------------------------------------
// isDirty (BR-10)
// ---------------------------------------------------------------------------
describe("useBrowserRun — isDirty (BR-10)", () => {
  it("is true with no snapshot, and true when ANY of world/recipe/pipeline diverges", () => {
    const { view } = renderBrowserRun();
    expect(view.result.current.isDirty).toBe(true); // no snapshot

    // Snapshot mirrors current authoring → clean.
    const s = useAuthoringStore.getState();
    act(() =>
      useRunStore.setState({
        lastRunSnapshot: {
          worldSettings: s.worldSettings,
          recipeSettings: s.recipeSettings,
          pipelineConfig: s.pipelineConfig,
        },
      })
    );
    expect(view.result.current.isDirty).toBe(false);

    // Diverge world only.
    act(() => useAuthoringStore.setState({ worldSettings: { ...s.worldSettings, playerCount: 8 } }));
    expect(view.result.current.isDirty).toBe(true);

    // Reset world, diverge recipe only.
    act(() => useAuthoringStore.setState({ worldSettings: s.worldSettings, recipeSettings: { ...s.recipeSettings, seed: "777" } }));
    expect(view.result.current.isDirty).toBe(true);

    // Reset recipe, diverge pipeline only.
    act(() => useAuthoringStore.setState({ recipeSettings: s.recipeSettings, pipelineConfig: { ...s.pipelineConfig } as typeof s.pipelineConfig, }));
    // A new pipeline reference with identical content stays clean (deep-equal)…
    expect(view.result.current.isDirty).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Auto-run trio (BR-1..BR-5) — fake timers, reactive runner model
// ---------------------------------------------------------------------------
describe("useBrowserRun — auto-run trio (BR-1..BR-5)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("BR-1: disabling auto-run cancels the scheduled run AND clears the deferred pending flag", () => {
    // (a) timer cancel: enabling schedules a run; disabling before the debounce → no run.
    const a = renderBrowserRun();
    act(() => a.view.result.current.setAutoRunEnabled(true)); // E2 schedules (idle, no snapshot = dirty)
    act(() => a.view.result.current.setAutoRunEnabled(false)); // E1 + E2 cleanup cancel
    act(() => vi.advanceTimersByTime(300));
    expect(a.runnerActions.start).not.toHaveBeenCalled();

    // (b) pending clear — E1's UNIQUE job (E2's cleanup already covers the timer).
    // A run deferred while the runner is busy must NOT survive a disable and then
    // flush the moment auto-run is re-enabled.
    const b = renderBrowserRun({ browserRunning: true });
    act(() => b.view.result.current.setAutoRunEnabled(true)); // E2 → pending=true (deferred while running)
    act(() => b.view.result.current.setAutoRunEnabled(false)); // E1 must clear pending
    act(() => b.update({ browserRunning: false })); // run "completes" while disabled → nothing fires
    act(() => b.view.result.current.setAutoRunEnabled(true)); // re-enable
    // A stale (uncleared) pending would flush start() immediately here; cleared → only
    // a fresh debounce is scheduled, which has not yet elapsed.
    expect(b.runnerActions.start).not.toHaveBeenCalled();
  });

  it("BR-2: a config change while running defers to exactly ONE run on completion (no drop, no duplicate)", () => {
    const { view, runnerActions, update } = renderBrowserRun({ browserRunning: true });
    act(() => view.result.current.setAutoRunEnabled(true)); // E2: running → pending=true; E3: running → bail
    // Config edits during the run keep deferring (still just pending).
    act(() => useAuthoringStore.setState({ pipelineConfig: { ...DEFAULT_CONFIG } as typeof DEFAULT_CONFIG }));

    // Run completes. start() must re-arm the runner → model browserRunning=true again,
    // which lets E2's cleanup cancel the timer it schedules on this transition.
    runnerActions.start.mockImplementation(() => {});
    act(() => update({ browserRunning: false })); // E3 flushes immediately (1 run); E2 schedules a timer
    expect(runnerActions.start).toHaveBeenCalledTimes(1);
    act(() => update({ browserRunning: true })); // runner started → E2 cleanup cancels the pending timer
    act(() => vi.advanceTimersByTime(300));
    act(() => update({ browserRunning: false })); // back to idle; snapshot now == config → no further run
    expect(runnerActions.start).toHaveBeenCalledTimes(1);
  });

  it("BR-3: suppressed while runInGame/saveDeploy busy; one run once the flags clear", () => {
    const { view, runnerActions, update } = renderBrowserRun({ runInGameRunning: true });
    act(() => view.result.current.setAutoRunEnabled(true)); // busy → E2/E3 bail, nothing scheduled
    act(() => vi.advanceTimersByTime(300));
    expect(runnerActions.start).not.toHaveBeenCalled();

    act(() => update({ runInGameRunning: false })); // idle → E2 schedules
    act(() => vi.advanceTimersByTime(300));
    expect(runnerActions.start).toHaveBeenCalledTimes(1);
  });

  it("BR-4: suppressed while overridesDisabled; one run after re-enable", () => {
    const { view, runnerActions } = renderBrowserRun();
    act(() => useAuthoringStore.setState({ overridesDisabled: true }));
    act(() => view.result.current.setAutoRunEnabled(true)); // overrides off → bail
    act(() => vi.advanceTimersByTime(300));
    expect(runnerActions.start).not.toHaveBeenCalled();

    act(() => useAuthoringStore.setState({ overridesDisabled: false })); // E2 schedules
    act(() => vi.advanceTimersByTime(300));
    expect(runnerActions.start).toHaveBeenCalledTimes(1);
  });

  it("BR-5: the 300ms debounce resets on each config change — exactly one run after quiescence", () => {
    const { view, runnerActions } = renderBrowserRun();
    act(() => view.result.current.setAutoRunEnabled(true)); // schedule #1
    act(() => vi.advanceTimersByTime(250)); // not yet
    act(() => useAuthoringStore.setState({ pipelineConfig: { ...DEFAULT_CONFIG } as typeof DEFAULT_CONFIG })); // reschedule
    act(() => vi.advanceTimersByTime(250)); // 500ms since first, but only 250 since reschedule → not yet
    expect(runnerActions.start).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(50)); // 300 since reschedule → fire once
    expect(runnerActions.start).toHaveBeenCalledTimes(1);
  });

  it("BR-13 (improve): disabling MID-debounce leaks no timer — the partially-elapsed run never fires", () => {
    // Distinct from BR-1(a), which disables immediately: here the 300ms timer has
    // already partially elapsed when auto-run is disabled. The guarantee holds only
    // because the disable-arm (E1) and the timer ref live in the SAME hook as the
    // schedule-arm (E2) — split them across hooks and the ref-holder leaks this timer.
    const { view, runnerActions } = renderBrowserRun();
    act(() => view.result.current.setAutoRunEnabled(true)); // schedule 300ms
    act(() => vi.advanceTimersByTime(150)); // mid-debounce
    act(() => view.result.current.setAutoRunEnabled(false)); // E1 cancels the in-flight timer
    act(() => vi.advanceTimersByTime(300)); // well past the original deadline
    expect(runnerActions.start).not.toHaveBeenCalled();
  });
});
