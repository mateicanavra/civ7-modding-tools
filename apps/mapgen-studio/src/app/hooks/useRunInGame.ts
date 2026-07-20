import type { MapConfigEnvelope, RunDiagnosticsLookupResult } from "@civ7/studio-contract";
import type { WorldSettings } from "@swooper/mapgen-studio-ui/types";
import { type MutableRefObject, useCallback, useMemo, useRef } from "react";
import { getCiv7MapSizePreset } from "../../features/browserRunner/mapSizes";
import {
  formatCiv7StudioSeedError,
  parseCiv7StudioSeed,
} from "../../features/civ7Setup/seedPolicy";
import {
  type Civ7StudioSetupConfig,
  normalizeStudioSetupConfig,
} from "../../features/civ7Setup/setupConfig";
import {
  admitCanonicalConfig,
  isPlainObject,
} from "../../features/configAuthoring/canonicalConfig";
import { runCurrentConfigInGame } from "../../features/runInGame/api";
import {
  buildRunInGameClientSnapshot,
  type RunInGameCurrentRelation,
  relationForRunInGameOperation,
} from "../../features/runInGame/clientState";
import { orpcClient } from "../../lib/orpc";
import type { AuthoringState } from "../../stores/authoringStore";
import type { RunState } from "../../stores/runStore";
import { mergeRunInGameOperation } from "../operationAdoption";
import type { UseLiveRuntimeResult } from "./useLiveRuntime";
import { useRunInGameTerminalToast } from "./useRunInGameTerminalToast";
import type { StudioOperations } from "./useStudioOperations";
import type { ToastFn } from "./useToast";

export type UseRunInGameArgs = {
  /** Current generation seed. */
  seed: string;
  /** Authoring world settings (map size / player count / resources). */
  worldSettings: WorldSettings;
  /** The sole complete config authoring value. */
  canonicalConfig: MapConfigEnvelope;
  /** Monotonic local revision used only to mark an admitted run as edited since launch. */
  authoringRevision: number;
  /** Current authoring setup config. */
  setupConfig: Civ7StudioSetupConfig;
  setSeed: AuthoringState["setSeed"];
  setSetupConfig: AuthoringState["setSetupConfig"];
  /** Live runtime status (from `useLiveRuntime`) — sync-back gating + suggestions. */
  liveRuntime: UseLiveRuntimeResult["liveRuntime"];
  /** Live runtime sync-back suggestion records (from `useLiveRuntime`). */
  liveRuntimeSuggestions: UseLiveRuntimeResult["liveRuntimeSuggestions"];
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
  /**
   * Host-owned toast-dedupe ref shared with operation recovery. Request IDs are
   * unique, so a new launch never resets a terminal notification already observed.
   */
  lastRunInGameToastRef: MutableRefObject<string | null>;
  /** Single-owner error-channel writer (from `useStudioOperations`). */
  setLocalError: StudioOperations["setLocalError"];
  toast: ToastFn;
};

export type UseRunInGameResult = {
  /** Current run-in-game relation (current/stale/unknown) consumed by the Game console. */
  runInGameCurrentRelation: RunInGameCurrentRelation;
  /** Launch handler for the current admitted config. */
  handleRunInGame: () => Promise<void>;
  /** Sync-back handler — applies only live seed/setup suggestions. */
  syncStudioFromLiveGame: () => void;
  /** Copies run-in-game diagnostics to the clipboard. */
  copyRunInGameDiagnostics: () => Promise<void>;
  /** Whether the current config prevents a Run in Game request. */
  isRunInGameBlocked: boolean;
};

type RunInGameLaunchDecision = Readonly<
  | { kind: "ready"; canonicalConfig: MapConfigEnvelope }
  | {
      kind: "blocked";
      message: string;
    }
>;

