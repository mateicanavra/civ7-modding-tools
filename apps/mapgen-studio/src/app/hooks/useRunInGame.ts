import type { RunDiagnosticsLookupResult } from "@civ7/studio-contract";
import { stripSchemaMetadataRoot } from "@swooper/mapgen-core/authoring";
import type {
  PipelineConfig,
  RecipeSettings,
  WorldSettings,
} from "@swooper/mapgen-studio-ui/types";
import { type MutableRefObject, useCallback, useMemo } from "react";
import { getCiv7MapSizePreset } from "../../features/browserRunner/mapSizes";
import { LIVE_GAME_PRESET_KEY } from "../../features/civ7Setup/livePreset";
import {
  formatCiv7StudioSeedError,
  parseCiv7StudioSeed,
} from "../../features/civ7Setup/seedPolicy";
import {
  type Civ7StudioSetupConfig,
  normalizeStudioSetupConfig,
} from "../../features/civ7Setup/setupConfig";
import { isPlainObject } from "../../features/configOverrides/configBuilders";
import { buildLiveRuntimeSuggestionRecords } from "../../features/liveRuntime/model";
import type { PresetKey } from "../../features/presets/types";
import { runCurrentConfigInGame } from "../../features/runInGame/api";
import {
  buildRunInGameClientSnapshot,
  buildRunInGameFingerprint,
  buildRunInGameSourceSnapshot,
  type RunInGameCurrentRelation,
  type RunInGameSourceSnapshot,
  relationForRunInGameOperation,
} from "../../features/runInGame/clientState";
import { orpcClient } from "../../lib/orpc";
import type { AuthoringState } from "../../stores/authoringStore";
import type { RunState } from "../../stores/runStore";
import type { UseLiveRuntimeResult } from "./useLiveRuntime";
import type { UsePresetLifecycleResult } from "./usePresetLifecycle";
import { useRunInGameTerminalToast } from "./useRunInGameTerminalToast";
import type { StudioOperations } from "./useStudioOperations";
import type { ToastFn } from "./useToast";

export type UseRunInGameArgs = {
  /** Authoring recipe/preset/seed selection (fingerprint + launch payload source). */
  recipeSettings: RecipeSettings;
  /** Authoring world settings (map size / player count / resources). */
  worldSettings: WorldSettings;
  /** Current authoring pipeline config — the launch payload source. */
  pipelineConfig: PipelineConfig;
  /** Current authoring setup config. */
  setupConfig: Civ7StudioSetupConfig;
  setRecipeSettings: AuthoringState["setRecipeSettings"];
  setSetupConfig: AuthoringState["setSetupConfig"];
  /**
   * HOST-computed materialization mode (cycle break, design.md §7.6). RIG-2
   * security-adjacent: a render-time `useMemo` in the host (durable/disposable
   * game-file routing) threaded IN — NEVER read from an effect-assigned ref.
   * Feeds the fingerprint (RIG-4) + the launch payload.
   */
  runInGameMaterializationMode: "durable" | "disposable";
  /**
   * HOST-computed proved-source projection (cycle break, design.md §7.6) — the
   * last proved Run-in-Game source snapshot, or null. Read by the sync-back path.
   */
  provedRunInGameSource: RunInGameSourceSnapshot | null;
  /** Live runtime status (from `useLiveRuntime`) — sync-back gating + suggestions. */
  liveRuntime: UseLiveRuntimeResult["liveRuntime"];
  /** Live runtime sync-back suggestion records (from `useLiveRuntime`). */
  liveRuntimeSuggestions: UseLiveRuntimeResult["liveRuntimeSuggestions"];
  /** Preset resolver (from `usePresetLifecycle`) — launch + sync-back preset lookup. */
  resolvePreset: UsePresetLifecycleResult["resolvePreset"];
  /**
   * The ordered authoring write (from `usePresetLifecycle`) — sync-back's single
   * authoring action (RIG-5: the 5-setter ORDER lives in the contract owner).
   */
  applyAuthoringSnapshot: UsePresetLifecycleResult["applyAuthoringSnapshot"];
  /** Live run-in-game operation status (owned by `useStudioOperations`). */
  runInGameOperation: StudioOperations["runInGameOperation"];
  /** Setter for the run-in-game operation status (owned by `useStudioOperations`). */
  setRunInGameOperation: StudioOperations["setRunInGameOperation"];
  /** Synchronous busy flag for run-in-game (busy-gate). */
  runInGameRunning: StudioOperations["runInGameRunning"];
  /** Synchronous busy flag for save/deploy (busy-gate). */
  saveDeployRunning: StudioOperations["saveDeployRunning"];
  /** Synchronous busy flag for browser map generation (sync-back busy-gate). */
  browserRunning: boolean;
  /** Session-only run-in-game client snapshot (relation source). */
  runInGameSnapshot: RunState["runInGameSnapshot"];
  setRunInGameSnapshot: RunState["setRunInGameSnapshot"];
  setLastRunInGameSource: RunState["setLastRunInGameSource"];
  /**
   * Host-owned toast-dedupe ref (shared with the operation-adoption + studio-event
   * coordination that lives host). `handleRunInGame` resets it on a fresh launch;
   * the terminal-toast effect reads it. Threaded IN (not owned here).
   */
  lastRunInGameToastRef: MutableRefObject<string | null>;
  /** Single-owner error-channel writer (from `useStudioOperations`). */
  setLocalError: StudioOperations["setLocalError"];
  toast: ToastFn;
};

