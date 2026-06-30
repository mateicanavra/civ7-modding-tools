import { useCallback, useMemo, useState } from "react";

import { requestCiv7Autoplay } from "../../features/civ7Setup/api";
import {
  formatCiv7StudioSeedError,
  parseCiv7StudioSeed,
} from "../../features/civ7Setup/seedPolicy";
import {
  clearStudioSetupSavedConfig,
  getLocalPlayerSetup,
  optionRowsFromParameter,
  studioSetupConfigFromSavedConfigFile,
  studioSetupDriftsFromSavedConfig,
} from "../../features/civ7Setup/setupConfig";
import {
  ensureSelectOption,
  findSetupParameterLike,
  mergeSelectOptions,
  setupCatalogOptions,
} from "../../features/civ7Setup/setupOptions";
import { liveControlPort } from "../../lib/control/liveControlPort";
import type { AuthoringState } from "../../stores/authoringStore";
import { studioBusyGateMessage } from "../studioEventRecovery";
import type { UseLiveRuntimeResult } from "./useLiveRuntime";
import type { SavedSetupConfigsView, SetupCatalogView } from "./useSetupDataQueries";
import type { StudioOperations } from "./useStudioOperations";
import type { ToastFn } from "./useToast";

export type UseSetupControlsArgs = {
  /** Current authoring setup config (from `useAuthoringStore`). */
  setupConfig: AuthoringState["setupConfig"];
  /** Setter for the authoring setup config (from `useAuthoringStore`). */
  setSetupConfig: AuthoringState["setSetupConfig"];
  /** Setter for the authoring recipe settings — saved-config seed adoption. */
  setRecipeSettings: AuthoringState["setRecipeSettings"];
  /** Saved-config READ view (from `useSetupDataQueries`). */
  savedSetupConfigs: SavedSetupConfigsView;
  /** Setup-catalog READ view (from `useSetupDataQueries`). */
  setupCatalog: SetupCatalogView;
  /** Live setup snapshot (from `useLiveRuntime`) — feeds the setup-options projection. */
  liveSetup: UseLiveRuntimeResult["liveSetup"];
  /**
   * Live runtime status (from `useLiveRuntime`). The autoplay toggle reads
   * `liveRuntime.autoplayActive` LIVE off this value (not a stale prop) so a stop
   * action is never issued against a stale active flag (MAN-3 / SC-5).
   */
  liveRuntime: UseLiveRuntimeResult["liveRuntime"];
  /** Setter for `liveRuntime` (from `useLiveRuntime`) — autoplay-result reconciliation. */
  setLiveRuntime: UseLiveRuntimeResult["setLiveRuntime"];
  /** Synchronous busy flag for browser map generation (busy-gate). */
  browserRunning: boolean;
  /** Synchronous busy flag for run-in-game (busy-gate, from `useStudioOperations`). */
  runInGameRunning: StudioOperations["runInGameRunning"];
  /** Synchronous busy flag for save/deploy (busy-gate, from `useStudioOperations`). */
  saveDeployRunning: StudioOperations["saveDeployRunning"];
  toast: ToastFn;
};

/** A single Civ7 setup-control select option group (value/label rows). */
type SetupControlSelectOptions = ReadonlyArray<{ value: string; label: string }>;

/** Shape of the memoized setup-control options object (one group per control). */
export type SetupControlOptions = {
  savedConfigOptions: SetupControlSelectOptions;
  leaderOptions: SetupControlSelectOptions;
  civilizationOptions: SetupControlSelectOptions;
  difficultyOptions: SetupControlSelectOptions;
  gameSpeedOptions: SetupControlSelectOptions;
};

export type UseSetupControlsResult = {
  /** Derived Civ7 setup-control select options (saved config + leader/civ/difficulty/speed). */
  setupControlOptions: SetupControlOptions;
  /** Drift flag — true when the authored setup diverges (by value) from the selected saved config. */
  savedSetupConfigModified: boolean;
  /** Applies (replaces) the authored setup from the chosen saved config + adopts its seed. */
  handleSavedSetupConfigChange: (configId: string) => void;
  /** Starts/stops Civ7 autoplay — busy-gated + re-entrant-guarded; reads LIVE autoplay state. */
  handleToggleAutoplay: () => Promise<void>;
  /** Reveals the live map (explore) — busy-gated + re-entrant-guarded. */
  handleExplore: () => Promise<void>;
  /** In-flight flag for the autoplay toggle (re-entrant guard, drives disabled state). */
  autoplayActionRunning: boolean;
  /** In-flight flag for the explore action (re-entrant guard, drives disabled state). */
  exploreActionRunning: boolean;
};