/** Coordinates Run in Game admission, operation state, and live-game sync-back. */
export function useRunInGame(args: UseRunInGameArgs): UseRunInGameResult {
  const {
    seed,
    worldSettings,
    canonicalConfig,
    authoringRevision,
    setupConfig,
    setSeed,
    setSetupConfig,
    liveRuntime,
    liveRuntimeSuggestions,
    runInGameOperation,
    setRunInGameOperation,
    runInGameRunning,
    saveDeployRunning,
    browserRunning,
    runInGameSnapshot,
    setRunInGameSnapshot,
    lastRunInGameToastRef,
    setLocalError,
    toast,
  } = args;

  const runInGameLaunchDecision = useMemo<RunInGameLaunchDecision>(() => {
    if (admitCanonicalConfig(canonicalConfig) === undefined) {
      return { kind: "blocked", message: "Run in Game failed: config is invalid for this recipe." };
    }
    return { kind: "ready", canonicalConfig };
  }, [canonicalConfig]);

  const runInGameCurrentRelation = useMemo<RunInGameCurrentRelation>(
    () =>
      relationForRunInGameOperation({
        status: runInGameOperation,
        snapshot: runInGameSnapshot,
        authoringRevision,
      }),
    [authoringRevision, runInGameOperation, runInGameSnapshot]
  );

  useRunInGameTerminalToast({
    runInGameOperation,
    lastRunInGameToastRef,
    toast,
  });

  const launchInFlightRef = useRef(false);

  const handleRunInGame = useCallback(async () => {
    // Busy gate must never be silent — a click that does nothing is
    // indistinguishable from a broken launch path.
    if (launchInFlightRef.current || runInGameRunning || saveDeployRunning) {
      toast(
        launchInFlightRef.current
          ? "Run in Game is still being admitted; wait for the request to settle."
          : runInGameRunning
            ? "Run in Game is already running — check the status chip in the Game bar."
            : "Save & Deploy is in progress; wait for it to finish before launching.",
        { variant: "info" }
      );
      return;
    }
    setLocalError(null);
    const seedPolicy = parseCiv7StudioSeed(seed);
    if (!seedPolicy.ok) {
      const message = formatCiv7StudioSeedError(seedPolicy);
      setLocalError(message);
      toast(message, { variant: "error" });
      return;
    }
    if (runInGameLaunchDecision.kind === "blocked") {
      const message = runInGameLaunchDecision.message;
      setLocalError(message);
      toast(message, { variant: "error" });
      return;
    }
    const mapSize = getCiv7MapSizePreset(worldSettings.mapSize);
    launchInFlightRef.current = true;
    let result: Awaited<ReturnType<typeof runCurrentConfigInGame>>;
    try {
      result = await runCurrentConfigInGame({
        canonicalConfig: runInGameLaunchDecision.canonicalConfig,
        seed,
        worldSettings: {
          mapSize: mapSize.id,
          playerCount: worldSettings.playerCount,
          resources: worldSettings.resources,
        },
        setupConfig,
      });
    } finally {
      launchInFlightRef.current = false;
    }
    if (!("requestId" in result)) {
      toast(`Run in Game failed: ${result.error}`, { variant: "error" });
      setLocalError(`Run in Game failed: ${result.error}`);
      return;
    }
    setRunInGameOperation((current) => mergeRunInGameOperation(current, result));
    const snapshot = buildRunInGameClientSnapshot({
      requestId: result.requestId,
      authoringRevision,
      seed,
      worldSettings,
      setupConfig,
      canonicalConfig: runInGameLaunchDecision.canonicalConfig,
    });
    setRunInGameSnapshot(snapshot);
  }, [
    runInGameLaunchDecision,
    seed,
    runInGameRunning,
    saveDeployRunning,
    authoringRevision,
    setLocalError,
    setRunInGameSnapshot,
    setRunInGameOperation,
    setupConfig,
    toast,
    worldSettings,
    worldSettings.mapSize,
    worldSettings.playerCount,
    worldSettings.resources,
  ]);

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
    const applySuggestedSeed = (value: unknown, source: string): boolean => {
      const parsedSeed = parseCiv7StudioSeed(value);
      if (!parsedSeed.ok) {
        toast(`${source} seed ignored: ${formatCiv7StudioSeedError(parsedSeed)}`, {
          variant: "info",
        });
        return false;
      }
      setSeed(String(parsedSeed.value));
      return true;
    };
    const applySuggestedSetup = (value: unknown): boolean => {
      if (!isPlainObject(value)) return false;
      setSetupConfig(normalizeStudioSetupConfig(value));
      return true;
    };

    const provedSeedSuggestion = currentSnapshotSuggestions.find(
      (record) => record.affectedConfigPath === "seed"
    );
    const provedSetupSuggestion = currentSnapshotSuggestions.find(
      (record) => record.affectedConfigPath === "setupConfig"
    );
    const didApplySeed = provedSeedSuggestion
      ? applySuggestedSeed(provedSeedSuggestion.value, "Live runtime suggestion")
      : false;
    const didApplySetup = provedSetupSuggestion
      ? applySuggestedSetup(provedSetupSuggestion.value)
      : false;
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
      { variant: "success" }
    );
  }, [
    browserRunning,
    liveRuntime.snapshotId,
    liveRuntime.status,
    liveRuntimeSuggestions,
    runInGameRunning,
    saveDeployRunning,
    toast,
    setSeed,
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
    isRunInGameBlocked: runInGameLaunchDecision.kind === "blocked",
  };
}
