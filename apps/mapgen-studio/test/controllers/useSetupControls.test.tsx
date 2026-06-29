// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./_setup";

// The autoplay/explore RPC entry points are pure module imports inside the hook
// (NOT hook params), so we mock the modules to controllable spies. Everything else
// (the busy gate, the re-entrant guard, the in-flight flag + finally, the live
// `liveRuntime.autoplayActive` read, the value-equality drift detector) runs for
// real — the SC-* contracts must be exercised against the real machinery.
vi.mock("../../src/features/civ7Setup/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/features/civ7Setup/api")>();
  return {
    ...actual,
    requestCiv7Autoplay: vi.fn(),
  };
});
vi.mock("../../src/lib/control/liveControlPort", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/lib/control/liveControlPort")>();
  return {
    ...actual,
    liveControlPort: {
      display: { explore: { request: vi.fn() } },
    },
  };
});

import { type UseSetupControlsArgs, useSetupControls } from "../../src/app/hooks/useSetupControls";
import { requestCiv7Autoplay } from "../../src/features/civ7Setup/api";
import {
  type Civ7SavedSetupConfigFile,
  type Civ7StudioSetupConfig,
  studioSetupConfigFromSavedConfigFile,
} from "../../src/features/civ7Setup/setupConfig";
import type { LiveRuntimeStatusState } from "../../src/features/liveRuntime/model";
import { liveControlPort } from "../../src/lib/control/liveControlPort";

const autoplayRpc = vi.mocked(requestCiv7Autoplay);
const exploreRpc = vi.mocked(liveControlPort.display.explore.request);

// A minimal-but-valid saved config file. `studioSetupConfigFromSavedConfigFile`
// (the same pure fn the real selection handler calls) derives the authored config
// from it — so a config derived this way is, by construction, a value-equal copy
// of the file-derived state (drift MUST be false).
const SAVED_CONFIG: Civ7SavedSetupConfigFile = {
  id: "saved-alpha",
  displayName: "Saved Alpha",
  fileName: "saved-alpha.config.json",
  path: "/configs/saved-alpha.config.json",
  sizeBytes: 10,
  modifiedAt: "2026-06-29T00:00:00.000Z",
  source: "local-disk",
  summary: { difficulty: "DIFFICULTY_SOVEREIGN" },
  setupOptions: { Difficulty: "DIFFICULTY_SOVEREIGN", GameSpeeds: "GAMESPEED_STANDARD" },
  playerOptions: [
    {
      playerId: 0,
      options: {
        PlayerLeader: "LEADER_HARRIET_TUBMAN",
        PlayerCivilization: "CIVILIZATION_AMERICA",
      },
    },
  ],
};

const LIVE_RUNTIME_IDLE = {
  status: "idle",
  autoplayActive: false,
} as unknown as LiveRuntimeStatusState;

function makeArgs(over: Partial<UseSetupControlsArgs> = {}): UseSetupControlsArgs {
  return {
    setupConfig: studioSetupConfigFromSavedConfigFile(SAVED_CONFIG),
    setSetupConfig: vi.fn(),
    setRecipeSettings: vi.fn(),
    savedSetupConfigs: { status: "ok", configurations: [SAVED_CONFIG] },
    setupCatalog: { status: "idle" },
    liveSetup: { status: "idle" },
    liveRuntime: LIVE_RUNTIME_IDLE,
    setLiveRuntime: vi.fn(),
    browserRunning: false,
    runInGameRunning: false,
    saveDeployRunning: false,
    toast: vi.fn(),
    ...over,
  };
}

function setup(over: Partial<UseSetupControlsArgs> = {}) {
  const props = makeArgs(over);
  const { result, rerender, unmount } = renderHook(
    (p: UseSetupControlsArgs) => useSetupControls(p),
    { initialProps: props }
  );
  return { result, rerender, props, unmount };
}

beforeEach(() => {
  autoplayRpc.mockReset();
  exploreRpc.mockReset();
});
afterEach(() => {
  vi.clearAllMocks();
});

describe("useSetupControls — SC-4 (drift via value equality, not identity)", () => {
  it("savedSetupConfigModified is false when the authored setup equals the selected saved config (even though it is a fresh-reference object)", () => {
    // The authored config is derived from the file via the SAME pure fn the real
    // selection handler uses — a brand-new object reference each render. Value
    // equality ⇒ no drift. An object-identity comparison would see distinct
    // references and spuriously report drift here (the falsifier).
    const { result } = setup({ setupConfig: studioSetupConfigFromSavedConfigFile(SAVED_CONFIG) });
    expect(result.current.savedSetupConfigModified).toBe(false);
  });

  it("savedSetupConfigModified flips to true after a (simulated) sync writes a DIFFERENT setup value", () => {
    // Simulate a live sync replacing one game-option value. The config still claims
    // the saved id, but its VALUE now differs from the file ⇒ drift (header → Custom).
    const derived = studioSetupConfigFromSavedConfigFile(SAVED_CONFIG);
    const drifted: Civ7StudioSetupConfig = {
      ...derived,
      gameOptions: { ...derived.gameOptions, Difficulty: "DIFFICULTY_DEITY" },
    };
    const { result } = setup({ setupConfig: drifted });
    expect(result.current.savedSetupConfigModified).toBe(true);
  });

  it("savedSetupConfigModified is false when no saved config is selected", () => {
    const derived = studioSetupConfigFromSavedConfigFile(SAVED_CONFIG);
    const noSelection: Civ7StudioSetupConfig = { ...derived, savedConfig: undefined };
    const { result } = setup({ setupConfig: noSelection });
    expect(result.current.savedSetupConfigModified).toBe(false);
  });
});