/**
 * `useSetupControls` — owns the Civ7 setup-controls cluster: the derived
 * `setupControlOptions` select-option projection, the saved-config selection
 * handler (`handleSavedSetupConfigChange`), the value-equality drift detector
 * (`savedSetupConfigModified`), and the two live-game *actions* co-located here
 * (`handleToggleAutoplay` / `handleExplore`) with their in-flight guard state.
 *
 * Load-bearing invariants preserved verbatim from the prior host body:
 * - SC-4: drift detection is VALUE equality (`studioSetupDriftsFromSavedConfig`
 *   → `studioSetupConfigsEqual`), never object identity — so it flips to "Custom"
 *   only when the authored setup actually differs from the file (a post-sync
 *   identity change alone never spuriously flips it).
 * - SC-1/2/3: the saved-config replace + drift + normalized-equality PURE logic
 *   stays in `features/civ7Setup/*` (`studioSetupConfigFromSavedConfigFile`,
 *   `clearStudioSetupSavedConfig`, `studioSetupDriftsFromSavedConfig`) — called,
 *   never inlined/re-derived.
 * - SC-5: `handleToggleAutoplay` short-circuits + toasts when `autoplayAction
 *   Running` (re-entrant guard) OR when a busy flag is set; the in-flight flag is
 *   set BEFORE the await and cleared in a `finally`. The start/stop decision reads
 *   the LIVE `liveRuntime.autoplayActive` threaded IN (not a stale capture).
 * - SC-6: `handleExplore` short-circuits + toasts when `exploreActionRunning` OR
 *   busy; the in-flight flag is set BEFORE the await and cleared in `finally`
 *   (try/finally wraps the RPC).
 *
 * The setup config + setters, the saved-config/catalog READ views, the live setup/
 * runtime + `setLiveRuntime`, and the busy booleans are threaded IN from their
 * owners (`useAuthoringStore`, `useSetupDataQueries`, `useLiveRuntime`,
 * `useStudioOperations`); the autoplay/explore RPC entry points
 * (`requestCiv7Autoplay`, `liveControlPort`) are pure module imports.
 */
