// @vitest-environment jsdom
import type { MapConfigSaveDeployStatus } from "@civ7/studio-contract";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./_setup";

// Mock the oRPC-talking save module so the RPC result/timing is controllable.
// EVERYTHING else (the waiter map, the two effects, the busy gate, the handler
// bodies) runs for real — the SD-* contracts must be exercised against the real
// machinery, not a stand-in.
vi.mock("../../src/features/mapConfigSave/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/features/mapConfigSave/api")>();
  return {
    ...actual,
    saveRepoBackedConfig: vi.fn(),
  };
});

import { type UseSaveDeployArgs, useSaveDeploy } from "../../src/app/hooks/useSaveDeploy";
import { saveRepoBackedConfig } from "../../src/features/mapConfigSave/api";
import { createMapConfigSaveDeployStatus } from "../../src/features/mapConfigSave/status";
import { DEFAULT_RECIPE_SETTINGS } from "../../src/ui/constants/defaults";
import type { PipelineConfig } from "../../src/ui/types";

const saveRpc = vi.mocked(saveRepoBackedConfig);

const RECIPE = DEFAULT_RECIPE_SETTINGS.recipe;
const CONFIG = { foo: 1 } as unknown as PipelineConfig;

const status = (
  requestId: string,
  phase: "queued" | "saving" | "complete" | "failed",
  extra: Partial<Parameters<typeof createMapConfigSaveDeployStatus>[0]> = {}
): MapConfigSaveDeployStatus => createMapConfigSaveDeployStatus({ requestId, phase, ...extra });

function makeArgs(over: Partial<UseSaveDeployArgs> = {}): UseSaveDeployArgs {
  return {
    saveDeployOperation: null,
    setSaveDeployOperation: vi.fn(),
    saveDeployRunning: false,
    browserRunning: false,
    runInGameRunning: false,
    // Preset-derived deps (would come from usePresetLifecycle) — faked by value.
    resolvePreset: vi.fn(() => undefined),
    rememberRepoBackedConfig: vi.fn(),
    markPresetApplied: vi.fn(),
    builtInPresets: [],
    presetActions: {
      saveAsNew: vi.fn(),
      saveToCurrent: vi.fn(),
      deleteLocal: vi.fn(),
    } as unknown as UseSaveDeployArgs["presetActions"],
    recipeSettings: { ...DEFAULT_RECIPE_SETTINGS, recipe: RECIPE, preset: "none" },
    pipelineConfig: CONFIG,
    setRecipeSettings: vi.fn(),
    setPipelineConfig: vi.fn(),
    setLastSaveDeployConfig: vi.fn(),
    toast: vi.fn(),
    ...over,
  };
}

function setup(over: Partial<UseSaveDeployArgs> = {}) {
  const props = makeArgs(over);
  const { result, rerender, unmount } = renderHook((p: UseSaveDeployArgs) => useSaveDeploy(p), {
    initialProps: props,
  });
  // Drives the SSE-mirror effect: rerender with a new saveDeployOperation value.
  const setOp = (op: MapConfigSaveDeployStatus | null) =>
    rerender({ ...props, saveDeployOperation: op });
  return { result, rerender, props, setOp, unmount };
}

