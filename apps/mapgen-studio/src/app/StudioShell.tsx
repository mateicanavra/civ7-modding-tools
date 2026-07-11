import {
  AppFooter,
  AppHeader,
  ErrorBanner,
  ExplorePanel,
  GameConsole,
  LeftDock,
  PipelineStage,
  PresetConfirmDialog,
  PresetErrorDialog,
  PresetSaveDialog,
  RecipePanel,
  RightDock,
  StageViewTabs,
} from "@swooper/mapgen-studio-ui";
import type { GenerationStatus } from "@swooper/mapgen-studio-ui/types";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useBrowserRunner } from "../features/browserRunner/useBrowserRunner";
import { CIV7_STUDIO_SEED_MAX, CIV7_STUDIO_SEED_MIN } from "../features/civ7Setup/seedPolicy";
import { getMaterializedRecipeDefaultConfig } from "../features/configAuthoring/canonicalConfig";
import { orpcClient } from "../lib/orpc";
import { STUDIO_RECIPE_OPTIONS } from "../recipes/catalog";
import type { VizEvent } from "../shared/vizEvents";
import { useAuthoringStore } from "../stores/authoringStore";
import { useRunStore } from "../stores/runStore";
import { useViewStore } from "../stores/viewStore";
import { MAP_SIZE_OPTIONS, MAP_SIZE_SHORT, PLAYER_COUNT_OPTIONS } from "../ui/constants";
import { CanvasStage } from "./CanvasStage";
import { useBrowserRun } from "./hooks/useBrowserRun";
import { useDeckAutofit } from "./hooks/useDeckAutofit";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useLiveRuntime } from "./hooks/useLiveRuntime";
import { usePresetLifecycle } from "./hooks/usePresetLifecycle";
import { useRunInGame } from "./hooks/useRunInGame";
import { useSaveDeploy } from "./hooks/useSaveDeploy";
import { useSetupControls } from "./hooks/useSetupControls";
import { useSetupDataQueries } from "./hooks/useSetupDataQueries";
import { useStudioEvents } from "./hooks/useStudioEvents";
import { useStudioOperations } from "./hooks/useStudioOperations";
import { useToast } from "./hooks/useToast";
import { useViewportLayout } from "./hooks/useViewportLayout";
import { useVizSelection } from "./hooks/useVizSelection";
import { readAndAdoptStudioOperationsCurrent } from "./operationAdoption";
import { studioBusyGateMessage } from "./studioEventRecovery";

export type StudioShellProps = {
  themePreference: "system" | "light" | "dark";
  cyclePreference(): void;
};