describe("useSetupControls — SC-5 (handleToggleAutoplay busy-gate + re-entrant guard)", () => {
  it("early-returns + toasts (no RPC) when a busy flag is set", async () => {
    const toast = vi.fn();
    const { result } = setup({ browserRunning: true, toast });
    await act(async () => {
      await result.current.handleToggleAutoplay();
    });
    expect(autoplayRpc).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.stringContaining("Autoplay"), { variant: "info" });
  });

  it("early-returns + toasts (no RPC) on a re-entrant call while one is already in flight", async () => {
    const toast = vi.fn();
    // First call: hold the RPC open so the in-flight flag stays set.
    let resolveRpc: (v: Awaited<ReturnType<typeof requestCiv7Autoplay>>) => void = () => {};
    autoplayRpc.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRpc = resolve;
        })
    );
    const { result } = setup({ toast });

    let firstCall!: Promise<void>;
    act(() => {
      firstCall = result.current.handleToggleAutoplay();
    });
    // Second (re-entrant) call WHILE the first is awaiting the RPC.
    await act(async () => {
      await result.current.handleToggleAutoplay();
    });
    // The guard short-circuited the second call: still exactly ONE RPC, and an
    // in-flight info toast fired.
    expect(autoplayRpc).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith("Autoplay request is already in flight.", {
      variant: "info",
    });
    // Drain the first call.
    await act(async () => {
      resolveRpc({ ok: true, action: "start", autoplay: { isActive: true } });
      await firstCall;
    });
  });

  it("issues the RPC + reconciles liveRuntime when idle and not busy (flag set before await, cleared in finally)", async () => {
    autoplayRpc.mockResolvedValue({ ok: true, action: "start", autoplay: { isActive: true } });
    const setLiveRuntime = vi.fn();
    const { result } = setup({ setLiveRuntime });
    await act(async () => {
      await result.current.handleToggleAutoplay();
    });
    expect(autoplayRpc).toHaveBeenCalledWith("start");
    expect(setLiveRuntime).toHaveBeenCalledTimes(1);
    // Cleared in finally ⇒ the in-flight flag is back to false.
    expect(result.current.autoplayActionRunning).toBe(false);
  });

  it("clears the in-flight flag in finally even when the RPC throws", async () => {
    autoplayRpc.mockRejectedValue(new Error("boom"));
    const { result } = setup();
    await act(async () => {
      await expect(result.current.handleToggleAutoplay()).rejects.toThrow("boom");
    });
    // finally ran despite the throw ⇒ flag cleared (no permanent stuck state).
    expect(result.current.autoplayActionRunning).toBe(false);
  });

  it("reads the LIVE liveRuntime.autoplayActive (issues 'stop' when active, not a stale 'start')", async () => {
    autoplayRpc.mockResolvedValue({ ok: true, action: "stop", autoplay: { isActive: false } });
    const activeRuntime = {
      status: "ok",
      autoplayActive: true,
    } as unknown as LiveRuntimeStatusState;
    const { result } = setup({ liveRuntime: activeRuntime });
    await act(async () => {
      await result.current.handleToggleAutoplay();
    });
    expect(autoplayRpc).toHaveBeenCalledWith("stop");
  });
});

describe("useSetupControls — SC-6 (handleExplore busy-gate + re-entrant guard, try/finally)", () => {
  it("early-returns + toasts (no RPC) when a busy flag is set", async () => {
    const toast = vi.fn();
    const { result } = setup({ saveDeployRunning: true, toast });
    await act(async () => {
      await result.current.handleExplore();
    });
    expect(exploreRpc).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.stringContaining("Explore"), { variant: "info" });
  });

  it("early-returns + toasts (no RPC) on a re-entrant call while one is already in flight", async () => {
    const toast = vi.fn();
    let resolveRpc: (v: { classification: string; grantedPlots: number }) => void = () => {};
    exploreRpc.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRpc = resolve;
        }) as ReturnType<typeof liveControlPort.display.explore.request>
    );
    const { result } = setup({ toast });

    let firstCall!: Promise<void>;
    act(() => {
      firstCall = result.current.handleExplore();
    });
    await act(async () => {
      await result.current.handleExplore();
    });
    expect(exploreRpc).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith("Explore request is already in flight.", {
      variant: "info",
    });
    await act(async () => {
      resolveRpc({ classification: "explored", grantedPlots: 12 });
      await firstCall;
    });
  });

  it("issues the explore RPC + clears the in-flight flag in finally on success", async () => {
    exploreRpc.mockResolvedValue({
      classification: "explored",
      grantedPlots: 7,
    } as Awaited<ReturnType<typeof liveControlPort.display.explore.request>>);
    const { result } = setup();
    await act(async () => {
      await result.current.handleExplore();
    });
    expect(exploreRpc).toHaveBeenCalledWith({ playerId: 0 });
    expect(result.current.exploreActionRunning).toBe(false);
  });

  it("catches a thrown RPC, toasts an error, and still clears the in-flight flag (try/finally)", async () => {
    const toast = vi.fn();
    exploreRpc.mockRejectedValue(new Error("live game unavailable"));
    const { result } = setup({ toast });
    await act(async () => {
      await result.current.handleExplore();
    });
    expect(toast).toHaveBeenCalledWith(expect.stringContaining("Explore failed"), {
      variant: "error",
    });
    expect(result.current.exploreActionRunning).toBe(false);
  });
});
