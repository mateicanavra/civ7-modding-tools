import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getCiv7MapSizePreset } from "../../features/browserRunner/mapSizes";
import { capturePinnedSelection } from "../../features/browserRunner/retention";
import type { BrowserRunnerActions } from "../../features/browserRunner/useBrowserRunner";
import {
  formatCiv7StudioSeedError,
  parseCiv7StudioSeed,
  randomCiv7StudioSeed,
} from "../../features/civ7Setup/seedPolicy";
import { admitCanonicalConfig } from "../../features/configAuthoring/canonicalConfig";
import { buildBrowserRunSnapshot } from "../../features/runInGame/liveSource";
import type { UseVizStateResult } from "../../features/viz/useVizState";
import { useAuthoringStore } from "../../stores/authoringStore";
import { useRunStore } from "../../stores/runStore";
import type { ToastFn } from "./useToast";

/**
 * The viz capabilities `startBrowserRun` reaches into when it kicks off a run:
 * the pinned-selection read + the stream/selection reset. Narrowed to exactly
 * these members so `useBrowserRun` depends on the viz *surface* it uses, not the
 * full `useVizState` result (the host passes the whole `viz` handle in).
 */
export type BrowserRunVizHandle = Pick<
  UseVizStateResult,
  | "selectedStepId"
  | "selectedLayerKey"
  | "clearStream"
  | "setSelectedStepId"
  | "setSelectedLayerKey"
>;

export type UseBrowserRunArgs = {
  /** `browserRunner.actions` — the worker-run command surface (start/cancel/clearError). */
  runnerActions: BrowserRunnerActions;
  /** `browserRunner.state.running`, derived in host render scope (BR-12) and threaded in. */
  browserRunning: boolean;
  /** The host-owned viz handle (slice 2.7); only the run-relevant members are used. */
  viz: BrowserRunVizHandle;
  /** Threaded busy flags from `useStudioOperations` (slice 2.4) — received, never re-derived. */
  runInGameRunning: boolean;
  saveDeployRunning: boolean;
  toast: ToastFn;
  /** The single-owner error channel setter from `useStudioOperations`. */
  setLocalError: (message: string | null) => void;
};

export type UseBrowserRun = {
  reroll: () => void;
  triggerRun: () => void;
  isDirty: boolean;
  autoRunEnabled: boolean;
  setAutoRunEnabled: Dispatch<SetStateAction<boolean>>;
};

type BrowserRunTarget = Readonly<{
  seed: string;
  authoringRevision: number;
}>;

/**
 * `useBrowserRun` — the browser-run command + auto-run orchestration surface.
 *
 * It owns `startBrowserRun` (the imperative run entry point), the three-effect
 * auto-run debounce state machine, the `reroll`/`triggerRun` user actions, and
 * the `isDirty` signal. Authoring/run-store values are read directly from their
 * stores here (same selectors the host used); only genuinely cross-cutting
 * values cross the boundary as args — the runner actions + `browserRunning`
 * (the host instantiates `browserRunner` BEFORE `viz`, since viz reads
 * `browserRunning`, so the runner instance + its `vizIngestRef` event-sink wiring
 * stay in host render scope), the viz handle, the threaded busy flags, `toast`,
 * and the error-channel setter.
 *
 * The auto-run trio is atomic (Tier-A): the three effects communicate only
 * through `autoRunTimerRef`/`autoRunPendingRef`, invisible to React's deps, so
 * they MUST stay co-located in source order — splitting them would orphan a
 * ref-writer from its ref-reader and silently break the defer/flush handshake
 * (and leak the debounce timer past a disable; see BR-13).
 */
