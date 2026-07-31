// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./_setup";

// The autoplay/explore RPC entry points are pure module imports inside the hook
// (NOT hook params), so we mock the modules to controllable spies. Everything else
// (the busy gate, the re-entrant guard, the in-flight flag + finally, the live
// `liveRuntime.autoplayActive` read, the complete saved-launch relation) runs for
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

import {
  deriveAppHeaderSetupState,
  type UseSetupControlsArgs,
  useSetupControls,
} from "../../src/app/hooks/useSetupControls";
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
type ExploreRequestResult = Awaited<ReturnType<typeof liveControlPort.display.explore.request>>;

// A minimal-but-valid saved config file. `studioSetupConfigFromSavedConfigFile`
// (the same pure fn the real selection handler calls) derives the authored config
// from it — so a config derived this way is, by construction, a value-equal copy
// of the file-derived state (drift MUST be false).
const SAVED_CONFIG: Civ7SavedSetupConfigFile = {
  id: "saved-alpha",
  displayName: "Saved Alpha",
  fileName: "saved-alpha.Civ7Cfg",
  summary: {
    difficulty: "DIFFICULTY_SOVEREIGN",
    mapSize: "MAPSIZE_SMALL",
    playerCount: 6,
    mapSeed: 123,
    gameSeed: 456,
  },
  gameOptions: { Difficulty: "DIFFICULTY_SOVEREIGN", GameSpeeds: "GAMESPEED_STANDARD" },
  mapOptions: {},
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

const LIVE_RUNTIME_IDLE: LiveRuntimeStatusState = {
  status: "idle",
  autoplayActive: false,
};

const EXPLORE_ALREADY_VISIBLE_RESULT = {
  playerId: 0,
  skipped: true,
  before: { revealed: 64, visible: 64 },
  after: { revealed: 64, visible: 64 },
  mapPlotCount: 64,
  classification: "already-explored",
} satisfies ExploreRequestResult;

const EXPLORE_REVEALED_RESULT = {
  playerId: 0,
  skipped: false,
  before: { revealed: 29, visible: 7 },
  after: { revealed: 64, visible: 64 },
  grantId: 1,
  grantedPlots: 64,
  grantReleased: false,
  settleMs: 15_000,
  drainPolls: 3,
  quiesced: true,
  suspendVerified: true,
  resumeVerified: true,
  suppressedDisplays: [],
  mutation: "Visibility.setTrackedVisibilityGrant",
  discoveryPosture: "ui-suppressed-gameplay-discovers",
  classification: "explored",
} satisfies ExploreRequestResult;

const EXPLORE_UNVERIFIED_RESULT = {
  ...EXPLORE_REVEALED_RESULT,
  after: { revealed: null, visible: 64 },
  classification: "unverified",
} satisfies ExploreRequestResult;

function makeArgs(over: Partial<UseSetupControlsArgs> = {}): UseSetupControlsArgs {
  return {
    setupConfig: studioSetupConfigFromSavedConfigFile(SAVED_CONFIG),
    seed: "123",
    gameSeed: "456",
    worldSettings: { mapSize: "MAPSIZE_SMALL", playerCount: 6, resources: "balanced" },
    setSetupConfig: vi.fn(),
    setSeed: vi.fn(),
    setGameSeed: vi.fn(),
    setWorldSettings: vi.fn(),
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

describe("useSetupControls — SC-4 (complete saved-launch exactness)", () => {
  it("adopts exact saved seeds, map size, and player count", () => {
    const setSeed = vi.fn();
    const setGameSeed = vi.fn();
    const setWorldSettings = vi.fn();
    const { result } = setup({ setSeed, setGameSeed, setWorldSettings });

    act(() => result.current.handleSavedSetupConfigChange(SAVED_CONFIG.id));

    expect(setSeed).toHaveBeenCalledWith("123");
    expect(setGameSeed).toHaveBeenCalledWith("456");
    expect(setWorldSettings).toHaveBeenCalledOnce();
    expect(
      setWorldSettings.mock.calls[0]?.[0]({
        mapSize: "MAPSIZE_HUGE",
        playerCount: 10,
        resources: "strategic",
      })
    ).toEqual({
      mapSize: "MAPSIZE_SMALL",
      playerCount: 6,
      resources: "strategic",
    });
  });

  it("savedSetupConfigModified is false when the authored setup equals the selected saved config (even though it is a fresh-reference object)", () => {
    // The authored config is derived from the file via the SAME pure fn the real
    // selection handler uses — a brand-new object reference each render. Value
    // equality ⇒ no drift. An object-identity comparison would see distinct
    // references and spuriously report drift here (the falsifier).
    const { result } = setup({ setupConfig: studioSetupConfigFromSavedConfigFile(SAVED_CONFIG) });
    expect(result.current.savedSetupConfigModified).toBe(false);
  });

  it("treats matching negative saved seeds as exact and adopts both independently", () => {
    const savedConfig = {
      ...SAVED_CONFIG,
      id: "saved-negative-seeds",
      summary: { ...SAVED_CONFIG.summary, mapSeed: -123, gameSeed: -456 },
    };
    const setSeed = vi.fn();
    const setGameSeed = vi.fn();
    const { result } = setup({
      setupConfig: studioSetupConfigFromSavedConfigFile(savedConfig),
      seed: "-123",
      gameSeed: "-456",
      savedSetupConfigs: { status: "ok", configurations: [savedConfig] },
      setSeed,
      setGameSeed,
    });

    expect(result.current.savedSetupConfigModified).toBe(false);
    act(() => result.current.handleSavedSetupConfigChange(savedConfig.id));
    expect(setSeed).toHaveBeenCalledWith("-123");
    expect(setGameSeed).toHaveBeenCalledWith("-456");
  });

  it("marks only map-seed drift as modified", () => {
    const { result } = setup({ seed: "124" });
    expect(result.current.savedSetupConfigModified).toBe(true);
  });

  it("marks only game-seed drift as modified", () => {
    const { result } = setup({ gameSeed: "457" });
    expect(result.current.savedSetupConfigModified).toBe(true);
  });

  it("marks map-size and player-count drift as modified", () => {
    expect(
      setup({
        worldSettings: { mapSize: "MAPSIZE_HUGE", playerCount: 6, resources: "balanced" },
      }).result.current.savedSetupConfigModified
    ).toBe(true);
    expect(
      setup({
        worldSettings: { mapSize: "MAPSIZE_SMALL", playerCount: 8, resources: "balanced" },
      }).result.current.savedSetupConfigModified
    ).toBe(true);
  });

  it("fails closed when the saved file cannot prove player count", () => {
    const { playerCount: _playerCount, ...summary } = SAVED_CONFIG.summary;
    const incomplete = { ...SAVED_CONFIG, id: "saved-no-player-count", summary };
    const { result } = setup({
      setupConfig: studioSetupConfigFromSavedConfigFile(incomplete),
      savedSetupConfigs: { status: "ok", configurations: [incomplete] },
    });

    expect(result.current.savedSetupConfigModified).toBe(true);
  });

  it("fails closed when saved seed evidence is missing or invalid", () => {
    const withoutSeeds = { ...SAVED_CONFIG, summary: { difficulty: "DIFFICULTY_SOVEREIGN" } };
    const invalidSeeds = {
      ...SAVED_CONFIG,
      id: "saved-invalid-seeds",
      summary: { ...SAVED_CONFIG.summary, mapSeed: -2_147_483_649 },
    };
    const missing = setup({
      setupConfig: studioSetupConfigFromSavedConfigFile(withoutSeeds),
      savedSetupConfigs: { status: "ok", configurations: [withoutSeeds] },
    });
    const invalid = setup({
      setupConfig: studioSetupConfigFromSavedConfigFile(invalidSeeds),
      savedSetupConfigs: { status: "ok", configurations: [invalidSeeds] },
    });

    expect(missing.result.current.savedSetupConfigModified).toBe(true);
    expect(invalid.result.current.savedSetupConfigModified).toBe(true);
  });

  it("leaves an invalid saved seed unadopted and keeps the selected launch modified", () => {
    const invalid = {
      ...SAVED_CONFIG,
      id: "saved-invalid-game-seed",
      summary: { ...SAVED_CONFIG.summary, gameSeed: -2_147_483_649 },
    };
    const setSeed = vi.fn();
    const setGameSeed = vi.fn();
    const toast = vi.fn();
    const { result } = setup({
      setupConfig: studioSetupConfigFromSavedConfigFile(invalid),
      savedSetupConfigs: { status: "ok", configurations: [invalid] },
      setSeed,
      setGameSeed,
      toast,
    });

    act(() => result.current.handleSavedSetupConfigChange(invalid.id));

    expect(setSeed).toHaveBeenCalledWith("123");
    expect(setGameSeed).not.toHaveBeenCalled();
    expect(result.current.savedSetupConfigModified).toBe(true);
    expect(toast).toHaveBeenCalledWith(expect.stringContaining("game seed ignored"), {
      variant: "info",
    });
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

describe("useSetupControls — E4a header view-model + setup intents (the container half)", () => {
  // The pre-redesign AppHeader read these fields inline (setupConfig prop);
  // the E4a container derives them. Field-for-field equivalence, including
  // the difficulty game-over-player fallback and the narrow savedConfig ref.
  it("deriveAppHeaderSetupState projects the authored config field-for-field (game Difficulty wins)", () => {
    expect(deriveAppHeaderSetupState(studioSetupConfigFromSavedConfigFile(SAVED_CONFIG))).toEqual({
      savedConfig: { id: "saved-alpha", displayName: "Saved Alpha" },
      leaderId: "LEADER_HARRIET_TUBMAN",
      civilizationId: "CIVILIZATION_AMERICA",
      difficultyId: "DIFFICULTY_SOVEREIGN",
      gameSpeedId: "GAMESPEED_STANDARD",
    });
  });

  it("deriveAppHeaderSetupState falls back to the player difficulty and maps unset to ''/null", () => {
    expect(
      deriveAppHeaderSetupState({
        gameOptions: {},
        mapOptions: {},
        playerOptions: [{ playerId: 0, options: { PlayerDifficulty: "DIFFICULTY_KING" } }],
      })
    ).toEqual({
      savedConfig: null,
      leaderId: "",
      civilizationId: "",
      difficultyId: "DIFFICULTY_KING",
      gameSpeedId: "",
    });
  });

  it("headerSetupState is the derived projection of the threaded-in config", () => {
    const config = studioSetupConfigFromSavedConfigFile(SAVED_CONFIG);
    const { result } = setup({ setupConfig: config });
    expect(result.current.headerSetupState).toEqual(deriveAppHeaderSetupState(config));
  });

  // Each intent updates via the functional setter off the CURRENT config —
  // assert by applying the queued updater to a base config and comparing
  // against the pure-helper composition the deleted component performed.
  function applyIntent(
    invoke: (r: ReturnType<typeof setup>["result"]) => void,
    base: Civ7StudioSetupConfig,
    over: Partial<UseSetupControlsArgs> = {}
  ): Civ7StudioSetupConfig {
    const setSetupConfig = vi.fn<UseSetupControlsArgs["setSetupConfig"]>();
    const harness = setup({ ...over, setupConfig: base, setSetupConfig });
    invoke(harness.result);
    expect(setSetupConfig).toHaveBeenCalledTimes(1);
    const updater = setSetupConfig.mock.calls[0]?.[0];
    expect(updater).toBeTypeOf("function");
    if (typeof updater !== "function") {
      throw new Error("Setup control intent must update from the current authored config");
    }
    return updater(base);
  }

  it("handleDifficultyChange performs the game+player DOUBLE-WRITE in one update", () => {
    const base = studioSetupConfigFromSavedConfigFile(SAVED_CONFIG);
    const next = applyIntent((r) => r.current.handleDifficultyChange("DIFFICULTY_DEITY"), base);
    expect(next.gameOptions.Difficulty).toBe("DIFFICULTY_DEITY");
    expect(next.playerOptions[0]?.options.PlayerDifficulty).toBe("DIFFICULTY_DEITY");
  });

  it("handleDifficultyChange('') clears BOTH difficulty keys", () => {
    const base: Civ7StudioSetupConfig = {
      gameOptions: { Difficulty: "DIFFICULTY_DEITY" },
      mapOptions: {},
      playerOptions: [{ playerId: 0, options: { PlayerDifficulty: "DIFFICULTY_DEITY" } }],
    };
    const next = applyIntent((r) => r.current.handleDifficultyChange(""), base);
    expect(next.gameOptions.Difficulty).toBeUndefined();
    expect(next.playerOptions[0]?.options.PlayerDifficulty).toBeUndefined();
  });

  it("leader/civ/speed intents set the single key ('' clears)", () => {
    const base = studioSetupConfigFromSavedConfigFile(SAVED_CONFIG);
    expect(
      applyIntent((r) => r.current.handleLeaderChange("LEADER_AMINA"), base).playerOptions[0]
        ?.options.PlayerLeader
    ).toBe("LEADER_AMINA");
    expect(
      applyIntent((r) => r.current.handleCivilizationChange(""), base).playerOptions[0]?.options
        .PlayerCivilization
    ).toBeUndefined();
    expect(
      applyIntent((r) => r.current.handleGameSpeedChange("GAMESPEED_ONLINE"), base).gameOptions
        .GameSpeeds
    ).toBe("GAMESPEED_ONLINE");
  });

  it("projects and edits the observed local player when Civ7 reports a nonzero identity", () => {
    const localPlayerId = 3;
    const base: Civ7StudioSetupConfig = {
      gameOptions: {},
      mapOptions: {},
      playerOptions: [
        {
          playerId: 0,
          options: {
            PlayerLeader: "LEADER_HARRIET_TUBMAN",
            PlayerCivilization: "CIVILIZATION_AMERICA",
          },
        },
        {
          playerId: localPlayerId,
          options: {
            PlayerLeader: "LEADER_ASHOKA",
            PlayerCivilization: "CIVILIZATION_INDIA_MAURYA",
            PlayerDifficulty: "DIFFICULTY_KING",
          },
        },
      ],
    };
    const liveSetup = {
      status: "ok" as const,
      setup: {
        parameters: [],
        players: [
          { playerId: 0, parameters: [] },
          { playerId: localPlayerId, parameters: [] },
        ],
        localPlayerId,
      },
    } satisfies UseSetupControlsArgs["liveSetup"];
    const { result } = setup({ setupConfig: base, liveSetup });

    expect(result.current.headerSetupState).toEqual({
      savedConfig: null,
      leaderId: "LEADER_ASHOKA",
      civilizationId: "CIVILIZATION_INDIA_MAURYA",
      difficultyId: "DIFFICULTY_KING",
      gameSpeedId: "",
    });

    const next = applyIntent((hook) => hook.current.handleLeaderChange("LEADER_AMINA"), base, {
      liveSetup,
    });
    expect(next.playerOptions.find(({ playerId }) => playerId === 0)?.options.PlayerLeader).toBe(
      "LEADER_HARRIET_TUBMAN"
    );
    expect(
      next.playerOptions.find(({ playerId }) => playerId === localPlayerId)?.options.PlayerLeader
    ).toBe("LEADER_AMINA");
  });

  it("does not borrow another player's option domain when the observed local row is absent", () => {
    const localPlayerId = 3;
    const liveSetup = {
      status: "ok" as const,
      setup: {
        parameters: [],
        players: [
          {
            playerId: 0,
            parameters: [
              {
                id: "PlayerLeader",
                exists: true,
                possibleValues: [{ value: "LEADER_HARRIET_TUBMAN" }],
              },
            ],
          },
        ],
        localPlayerId,
      },
    } satisfies UseSetupControlsArgs["liveSetup"];
    const setupConfig: Civ7StudioSetupConfig = {
      gameOptions: {},
      mapOptions: {},
      playerOptions: [{ playerId: localPlayerId, options: { PlayerLeader: "LEADER_ASHOKA" } }],
    };

    const { result } = setup({ liveSetup, setupConfig });

    expect(result.current.setupControlOptions.leaderOptions).toContainEqual({
      value: "LEADER_ASHOKA",
      label: "Ashoka",
    });
    expect(result.current.setupControlOptions.leaderOptions).not.toContainEqual(
      expect.objectContaining({ value: "LEADER_HARRIET_TUBMAN" })
    );
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
    const activeRuntime: LiveRuntimeStatusState = {
      status: "ok",
      autoplayActive: true,
    };
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
    let resolveRpc: (value: ExploreRequestResult) => void = () => {};
    exploreRpc.mockImplementationOnce(
      () =>
        new Promise<ExploreRequestResult>((resolve) => {
          resolveRpc = resolve;
        })
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
      resolveRpc(EXPLORE_ALREADY_VISIBLE_RESULT);
      await firstCall;
    });
  });

  it("presents explored as a success with the owner's granted-plot evidence", async () => {
    const toast = vi.fn();
    exploreRpc.mockResolvedValue(EXPLORE_REVEALED_RESULT);
    const { result } = setup({ toast });

    await act(async () => {
      await result.current.handleExplore();
    });

    expect(toast).toHaveBeenCalledWith("Live map revealed — 64 plots granted", {
      variant: "success",
    });
  });

  it("presents already-explored as a success without claiming a new reveal", async () => {
    const toast = vi.fn();
    exploreRpc.mockResolvedValue(EXPLORE_ALREADY_VISIBLE_RESULT);
    const { result } = setup({ toast });

    await act(async () => {
      await result.current.handleExplore();
    });

    expect(toast).toHaveBeenCalledWith("Live map already fully revealed", {
      variant: "success",
    });
  });

  it("presents unverified as informational uncertainty with inspect-before-retry guidance", async () => {
    const toast = vi.fn();
    exploreRpc.mockResolvedValue(EXPLORE_UNVERIFIED_RESULT);
    const { result } = setup({ toast });

    await act(async () => {
      await result.current.handleExplore();
    });

    expect(toast).toHaveBeenCalledWith(
      "Live map reveal could not be verified. Inspect the live map before retrying.",
      { variant: "info" }
    );
  });

  it("sets the in-flight flag before awaiting and clears it in finally", async () => {
    let resolveRpc: (value: ExploreRequestResult) => void = () => {};
    exploreRpc.mockImplementationOnce(
      () =>
        new Promise<ExploreRequestResult>((resolve) => {
          resolveRpc = resolve;
        })
    );
    const { result } = setup();
    let request!: Promise<void>;

    act(() => {
      request = result.current.handleExplore();
    });
    expect(result.current.exploreActionRunning).toBe(true);

    await act(async () => {
      resolveRpc(EXPLORE_REVEALED_RESULT);
      await request;
    });

    expect(exploreRpc).toHaveBeenCalledWith({ playerId: 0 });
    expect(result.current.exploreActionRunning).toBe(false);
  });

  it("targets the observed local player when revealing the live map", async () => {
    exploreRpc.mockResolvedValue({ ...EXPLORE_ALREADY_VISIBLE_RESULT, playerId: 3 });
    const { result } = setup({
      liveSetup: {
        status: "ok",
        setup: { parameters: [], players: [{ playerId: 3, parameters: [] }], localPlayerId: 3 },
      },
    });

    await act(async () => {
      await result.current.handleExplore();
    });

    expect(exploreRpc).toHaveBeenCalledWith({ playerId: 3 });
  });

  it("presents a thrown owner error as an error and still clears the in-flight flag", async () => {
    const toast = vi.fn();
    exploreRpc.mockRejectedValue(new Error("owner refused request"));
    const { result } = setup({ toast });
    await act(async () => {
      await result.current.handleExplore();
    });
    expect(toast).toHaveBeenCalledWith("Explore failed: owner refused request", {
      variant: "error",
    });
    expect(result.current.exploreActionRunning).toBe(false);
  });
});
