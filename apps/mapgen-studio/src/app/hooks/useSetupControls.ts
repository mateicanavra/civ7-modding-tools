import type { AppHeaderSetupState } from "@swooper/mapgen-studio-ui";
import { useCallback, useMemo, useState } from "react";

import { requestCiv7Autoplay } from "../../features/civ7Setup/api";
import {
  formatCiv7StudioSeedError,
  parseCiv7StudioSeed,
} from "../../features/civ7Setup/seedPolicy";
import {
  type Civ7StudioSetupConfig,
  clearStudioSetupSavedConfig,
  getLocalPlayerSetup,
  optionRowsFromParameter,
  studioLaunchMatchesSavedConfig,
  studioSavedWorldSettingsFromConfigFile,
  studioSetupConfigFromSavedConfigFile,
  updateStudioSetupGameOption,
  updateStudioSetupPlayerOption,
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
  /** Current authored map seed used by generation and saved-config exactness. */
  seed: AuthoringState["seed"];
  /** Current authored game seed used by Civ7 setup and saved-config exactness. */
  gameSeed: AuthoringState["gameSeed"];
  /** Current map size and player count used by generation and saved-config exactness. */
  worldSettings: AuthoringState["worldSettings"];
  /** Setter for the authoring setup config (from `useAuthoringStore`). */
  setSetupConfig: AuthoringState["setSetupConfig"];
  /** Setter for the generation seed — saved-config seed adoption. */
  setSeed: AuthoringState["setSeed"];
  /** Setter for the Civ7 game seed — saved-config seed adoption. */
  setGameSeed: AuthoringState["setGameSeed"];
  /** Setter for map size/player count identities proved by a saved configuration. */
  setWorldSettings: AuthoringState["setWorldSettings"];
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
type SetupControlOptions = {
  savedConfigOptions: SetupControlSelectOptions;
  leaderOptions: SetupControlSelectOptions;
  civilizationOptions: SetupControlSelectOptions;
  difficultyOptions: SetupControlSelectOptions;
  gameSpeedOptions: SetupControlSelectOptions;
};

export type UseSetupControlsResult = {
  /** Derived Civ7 setup-control select options (saved config + leader/civ/difficulty/speed). */
  setupControlOptions: SetupControlOptions;
  /** AppHeader's game-setup view-model (E4a) — derived from the authored setup config. */
  headerSetupState: AppHeaderSetupState;
  /** True when authored setup, seeds, map size, or player count diverges from saved evidence. */
  savedSetupConfigModified: boolean;
  /** Applies the saved setup and adopts every seed/world identity the file proves. */
  handleSavedSetupConfigChange: (configId: string) => void;
  /** AppHeader intent: set/clear ("" = clear) the local player's leader. */
  handleLeaderChange: (value: string) => void;
  /** AppHeader intent: set/clear the local player's civilization. */
  handleCivilizationChange: (value: string) => void;
  /** AppHeader intent: the difficulty DOUBLE-WRITE — game `Difficulty` + player `PlayerDifficulty`. */
  handleDifficultyChange: (value: string) => void;
  /** AppHeader intent: set/clear the game speed. */
  handleGameSpeedChange: (value: string) => void;
  /** Starts/stops Civ7 autoplay — busy-gated + re-entrant-guarded; reads LIVE autoplay state. */
  handleToggleAutoplay: () => Promise<void>;
  /** Reveals the live map (explore) — busy-gated + re-entrant-guarded. */
  handleExplore: () => Promise<void>;
  /** In-flight flag for the autoplay toggle (re-entrant guard, drives disabled state). */
  autoplayActionRunning: boolean;
  /** In-flight flag for the explore action (re-entrant guard, drives disabled state). */
  exploreActionRunning: boolean;
};

function adoptSavedSeed(
  label: "Map" | "Game",
  value: unknown,
  setValue: AuthoringState["setSeed"],
  toast: ToastFn
): void {
  if (value === undefined) return;
  const parsed = parseCiv7StudioSeed(value);
  if (parsed.ok) {
    setValue(String(parsed.value));
    return;
  }
  toast(`Saved config ${label.toLowerCase()} seed ignored: ${formatCiv7StudioSeedError(parsed)}`, {
    variant: "info",
  });
}

/**
 * `deriveAppHeaderSetupState` — the app container's projection of the authored
 * setup config into AppHeader's `AppHeaderSetupState` view-model (E4a redesign,
 * structure-rewire §5). Field-for-field the reads the pre-redesign AppHeader
 * performed inline: saved-config ref (id + displayName only), the local
 * player's leader/civilization, the difficulty with its game-over-player
 * fallback (`gameOptions.Difficulty ?? PlayerDifficulty`), and the game speed.
 * "" = unset throughout. Pure + exported so the markup-pin test composes the
 * REAL derivation with the package AppHeader.
 */
export function deriveAppHeaderSetupState(
  config: Civ7StudioSetupConfig,
  localPlayerId = 0
): AppHeaderSetupState {
  const localPlayerSetup = getLocalPlayerSetup(config, localPlayerId);
  return {
    savedConfig: config.savedConfig
      ? { id: config.savedConfig.id, displayName: config.savedConfig.displayName }
      : null,
    leaderId: String(localPlayerSetup.options.PlayerLeader ?? ""),
    civilizationId: String(localPlayerSetup.options.PlayerCivilization ?? ""),
    difficultyId: String(
      config.gameOptions.Difficulty ?? localPlayerSetup.options.PlayerDifficulty ?? ""
    ),
    gameSpeedId: String(config.gameOptions.GameSpeeds ?? ""),
  };
}

/**
 * `useSetupControls` — owns the Civ7 setup-controls cluster: the derived
 * `setupControlOptions` select-option projection, the AppHeader view-model
 * (`headerSetupState`) with its four setup intents (leader/civ/difficulty/
 * speed — the E4a container half; difficulty is the game+player double-write),
 * the saved-config selection handler (`handleSavedSetupConfigChange`), the
 * complete saved-launch relation (`savedSetupConfigModified`), and the two
 * live-game *actions* co-located here (`handleToggleAutoplay` /
 * `handleExplore`) with their in-flight guard state.
 *
 * Load-bearing invariants preserved verbatim from the prior host body:
 * - SC-4: exactness is VALUE equality over setup, both seeds, map size, and player count,
 *   never object identity. Missing or invalid saved evidence fails closed to "Custom"
 *   instead of claiming the file governs the next launch.
 * - SC-1/2/3: the saved-config replace + drift + normalized-equality PURE logic
 *   stays in `features/civ7Setup/*` (`studioSetupConfigFromSavedConfigFile`,
 *   `clearStudioSetupSavedConfig`, `studioLaunchMatchesSavedConfig`) — called,
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
    seed,
    gameSeed,
    worldSettings,
    setSetupConfig,
    setSeed,
    setGameSeed,
    setWorldSettings,
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
  const localPlayerId = liveSetup.setup?.localPlayerId ?? 0;

  const setupControlOptions = useMemo(() => {
    const setup = liveSetup.setup;
    const parameters = setup?.parameters ?? [];
    const playerParameters =
      setup?.players.find((player) => player.playerId === localPlayerId)?.parameters ?? [];
    const localPlayer = getLocalPlayerSetup(setupConfig, localPlayerId);
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
    localPlayerId,
    savedSetupConfigs.configurations,
    savedSetupConfigs.status,
    setupCatalog.catalog,
    setupConfig,
  ]);

  // Config precedence: the selector claims the saved file only while every
  // launch input governed by that file (setup, seeds, map size, player count) matches.
  const savedSetupConfigModified = useMemo(() => {
    const selectedId = setupConfig.savedConfig?.id;
    if (!selectedId) return false;
    const savedConfig = savedSetupConfigs.configurations.find((config) => config.id === selectedId);
    if (!savedConfig) return true;
    return !studioLaunchMatchesSavedConfig({
      setupConfig,
      seed,
      gameSeed,
      mapSize: worldSettings.mapSize,
      playerCount: worldSettings.playerCount,
      savedConfig,
    });
  }, [gameSeed, savedSetupConfigs.configurations, seed, setupConfig, worldSettings]);

  const handleSavedSetupConfigChange = useCallback(
    (configId: string) => {
      const savedConfig = savedSetupConfigs.configurations.find((config) => config.id === configId);
      if (!savedConfig) {
        setSetupConfig((current) => clearStudioSetupSavedConfig(current));
        return;
      }
      setSetupConfig(studioSetupConfigFromSavedConfigFile(savedConfig));
      adoptSavedSeed("Map", savedConfig.summary.mapSeed, setSeed, toast);
      adoptSavedSeed("Game", savedConfig.summary.gameSeed, setGameSeed, toast);
      const savedWorldSettings = studioSavedWorldSettingsFromConfigFile(savedConfig);
      if (
        savedWorldSettings.mapSize !== undefined ||
        savedWorldSettings.playerCount !== undefined
      ) {
        setWorldSettings((current) => ({ ...current, ...savedWorldSettings }));
      }
    },
    [
      savedSetupConfigs.configurations,
      setGameSeed,
      setSeed,
      setSetupConfig,
      setWorldSettings,
      toast,
    ]
  );

  // The E4a header intents (structure-rewire §4.7/§5): the update composition
  // the pre-redesign AppHeader performed inline, moved to the container. Each
  // uses the functional setter form (the hook's existing pattern for
  // `clearStudioSetupSavedConfig`) so updates compose off the CURRENT config;
  // "" clears the option (`value || undefined`, exactly as before).
  const handleLeaderChange = useCallback(
    (value: string) => {
      setSetupConfig((current) =>
        updateStudioSetupPlayerOption(current, "PlayerLeader", value || undefined, localPlayerId)
      );
    },
    [localPlayerId, setSetupConfig]
  );
  const handleCivilizationChange = useCallback(
    (value: string) => {
      setSetupConfig((current) =>
        updateStudioSetupPlayerOption(
          current,
          "PlayerCivilization",
          value || undefined,
          localPlayerId
        )
      );
    },
    [localPlayerId, setSetupConfig]
  );
  // The difficulty DOUBLE-WRITE (pre-redesign AppHeader.tsx:92-97): one state
  // update writing game `Difficulty` and player `PlayerDifficulty` together —
  // the pair must never drift apart.
  const handleDifficultyChange = useCallback(
    (value: string) => {
      setSetupConfig((current) =>
        updateStudioSetupPlayerOption(
          updateStudioSetupGameOption(current, "Difficulty", value || undefined),
          "PlayerDifficulty",
          value || undefined,
          localPlayerId
        )
      );
    },
    [localPlayerId, setSetupConfig]
  );
  const handleGameSpeedChange = useCallback(
    (value: string) => {
      setSetupConfig((current) =>
        updateStudioSetupGameOption(current, "GameSpeeds", value || undefined)
      );
    },
    [setSetupConfig]
  );

  const headerSetupState = useMemo(
    () => deriveAppHeaderSetupState(setupConfig, localPlayerId),
    [localPlayerId, setupConfig]
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
    setLiveRuntime,
  ]);

  /**
   * Explore (reveal the map) in the live game via the canonical
   * `display.explore.request` control procedure — the studio's map-QA verb.
   * The grant stays held (fog does not re-cover) for a disposable studio
   * session; the observed local-player identity is used when Civ7 supplies one.
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
      const result = await liveControlPort.display.explore.request({ playerId: localPlayerId });
      switch (result.classification) {
        case "explored":
          toast(`Live map revealed — ${result.grantedPlots} plots granted`, {
            variant: "success",
          });
          break;
        case "already-explored":
          toast("Live map already fully revealed", { variant: "success" });
          break;
        case "unverified":
          toast("Live map reveal could not be verified. Inspect the live map before retrying.", {
            variant: "info",
          });
          break;
        default:
          result satisfies never;
      }
    } catch (err) {
      toast(`Explore failed: ${err instanceof Error ? err.message : "live game unavailable"}`, {
        variant: "error",
      });
    } finally {
      setExploreActionRunning(false);
    }
  }, [
    browserRunning,
    exploreActionRunning,
    localPlayerId,
    runInGameRunning,
    saveDeployRunning,
    toast,
  ]);

  return {
    setupControlOptions,
    headerSetupState,
    savedSetupConfigModified,
    handleSavedSetupConfigChange,
    handleLeaderChange,
    handleCivilizationChange,
    handleDifficultyChange,
    handleGameSpeedChange,
    handleToggleAutoplay,
    handleExplore,
    autoplayActionRunning,
    exploreActionRunning,
  };
}