/** Wires the authoring, browser-run, and server-operation controllers into the Studio UI. */
export function StudioShell(props: StudioShellProps) {
  const toast = useToast();
  const { themePreference, cyclePreference } = props;

  // The authoring store is the only persisted owner of the active config source.
  const worldSettings = useAuthoringStore((s) => s.worldSettings);
  const setWorldSettings = useAuthoringStore((s) => s.setWorldSettings);
  const recipeSettings = useAuthoringStore((s) => s.recipeSettings);
  const setRecipeSettings = useAuthoringStore((s) => s.setRecipeSettings);
  const setupConfig = useAuthoringStore((s) => s.setupConfig);
  const setSetupConfig = useAuthoringStore((s) => s.setSetupConfig);
  const authoringConfigSource = useAuthoringStore((s) => s.authoringConfigSource);
  const setAuthoringConfigSource = useAuthoringStore((s) => s.setAuthoringConfigSource);
  const setAuthoringSelection = useAuthoringStore((s) => s.setAuthoringSelection);
  const authoringRevision = useAuthoringStore((s) => s.authoringRevision);
  const configEditingEnabled = useAuthoringStore((s) => s.configEditingEnabled);
  const setConfigEditingEnabled = useAuthoringStore((s) => s.setConfigEditingEnabled);

  // View-only state is owned by `viewStore` (Zustand, architecture/10 §3). These
  // are presentation toggles/selections with no server coupling and no persistence
  // contract; the store is the single owner so this component no longer holds a
  // `useState` mirror. Field + setter names match the store API, so downstream
  // usage in this file is unchanged.
  const showGrid = useViewStore((s) => s.showGrid);
  const setShowGrid = useViewStore((s) => s.setShowGrid);
  const showEdges = useViewStore((s) => s.showEdges);
  const setShowEdges = useViewStore((s) => s.setShowEdges);
  const overlaySelectionId = useViewStore((s) => s.overlaySelectionId);
  const setOverlaySelectionId = useViewStore((s) => s.setOverlaySelectionId);
  const overlayOpacity = useViewStore((s) => s.overlayOpacity);
  const setOverlayOpacity = useViewStore((s) => s.setOverlayOpacity);
  // `eraMode` is read here for the explore-panel JSX; the era/overlay *write*
  // surface (`manualEra`/`setManualEra`/`setEraMode`/`overlayVariantKeyPreference`)
  // is owned by `useVizSelection`.
  const eraMode = useViewStore((s) => s.eraMode);
  const recipeSectionCollapsed = useViewStore((s) => s.recipeSectionCollapsed);
  const setRecipeSectionCollapsed = useViewStore((s) => s.setRecipeSectionCollapsed);
  const configSectionCollapsed = useViewStore((s) => s.configSectionCollapsed);
  const setConfigSectionCollapsed = useViewStore((s) => s.setConfigSectionCollapsed);
  const exploreStageExpanded = useViewStore((s) => s.exploreStageExpanded);
  const setExploreStageExpanded = useViewStore((s) => s.setExploreStageExpanded);
  const exploreStepExpanded = useViewStore((s) => s.exploreStepExpanded);
  const setExploreStepExpanded = useViewStore((s) => s.setExploreStepExpanded);
  const exploreLayersExpanded = useViewStore((s) => s.exploreLayersExpanded);
  const setExploreLayersExpanded = useViewStore((s) => s.setExploreLayersExpanded);
  const exploreWaterStatsExpanded = useViewStore((s) => s.exploreWaterStatsExpanded);
  const setExploreWaterStatsExpanded = useViewStore((s) => s.setExploreWaterStatsExpanded);
  const stageView = useViewStore((s) => s.stageView);
  const setStageView = useViewStore((s) => s.setStageView);
  const pipelineSelectedStageId = useViewStore((s) => s.pipelineSelectedStageId);
  const setPipelineSelectedStageId = useViewStore((s) => s.setPipelineSelectedStageId);

  // Coordination layer (init FIRST): owns the runInGame/saveDeploy operation
  // state + the single-owner error channel, and derives the busy booleans
  // synchronously so they are stable from the first render and can be threaded
  // (never republished) into the hooks below. `error`/`status` are completed in
  // host render scope after `browserRunner` exists (architecture/10 §4; §7.3/§7.4).
  const {
    runInGameOperation,
    setRunInGameOperation,
    saveDeployOperation,
    setSaveDeployOperation,
    localError,
    setLocalError,
    clearLocalErrorIfCurrent,
    runInGameRunning,
    saveDeployRunning,
    runInGameOperationRef,
    saveDeployOperationCurrentRef,
  } = useStudioOperations();

  // Viewport/layout chrome: deck canvas handle, measured viewport, docked-panel
  // geometry, and the recipe-DAG (pipeline view) read surface + expansion.
  // Initialized BEFORE `useVizState` so viz and deck-autofit can consume the
  // deck handle / viewport by reference (architecture/10 §4; init order §7.7).
  const {
    containerRef,
    viewportSize,
    deckApiRef,
    deckApiReadyTick,
    handleDeckApiReady,
    panelTop,
    panelBottom,
    handleHeaderHeightChange,
    recipeDag,
    pipelineExpandedStageIds,
    handlePipelineStageToggle,
  } = useViewportLayout({ recipe: recipeSettings.recipe, stageView });

  const setLastRunSnapshot = useRunStore((s) => s.setLastRunSnapshot);
  const runInGameSnapshot = useRunStore((s) => s.runInGameSnapshot);
  const setRunInGameSnapshot = useRunStore((s) => s.setRunInGameSnapshot);

  const {
    recipeArtifacts,
    presetOptions,
    pipelineConfig,
    setPipelineConfig,
    isAuthoringBlocked,
    authoringBlockReason,
    recoverWithCatalogConfig,
    recoverWithNewEditorConfig,
    presetError,
    setPresetError,
    pendingImport,
    importInputRef,
    applyRecipeSettingsChange,
    adoptSavedEditorConfig,
    handleExportPreset,
    handleImportPreset,
    handleImportFileChange,
    confirmImportSwitch,
    cancelImportSwitch,
  } = usePresetLifecycle({
    recipeSettings,
    authoringConfigSource,
    setAuthoringConfigSource,
    setAuthoringSelection,
    setConfigEditingEnabled,
    setRecipeSettings,
    setLastRunSnapshot,
    toast,
  });

  // Seam #1: the browser-runner → viz event sink. `useBrowserRunner` needs a STABLE
  // `onVizEvent` at construction, but the real `viz.ingest` is produced by
  // `useVizSelection` which runs LATER (it reads `browserRunning`, which depends on the
  // runner). The ref breaks that cycle: the runner is handed this stable forwarder now,
  // and `vizIngestRef.current` is pointed at `viz.ingest` in render scope once it exists.
  const vizIngestRef = useRef<(event: VizEvent) => void>(() => {});
  const handleVizEvent = useCallback((event: VizEvent) => {
    vizIngestRef.current?.(event);
  }, []);

  const browserRunner = useBrowserRunner({
    enabled: true,
    onVizEvent: handleVizEvent,
  });

  const browserRunning = browserRunner.state.running;
  // Run presentation state is session-only; cross-reload operation recovery is
  // daemon-owned through `studio.operations.current`.
  const lastRunInGameToastRef = useRef<string | null>(null);

  // Saved configs + setup catalog are READ through oRPC-native TanStack Query
  // (architecture/10 §2). The query layer owns retry + refetch-on-focus (query client
  // defaults), replacing the prior hand-rolled load/retry/focus effect; the derived view
  // shapes are unchanged so `setupControlOptions` below consumes them as before.
  const { savedSetupConfigs, setupCatalog } = useSetupDataQueries();

  // Viz selection/exploration fixpoint (slice 2.7): owns `useVizState` + the full
  // stage/step/dataType/space/mode/variant/era/overlay cascade and is the sole
  // writer of the selected stage/step + the mutable `viz` object. Called here
  // (after `browserRunning` is derived — viz reads it via `allowPendingSelection`)
  // so the host-owned `vizIngestRef` event sink can be wired in render scope below,
  // and the whole `viz` handle threads onward to `useBrowserRun`, deck-autofit
  // (slice 2.7b), `backgroundGridEnabled`, and the canvas/explore JSX BY VALUE.
  const {
    viz,
    stages,
    steps,
    dataTypeOptions,
    spaceOptions,
    renderModeOptions,
    variantOptions,
    overlayOptions,
    selection,
    eraEnabled,
    eraRange,
    eraDisplayValue,
    riverLakeInspectorSummary,
    handleStageChange,
    handleStepChange,
    handleDataTypeChange,
    handleSpaceChange,
    handleRenderModeChange,
    handleVariantChange,
    handleEraModeChange,
    handleEraValueChange,
    handleRiverLakeInspectorLayerSelect,
  } = useVizSelection({
    recipe: recipeSettings.recipe,
    recipeArtifacts,
    browserRunning,
    setLocalError,
  });
  // eslint-disable-next-line react-hooks/refs -- Host-owned event sink: `vizIngestRef` is declared with a no-op default (line ~304) and consumed by the `onVizEvent` callback created in render scope ABOVE this point, so it cannot route through `useLatestRef` (the consumer precedes `viz`). Wiring it to `viz.ingest` here is the deliberate "create sink early, point it at viz once viz exists" pattern; the write is idempotent and does not affect this render's output.
  vizIngestRef.current = viz.ingest;
  // Deck-camera auto-fit (slice 2.7b): the ordered per-space + first-paint refit
  // pair and their guard refs, consuming the viz read-projection BY VALUE and the
  // deck handle / viewport from `useViewportLayout`. Lifted AFTER `useVizSelection`.
  const { handleFitView } = useDeckAutofit({ deckApiRef, viewportSize, deckApiReadyTick, viz });

  const error = localError ?? browserRunner.state.error;

  // Saved configs + setup catalog now load via `useSetupDataQueries` (TanStack Query);
  // the prior hand-rolled load/retry/focus-refetch effect is replaced by the query
  // client's `retry` + `refetchOnWindowFocus` defaults.

  // Selected stage/step are part of the view surface — owned by `viewStore`
  // (single owner; no App-local mirror), per architecture/10 §3.
  const selectedStageId = useViewStore((s) => s.selectedStageId);
  const selectedStepId = useViewStore((s) => s.selectedStepId);
  // `setSelectedStepId` is still threaded into `useKeyboardShortcuts` here;
  // `setSelectedStageId` and the stage/step memos + clamp effects moved into
  // `useVizSelection` (their sole writer).
  const setSelectedStepId = useViewStore((s) => s.setSelectedStepId);

  // Static recipe dropdown options (`[]` deps — the catalog is build-time constant).
  // A trivial host-render projection: too small to warrant a hook, and the recipe panel
  // needs it synchronously.
  const recipeOptions = useMemo(
    () => STUDIO_RECIPE_OPTIONS.map((opt) => ({ value: opt.id, label: opt.label })),
    []
  );

  // Browser-run command + auto-run orchestration (slice 2.6). The runner
  // instance + `browserRunning` derivation + `vizIngestRef` sink wiring stay in
  // host render scope above (they must straddle the host-owned `viz` call, which
  // reads `browserRunning`); the command surface — `startBrowserRun`, the atomic
  // auto-run trio, `reroll`/`triggerRun`, and `isDirty` — lives in the hook. Busy
  // flags are threaded from `useStudioOperations` (never re-derived here).
  const { reroll, triggerRun, isDirty, autoRunEnabled, setAutoRunEnabled } = useBrowserRun({
    runnerActions: browserRunner.actions,
    browserRunning,
    viz,
    runInGameRunning,
    saveDeployRunning,
    pipelineConfig,
    toast,
    setLocalError,
  });

  // Repo-backed save/deploy cluster (slice 2.9): the save-dialog state, the
  // save/deploy terminal-event waiter machinery (mirror + unmount-cleanup effects,
  // SD-5 ordered pair / SD-10 first-line ref assign), and the three save handlers
  // plus their shared `saveRepoBackedConfigWithState` core. The operation state
  // itself stays in `useStudioOperations`; the busy booleans are threaded IN. Initialized
  // BEFORE the operation-adoption effect (§5) so a daemon-adopted terminal
  // save/deploy commit can resolve a pending waiter.
  const {
    saveDialogState,
    closeSaveDialog,
    handleSaveDialogConfirm,
    handleSaveAsNew,
    handleSaveToCurrent,
  } = useSaveDeploy({
    saveDeployOperation,
    setSaveDeployOperation,
    saveDeployRunning,
    browserRunning,
    runInGameRunning,
    recipeId: recipeSettings.recipe,
    authoringConfigSource,
    pipelineConfig,
    adoptSavedEditorConfig,
    toast,
  });

  // Live-runtime snapshot/setup staleness machine (slice 2.10): the abort/mounted
  // lifecycle refs travel WITH the mount lifecycle and the three event-driven read
  // functions into one hook (atomic mount-lifecycle group). `applyLiveGameState` is
  // wired into `useStudioEvents`; `setLiveRuntime` feeds the autoplay toggle (2.12)
  // and run-in-game sync-back (2.11). The host still reads `liveRuntime.status/seed`,
  // `liveSetup.setup`, and `liveRuntimeSuggestions` from the returned outputs. The
  // `orpcClient` is threaded IN so the abort/staleness contracts are renderHook-testable.
  // Initialized BEFORE `useRunInGame`'s territory / the operation-adoption effect (§5)
  // because adoption needs the run-in-game + save-deploy setters and run-in-game inits
  // after this hook.
  const { liveRuntime, setLiveRuntime, liveRuntimeSuggestions, liveSetup, applyLiveGameState } =
    useLiveRuntime({ orpcClient });

  const status: GenerationStatus = browserRunning ? "running" : error ? "error" : "ready";

  // Run admission follows save/live setup so the shared operation state is available.
  const {
    runInGameCurrentRelation,
    handleRunInGame,
    syncStudioFromLiveGame,
    copyRunInGameDiagnostics,
    isRunInGameBlocked,
  } = useRunInGame({
    recipeSettings,
    worldSettings,
    authoringConfigSource,
    authoringRevision,
    setupConfig,
    setRecipeSettings,
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
  });

  const liveGameStudioRelation = useMemo<"current" | "stale" | "unknown">(() => {
    if (liveRuntime.status !== "ok") return "unknown";
    if (liveRuntime.seed !== undefined && String(liveRuntime.seed) !== recipeSettings.seed)
      return "stale";
    if (runInGameCurrentRelation === "current" && runInGameOperation?.status === "completed") {
      return "current";
    }
    return runInGameCurrentRelation === "stale" ? "stale" : "unknown";
  }, [
    liveRuntime.seed,
    liveRuntime.status,
    recipeSettings.seed,
    runInGameCurrentRelation,
    runInGameOperation,
  ]);

  // Setup-controls cluster (slice 2.12): the derived `setupControlOptions`
  // projection, the value-equality saved-config drift detector, the saved-config
  // selection handler, and the two live-game *actions* (autoplay toggle + explore)
  // with their in-flight guard state. Initialized LAST in the hook sequence (§5):
  // the autoplay toggle reads the LIVE `liveRuntime.autoplayActive` + `setLiveRuntime`
  // (from `useLiveRuntime`) and both actions busy-gate on the flags threaded from
  // `useStudioOperations`, so this must follow those hooks (and `useSetupDataQueries`).
  const {
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
  } = useSetupControls({
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
  });

  // Seam #2: the shared run-in-game toast-dedupe stamp. Both the adoption effect below
  // and `useStudioEvents` call this to mark a requestId as already-toasted, so whichever
  // observes a terminal run-in-game status first suppresses the other's toast (see
  // `useRunInGameTerminalToast`). Stable identity (`[]`) so it can be threaded into the
  // adoption effect's deps without re-triggering it.
  const markRunInGameToastHandled = useCallback((requestId: string) => {
    lastRunInGameToastRef.current = requestId;
  }, []);

  // The SINGLE mount-time operation-adoption effect (§5). On load, reconcile the shell
  // against `studio.operations.current` so a run-in-game / save-deploy that completed
  // (or is still running) on the daemon while the tab was closed is re-attached: it
  // restores both op states and stamps the toast guard so an already-finished operation
  // is not re-toasted. Reads the live op state via the `*Ref` mirrors (not deps) so it
  // runs ONCE; `markRunInGameToastHandled` is its only reactive dep (and is `[]`-stable).
  // This is the live-stream's static counterpart; `useStudioEvents` keeps it current
  // afterward. Initialized after save/live/run hooks so their setters exist here.
  // biome-ignore lint/correctness/useExhaustiveDependencies: Mount-time adoption intentionally reads operation refs without subscribing; live updates are owned by useStudioEvents.
  useEffect(() => {
    let cancelled = false;
    void readAndAdoptStudioOperationsCurrent({
      readCurrent: () => orpcClient.studio.operations.current({}),
      targets: {
        setRunInGameOperation,
        setSaveDeployOperation,
        markRunInGameToastHandled,
      },
      isCancelled: () => cancelled,
      getCurrentRunInGameOperation: () => runInGameOperationRef.current,
      getCurrentSaveDeployOperation: () => saveDeployOperationCurrentRef.current,
      onError: setLocalError,
    });
    return () => {
      cancelled = true;
    };
  }, [markRunInGameToastHandled]);

  useStudioEvents({
    applyLiveGameState,
    currentRunInGameOperation: runInGameOperation,
    currentSaveDeployOperation: saveDeployOperation,
    setRunInGameOperation,
    setSaveDeployOperation,
    markRunInGameToastHandled,
    setLocalError,
    clearLocalError: clearLocalErrorIfCurrent,
  });

  const gameOperationBusyLabel = studioBusyGateMessage({
    subject: "Game controls",
    browserRunning,
    runInGameRunning,
    saveDeployRunning,
  });
  const worldOperationBusyLabel = studioBusyGateMessage({
    subject: "World controls",
    browserRunning,
    runInGameRunning,
    saveDeployRunning,
  });

  useKeyboardShortcuts({
    stages,
    steps,
    dataTypeOptions,
    selectedStageId,
    selectedStepId,
    selectedDataTypeId: selection?.dataTypeId ?? null,
    handleStageChange,
    setSelectedStepId,
    handleDataTypeChange,
    run: triggerRun,
    reroll,
    toggleRightPanel: () => {
      const rightCollapsed =
        !exploreStageExpanded &&
        !exploreStepExpanded &&
        !exploreLayersExpanded &&
        !exploreWaterStatsExpanded;
      const next = rightCollapsed;
      setExploreStageExpanded(next);
      setExploreStepExpanded(next);
      setExploreLayersExpanded(next);
      setExploreWaterStatsExpanded(next);
    },
    toggleLeftPanel: () => {
      const leftCollapsed = recipeSectionCollapsed && configSectionCollapsed;
      const next = !leftCollapsed;
      setRecipeSectionCollapsed(next);
      setConfigSectionCollapsed(next);
    },
  });

  // Host-render derivation (§7.6): composes the view-store `showGrid` toggle with the
  // by-value `viz` read-projection, so it lives where both are in scope rather than in a
  // hook owning only one. Fed straight to `CanvasStage`.
  const backgroundGridEnabled = useMemo(() => {
    if (!showGrid) return false;
    // The graticule is CANVAS substrate, not layer furniture: once a manifest
    // exists it follows the user's grid toggle on EVERY stage — including
    // steps with no visible layers (the canvas stays a ready survey field,
    // not dead space). A layer may still opt out via meta. The old
    // points/segments-only gate made the grid vanish the moment a tile/mesh
    // layer was selected — i.e. on most stage switches. Pre-manifest, the
    // awaiting-matter overlay carries its own graticule.
    if (!viz.manifest) return false;
    if (viz.effectiveLayer?.meta?.showGrid === false) return false;
    return true;
  }, [showGrid, viz.effectiveLayer, viz.manifest]);

  const lastRunSettings = recipeSettings;
  const lastGlobalSettings = worldSettings;

  const header = (
    <AppHeader
      themePreference={themePreference}
      onThemeCycle={cyclePreference}
      showGrid={showGrid}
      onShowGridChange={setShowGrid}
      setup={headerSetupState}
      setupOptions={setupControlOptions}
      savedConfigModified={savedSetupConfigModified}
      onSavedConfigChange={handleSavedSetupConfigChange}
      onLeaderChange={handleLeaderChange}
      onCivilizationChange={handleCivilizationChange}
      onDifficultyChange={handleDifficultyChange}
      onGameSpeedChange={handleGameSpeedChange}
      onHeaderHeightChange={handleHeaderHeightChange}
      gameConsole={
        <GameConsole
          liveRuntime={liveRuntime}
          liveGameStudioRelation={liveGameStudioRelation}
          onSyncFromLiveGame={syncStudioFromLiveGame}
          isAutoplayActionRunning={autoplayActionRunning}
          onToggleAutoplay={handleToggleAutoplay}
          onExplore={handleExplore}
          isExploreActionRunning={exploreActionRunning}
          operationControlsDisabled={browserRunning || runInGameRunning || saveDeployRunning}
          operationBusyLabel={gameOperationBusyLabel}
          isRunInGameRunning={runInGameRunning}
          runInGameStatus={runInGameOperation}
          runInGameCurrentRelation={runInGameCurrentRelation}
          onRunInGame={() => {
            void handleRunInGame();
          }}
          runInGameDisabled={isRunInGameBlocked}
          runInGameDisabledReason={
            isRunInGameBlocked ? "Recover the authoring source before running in game." : undefined
          }
          onCopyRunInGameDiagnostics={copyRunInGameDiagnostics}
          saveDeployStatus={saveDeployOperation}
        />
      }
    />
  );

  const leftPanel = (
    <RecipePanel
      config={pipelineConfig}
      configSchema={recipeArtifacts.configSchema}
      onConfigChange={setPipelineConfig}
      onConfigReset={() =>
        setPipelineConfig(getMaterializedRecipeDefaultConfig(recipeSettings.recipe, "config-reset"))
      }
      recipeOptions={recipeOptions}
      presetOptions={presetOptions}
      selectedStep={selectedStageId}
      settings={recipeSettings}
      onSettingsChange={(next) => {
        applyRecipeSettingsChange(next);
        if (next.recipe !== recipeSettings.recipe)
          toast(`Recipe: ${next.recipe}`, { variant: "info" });
      }}
      onSaveToCurrent={handleSaveToCurrent}
      onSaveAsNew={handleSaveAsNew}
      onImportPreset={handleImportPreset}
      onExportPreset={handleExportPreset}
      isSaveDeployRunning={saveDeployRunning}
      saveDeployStatus={saveDeployOperation}
      isSaveDisabled={browserRunning || runInGameRunning || saveDeployRunning || isAuthoringBlocked}
      authoringBlocked={
        authoringBlockReason === null
          ? undefined
          : {
              reason: authoringBlockReason,
              onSelectExistingCatalogConfig: recoverWithCatalogConfig,
              onCreateNewEditorConfig: recoverWithNewEditorConfig,
            }
      }
      isDirty={isDirty}
      configEditingEnabled={configEditingEnabled}
      onConfigEditingEnabledChange={setConfigEditingEnabled}
      recipeCollapsed={recipeSectionCollapsed}
      onRecipeCollapsedChange={setRecipeSectionCollapsed}
      configCollapsed={configSectionCollapsed}
      onConfigCollapsedChange={setConfigSectionCollapsed}
    />
  );

  const rightPanel = (
    <ExplorePanel
      stages={stages}
      selectedStage={selectedStageId}
      onSelectedStageChange={handleStageChange}
      steps={steps}
      selectedStep={selectedStepId}
      onSelectedStepChange={handleStepChange}
      dataTypeOptions={dataTypeOptions}
      selectedDataType={selection?.dataTypeId ?? ""}
      onSelectedDataTypeChange={handleDataTypeChange}
      spaceOptions={spaceOptions}
      selectedSpace={selection?.spaceId ?? ""}
      onSelectedSpaceChange={handleSpaceChange}
      renderModeOptions={renderModeOptions}
      selectedRenderMode={selection?.renderModeId ?? ""}
      onSelectedRenderModeChange={handleRenderModeChange}
      variantOptions={variantOptions}
      selectedVariant={selection?.variantId ?? ""}
      onSelectedVariantChange={handleVariantChange}
      overlayOptions={overlayOptions}
      selectedOverlay={overlaySelectionId}
      onSelectedOverlayChange={setOverlaySelectionId}
      overlayOpacity={overlayOpacity}
      onOverlayOpacityChange={setOverlayOpacity}
      eraEnabled={eraEnabled}
      eraMode={eraMode}
      eraValue={eraDisplayValue}
      eraMin={eraRange?.min ?? 1}
      eraMax={eraRange?.max ?? 1}
      onEraModeChange={handleEraModeChange}
      onEraValueChange={handleEraValueChange}
      showEdges={showEdges}
      onShowEdgesChange={setShowEdges}
      showDebugLayers={viz.showDebugLayers}
      onShowDebugLayersChange={viz.setShowDebugLayers}
      onFitView={handleFitView}
      stageExpanded={exploreStageExpanded}
      onStageExpandedChange={setExploreStageExpanded}
      stepExpanded={exploreStepExpanded}
      onStepExpandedChange={setExploreStepExpanded}
      layersExpanded={exploreLayersExpanded}
      onLayersExpandedChange={setExploreLayersExpanded}
      riverLakeInspectorSummary={riverLakeInspectorSummary}
      onRiverLakeInspectorLayerSelect={handleRiverLakeInspectorLayerSelect}
      waterStatsExpanded={exploreWaterStatsExpanded}
      onWaterStatsExpandedChange={setExploreWaterStatsExpanded}
    />
  );

  const footer = (
    <AppFooter
      status={status}
      lastRunSettings={lastRunSettings}
      lastGlobalSettings={lastGlobalSettings}
      globalSettings={worldSettings}
      onGlobalSettingsChange={setWorldSettings}
      currentSettings={recipeSettings}
      onSettingsChange={setRecipeSettings}
      onRun={triggerRun}
      onReroll={reroll}
      isRunning={browserRunning}
      isRunInGameRunning={runInGameRunning}
      isSaveDeployRunning={saveDeployRunning}
      operationBusyLabel={worldOperationBusyLabel}
      isDirty={isDirty}
      onToast={(message) => toast(message, { variant: "success" })}
      autoRunEnabled={autoRunEnabled}
      onAutoRunEnabledChange={setAutoRunEnabled}
      mapSizeOptions={MAP_SIZE_OPTIONS}
      mapSizeShortLabels={MAP_SIZE_SHORT}
      playerCountOptions={PLAYER_COUNT_OPTIONS}
      seedMin={CIV7_STUDIO_SEED_MIN}
      seedMax={CIV7_STUDIO_SEED_MAX}
    />
  );

  const presetDialogs = (
    <>
      <PresetSaveDialog
        open={saveDialogState.open}
        initialLabel={saveDialogState.label}
        initialDescription={saveDialogState.description}
        onCancel={closeSaveDialog}
        onConfirm={handleSaveDialogConfirm}
      />
      <PresetErrorDialog
        open={Boolean(presetError)}
        title={presetError?.title ?? "Preset error"}
        message={presetError?.message ?? "Preset operation failed."}
        details={presetError?.details}
        onOpenChange={(open) => {
          if (!open) setPresetError(null);
        }}
      />
      <PresetConfirmDialog
        open={Boolean(pendingImport)}
        title="Import preset?"
        message={
          pendingImport
            ? `Preset is for ${pendingImport.recipeId}. Switch recipes and import it?`
            : ""
        }
        confirmLabel="Switch & Import"
        onCancel={cancelImportSwitch}
        onConfirm={confirmImportSwitch}
      />
    </>
  );

  // Polite, visually-hidden mirror of the volatile run/live status so assistive
  // tech is told when generation is running, the live Civ7 runtime changes, or a
  // Run-in-Game / save-deploy operation moves — without stealing focus. The
  // visible chrome (footer status panel) carries the same information.
  const liveStatusAnnouncement = [
    status === "running" ? "Generating map" : status === "error" ? "Generation error" : "Ready",
    liveRuntime.status === "ok"
      ? `Live Civ7 ${liveRuntime.turn !== undefined || liveRuntime.seed !== undefined ? `turn ${liveRuntime.turn ?? "?"} seed ${liveRuntime.seed ?? "?"}` : (liveRuntime.readiness ?? "ready")}`
      : liveRuntime.status === "error"
        ? "Live Civ7 unavailable"
        : null,
    runInGameOperation ? `Run in Game ${runInGameOperation.phase}` : null,
    saveDeployOperation && saveDeployOperation.status === "running"
      ? `Save/deploy ${saveDeployOperation.phase}`
      : null,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-background">
      {/* Skip link: first focusable element, visually hidden until focused. */}
      <a
        href="#map-preview"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-popover focus:px-3 focus:py-2 focus:text-data focus:font-medium focus:text-foreground focus:shadow-md focus:outline-none focus:ring-1 focus:ring-ring"
      >
        Skip to map preview
      </a>
      {/* Polite live region (visually hidden mirror of the run/live status). */}
      <div aria-live="polite" className="sr-only">
        {liveStatusAnnouncement}
      </div>
      {/*
        Skip-link target. Previously `display:contents`, which removes the
        element from the box tree — the browser can't focus or scroll to it, so
        the skip link landed nowhere. It is now a real, laid-out box that fills
        the stage (`absolute inset-0`, identical to the CanvasStage fill it
        wraps), keeping it in the a11y tree and focusable via `tabIndex={-1}`
        without changing the visual layout.
      */}
      <main
        id="map-preview"
        aria-label={stageView === "pipeline" ? "Recipe pipeline" : "Map preview"}
        tabIndex={-1}
        className="absolute inset-0"
      >
        {/* The map stage stays MOUNTED (just not painted) while the pipeline
            view is up: deck camera state and in-flight generation loops are
            untouched — behavior parity (mapgen-studio-dag-tab). */}
        <div className={`absolute inset-0 ${stageView === "pipeline" ? "invisible" : ""}`}>
          <CanvasStage
            apiRef={deckApiRef}
            onApiReady={handleDeckApiReady}
            layers={viz.deck.layers}
            effectiveLayer={viz.effectiveLayer}
            viewportSize={viewportSize}
            activeBounds={viz.activeBounds}
            backgroundGridEnabled={backgroundGridEnabled}
            hasManifest={Boolean(viz.manifest)}
          />
        </div>
        {stageView === "pipeline" ? (
          <PipelineStage
            recipeId={recipeSettings.recipe}
            dag={recipeDag.dag}
            status={recipeDag.status}
            error={recipeDag.error}
            expandedStageIds={pipelineExpandedStageIds}
            selectedStageId={pipelineSelectedStageId || null}
            onToggleStage={handlePipelineStageToggle}
            onSelectStage={setPipelineSelectedStageId}
            topInset={panelTop}
            bottomInset={panelBottom}
          />
        ) : null}
      </main>
      {presetDialogs}
      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportFileChange}
      />

      <LeftDock top={panelTop} bottom={panelBottom}>
        {leftPanel}
      </LeftDock>
      {/* The Explore dock is map-scoped (run stage/step navigation, layers,
          camera); it leaves the stage when the pipeline view is active. */}
      {stageView === "map" ? (
        <RightDock top={panelTop} bottom={panelBottom}>
          {rightPanel}
        </RightDock>
      ) : null}

      <StageViewTabs value={stageView} onValueChange={setStageView} top={panelTop} />

      {header}
      {footer}

      <ErrorBanner message={error} top={panelTop} />
    </div>
  );
}
