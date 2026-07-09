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
import {
  formatPresetErrors,
  materializePipelineConfig,
} from "../../features/configOverrides/configBuilders";
import { resolveEffectivePipelineConfig } from "../../features/configOverrides/effectiveConfig";
import { type PresetKey } from "../../features/presets/types";
import type { UseVizStateResult } from "../../features/viz/useVizState";
import { useAuthoringStore } from "../../stores/authoringStore";
import { useRunStore } from "../../stores/runStore";
import { configsEqual, recipeSettingsEqual, worldSettingsEqual } from "../../ui/utils/config";
import type { UsePresetLifecycleResult } from "./usePresetLifecycle";
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
  /** Preset resolver (from `usePresetLifecycle`) so preview uses selected config metadata. */
  resolvePreset: UsePresetLifecycleResult["resolvePreset"];
  toast: ToastFn;
  /** The single-owner error channel setter from `useStudioOperations`. */
  setLocalError: (message: string | null) => void;
};

const DEFAULT_LATITUDE_BOUNDS = { topLatitude: 80, bottomLatitude: -80 } as const;

export type UseBrowserRun = {
  startBrowserRun: (overrides?: { seed?: string }) => void;
  reroll: () => void;
  triggerRun: () => void;
  isDirty: boolean;
  autoRunEnabled: boolean;
  setAutoRunEnabled: Dispatch<SetStateAction<boolean>>;
};

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
  resolvePreset,
  toast,
  setLocalError,
}: UseBrowserRunArgs): UseBrowserRun {
  const worldSettings = useAuthoringStore((s) => s.worldSettings);
  const recipeSettings = useAuthoringStore((s) => s.recipeSettings);
  const setRecipeSettings = useAuthoringStore((s) => s.setRecipeSettings);
  const pipelineConfig = useAuthoringStore((s) => s.pipelineConfig);
  const overridesDisabled = useAuthoringStore((s) => s.overridesDisabled);
  const lastRunSnapshot = useRunStore((s) => s.lastRunSnapshot);
  const setLastRunSnapshot = useRunStore((s) => s.setLastRunSnapshot);

  const [autoRunEnabled, setAutoRunEnabled] = useState(false);
  // BR-13 invariant: the debounce timer ref MUST stay co-located with both the
  // schedule-arm (E2) and the disable-arm (E1) effects below. If a future refactor
  // moves E1 to a different hook from this ref, a disable mid-debounce leaks the
  // timer and fires a phantom run. Keep all three in this one hook.
  const autoRunTimerRef = useRef<number | null>(null);
  const autoRunPendingRef = useRef(false);

  const startBrowserRun = useCallback(
    (overrides?: { seed?: string }) => {
      setLocalError(null);

      const seedStr = overrides?.seed ?? recipeSettings.seed;
      const seedPolicy = parseCiv7StudioSeed(seedStr);
      if (!seedPolicy.ok) {
        const message = formatCiv7StudioSeedError(seedPolicy);
        setLocalError(message);
        toast(message, { variant: "error" });
        return;
      }
      const seed = seedPolicy.value;
      const mapSize = getCiv7MapSizePreset(worldSettings.mapSize);
      const effectiveConfigSource = resolveEffectivePipelineConfig({
        recipeId: recipeSettings.recipe,
        pipelineConfig,
        overridesDisabled,
      });
      const selectedPreset = resolvePreset(recipeSettings.preset as PresetKey);
      const latitudeBounds =
        effectiveConfigSource.kind === "draft"
          ? (selectedPreset?.latitudeBounds ?? DEFAULT_LATITUDE_BOUNDS)
          : DEFAULT_LATITUDE_BOUNDS;
      const validatedConfig = materializePipelineConfig({
        schema: effectiveConfigSource.recipeArtifacts.configSchema,
        config: effectiveConfigSource.config,
        label: "browser-run",
      });
      if (!validatedConfig.ok) {
        const message = `Browser run failed: config is invalid for this recipe.\n${formatPresetErrors(
          validatedConfig.errors
        ).join("\n")}`;
        setLocalError(message);
        toast("Browser run failed: config is invalid for this recipe.", { variant: "error" });
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

      setLastRunSnapshot({
        worldSettings,
        recipeSettings: { ...recipeSettings, seed: seedStr },
        pipelineConfig: validatedConfig.value,
      });

      runnerActions.start({
        recipeId: recipeSettings.recipe,
        seed,
        mapSizeId: mapSize.id,
        dimensions: mapSize.dimensions,
        latitudeBounds,
        playerCount: worldSettings.playerCount,
        resourcesMode: worldSettings.resources,
        pipelineConfig: validatedConfig.value,
      });
    },
    [
      runnerActions,
      overridesDisabled,
      pipelineConfig,
      recipeSettings,
      resolvePreset,
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
    if (overridesDisabled) return;
    if (runInGameRunning || saveDeployRunning) return;

    if (browserRunning) {
      autoRunPendingRef.current = true;
      return;
    }

    if (lastRunSnapshot && configsEqual(lastRunSnapshot.pipelineConfig, pipelineConfig)) return;

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
    lastRunSnapshot,
    overridesDisabled,
    pipelineConfig,
    runInGameRunning,
    saveDeployRunning,
    startBrowserRun,
  ]);

  useEffect(() => {
    if (!autoRunEnabled) return;
    if (overridesDisabled) return;
    if (browserRunning) return;
    if (runInGameRunning || saveDeployRunning) return;
    if (!autoRunPendingRef.current) return;

    autoRunPendingRef.current = false;
    if (lastRunSnapshot && configsEqual(lastRunSnapshot.pipelineConfig, pipelineConfig)) return;
    startBrowserRun();
  }, [
    autoRunEnabled,
    browserRunning,
    lastRunSnapshot,
    overridesDisabled,
    pipelineConfig,
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
    setRecipeSettings((prev) => ({ ...prev, seed: next }));
    startBrowserRun({ seed: next });
    // `setRecipeSettings` (stable store setter) omitted from deps, as in the host original.
  }, [runInGameRunning, saveDeployRunning, startBrowserRun, toast]);

  const triggerRun = useCallback(() => {
    if (runInGameRunning || saveDeployRunning) {
      toast("Finish the current Studio operation before running.", { variant: "info" });
      return;
    }
    startBrowserRun();
  }, [runInGameRunning, saveDeployRunning, startBrowserRun, toast]);

  const isDirty = useMemo(() => {
    if (!lastRunSnapshot) return true;
    return (
      !worldSettingsEqual(lastRunSnapshot.worldSettings, worldSettings) ||
      !recipeSettingsEqual(lastRunSnapshot.recipeSettings, recipeSettings) ||
      !configsEqual(lastRunSnapshot.pipelineConfig, pipelineConfig)
    );
  }, [lastRunSnapshot, pipelineConfig, recipeSettings, worldSettings]);

  return {
    startBrowserRun,
    reroll,
    triggerRun,
    isDirty,
    autoRunEnabled,
    setAutoRunEnabled,
  };
}