export function useSetupControls(args: UseSetupControlsArgs): UseSetupControlsResult {
  const {
    setupConfig,
    setSetupConfig,
    setRecipeSettings,
    savedSetupConfigs,
    setupCatalog,
    liveSetup,
    liveRuntime,
    setLiveRuntime,
    browserRunning,
    runInGameRunning,
    saveDeployRunning,
    toast,
  } = args;

  const [autoplayActionRunning, setAutoplayActionRunning] = useState(false);
  const [exploreActionRunning, setExploreActionRunning] = useState(false);

  const setupControlOptions = useMemo(() => {
    const setup = liveSetup.setup;
    const parameters = setup?.setup?.parameters ?? [];
    const localPlayerId = Number(
      setup?.setup?.localPlayerId?.ok === true
        ? setup.setup.localPlayerId.value
        : getLocalPlayerSetup(setupConfig).playerId
    );
    const playerParameters =
      setup?.setup?.playerParameters?.find((player) => player.playerId === localPlayerId)
        ?.parameters ??
      setup?.setup?.playerParameters?.[0]?.parameters ??
      [];
    const localPlayer = getLocalPlayerSetup(setupConfig);
    const gameOptions = setupConfig.gameOptions;
    const playerOptions = localPlayer.options;
    const savedConfigOptions = [
      {
        value: "",
        label: savedSetupConfigs.status === "idle" ? "Loading configs" : "No saved config",
      },
      ...savedSetupConfigs.configurations.map((config) => ({
        value: config.id,
        label: config.displayName,
      })),
    ];
    const leader = playerOptions.PlayerLeader;
    const civilization = playerOptions.PlayerCivilization;
    const difficulty = gameOptions.Difficulty ?? playerOptions.PlayerDifficulty;
    const gameSpeed = gameOptions.GameSpeeds;
    const catalog = setupCatalog.catalog;
    return {
      savedConfigOptions: ensureSelectOption(savedConfigOptions, setupConfig.savedConfig?.id),
      leaderOptions: ensureSelectOption(
        mergeSelectOptions(
          [{ value: "", label: "Leader" }],
          optionRowsFromParameter(findSetupParameterLike(playerParameters, "PlayerLeader")),
          setupCatalogOptions(catalog?.leaders)
        ),
        leader
      ),
      civilizationOptions: ensureSelectOption(
        mergeSelectOptions(
          [{ value: "", label: "Civilization" }],
          optionRowsFromParameter(findSetupParameterLike(playerParameters, "PlayerCivilization")),
          setupCatalogOptions(catalog?.civilizations)
        ),
        civilization
      ),
      difficultyOptions: ensureSelectOption(
        mergeSelectOptions(
          [{ value: "", label: "Difficulty" }],
          optionRowsFromParameter(findSetupParameterLike(parameters, "Difficulty")),
          setupCatalogOptions(catalog?.difficulties)
        ),
        difficulty
      ),
      gameSpeedOptions: ensureSelectOption(
        mergeSelectOptions(
          [{ value: "", label: "Speed" }],
          optionRowsFromParameter(findSetupParameterLike(parameters, "GameSpeeds")),
          setupCatalogOptions(catalog?.gameSpeeds)
        ),
        gameSpeed
      ),
    };
  }, [
    liveSetup.setup,
    savedSetupConfigs.configurations,
    savedSetupConfigs.status,
    setupCatalog.catalog,
    setupConfig,
  ]);

  // Config precedence (Y2, hardened in P7): the selector claims the saved
  // config ONLY while the authored setup state equals the file-derived state
  // — any difference (dropdown edit, live sync, stray persisted key) means
  // the launch would not be the file, so the header shows "Custom" instead.
  // Re-selecting the config re-applies the file exactly and returns to clean.
  const savedSetupConfigModified = useMemo(() => {
    const selectedId = setupConfig.savedConfig?.id;
    if (!selectedId) return false;
    const savedConfig = savedSetupConfigs.configurations.find((config) => config.id === selectedId);
    if (!savedConfig) return false;
    return studioSetupDriftsFromSavedConfig(setupConfig, savedConfig);
  }, [savedSetupConfigs.configurations, setupConfig]);

  const handleSavedSetupConfigChange = useCallback(
    (configId: string) => {
      const savedConfig = savedSetupConfigs.configurations.find((config) => config.id === configId);
      if (!savedConfig) {
        setSetupConfig((current) => clearStudioSetupSavedConfig(current));
        return;
      }
      setSetupConfig(studioSetupConfigFromSavedConfigFile(savedConfig));
      const nextSeed = savedConfig.summary.mapSeed ?? savedConfig.summary.gameSeed;
      if (nextSeed !== undefined) {
        const seedPolicy = parseCiv7StudioSeed(nextSeed);
        if (seedPolicy.ok) {
          setRecipeSettings((current) => ({ ...current, seed: String(seedPolicy.value) }));
        } else {
          toast(`Saved config seed ignored: ${formatCiv7StudioSeedError(seedPolicy)}`, {
            variant: "info",
          });
        }
      }
    },
    [savedSetupConfigs.configurations, toast]
  );

  const handleToggleAutoplay = useCallback(async () => {
    if (autoplayActionRunning) {
      toast("Autoplay request is already in flight.", { variant: "info" });
      return;
    }
    const busyMessage = studioBusyGateMessage({
      subject: "Autoplay",
      browserRunning,
      runInGameRunning,
      saveDeployRunning,
    });
    if (busyMessage) {
      toast(busyMessage, { variant: "info" });
      return;
    }
    const action = liveRuntime.autoplayActive ? "stop" : "start";
    setAutoplayActionRunning(true);
    try {
      const result = await requestCiv7Autoplay(action);
      if (!result.ok) {
        toast(`Autoplay ${action} failed: ${result.error ?? "unknown error"}`, {
          variant: "error",
        });
        return;
      }
      setLiveRuntime((current) => ({
        ...current,
        status: "ok",
        autoplayActive: result.autoplay?.isActive ?? action === "start",
        autoplayPaused: result.autoplay?.isPaused,
        turn: result.game?.turn?.ok ? result.game.turn.value : current.turn,
        updatedAt: new Date().toISOString(),
        error: undefined,
      }));
      toast(action === "start" ? "Civ7 autoplay started" : "Civ7 autoplay stopped", {
        variant: "success",
      });
    } finally {
      setAutoplayActionRunning(false);
    }
  }, [
    autoplayActionRunning,
    browserRunning,
    liveRuntime.autoplayActive,
    runInGameRunning,
    saveDeployRunning,
    toast,
  ]);

  /**
   * Explore (reveal the map) in the live game via the canonical
   * `display.explore.request` control procedure — the studio's map-QA verb.
   * The grant stays held (fog does not re-cover) for a disposable studio
   * session; player 0 is the canonical local player, matching the CLI.
   */
  const handleExplore = useCallback(async () => {
    if (exploreActionRunning) {
      toast("Explore request is already in flight.", { variant: "info" });
      return;
    }
    const busyMessage = studioBusyGateMessage({
      subject: "Explore",
      browserRunning,
      runInGameRunning,
      saveDeployRunning,
    });
    if (busyMessage) {
      toast(busyMessage, { variant: "info" });
      return;
    }
    setExploreActionRunning(true);
    try {
      const result = await liveControlPort.display.explore.request({ playerId: 0 });
      toast(
        result.classification === "already-explored"
          ? "Live map already fully revealed"
          : `Live map revealed — ${result.grantedPlots} plots granted`,
        { variant: "success" }
      );
    } catch (err) {
      toast(`Explore failed: ${err instanceof Error ? err.message : "live game unavailable"}`, {
        variant: "error",
      });
    } finally {
      setExploreActionRunning(false);
    }
  }, [browserRunning, exploreActionRunning, runInGameRunning, saveDeployRunning, toast]);

  return {
    setupControlOptions,
    savedSetupConfigModified,
    handleSavedSetupConfigChange,
    handleToggleAutoplay,
    handleExplore,
    autoplayActionRunning,
    exploreActionRunning,
  };
}
