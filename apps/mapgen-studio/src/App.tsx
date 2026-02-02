import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";

import { AppHeader } from "./ui/components/AppHeader";
import { AppFooter } from "./ui/components/AppFooter";
import { ExplorePanel } from "./ui/components/ExplorePanel";
import { RecipePanel } from "./ui/components/RecipePanel";
import { ToastProvider, useToast } from "./ui/components/ui";
import { createTheme, useThemePreference } from "./ui/hooks";
import { applyConfigPatch, configsEqual, recipeSettingsEqual, worldSettingsEqual } from "./ui/utils/config";
import { formatStageName } from "./ui/utils/formatting";
import { LAYOUT } from "./ui/constants/layout";
import type {
  ConfigPatch,
  DataTypeOption,
  GenerationStatus,
  KnobOptionsMap,
  PipelineConfig,
  RecipeSettings,
  RenderModeOption,
  SpaceOption,
  StageOption,
  StepOption,
  VariantOption,
  WorldSettings,
} from "./ui/types";

import { useDumpLoader } from "./features/dumpViewer/useDumpLoader";
import { useBrowserRunner } from "./features/browserRunner/useBrowserRunner";
import { capturePinnedSelection } from "./features/browserRunner/retention";
import { getCiv7MapSizePreset } from "./features/browserRunner/mapSizes";
import { DeckCanvas, type DeckCanvasApi } from "./features/viz/DeckCanvas";
import { useVizState } from "./features/viz/useVizState";
import { formatErrorForUi } from "./shared/errorFormat";
import type { VizEvent } from "./shared/vizEvents";

import { DEFAULT_STUDIO_RECIPE_ID, getRecipeArtifacts, STUDIO_RECIPE_OPTIONS } from "./recipes/catalog";

function randomU32(): number {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] ?? 0;
    }
  } catch {
    // ignore
  }
  return (Math.random() * 0xffffffff) >>> 0;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function extractEnumValues(schema: unknown): string[] {
  if (!schema || typeof schema !== "object") return [];
  const obj = schema as Record<string, unknown>;

  const direct = obj.enum;
  if (Array.isArray(direct) && direct.every((v) => typeof v === "string")) return [...direct] as string[];

  const anyOf = obj.anyOf;
  if (Array.isArray(anyOf)) {
    const values = anyOf
      .map((entry) => (entry && typeof entry === "object" ? (entry as Record<string, unknown>).const : undefined))
      .filter((v): v is string => typeof v === "string");
    if (values.length > 0) return values;
  }

  const oneOf = obj.oneOf;
  if (Array.isArray(oneOf)) {
    const values = oneOf
      .map((entry) => (entry && typeof entry === "object" ? (entry as Record<string, unknown>).const : undefined))
      .filter((v): v is string => typeof v === "string");
    if (values.length > 0) return values;
  }

  return [];
}

function extractKnobOptions(schema: unknown, stageIds: readonly string[]): KnobOptionsMap {
  if (!schema || typeof schema !== "object") return {};
  const root = schema as Record<string, unknown>;
  const properties = root.properties;
  if (!isPlainObject(properties)) return {};

  const out: Record<string, string[]> = {};
  for (const stageId of stageIds) {
    const stageSchema = properties[stageId];
    if (!isPlainObject(stageSchema)) continue;
    const stageProps = stageSchema.properties;
    if (!isPlainObject(stageProps)) continue;
    const knobs = stageProps.knobs;
    if (!isPlainObject(knobs)) continue;
    const knobProps = knobs.properties;
    if (!isPlainObject(knobProps)) continue;

    for (const [knobName, knobSchema] of Object.entries(knobProps)) {
      const values = extractEnumValues(knobSchema);
      if (values.length === 0) continue;
      const merged = new Set([...(out[knobName] ?? []), ...values]);
      out[knobName] = [...merged];
    }
  }

  return out;
}

function buildDefaultConfig(schema: unknown, stageIds: readonly string[]): PipelineConfig {
  const skeleton: Record<string, unknown> = Object.fromEntries(stageIds.map((s) => [s, {}]));
  const { value, errors } = normalizeStrict<Record<string, unknown>>(schema as any, skeleton, "/defaultConfig");
  if (errors.length > 0) {
    console.error("[mapgen-studio] invalid recipe config schema defaults", errors);
    return skeleton as PipelineConfig;
  }
  return value as unknown as PipelineConfig;
}

type LastRunSnapshot = {
  worldSettings: WorldSettings;
  recipeSettings: RecipeSettings;
  pipelineConfig: PipelineConfig;
};