export function useBrowserRun({
  runnerActions,
  browserRunning,
  viz,
  runInGameRunning,
  saveDeployRunning,
  toast,
  setLocalError,
}: UseBrowserRunArgs): UseBrowserRun {
  const worldSettings = useAuthoringStore((s) => s.worldSettings);
  const seed = useAuthoringStore((s) => s.seed);
  const setSeed = useAuthoringStore((s) => s.setSeed);
  const canonicalConfig = useAuthoringStore((s) => s.canonicalConfig);
  const authoringRevision = useAuthoringStore((s) => s.authoringRevision);
  const lastRunSnapshot = useRunStore((s) => s.lastRunSnapshot);
  const setLastRunSnapshot = useRunStore((s) => s.setLastRunSnapshot);

  const currentBrowserRunSnapshot = useMemo(
    () => buildBrowserRunSnapshot({ authoringRevision, seed, worldSettings }),
    [authoringRevision, seed, worldSettings]
  );

  const [autoRunEnabled, setAutoRunEnabled] = useState(false);
  // BR-13 invariant: the debounce timer ref MUST stay co-located with both the
  // schedule-arm (E2) and the disable-arm (E1) effects below. If a future refactor
  // moves E1 to a different hook from this ref, a disable mid-debounce leaks the
  // timer and fires a phantom run. Keep all three in this one hook.
  const autoRunTimerRef = useRef<number | null>(null);
  const autoRunPendingRef = useRef(false);

  const startBrowserRun = useCallback(
    (target?: BrowserRunTarget) => {
      setLocalError(null);

      const seedStr = target?.seed ?? seed;
      const seedPolicy = parseCiv7StudioSeed(seedStr);
      if (!seedPolicy.ok) {
        const message = formatCiv7StudioSeedError(seedPolicy);
        setLocalError(message);
        toast(message, { variant: "error" });
        return;
      }
      const admittedSeed = seedPolicy.value;
      const mapSize = getCiv7MapSizePreset(worldSettings.mapSize);
      if (admitCanonicalConfig(canonicalConfig) === undefined) {
        const message = "Browser run failed: config is invalid for this recipe.";
        setLocalError(message);
        toast(message, { variant: "error" });
        return;
      }

      const pinned = capturePinnedSelection({
        selectedStepId: viz.selectedStepId,
        selectedLayerKey: viz.selectedLayerKey,
      });
      viz.clearStream();
      if (!pinned.retainStep) viz.setSelectedStepId(null);
      if (!pinned.retainLayer) viz.setSelectedLayerKey(null);

      runnerActions.clearError();

      setLastRunSnapshot(
        buildBrowserRunSnapshot({
          authoringRevision: target?.authoringRevision ?? authoringRevision,
          seed: seedStr,
          worldSettings,
        })
      );

      runnerActions.start({
        recipeId: canonicalConfig.recipe,
        seed: admittedSeed,
        mapSizeId: mapSize.id,
        dimensions: mapSize.dimensions,
        latitudeBounds: canonicalConfig.latitudeBounds,
        playerCount: worldSettings.playerCount,
        resourcesMode: worldSettings.resources,
        pipelineConfig: canonicalConfig.config,
      });
    },
    [
      runnerActions,
      authoringRevision,
      canonicalConfig,
      seed,
      setLastRunSnapshot,
      setLocalError,
      toast,
      worldSettings,
      viz,
    ]
  );

  useEffect(() => {
    if (!autoRunEnabled) {
      autoRunPendingRef.current = false;
      if (autoRunTimerRef.current) {
        window.clearTimeout(autoRunTimerRef.current);
        autoRunTimerRef.current = null;
      }
    }
  }, [autoRunEnabled]);

  useEffect(() => {
    if (!autoRunEnabled) return;
    if (runInGameRunning || saveDeployRunning) return;

    if (browserRunning) {
      autoRunPendingRef.current = true;
      return;
    }

    if (lastRunSnapshot?.authoringRevision === currentBrowserRunSnapshot.authoringRevision) return;

    if (autoRunTimerRef.current) window.clearTimeout(autoRunTimerRef.current);
    autoRunTimerRef.current = window.setTimeout(() => {
      autoRunTimerRef.current = null;
      startBrowserRun();
    }, 300);

    return () => {
      if (!autoRunTimerRef.current) return;
      window.clearTimeout(autoRunTimerRef.current);
      autoRunTimerRef.current = null;
    };
  }, [
    autoRunEnabled,
    browserRunning,
    currentBrowserRunSnapshot.authoringRevision,
    lastRunSnapshot,
    runInGameRunning,
    saveDeployRunning,
    startBrowserRun,
  ]);

  useEffect(() => {
    if (!autoRunEnabled) return;
    if (browserRunning) return;
    if (runInGameRunning || saveDeployRunning) return;
    if (!autoRunPendingRef.current) return;

    autoRunPendingRef.current = false;
    if (lastRunSnapshot?.authoringRevision === currentBrowserRunSnapshot.authoringRevision) return;
    startBrowserRun();
  }, [
    autoRunEnabled,
    browserRunning,
    currentBrowserRunSnapshot.authoringRevision,
    lastRunSnapshot,
    runInGameRunning,
    saveDeployRunning,
    startBrowserRun,
  ]);

  const reroll = useCallback(() => {
    if (runInGameRunning || saveDeployRunning) {
      toast("Finish the current Studio operation before rerolling.", { variant: "info" });
      return;
    }
    const next = randomCiv7StudioSeed();
    setSeed(next);
    const targetRevision = useAuthoringStore.getState().authoringRevision;
    startBrowserRun({ seed: next, authoringRevision: targetRevision });
  }, [runInGameRunning, saveDeployRunning, setSeed, startBrowserRun, toast]);

  const triggerRun = useCallback(() => {
    if (runInGameRunning || saveDeployRunning) {
      toast("Finish the current Studio operation before running.", { variant: "info" });
      return;
    }
    startBrowserRun();
  }, [runInGameRunning, saveDeployRunning, startBrowserRun, toast]);

  const isDirty =
    lastRunSnapshot?.authoringRevision !== currentBrowserRunSnapshot.authoringRevision;

  return {
    reroll,
    triggerRun,
    isDirty,
    autoRunEnabled,
    setAutoRunEnabled,
  };
}