export type UseRunInGameResult = {
  /** Current run-in-game relation (current/stale/unknown) consumed by the Game console. */
  runInGameCurrentRelation: RunInGameCurrentRelation;
  /** Launch handler — busy-gated, seed-validated, fingerprint/source-recording. */
  handleRunInGame: (options?: { restartCivProcess?: boolean }) => Promise<void>;
  /** Sync-back handler — proved-source restore or seed/setup suggestion apply. */
  syncStudioFromLiveGame: () => void;
  /** Copies run-in-game diagnostics to the clipboard. */
  copyRunInGameDiagnostics: () => Promise<void>;
};

/**
 * `useRunInGame` — owns the run-in-game cluster: the current fingerprint + relation
 * memos, the launch handler (`handleRunInGame`), the live-game sync-back handler
 * (`syncStudioFromLiveGame`), the diagnostics-copy handler, and the run-in-game
 * terminal-toast effect.
 *
 * The hook is deliberately a coordinator, not a runtime truth owner: source
 * proof and materialization mode are computed by the host and threaded in,
 * authoring writes go through `usePresetLifecycle`, and private diagnostics are
 * copied only through the explicit server lookup when the public status exposes
 * a diagnostics id.
 */
export function useRunInGame(args: UseRunInGameArgs): UseRunInGameResult {
  const {
    recipeSettings,
    worldSettings,
    pipelineConfig,
    setupConfig,
    setRecipeSettings,
    setSetupConfig,
    runInGameMaterializationMode,
    provedRunInGameSource,
    liveRuntime,
    liveRuntimeSuggestions,
    resolvePreset,
    applyAuthoringSnapshot,
    runInGameOperation,
    setRunInGameOperation,
    runInGameRunning,
    saveDeployRunning,
    browserRunning,
    runInGameSnapshot,
    setRunInGameSnapshot,
    setLastRunInGameSource,
    lastRunInGameToastRef,
    setLocalError,
    toast,
  } = args;

  const runInGameCurrentFingerprint = useMemo(
    () =>
      buildRunInGameFingerprint({
        recipeSettings,
        worldSettings,
        pipelineConfig: stripSchemaMetadataRoot(pipelineConfig) as PipelineConfig,
        setupConfig,
        materializationMode: runInGameMaterializationMode,
      }),
    [pipelineConfig, recipeSettings, runInGameMaterializationMode, setupConfig, worldSettings]
  );

  const runInGameCurrentRelation = useMemo<RunInGameCurrentRelation>(
    () =>
      relationForRunInGameOperation({
        status: runInGameOperation,
        snapshot: runInGameSnapshot,
        currentFingerprint: runInGameCurrentFingerprint,
      }),
    [runInGameCurrentFingerprint, runInGameOperation, runInGameSnapshot]
  );

  useRunInGameTerminalToast({
    runInGameOperation,
    lastRunInGameToastRef,
    toast,
  });

  const handleRunInGame = useCallback(
    async (options?: { restartCivProcess?: boolean }) => {
      // Busy gate must never be silent — a click that does nothing is
      // indistinguishable from a broken launch path.
      if (runInGameRunning || saveDeployRunning) {
        toast(
          runInGameRunning
            ? "Run in Game is already running — check the status chip in the Game bar."
            : "Save & Deploy is in progress; wait for it to finish before launching.",
          { variant: "info" }
        );
        return;
      }
      setLocalError(null);
      const seedPolicy = parseCiv7StudioSeed(recipeSettings.seed);
      if (!seedPolicy.ok) {
        const message = formatCiv7StudioSeedError(seedPolicy);
        setLocalError(message);
        toast(message, { variant: "error" });
        return;
      }
      const sanitized = stripSchemaMetadataRoot(pipelineConfig) as PipelineConfig;
      const resolved = resolvePreset(recipeSettings.preset as PresetKey);
      const mapSize = getCiv7MapSizePreset(worldSettings.mapSize);
      const selectedConfig = resolved
        ? {
            id: resolved.id,
            label: resolved.label,
            description: resolved.description,
            sourcePath: resolved.sourcePath,
            sortIndex: resolved.sortIndex,
            latitudeBounds: resolved.latitudeBounds,
          }
        : undefined;
      const launchSource =
        runInGameMaterializationMode === "durable" && selectedConfig?.id
          ? ({
              kind: "catalog" as const,
              catalogSourceId: selectedConfig.id,
            } satisfies Parameters<typeof runCurrentConfigInGame>[0]["source"])
          : ({
              kind: "editor" as const,
              editorSessionId: "studio-current",
              payload: {
                configId: "studio-current",
                label: selectedConfig?.label ?? "Studio Current",
                ...(selectedConfig?.description === undefined
                  ? {}
                  : { description: selectedConfig.description }),
                mapScript: "{swooper-maps}/maps/studio-current.js",
                pipelineConfig: sanitized,
                recipeId: "mod-swooper-maps/standard",
                sortIndex: selectedConfig?.sortIndex ?? 9999,
                ...(selectedConfig?.latitudeBounds === undefined
                  ? {}
                  : { latitudeBounds: selectedConfig.latitudeBounds }),
              },
            } satisfies Parameters<typeof runCurrentConfigInGame>[0]["source"]);
      const result = await runCurrentConfigInGame({
        source: launchSource,
        recipeSettings: {
          preset: recipeSettings.preset,
          recipe: "mod-swooper-maps/standard",
          seed: recipeSettings.seed,
        },
        worldSettings: {
          mapSize: mapSize.id,
          playerCount: worldSettings.playerCount,
          resources: worldSettings.resources,
        },
        setupConfig,
        restartCivProcess: options?.restartCivProcess,
      });
      if (!("requestId" in result)) {
        toast(`Run in Game failed: ${result.error}`, { variant: "error" });
        setRunInGameOperation({
          requestId: `studio-run-in-game-client-error-${Date.now()}`,
          phase: "failed",
          status: "failed",
          safeFailureCategory: result.safeFailureCategory,
          recoveryActions: ["retry-run"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          terminalAt: new Date().toISOString(),
        });
        return;
      }
      lastRunInGameToastRef.current = null;
      setRunInGameOperation(result);
      const snapshot = buildRunInGameClientSnapshot({
        requestId: result.requestId,
        recipeSettings,
        worldSettings,
        pipelineConfig: sanitized,
        setupConfig,
        materializationMode: runInGameMaterializationMode,
      });
      setRunInGameSnapshot(snapshot);
      const sourceSnapshot = buildRunInGameSourceSnapshot({
        requestId: result.requestId,
        recipeSettings,
        worldSettings,
        pipelineConfig: sanitized,
        setupConfig,
        materializationMode: runInGameMaterializationMode,
        selectedConfig,
      });
      setLastRunInGameSource(sourceSnapshot);
      toast(`Run in Game started: ${result.requestId}`, {
        variant: "info",
      });
    },
    [
      pipelineConfig,
      recipeSettings.preset,
      recipeSettings,
      recipeSettings.seed,
      resolvePreset,
      runInGameMaterializationMode,
      runInGameRunning,
      saveDeployRunning,
      setLastRunInGameSource,
      setLocalError,
      setRunInGameSnapshot,
      setRunInGameOperation,
      setupConfig,
      toast,
      worldSettings,
      worldSettings.mapSize,
      worldSettings.playerCount,
      worldSettings.resources,
      lastRunInGameToastRef,
    ]
  );

  const syncStudioFromLiveGame = useCallback(() => {
    if (liveRuntime.status !== "ok") return;
    if (browserRunning || runInGameRunning || saveDeployRunning) {
      toast("Finish the current Studio operation before syncing from the live game.", {
        variant: "info",
      });
      return;
    }
    const currentSnapshotSuggestions = liveRuntimeSuggestions.filter(
      (record) =>
        record.applyPath === "visible-studio-control" &&
        record.sourceSnapshotId !== undefined &&
        record.sourceSnapshotId === liveRuntime.snapshotId
    );
    const seedSuggestion = currentSnapshotSuggestions.find(
      (record) => record.affectedConfigPath === "recipeSettings.seed"
    );
    const setupSuggestion = currentSnapshotSuggestions.find(
      (record) => record.affectedConfigPath === "setupConfig"
    );
    const applySuggestedSeed = (value: unknown, source: string): boolean => {
      const parsedSeed = parseCiv7StudioSeed(value);
      if (!parsedSeed.ok) {
        toast(`${source} seed ignored: ${formatCiv7StudioSeedError(parsedSeed)}`, {
          variant: "info",
        });
        return false;
      }
      setRecipeSettings((prev) => ({ ...prev, seed: String(parsedSeed.value) }));
      return true;
    };
    const applySuggestedSetup = (value: unknown): boolean => {
      if (!isPlainObject(value)) return false;
      setSetupConfig(normalizeStudioSetupConfig(value as Civ7StudioSetupConfig));
      return true;
    };

    if (!provedRunInGameSource) {
      if (currentSnapshotSuggestions.length === 0) {
        toast("Live game suggestions are unavailable; wait for a fresh keyed live snapshot.", {
          variant: "error",
        });
        return;
      }
      const didApplySeed = seedSuggestion
        ? applySuggestedSeed(seedSuggestion.value, "Live runtime suggestion")
        : false;
      const didApplySetup = setupSuggestion ? applySuggestedSetup(setupSuggestion.value) : false;
      if (!didApplySeed && !didApplySetup) {
        toast("Live game suggestions did not include an applicable Studio seed or setup change.", {
          variant: "error",
        });
        return;
      }
      toast(
        didApplySetup
          ? "Live runtime suggestion applied to Studio setup."
          : "Live runtime seed suggestion applied.",
        {
          variant: "success",
        }
      );
      return;
    }
    const liveSeed =
      liveRuntime.seed === undefined
        ? provedRunInGameSource.recipeSettings.seed
        : String(liveRuntime.seed);
    if (liveSeed !== provedRunInGameSource.recipeSettings.seed) {
      toast("Live game seed no longer matches the last proved Studio run.", { variant: "error" });
      return;
    }
    const provedSuggestions = buildLiveRuntimeSuggestionRecords({
      sourceSnapshotId: liveRuntime.snapshotId ?? `proved:${provedRunInGameSource.requestId}`,
      seed: Number(provedRunInGameSource.recipeSettings.seed),
      setupConfig: provedRunInGameSource.setupConfig,
      provedStudioRun: true,
    });
    if (provedSuggestions.length === 0) {
      toast("The proved Studio run did not include an applicable restore suggestion.", {
        variant: "error",
      });
      return;
    }
    const durablePresetKey =
      provedRunInGameSource.materializationMode === "durable" &&
      provedRunInGameSource.selectedConfig?.id
        ? (`builtin:${provedRunInGameSource.selectedConfig.id}` as PresetKey)
        : null;
    const nextPreset =
      durablePresetKey && resolvePreset(durablePresetKey) ? durablePresetKey : LIVE_GAME_PRESET_KEY;

    applyAuthoringSnapshot({
      key: nextPreset,
      worldSettings: provedRunInGameSource.worldSettings,
      pipelineConfig: provedRunInGameSource.pipelineConfig,
      setupConfig: provedRunInGameSource.setupConfig,
      recipeSettings: {
        ...provedRunInGameSource.recipeSettings,
        seed: liveSeed,
        preset: nextPreset,
      },
    });
    toast(
      nextPreset === LIVE_GAME_PRESET_KEY
        ? "Studio synced to live game config"
        : "Studio synced to live game preset",
      {
        variant: "success",
      }
    );
  }, [
    browserRunning,
    liveRuntime.seed,
    liveRuntime.snapshotId,
    liveRuntime.status,
    liveRuntimeSuggestions,
    provedRunInGameSource,
    resolvePreset,
    runInGameRunning,
    saveDeployRunning,
    toast,
    applyAuthoringSnapshot,
    setRecipeSettings,
    setSetupConfig,
  ]);

  const copyRunInGameDiagnostics = useCallback(async () => {
    if (!runInGameOperation) return;
    if (runInGameOperation.diagnosticsId === undefined) {
      toast("Run in Game diagnostics are not available yet", { variant: "info" });
      return;
    }
    try {
      const diagnostics = await orpcClient.runInGame
        .diagnostics({ diagnosticsId: runInGameOperation.diagnosticsId })
        .then((result: RunDiagnosticsLookupResult) => JSON.stringify(result, null, 2));
      await navigator.clipboard.writeText(diagnostics);
      toast("Run in Game diagnostics copied", { variant: "info" });
    } catch (err) {
      toast(
        `Could not copy diagnostics: ${err instanceof Error ? err.message : "clipboard unavailable"}`,
        { variant: "error" }
      );
    }
  }, [runInGameOperation, toast]);

  return {
    runInGameCurrentRelation,
    handleRunInGame,
    syncStudioFromLiveGame,
    copyRunInGameDiagnostics,
  };
}