type AppContentProps = {
  themePreference: "system" | "light" | "dark";
  isLightMode: boolean;
  cyclePreference(): void;
};

function AppContent(props: AppContentProps) {
  const { toast } = useToast();
  const { themePreference, isLightMode, cyclePreference } = props;
  const theme = useMemo(() => createTheme(isLightMode), [isLightMode]);

  const deckApiRef = useRef<DeckCanvasApi | null>(null);
  const [deckApiReadyTick, setDeckApiReadyTick] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });

  const [showGrid, setShowGrid] = useState(true);
  const [showEdges, setShowEdges] = useState(true);
  const [recipeSectionCollapsed, setRecipeSectionCollapsed] = useState(false);
  const [configSectionCollapsed, setConfigSectionCollapsed] = useState(false);
  const [exploreStageExpanded, setExploreStageExpanded] = useState(true);
  const [exploreStepExpanded, setExploreStepExpanded] = useState(true);
  const [exploreLayersExpanded, setExploreLayersExpanded] = useState(true);
  const [autoRunEnabled, setAutoRunEnabled] = useState(false);
  const autoRunTimerRef = useRef<number | null>(null);
  const autoRunPendingRef = useRef(false);

  const [worldSettings, setWorldSettings] = useState<WorldSettings>({
    mode: "browser",
    mapSize: "MAPSIZE_STANDARD",
    playerCount: 6,
    resources: "balanced",
  });

  const [recipeSettings, setRecipeSettings] = useState<RecipeSettings>({
    recipe: DEFAULT_STUDIO_RECIPE_ID,
    preset: "none",
    seed: "123",
  });

  const recipeArtifacts = useMemo(() => getRecipeArtifacts(recipeSettings.recipe), [recipeSettings.recipe]);
  const stageIds = useMemo(() => recipeArtifacts.uiMeta.stages.map((s) => s.stageId), [recipeArtifacts.uiMeta.stages]);
  const knobOptions = useMemo(() => extractKnobOptions(recipeArtifacts.configSchema, stageIds), [recipeArtifacts.configSchema, stageIds]);

  const [pipelineConfig, setPipelineConfig] = useState<PipelineConfig>(() => {
    const artifacts = getRecipeArtifacts(DEFAULT_STUDIO_RECIPE_ID);
    const ids = artifacts.uiMeta.stages.map((s) => s.stageId);
    return buildDefaultConfig(artifacts.configSchema, ids);
  });
  const [overridesDisabled, setOverridesDisabled] = useState(false);
  const [lastRunSnapshot, setLastRunSnapshot] = useState<LastRunSnapshot | null>(null);

  useEffect(() => {
    const base = buildDefaultConfig(recipeArtifacts.configSchema, stageIds);
    setPipelineConfig(base);
    setOverridesDisabled(false);
    setLastRunSnapshot(null);
  }, [recipeArtifacts.configSchema, stageIds]);

  const dumpLoader = useDumpLoader();
  const dumpAssetResolver = dumpLoader.state.status === "loaded" ? dumpLoader.state.reader : null;
  const dumpManifest = dumpLoader.state.status === "loaded" ? dumpLoader.state.manifest : null;

  const vizIngestRef = useRef<(event: VizEvent) => void>(() => {});
  const handleVizEvent = useCallback((event: VizEvent) => {
    vizIngestRef.current?.(event);
  }, []);

  const browserRunner = useBrowserRunner({
    enabled: worldSettings.mode === "browser",
    onVizEvent: handleVizEvent,
  });

  const browserRunning = browserRunner.state.running;
  const [localError, setLocalError] = useState<string | null>(null);

  const viz = useVizState({
    enabled: worldSettings.mode === "browser" || worldSettings.mode === "dump",
    mode: worldSettings.mode,
    assetResolver: worldSettings.mode === "dump" ? dumpAssetResolver : null,
    showEdgeOverlay: showEdges,
    allowPendingSelection: worldSettings.mode === "browser" && browserRunning,
    onError: (e) => setLocalError(formatErrorForUi(e)),
  });
  vizIngestRef.current = viz.ingest;
  const hasEverSeenVizManifestRef = useRef(false);
  const lastAutoFitSpaceRef = useRef<string | null>(null);

  useEffect(() => {
    const spaceId = viz.effectiveLayer?.spaceId ?? null;
    if (!spaceId) return;
    if (!viz.activeBounds) return;
    if (lastAutoFitSpaceRef.current === spaceId) return;
    lastAutoFitSpaceRef.current = spaceId;
    deckApiRef.current?.fitToBounds(viz.activeBounds);
  }, [viz.activeBounds, viz.effectiveLayer?.spaceId]);

  useEffect(() => {
    if (!dumpManifest) return;
    viz.setDumpManifest(dumpManifest);
    const firstStep = [...dumpManifest.steps].sort((a, b) => a.stepIndex - b.stepIndex)[0]?.stepId ?? null;
    setSelectedStageId(viz.pipelineStages[0]?.stageId ?? "");
    setSelectedStepId(firstStep ?? "");
    viz.setSelectedLayerKey(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dumpManifest]);

  useEffect(() => {
    if (!viz.manifest) return;
    if (hasEverSeenVizManifestRef.current) return;
    if (!viz.activeBounds) return;
    const deckApi = deckApiRef.current;
    if (!deckApi) return;
    deckApi.fitToBounds(viz.activeBounds);
    hasEverSeenVizManifestRef.current = true;
  }, [deckApiReadyTick, viewportSize.height, viewportSize.width, viz.activeBounds, viz.manifest]);

  const error =
    localError ??
    (worldSettings.mode === "browser" ? browserRunner.state.error : null) ??
    (dumpLoader.state.status === "error" ? dumpLoader.state.message : null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setViewportSize({ width: Math.max(1, rect.width), height: Math.max(1, rect.height) });
    };
    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const openDumpFolder = useCallback(async () => {
    setLocalError(null);
    setWorldSettings((prev) => ({ ...prev, mode: "dump" }));
    browserRunner.actions.cancel();
    await dumpLoader.actions.openViaDirectoryPicker();
  }, [browserRunner.actions, dumpLoader.actions]);

  const onUploadDumpFolder = useCallback(
    async (files: FileList) => {
      setLocalError(null);
      setWorldSettings((prev) => ({ ...prev, mode: "dump" }));
      browserRunner.actions.cancel();
      await dumpLoader.actions.loadFromFileList(files);
    },
    [browserRunner.actions, dumpLoader.actions]
  );

  const [isDumpDropActive, setIsDumpDropActive] = useState(false);

  useEffect(() => {
    if (worldSettings.mode !== "dump") {
      setIsDumpDropActive(false);
      return;
    }

    let dragDepth = 0;
    const isFileDrag = (dt: DataTransfer | null) => (dt?.types ? Array.from(dt.types).includes("Files") : false);

    const onDragEnter = (e: DragEvent) => {
      if (!isFileDrag(e.dataTransfer)) return;
      dragDepth += 1;
      setIsDumpDropActive(true);
    };

    const onDragLeave = (e: DragEvent) => {
      if (!isFileDrag(e.dataTransfer)) return;
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) setIsDumpDropActive(false);
    };

    const onDragOver = (e: DragEvent) => {
      if (!isFileDrag(e.dataTransfer)) return;
      e.preventDefault();
    };

    const onDrop = (e: DragEvent) => {
      if (!isFileDrag(e.dataTransfer)) return;
      e.preventDefault();
      dragDepth = 0;
      setIsDumpDropActive(false);
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;
      void onUploadDumpFolder(files);
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
    };
  }, [onUploadDumpFolder, worldSettings.mode]);

  const [selectedStageId, setSelectedStageId] = useState("");
  const [selectedStepId, setSelectedStepId] = useState("");

  const recipeOptions = useMemo(
    () => STUDIO_RECIPE_OPTIONS.map((opt) => ({ value: opt.id, label: opt.label })),
    []
  );
  const presetOptions = useMemo(() => [{ value: "none", label: "None" }], []);

  const stages: StageOption[] = useMemo(() => {
    if (worldSettings.mode === "browser") {
      return recipeArtifacts.uiMeta.stages.map((stage, index) => ({
        value: stage.stageId,
        label: formatStageName(stage.stageId),
        index: index + 1,
      }));
    }

    return viz.pipelineStages.map((stage, index) => ({
      value: stage.stageId,
      label: formatStageName(stage.stageId),
      index: index + 1,
    }));
  }, [recipeArtifacts.uiMeta.stages, viz.pipelineStages, worldSettings.mode]);

  const steps: StepOption[] = useMemo(() => {
    if (!selectedStageId) return [];

    if (worldSettings.mode === "browser") {
      const stage = recipeArtifacts.uiMeta.stages.find((s) => s.stageId === selectedStageId);
      return (
        stage?.steps.map((step) => ({
          value: step.fullStepId,
          label: step.stepId,
          category: selectedStageId,
        })) ?? []
      );
    }

    const stage = viz.pipelineStages.find((s) => s.stageId === selectedStageId);
    return (
      stage?.steps.map((step) => ({
        value: step.stepId,
        label: step.address?.stepId ?? step.stepId,
        category: selectedStageId,
      })) ?? []
    );
  }, [recipeArtifacts.uiMeta.stages, selectedStageId, viz.pipelineStages, worldSettings.mode]);

  useEffect(() => {
    if (stages.length === 0) return;
    setSelectedStageId((prev) => (stages.some((s) => s.value === prev) ? prev : stages[0]!.value));
  }, [stages]);

  useEffect(() => {
    if (steps.length === 0) return;
    setSelectedStepId((prev) => (steps.some((s) => s.value === prev) ? prev : steps[0]!.value));
  }, [steps]);

  useEffect(() => {
    if (!selectedStepId) return;
    if (viz.selectedStepId === selectedStepId) return;
    viz.setSelectedStepId(selectedStepId);
    viz.setSelectedLayerKey(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStepId]);

  const startBrowserRun = useCallback(
    (overrides?: { seed?: string }) => {
      setLocalError(null);

      const seedStr = overrides?.seed ?? recipeSettings.seed;
      const seed = Number(seedStr) || 0;
      const mapSize = getCiv7MapSizePreset(worldSettings.mapSize);
      const nextWorldSettings = { ...worldSettings, mode: "browser" } as const;

      setWorldSettings(nextWorldSettings);

      const pinned = capturePinnedSelection({
        mode: "browser",
        selectedStepId: viz.selectedStepId,
        selectedLayerKey: viz.selectedLayerKey,
      });
      viz.clearStream();
      if (!pinned.retainStep) viz.setSelectedStepId(null);
      if (!pinned.retainLayer) viz.setSelectedLayerKey(null);

      browserRunner.actions.clearError();

      setLastRunSnapshot({
        worldSettings: nextWorldSettings,
        recipeSettings: { ...recipeSettings, seed: seedStr },
        pipelineConfig,
      });

      browserRunner.actions.start({
        recipeId: recipeSettings.recipe,
        seed,
        mapSizeId: mapSize.id,
        dimensions: mapSize.dimensions,
        latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
        playerCount: worldSettings.playerCount,
        resourcesMode: worldSettings.resources,
        configOverrides: overridesDisabled ? undefined : (pipelineConfig as unknown),
      });
    },
    [browserRunner.actions, overridesDisabled, pipelineConfig, recipeSettings, worldSettings, viz]
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
    if (worldSettings.mode !== "browser") return;
    if (overridesDisabled) return;

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
    startBrowserRun,
    worldSettings.mode,
  ]);

  useEffect(() => {
    if (!autoRunEnabled) return;
    if (worldSettings.mode !== "browser") return;
    if (overridesDisabled) return;
    if (browserRunning) return;
    if (!autoRunPendingRef.current) return;

    autoRunPendingRef.current = false;
    if (lastRunSnapshot && configsEqual(lastRunSnapshot.pipelineConfig, pipelineConfig)) return;
    startBrowserRun();
  }, [autoRunEnabled, browserRunning, lastRunSnapshot, overridesDisabled, pipelineConfig, startBrowserRun, worldSettings.mode]);

  const reroll = useCallback(() => {
    const next = String(randomU32());
    setRecipeSettings((prev) => ({ ...prev, seed: next }));
    startBrowserRun({ seed: next });
  }, [startBrowserRun]);

  const triggerRun = useCallback(() => {
    if (worldSettings.mode === "dump") {
      void openDumpFolder();
      return;
    }
    startBrowserRun();
  }, [openDumpFolder, startBrowserRun, worldSettings.mode]);

  const status: GenerationStatus = browserRunning ? "running" : error ? "error" : "ready";

  const isDirty = useMemo(() => {
    if (!lastRunSnapshot) return true;
    return (
      !worldSettingsEqual(lastRunSnapshot.worldSettings, worldSettings) ||
      !recipeSettingsEqual(lastRunSnapshot.recipeSettings, recipeSettings) ||
      !configsEqual(lastRunSnapshot.pipelineConfig, pipelineConfig)
    );
  }, [lastRunSnapshot, pipelineConfig, recipeSettings, worldSettings]);

  const dataTypeModel = viz.dataTypeModel;
  const dataTypeOptions: DataTypeOption[] = useMemo(() => {
    if (!dataTypeModel) return [];
    return dataTypeModel.dataTypes.map((dt) => ({ value: dt.dataTypeId, label: dt.label, group: dt.group }));
  }, [dataTypeModel]);

  const selection = useMemo(() => {
    if (!dataTypeModel) return null;
    for (const dt of dataTypeModel.dataTypes) {
      for (const space of dt.spaces) {
        for (const rm of space.renderModes) {
          for (const variant of rm.variants) {
            if (variant.layerKey === viz.selectedLayerKey) {
              return {
                dataTypeId: dt.dataTypeId,
                spaceId: space.spaceId,
                renderModeId: rm.renderModeId,
                variantId: variant.variantId,
              };
            }
          }
        }
      }
    }
    const firstDt = dataTypeModel.dataTypes[0];
    const firstSpace = firstDt?.spaces[0];
    const firstRm = firstSpace?.renderModes[0];
    const firstVariant = firstRm?.variants[0];
    if (!firstDt || !firstSpace || !firstRm || !firstVariant) return null;
    return {
      dataTypeId: firstDt.dataTypeId,
      spaceId: firstSpace.spaceId,
      renderModeId: firstRm.renderModeId,
      variantId: firstVariant.variantId,
    };
  }, [dataTypeModel, viz.selectedLayerKey]);

  const spaceOptions: SpaceOption[] = useMemo(() => {
    if (!dataTypeModel || !selection) return [];
    const dt = dataTypeModel.dataTypes.find((x) => x.dataTypeId === selection.dataTypeId);
    return dt?.spaces.map((s) => ({ value: s.spaceId, label: s.label })) ?? [];
  }, [dataTypeModel, selection]);

  const renderModeOptions: RenderModeOption[] = useMemo(() => {
    if (!dataTypeModel || !selection) return [];
    const dt = dataTypeModel.dataTypes.find((x) => x.dataTypeId === selection.dataTypeId);
    const space = dt?.spaces.find((s) => s.spaceId === selection.spaceId) ?? dt?.spaces[0];
    return (
      space?.renderModes.map((rm) => ({
        value: rm.renderModeId,
        label: rm.label,
      })) ?? []
    );
  }, [dataTypeModel, selection]);

  const variantOptions: VariantOption[] = useMemo(() => {
    if (!dataTypeModel || !selection) return [];
    const dt = dataTypeModel.dataTypes.find((x) => x.dataTypeId === selection.dataTypeId);
    const space = dt?.spaces.find((s) => s.spaceId === selection.spaceId) ?? dt?.spaces[0];
    const rm = space?.renderModes.find((x) => x.renderModeId === selection.renderModeId) ?? space?.renderModes[0];
    return rm?.variants.map((v) => ({ value: v.variantId, label: v.label })) ?? [];
  }, [dataTypeModel, selection]);

  const selectLayerFor = useCallback(
    (dataTypeId: string, spaceId: string, renderModeId: string, variantId?: string) => {
      if (!dataTypeModel) return;
      const dt = dataTypeModel.dataTypes.find((x) => x.dataTypeId === dataTypeId);
      const space = dt?.spaces.find((s) => s.spaceId === spaceId) ?? dt?.spaces[0];
      const rm = space?.renderModes.find((x) => x.renderModeId === renderModeId) ?? space?.renderModes[0];
      const variant = variantId ? rm?.variants.find((v) => v.variantId === variantId) ?? rm?.variants[0] : rm?.variants[0];
      viz.setSelectedLayerKey(variant?.layerKey ?? null);
    },
    [dataTypeModel, viz]
  );

  const handleStageChange = useCallback(
    (stageId: string) => {
      setSelectedStageId(stageId);
      const stage = stages.find((s) => s.value === stageId);
      if (!stage) return;

      if (worldSettings.mode === "browser") {
        const stageMeta = recipeArtifacts.uiMeta.stages.find((s) => s.stageId === stageId);
        const nextStep = stageMeta?.steps[0]?.fullStepId ?? "";
        setSelectedStepId(nextStep);
        return;
      }

      const stageFromManifest = viz.pipelineStages.find((s) => s.stageId === stageId);
      const nextStep = stageFromManifest?.steps[0]?.stepId ?? "";
      setSelectedStepId(nextStep);
    },
    [recipeArtifacts.uiMeta.stages, stages, viz.pipelineStages, worldSettings.mode]
  );

  const handleStepChange = useCallback((stepId: string) => setSelectedStepId(stepId), []);

  const handleDataTypeChange = useCallback(
    (next: string) => {
      if (!dataTypeModel) return;
      const dt = dataTypeModel.dataTypes.find((x) => x.dataTypeId === next);
      const space = dt?.spaces[0];
      const rm = space?.renderModes[0];
      const variant = rm?.variants[0];
      if (!space || !rm || !variant) return;
      selectLayerFor(next, space.spaceId, rm.renderModeId, variant.variantId);
    },
    [dataTypeModel, selectLayerFor]
  );

  const handleSpaceChange = useCallback(
    (next: string) => {
      if (!selection) return;
      const dataTypeId = selection.dataTypeId;
      if (!dataTypeModel) return;
      const dt = dataTypeModel.dataTypes.find((x) => x.dataTypeId === dataTypeId);
      const space = dt?.spaces.find((s) => s.spaceId === next) ?? dt?.spaces[0];
      const rm = space?.renderModes[0];
      const variant = rm?.variants[0];
      if (!space || !rm || !variant) return;
      selectLayerFor(dataTypeId, space.spaceId, rm.renderModeId, variant.variantId);
    },
    [dataTypeModel, selectLayerFor, selection]
  );

  const handleRenderModeChange = useCallback(
    (next: string) => {
      if (!selection) return;
      selectLayerFor(selection.dataTypeId, selection.spaceId, next);
    },
    [selectLayerFor, selection]
  );

  const handleVariantChange = useCallback(
    (next: string) => {
      if (!selection) return;
      selectLayerFor(selection.dataTypeId, selection.spaceId, selection.renderModeId, next);
    },
    [selectLayerFor, selection]
  );

  const shortcutsRef = useRef<{
    stages: StageOption[];
    steps: StepOption[];
    dataTypeOptions: DataTypeOption[];
    selectedStageId: string;
    selectedStepId: string;
    selectedDataTypeId: string | null;
    handleStageChange(stageId: string): void;
    setSelectedStepId(stepId: string): void;
    handleDataTypeChange(dataTypeId: string): void;
    run(): void;
    reroll(): void;
    toggleRightPanel(): void;
    toggleLeftPanel(): void;
  }>({
    stages: [],
    steps: [],
    dataTypeOptions: [],
    selectedStageId: "",
    selectedStepId: "",
    selectedDataTypeId: null,
    handleStageChange: () => {},
    setSelectedStepId: () => {},
    handleDataTypeChange: () => {},
    run: () => {},
    reroll: () => {},
    toggleRightPanel: () => {},
    toggleLeftPanel: () => {},
  });

  shortcutsRef.current = {
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
      const rightCollapsed = !exploreStageExpanded && !exploreStepExpanded && !exploreLayersExpanded;
      const next = rightCollapsed;
      setExploreStageExpanded(next);
      setExploreStepExpanded(next);
      setExploreLayersExpanded(next);
    },
    toggleLeftPanel: () => {
      const leftCollapsed = recipeSectionCollapsed && configSectionCollapsed;
      const next = !leftCollapsed;
      setRecipeSectionCollapsed(next);
      setConfigSectionCollapsed(next);
    },
  };

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      if (el.isContentEditable) return true;
      const tag = el.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return true;
      return Boolean(
        el.closest?.(
          [
            "input",
            "textarea",
            "select",
            '[contenteditable="true"]',
            '[role="textbox"]',
            '[role="combobox"]',
            '[role="listbox"]',
            '[role="option"]',
            '[role="menu"]',
            '[role="menuitem"]',
            '[role="dialog"]',
            '[role="alertdialog"]',
          ].join(", ")
        )
      );
    };

    const clampIndex = (index: number, max: number) => Math.max(0, Math.min(max, index));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.isComposing) return;

      const ctx = shortcutsRef.current;
      const isMod = event.metaKey || event.ctrlKey;

      // Allow modifier-based app shortcuts even while typing; ignore bare keys in inputs.
      // Note: we also allow Opt/Alt-based shortcuts in inputs (for layer navigation) by request.
      if (isEditableTarget(event.target) && !isMod && !event.altKey) return;

      // Run / re-roll
      if (isMod && event.key === "Enter") {
        event.preventDefault();
        if (event.repeat) return;
        if (event.shiftKey) ctx.reroll();
        else ctx.run();
        return;
      }

      // Collapse panels
      if (isMod && (event.key === "b" || event.key === "B")) {
        event.preventDefault();
        if (event.repeat) return;
        ctx.toggleLeftPanel();
        return;
      }
      if (isMod && (event.key === "i" || event.key === "I")) {
        event.preventDefault();
        if (event.repeat) return;
        ctx.toggleRightPanel();
        return;
      }

      // Layer / step / stage navigation (arrows require modifiers so deck.gl can use bare arrows for panning).
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        const dir = event.key === "ArrowUp" ? -1 : 1;

        // Opt+Up/Down => layer
        if (event.altKey && !isMod) {
          if (!ctx.dataTypeOptions.length) return;
          event.preventDefault();
          const selected = ctx.selectedDataTypeId ?? ctx.dataTypeOptions[0]?.value ?? "";
          const idx = ctx.dataTypeOptions.findIndex((dt) => dt.value === selected);
          const nextIdx = clampIndex(idx + dir, ctx.dataTypeOptions.length - 1);
          const next = ctx.dataTypeOptions[nextIdx]?.value ?? null;
          if (!next || next === selected) return;
          ctx.handleDataTypeChange(next);
          return;
        }

        if (!isMod) return;

        // Cmd+Shift+Up/Down => stage
        if (event.shiftKey) {
          if (!ctx.stages.length) return;
          event.preventDefault();
          const idx = ctx.stages.findIndex((s) => s.value === ctx.selectedStageId);
          const nextIdx = clampIndex(idx + dir, ctx.stages.length - 1);
          const nextStage = ctx.stages[nextIdx]?.value ?? null;
          if (!nextStage || nextStage === ctx.selectedStageId) return;
          ctx.handleStageChange(nextStage);
          return;
        }

        // Cmd+Up/Down => step
        if (!ctx.steps.length) return;
        event.preventDefault();
        const idx = ctx.steps.findIndex((s) => s.value === ctx.selectedStepId);
        const nextIdx = clampIndex(idx + dir, ctx.steps.length - 1);
        const nextStep = ctx.steps[nextIdx]?.value ?? null;
        if (!nextStep || nextStep === ctx.selectedStepId) return;
        ctx.setSelectedStepId(nextStep);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const panelTop = LAYOUT.SPACING + LAYOUT.HEADER_HEIGHT + LAYOUT.SPACING;

  const backgroundGridEnabled = useMemo(() => {
    if (!showGrid) return false;
    const layer = viz.effectiveLayer;
    if (!layer) return false;
    if (!(layer.kind === "points" || layer.kind === "segments")) return false;
    if (layer.meta?.showGrid === false) return false;
    return true;
  }, [showGrid, viz.effectiveLayer]);

  const canvas = (
    <div className="absolute inset-0">
      <div className={`absolute inset-0 ${isLightMode ? "bg-[#f5f5f7]" : "bg-[#0a0a12]"}`} />
      {/* Theme-tinted backdrop (kept outside deck.gl so it remains stable and cheap) */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: isLightMode
            ? `
              radial-gradient(circle at 30% 40%, #cbd5e0 0%, transparent 55%),
              radial-gradient(circle at 70% 60%, #cbd5e0 0%, transparent 45%),
              radial-gradient(circle at 50% 80%, #cbd5e0 0%, transparent 35%)
            `
            : `
              radial-gradient(circle at 30% 40%, #2d3748 0%, transparent 55%),
              radial-gradient(circle at 70% 60%, #2d3748 0%, transparent 45%),
              radial-gradient(circle at 50% 80%, #2d3748 0%, transparent 35%)
            `,
        }}
      />
      {backgroundGridEnabled ? (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(${isLightMode ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.02)"} 1px, transparent 1px),
              linear-gradient(90deg, ${isLightMode ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.02)"} 1px, transparent 1px)
            `,
            backgroundSize: "56px 56px",
          }}
        />
      ) : null}
      <DeckCanvas
        apiRef={deckApiRef}
        onApiReady={() => setDeckApiReadyTick((prev) => prev + 1)}
        layers={viz.deck.layers}
        effectiveLayer={viz.effectiveLayer}
        viewportSize={viewportSize}
        showBackgroundGrid={false}
        lightMode={isLightMode}
        activeBounds={viz.activeBounds}
      />
      {!viz.manifest ? (
        <div className="absolute inset-0 flex items-center justify-center text-[12px] text-[#7a7a8c]">
          {worldSettings.mode === "browser" ? "Click Run to generate a map" : "Open a dump folder to replay a run"}
        </div>
      ) : null}
    </div>
  );

  const lastRunSettings = lastRunSnapshot?.recipeSettings ?? recipeSettings;
  const lastGlobalSettings = lastRunSnapshot?.worldSettings ?? worldSettings;

  const header = (
    <AppHeader
      isLightMode={isLightMode}
      themePreference={themePreference}
      onThemeCycle={cyclePreference}
      showGrid={showGrid}
      onShowGridChange={setShowGrid}
      globalSettings={worldSettings}
      onGlobalSettingsChange={(next) => {
        setWorldSettings(next);
        if (next.mode === "dump") {
          browserRunner.actions.cancel();
          if (dumpLoader.state.status !== "loaded") toast("Select a dump folder to replay a run", { variant: "info" });
        }
      }}
    />
  );

  const leftPanel = (
    <RecipePanel
      config={pipelineConfig}
      onConfigPatch={(patch: ConfigPatch) => setPipelineConfig((prev) => applyConfigPatch(prev, patch))}
      onConfigReset={() => setPipelineConfig(buildDefaultConfig(recipeArtifacts.configSchema, stageIds))}
      recipeOptions={recipeOptions}
      presetOptions={presetOptions}
      knobOptions={knobOptions}
      theme={theme}
      lightMode={isLightMode}
      selectedStep={selectedStageId}
      settings={recipeSettings}
      onSettingsChange={(next) => {
        setRecipeSettings(next);
        if (next.recipe !== recipeSettings.recipe) toast(`Recipe: ${next.recipe}`, { variant: "info" });
      }}
      onRun={triggerRun}
      onSave={() => toast("Preset saving is not implemented in Studio yet", { variant: "info" })}
      isRunning={browserRunning}
      isDirty={isDirty}
      overridesDisabled={overridesDisabled}
      onOverridesDisabledChange={setOverridesDisabled}
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
      lightMode={isLightMode}
      showEdges={showEdges}
      onShowEdgesChange={setShowEdges}
      showDebugLayers={viz.showDebugLayers}
      onShowDebugLayersChange={viz.setShowDebugLayers}
      onFitView={() => {
        if (!viz.activeBounds) return;
        deckApiRef.current?.fitToBounds(viz.activeBounds);
      }}
      stageExpanded={exploreStageExpanded}
      onStageExpandedChange={setExploreStageExpanded}
      stepExpanded={exploreStepExpanded}
      onStepExpandedChange={setExploreStepExpanded}
      layersExpanded={exploreLayersExpanded}
      onLayersExpandedChange={setExploreLayersExpanded}
    />
  );

  const footer = (
    <AppFooter
      status={status}
      lastRunSettings={lastRunSettings}
      lastGlobalSettings={lastGlobalSettings}
      currentSettings={recipeSettings}
      onSettingsChange={setRecipeSettings}
      onRun={triggerRun}
      onReroll={reroll}
      isRunning={browserRunning}
      isDirty={isDirty}
      lightMode={isLightMode}
      onToast={(message) => toast(message, { variant: "success" })}
      autoRunEnabled={autoRunEnabled}
      onAutoRunEnabledChange={setAutoRunEnabled}
    />
  );

  return (
    <div ref={containerRef} className={`relative w-full min-h-screen ${isLightMode ? "bg-[#f5f5f7]" : "bg-[#0a0a12]"}`}>
      {canvas}

      <div className="absolute left-4 z-10" style={{ top: panelTop }}>
        {leftPanel}
      </div>
      <div className="absolute right-4 z-10" style={{ top: panelTop }}>
        {rightPanel}
      </div>

      {header}
      {footer}

      {error ? (
        <div className="absolute left-1/2 -translate-x-1/2 top-[84px] z-30 max-w-[min(720px,calc(100%-32px))] rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-2 text-[12px] text-red-200 backdrop-blur-sm">
          {error}
        </div>
      ) : null}

      {worldSettings.mode === "dump" && dumpLoader.state.status !== "loaded" ? (
        <div className="absolute left-1/2 -translate-x-1/2 top-[116px] z-30 max-w-[min(720px,calc(100%-32px))] rounded-lg border border-[#2a2a32] bg-[#141418]/80 px-4 py-2 text-[12px] text-[#8a8a96] backdrop-blur-sm">
          Dump mode: click Run to select a dump folder, or drag-and-drop a dump folder into the page.
        </div>
      ) : null}

      {worldSettings.mode === "dump" && isDumpDropActive ? (
        <div className="pointer-events-none absolute inset-0 z-20 border-2 border-dashed border-[#2a2a32] bg-[#141418]/40 backdrop-blur-[1px]" />
      ) : null}
    </div>
  );
}

export function App() {
  const { preference, isLightMode, cyclePreference } = useThemePreference();
  return (
    <ToastProvider lightMode={isLightMode}>
      <AppContent themePreference={preference} isLightMode={isLightMode} cyclePreference={cyclePreference} />
    </ToastProvider>
  );
}