beforeEach(() => {
  localStorage.clear();
  saveRpc.mockReset();
});
afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("useSaveDeploy — waiter contract (SD-1/2/3/4)", () => {
  it("SD-1: resolves immediately when the REF is already terminal for the requestId (reads ref, no waiter, no timer)", async () => {
    // Pin the handler's generated requestId via Date.now so we can seed the ref to a
    // matching terminal status through the mirror effect FIRST. The RPC then returns
    // a NON-terminal status → the handler MUST consult the waiter, which finds the
    // ref already terminal+matching and resolves in one microtask.
    // Oracle: under fake timers (never advanced), the handler still resolves and
    // setLastSaveDeployConfig fires — proving no 5-min waiter wait was needed.
    // Falsifier: reading React state (which lags the ref by a commit) or dropping the
    // ref short-circuit → the handler registers a waiter and hangs until the timeout.
    vi.useFakeTimers();
    const fixedReqId = `studio-save-deploy-${(1234).toString(36)}`;
    const dateSpy = vi.spyOn(Date, "now").mockReturnValue(1234);
    saveRpc.mockImplementation(async ({ requestId }) => ({
      ok: true as const,
      status: status(requestId, "saving"), // NON-terminal → handler must use the waiter
      path: "p.json",
    }));
    const { result, setOp, props } = setup();
    // Seed the ref to terminal for the requestId the handler will generate.
    act(() => setOp(status(fixedReqId, "complete", { saved: true, deployed: true })));
    await act(async () => {
      await result.current.handleSaveDialogConfirm({ label: "L" });
    });
    // No timer advance happened; terminal config recorded → immediate ref resolution.
    expect(props.setLastSaveDeployConfig).toHaveBeenCalledTimes(1);
    dateSpy.mockRestore();
  });

  it("SD-2: a pending waiter registers and resolves when the terminal op arrives via the mirror effect", async () => {
    // RPC returns a NON-terminal (saving) status → the handler awaits the waiter.
    // A later commit delivering the terminal op must resolve that pending promise.
    // Oracle: handler stays pending until the terminal op commits, then resolves and
    // setLastSaveDeployConfig fires. Falsifier: split the ref-assign from the resolve
    // loop (or never resolve) → the promise hangs.
    let capturedRequestId = "";
    saveRpc.mockImplementation(async ({ requestId }) => {
      capturedRequestId = requestId;
      return { ok: true as const, status: status(requestId, "saving"), path: "p.json" };
    });
    const { result, setOp, props } = setup();
    let done = false;
    let confirmPromise!: Promise<void>;
    await act(async () => {
      confirmPromise = result.current.handleSaveDialogConfirm({ label: "L" }).then(() => {
        done = true;
      });
      // Let the RPC resolve + the handler register the waiter (still pending).
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(done).toBe(false);
    expect(capturedRequestId).not.toBe("");
    // Deliver the terminal op through the SSE-mirror effect. The sync `act` flushes
    // the rerender + passive effect (which resolves the waiter) BEFORE we await the
    // handler promise — combining them in one async `act` deadlocks the flush order.
    act(() => setOp(status(capturedRequestId, "complete", { saved: true, deployed: true })));
    await act(async () => {
      await confirmPromise;
    });
    expect(done).toBe(true);
    expect(props.setLastSaveDeployConfig).toHaveBeenCalledTimes(1);
  });

  it("SD-3: a pending waiter rejects after the 5-min timeout and cleans itself up", async () => {
    // Oracle: +5min+1ms with no terminal op → the waiter rejects 'did not report a
    // terminal status in time'; the handler maps that to { ok:false } and the
    // failure toast fires (no setLastSaveDeployConfig). Falsifier: wrong constant or
    // reject-not-called → the handler hangs and the assertion never lands.
    vi.useFakeTimers();
    saveRpc.mockImplementation(async ({ requestId }) => ({
      ok: true as const,
      status: status(requestId, "saving"),
      path: "p.json",
    }));
    const { result, props } = setup();
    let settled = false;
    let confirmPromise!: Promise<void>;
    await act(async () => {
      confirmPromise = result.current.handleSaveDialogConfirm({ label: "L" }).then(() => {
        settled = true;
      });
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(settled).toBe(false);
    await act(async () => {
      vi.advanceTimersByTime(5 * 60_000 + 1);
      await confirmPromise;
    });
    expect(settled).toBe(true);
    expect(props.setLastSaveDeployConfig).not.toHaveBeenCalled();
    expect(props.toast).toHaveBeenCalledWith(
      expect.stringContaining("Save/Deploy event stream did not report a terminal status in time"),
      { variant: "error" }
    );
  });

  it("SD-4: unmount rejects all pending waiters with 'Save/Deploy wait cancelled'", async () => {
    // Oracle: a pending waiter at unmount → its promise rejects 'wait cancelled', the
    // handler maps that to ok:false (no setLastSaveDeployConfig) and an error toast
    // carrying the cancelled message. Falsifier: folding the cleanup into the mirror
    // effect (or dropping it) orphans the waiter on unmount → it never rejects.
    vi.useFakeTimers();
    saveRpc.mockImplementation(async ({ requestId }) => ({
      ok: true as const,
      status: status(requestId, "saving"),
      path: "p.json",
    }));
    const { result, props, unmount } = setup();
    let confirmPromise!: Promise<void>;
    await act(async () => {
      confirmPromise = result.current.handleSaveDialogConfirm({ label: "L" });
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      unmount(); // cleanup effect rejects the pending waiter
      await confirmPromise;
    });
    expect(props.setLastSaveDeployConfig).not.toHaveBeenCalled();
    expect(props.toast).toHaveBeenCalledWith(
      expect.stringContaining("Save/Deploy wait cancelled"),
      { variant: "error" }
    );
  });
});

describe("useSaveDeploy — busy gate + RPC short-circuits (SD-6/7/8)", () => {
  it("SD-6: the busy gate blocks the save with priority browser ≻ run ≻ save (no RPC issued)", async () => {
    // Oracle: any busy flag → { ok:false, error } with the priority-ordered reason
    // and NO saveRepoBackedConfig call. Falsifier: always-allow gate → the RPC fires
    // during a concurrent run, or the priority ordering collapses.
    // browser wins over run + save.
    {
      const { result, props } = setup({
        browserRunning: true,
        runInGameRunning: true,
        saveDeployRunning: true,
      });
      await act(async () => {
        await result.current.handleSaveDialogConfirm({ label: "Gate" });
      });
      expect(saveRpc).not.toHaveBeenCalled();
      expect(props.toast).toHaveBeenCalledWith(
        expect.stringContaining("Map generation is running"),
        { variant: "error" }
      );
    }
    saveRpc.mockClear();
    // run wins over save (browser false).
    {
      const { result, props } = setup({
        browserRunning: false,
        runInGameRunning: true,
        saveDeployRunning: true,
      });
      await act(async () => {
        await result.current.handleSaveDialogConfirm({ label: "Gate" });
      });
      expect(saveRpc).not.toHaveBeenCalled();
      expect(props.toast).toHaveBeenCalledWith(expect.stringContaining("Run in Game is running"), {
        variant: "error",
      });
    }
    saveRpc.mockClear();
    // save-only.
    {
      const { result, props } = setup({
        browserRunning: false,
        runInGameRunning: false,
        saveDeployRunning: true,
      });
      await act(async () => {
        await result.current.handleSaveDialogConfirm({ label: "Gate" });
      });
      expect(saveRpc).not.toHaveBeenCalled();
      expect(props.toast).toHaveBeenCalledWith(
        expect.stringContaining("Save/deploy is already running"),
        { variant: "error" }
      );
    }
  });

  it("SD-7: awaits the waiter ONLY when the RPC status is not already terminal", async () => {
    // Oracle: a terminal RPC status → NO waiter wait (resolves immediately, even with
    // fake timers never advanced). Falsifier: dropping the isSaveDeployTerminal
    // short-circuit → it always awaits → a 5-min hang on a terminal RPC (the config
    // is never recorded because no terminal op ever commits to resolve the waiter).
    vi.useFakeTimers();
    saveRpc.mockImplementation(async ({ requestId }) => ({
      ok: true as const,
      status: status(requestId, "complete", { saved: true, deployed: true }),
      path: "p.json",
    }));
    const { result, props } = setup();
    await act(async () => {
      await result.current.handleSaveDialogConfirm({ label: "L" });
    });
    // Resolved WITHOUT advancing timers → no waiter was awaited.
    expect(props.setLastSaveDeployConfig).toHaveBeenCalledTimes(1);
  });

  it("SD-8: sets the initial 'queued' op BEFORE the first await", async () => {
    // Oracle: setSaveDeployOperation('queued') is called synchronously before the RPC
    // promise resolves (so a second concurrent save sees the busy gate). Falsifier:
    // moving the setter after the await → the gate is open during the in-flight RPC.
    let queuedBeforeRpc = false;
    const setSaveDeployOperation = vi.fn();
    saveRpc.mockImplementation(async ({ requestId }) => {
      queuedBeforeRpc = setSaveDeployOperation.mock.calls.length >= 1;
      return {
        ok: true as const,
        status: status(requestId, "complete", { saved: true, deployed: true }),
        path: "p.json",
      };
    });
    const { result } = setup({ setSaveDeployOperation });
    await act(async () => {
      await result.current.handleSaveDialogConfirm({ label: "L" });
    });
    expect(queuedBeforeRpc).toBe(true);
    expect(setSaveDeployOperation.mock.calls[0]?.[0]).toMatchObject({ phase: "queued" });
  });
});

describe("useSaveDeploy — confirm ref/config gate (SD-11) + key-flip order (PL-7)", () => {
  it("SD-11: handleSaveDialogConfirm records ref+config ONLY on ok||saved (full failure → no-op)", async () => {
    // Oracle: a FULL failure (saved:false) → markPresetApplied / setRecipeSettings /
    // setPipelineConfig untouched, error toast fired, dialog closes. Falsifier:
    // dropping the `result.ok || result.saved` gate (e.g. unconditional record) would
    // mutate the preset on a clean failure.
    saveRpc.mockImplementation(async () => ({
      ok: false as const,
      error: "boom",
      saved: false,
      deployed: false,
    }));
    const { result, props } = setup();
    await act(async () => {
      await result.current.handleSaveDialogConfirm({ label: "L" });
    });
    expect(props.markPresetApplied).not.toHaveBeenCalled();
    expect(props.setRecipeSettings).not.toHaveBeenCalled();
    expect(props.setPipelineConfig).not.toHaveBeenCalled();
    expect(props.toast).toHaveBeenCalledWith("Config save failed: boom", { variant: "error" });
    expect(result.current.saveDialogState.open).toBe(false);
  });

  it("SD-11: a partial save (saved:true, ok:false) still records the preset (|| branch)", async () => {
    // Oracle: saved:true even with ok:false → the || branch records the preset.
    // Falsifier: an `&&` instead of `||` would block this partial-save recovery path.
    saveRpc.mockImplementation(async ({ requestId }) => ({
      ok: false as const,
      error: "deploy failed",
      saved: true,
      deployed: false,
      path: "p.json",
      status: status(requestId, "failed", { saved: true }),
    }));
    const { result, props } = setup();
    await act(async () => {
      await result.current.handleSaveDialogConfirm({ label: "My Cfg" });
    });
    expect(props.markPresetApplied).toHaveBeenCalledWith({
      key: "builtin:my-cfg",
      config: props.pipelineConfig,
    });
    expect(props.setRecipeSettings).toHaveBeenCalled();
  });

  it("PL-7: markPresetApplied + rememberRepoBackedConfig run BEFORE the key-flip setRecipeSettings", async () => {
    // Oracle: invocation order mark/remember < setRecipeSettings on the success path.
    // Falsifier: ref written after the key flip → the apply-effect re-applies and
    // reverts the just-saved config.
    saveRpc.mockImplementation(async ({ requestId }) => ({
      ok: true as const,
      status: status(requestId, "complete", { saved: true, deployed: true }),
      path: "p.json",
    }));
    const markPresetApplied = vi.fn();
    const rememberRepoBackedConfig = vi.fn();
    const setRecipeSettings = vi.fn();
    const { result } = setup({ markPresetApplied, rememberRepoBackedConfig, setRecipeSettings });
    await act(async () => {
      await result.current.handleSaveDialogConfirm({ label: "Cfg" });
    });
    const order = (fn: ReturnType<typeof vi.fn>) => fn.mock.invocationCallOrder[0];
    expect(order(rememberRepoBackedConfig)).toBeLessThan(order(setRecipeSettings));
    expect(order(markPresetApplied)).toBeLessThan(order(setRecipeSettings));
  });
});
