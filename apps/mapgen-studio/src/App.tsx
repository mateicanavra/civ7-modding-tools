import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import {
  stripSchemaMetadataRoot,
  type StudioPresetExportFileV1,
  type TSchema,
} from "@swooper/mapgen-core/authoring";

import { AppHeader } from "./ui/components/AppHeader";
import { AppFooter } from "./ui/components/AppFooter";
import { ExplorePanel } from "./ui/components/ExplorePanel";
import { RecipePanel } from "./ui/components/RecipePanel";
import { ToastProvider, useToast } from "./ui/components/ui";
import { createTheme, useThemePreference } from "./ui/hooks";
import { configsEqual, recipeSettingsEqual, worldSettingsEqual } from "./ui/utils/config";
import { formatStageName } from "./ui/utils/formatting";
import { LAYOUT } from "./ui/constants/layout";
import type {
  DataTypeOption,
  GenerationStatus,
  OverlayOption,
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
import {
  findVariantIdForEra,
  findVariantKeyForEra,
  listEraVariants,
  parseEraVariantKey,
  resolveFixedEraUiValue,
} from "./features/viz/era";
import { formatErrorForUi } from "./shared/errorFormat";
import { shouldIgnoreGlobalShortcutsInEditableTarget } from "./shared/shortcuts/shortcutPolicy";
import type { VizEvent } from "./shared/vizEvents";

import {
  PresetConfirmDialog,
  PresetErrorDialog,
  PresetSaveDialog,
} from "./features/presets/PresetDialogs";
import { resolveImportedPreset } from "./features/presets/importFlow";
import { buildPresetExportFile, downloadPresetFile, parsePresetExportFile } from "./features/presets/importExport";
import { parsePresetKey, type PresetKey } from "./features/presets/types";
import { usePresets } from "./features/presets/usePresets";
import {
  DEFAULT_STUDIO_RECIPE_ID,
  findRecipeArtifacts,
  getRecipeArtifacts,
  STUDIO_RECIPE_OPTIONS,
  type StudioRecipeUiMeta,
} from "./recipes/catalog";
import { getOverlaySuggestions } from "./recipes/overlaySuggestions";

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

function isNumericPathSegment(segment: string): boolean {
  return /^[0-9]+$/.test(segment);
}

const FORBIDDEN_MERGE_KEYS = new Set(["__proto__", "prototype", "constructor"]);

function mergeDeterministic(base: unknown, overrides: unknown): unknown {
  if (overrides === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(overrides)) return overrides;

  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(overrides)) {
    if (FORBIDDEN_MERGE_KEYS.has(key)) continue;
    out[key] = mergeDeterministic((base as Record<string, unknown>)[key], overrides[key]);
  }
  return out;
}

function setAtPath(root: Record<string, unknown>, path: readonly string[], value: unknown): void {
  let current: unknown = root;
  for (let i = 0; i < path.length; i += 1) {
    const key = path[i];
    const isLast = i === path.length - 1;
    const nextKey = path[i + 1];
    const wantsArray = typeof nextKey === "string" && isNumericPathSegment(nextKey);

    if (Array.isArray(current) && isNumericPathSegment(key)) {
      const idx = Number(key);
      if (isLast) {
        if (current[idx] === undefined) current[idx] = value;
        return;
      }
      const next = current[idx];
      if (!isPlainObject(next) && !Array.isArray(next)) {
        current[idx] = wantsArray ? [] : {};
      }
      current = current[idx];
      continue;
    }

    if (!isPlainObject(current) && !Array.isArray(current)) {
      return;
    }
    const record = current as Record<string, unknown>;
    if (isLast) {
      if (record[key] === undefined) record[key] = value;
      return;
    }
    const existing = record[key];
    if (!isPlainObject(existing) && !Array.isArray(existing)) {
      record[key] = wantsArray ? [] : {};
    }
    current = record[key];
  }
}

function buildConfigSkeleton(uiMeta: StudioRecipeUiMeta): PipelineConfig {
  const skeleton: PipelineConfig = {};
  for (const stage of uiMeta.stages) {
    const stageConfig: Record<string, unknown> = { knobs: {} };
    for (const step of stage.steps) {
      setAtPath(stageConfig, step.configFocusPathWithinStage, {});
    }
    skeleton[stage.stageId] = stageConfig;
  }
  return skeleton;
}


function buildDefaultConfig(
  schema: TSchema,
  uiMeta: StudioRecipeUiMeta,
  defaultConfig: unknown
): PipelineConfig {
  const skeleton = buildConfigSkeleton(uiMeta);
  const merged = mergeDeterministic(skeleton, stripSchemaMetadataRoot(defaultConfig));
  const { value, errors } = normalizeStrict<PipelineConfig>(schema, merged, "/defaultConfig");
  if (errors.length > 0) {
    console.error("[mapgen-studio] invalid recipe config schema defaults", errors);
    return skeleton;
  }
  return value;
}

type PresetApplyResult = Readonly<{
  value: PipelineConfig | null;
  errors: ReadonlyArray<{ path: string; message: string }>;
}>;

function applyPresetConfig(args: {
  schema: TSchema;
  uiMeta: StudioRecipeUiMeta;
  presetConfig: unknown;
  label: string;
}): PresetApplyResult {
  const { schema, uiMeta, presetConfig, label } = args;
  const skeleton = buildConfigSkeleton(uiMeta);
  const merged = mergeDeterministic(skeleton, stripSchemaMetadataRoot(presetConfig));
  const { value, errors } = normalizeStrict<PipelineConfig>(schema, merged, `/preset/${label}`);
  if (errors.length > 0) return { value: null, errors };
  return { value, errors: [] };
}

function formatPresetErrors(errors: ReadonlyArray<{ path: string; message: string }>): ReadonlyArray<string> {
  return errors.map((e) => `${e.path}: ${e.message}`);
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

type LastRunSnapshot = {
  worldSettings: WorldSettings;
  recipeSettings: RecipeSettings;
  pipelineConfig: PipelineConfig;
};

type PresetErrorState = Readonly<{
  title: string;
  message: string;
  details?: ReadonlyArray<string>;
}>;

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
  const handleDeckApiReady = useCallback(() => setDeckApiReadyTick((prev) => prev + 1), []);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });

  const [showGrid, setShowGrid] = useState(true);
  const [showEdges, setShowEdges] = useState(true);
  const [overlaySelectionId, setOverlaySelectionId] = useState("");
  const [overlayOpacity, setOverlayOpacity] = useState(0.45);
  const [overlayVariantKeyPreference, setOverlayVariantKeyPreference] = useState<string | null>(null);
  const [eraMode, setEraMode] = useState<"auto" | "fixed">("auto");
  const [manualEra, setManualEra] = useState(1);
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
  const [presetError, setPresetError] = useState<PresetErrorState | null>(null);
  const [saveDialogState, setSaveDialogState] = useState<{ open: boolean; label: string; description?: string }>({
    open: false,
    label: "",
    description: "",
  });
  const [pendingImport, setPendingImport] = useState<StudioPresetExportFileV1 | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const lastPresetKeyRef = useRef<PresetKey>("none");

  const overlaySuggestions = useMemo(() => getOverlaySuggestions(recipeSettings.recipe), [recipeSettings.recipe]);
  const overlaySelection = overlaySuggestions.find((opt) => opt.id === overlaySelectionId) ?? null;
  const overlayDataTypeKey = overlaySelection?.overlayDataTypeKey ?? null;

  const recipeArtifacts = useMemo(() => getRecipeArtifacts(recipeSettings.recipe), [recipeSettings.recipe]);
  const { options: presetOptions, resolvePreset, actions: presetActions, loadWarning } = usePresets({
    recipeId: recipeSettings.recipe,
    builtIns: recipeArtifacts.studioBuiltInPresets ?? [],
  });
  const isLocalPresetSelected = parsePresetKey(recipeSettings.preset).kind === "local";
  const [pipelineConfig, setPipelineConfig] = useState<PipelineConfig>(() => {
    const artifacts = getRecipeArtifacts(DEFAULT_STUDIO_RECIPE_ID);
    return buildDefaultConfig(artifacts.configSchema, artifacts.uiMeta, artifacts.defaultConfig);
  });
  const [overridesDisabled, setOverridesDisabled] = useState(false);
  const [lastRunSnapshot, setLastRunSnapshot] = useState<LastRunSnapshot | null>(null);

  useEffect(() => {
    const base = buildDefaultConfig(
      recipeArtifacts.configSchema,
      recipeArtifacts.uiMeta,
      recipeArtifacts.defaultConfig
    );
    setPipelineConfig(base);
    setOverridesDisabled(false);
    setLastRunSnapshot(null);
  }, [recipeArtifacts.configSchema, recipeArtifacts.uiMeta, recipeArtifacts.defaultConfig]);

  useEffect(() => {
    const nextKey = recipeSettings.preset as PresetKey;
    if (nextKey === lastPresetKeyRef.current) return;
    lastPresetKeyRef.current = nextKey;
    const parsed = parsePresetKey(nextKey);
    if (parsed.kind === "none") return;
    const resolved = resolvePreset(nextKey);
    if (!resolved) {
      toast("Preset not found", { variant: "error" });
      setPresetError({
        title: "Preset not found",
        message: "The selected preset could not be resolved for this recipe.",
      });
      return;
    }
    const applied = applyPresetConfig({
      schema: recipeArtifacts.configSchema,
      uiMeta: recipeArtifacts.uiMeta,
      presetConfig: resolved.config,
      label: resolved.label,
    });
    if (!applied.value) {
      toast("Preset invalid", { variant: "error" });
      setPresetError({
        title: "Preset invalid",
        message: "The selected preset failed schema validation.",
        details: formatPresetErrors(applied.errors),
      });
      return;
    }
    setPipelineConfig(applied.value);
  }, [
    resolvePreset,
    recipeArtifacts.configSchema,
    recipeArtifacts.uiMeta,
    recipeSettings.preset,
    toast,
  ]);

  useEffect(() => {
    if (!loadWarning) return;
    toast(loadWarning, { variant: "info" });
  }, [loadWarning, toast]);

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
    overlayDataTypeKey,
    overlayVariantKeyPreference,
    overlayOpacity,
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

  const stages: StageOption[] = useMemo(() => {
    const labelByStageId = new Map(
      recipeArtifacts.uiMeta.stages.map((stage) => [stage.stageId, stage.stageLabel] as const)
    );

    if (worldSettings.mode === "browser") {
      return recipeArtifacts.uiMeta.stages.map((stage, index) => ({
        value: stage.stageId,
        label: stage.stageLabel ?? formatStageName(stage.stageId),
        index: index + 1,
      }));
    }

    return viz.pipelineStages.map((stage, index) => ({
      value: stage.stageId,
      label: labelByStageId.get(stage.stageId) ?? formatStageName(stage.stageId),
      index: index + 1,
    }));
  }, [recipeArtifacts.uiMeta.stages, viz.pipelineStages, worldSettings.mode]);

  const steps: StepOption[] = useMemo(() => {
    if (!selectedStageId) return [];

    const labelByFullStepId = new Map(
      recipeArtifacts.uiMeta.stages.flatMap((stage) =>
        stage.steps.map((step) => [step.fullStepId, step.stepLabel] as const)
      )
    );

    if (worldSettings.mode === "browser") {
      const stage = recipeArtifacts.uiMeta.stages.find((s) => s.stageId === selectedStageId);
      return (
        stage?.steps.map((step) => ({
          value: step.fullStepId,
          label: step.stepLabel ?? step.stepId,
          category: selectedStageId,
        })) ?? []
      );
    }

    const stage = viz.pipelineStages.find((s) => s.stageId === selectedStageId);
    return (
      stage?.steps.map((step) => ({
        value: step.stepId,
        label: labelByFullStepId.get(step.stepId) ?? step.address?.stepId ?? step.stepId,
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

  const openSaveDialog = useCallback((seed?: { label?: string; description?: string }) => {
    setSaveDialogState({
      open: true,
      label: seed?.label ?? "",
      description: seed?.description,
    });
  }, []);

  const closeSaveDialog = useCallback(() => {
    setSaveDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  const handleSaveDialogConfirm = useCallback(
    (args: { label: string; description?: string }) => {
      const sanitized = stripSchemaMetadataRoot(pipelineConfig);
      const result = presetActions.saveAsNew({
        recipeId: recipeSettings.recipe,
        label: args.label,
        description: args.description,
        config: sanitized,
      });
      if (result.persistenceError) {
        toast(`Preset saved but could not persist: ${result.persistenceError}`, { variant: "error" });
      } else {
        toast("Preset saved", { variant: "success" });
      }
      setRecipeSettings((prev) => ({ ...prev, preset: `local:${result.preset.id}` }));
      setSaveDialogState({ open: false, label: "", description: "" });
    },
    [pipelineConfig, presetActions, recipeSettings.recipe, toast]
  );

  const handleSaveAsNew = useCallback(() => {
    const resolved = resolvePreset(recipeSettings.preset as PresetKey);
    const suggested = resolved ? `Copy of ${resolved.label}` : "New Preset";
    openSaveDialog({ label: suggested, description: resolved?.description });
  }, [openSaveDialog, recipeSettings.preset, resolvePreset]);

  const handleSaveToCurrent = useCallback(() => {
    const parsed = parsePresetKey(recipeSettings.preset);
    if (parsed.kind !== "local") {
      handleSaveAsNew();
      toast("Save to Current requires a local preset. Save as new instead.", { variant: "info" });
      return;
    }
    const sanitized = stripSchemaMetadataRoot(pipelineConfig);
    const result = presetActions.saveToCurrent({
      recipeId: recipeSettings.recipe,
      presetId: parsed.id,
      config: sanitized,
    });
    if (result.error) {
      toast(result.error, { variant: "error" });
      return;
    }
    if (result.persistenceError) {
      toast(`Preset updated but could not persist: ${result.persistenceError}`, { variant: "error" });
    } else {
      toast("Preset updated", { variant: "success" });
    }
  }, [handleSaveAsNew, pipelineConfig, presetActions, recipeSettings.preset, recipeSettings.recipe, toast]);

  const handleDeletePreset = useCallback(() => {
    const parsed = parsePresetKey(recipeSettings.preset);
    if (parsed.kind !== "local") {
      toast("Select a local preset to delete.", { variant: "info" });
      return;
    }
    const result = presetActions.deleteLocal({
      recipeId: recipeSettings.recipe,
      presetId: parsed.id,
    });
    if (result.persistenceError) {
      toast(`Preset deleted but could not persist: ${result.persistenceError}`, { variant: "error" });
    } else {
      toast("Preset deleted", { variant: "success" });
    }
    if (result.deleted) {
      setRecipeSettings((prev) => ({ ...prev, preset: "none" }));
    }
  }, [presetActions, recipeSettings.preset, recipeSettings.recipe, toast]);

  const handleExportPreset = useCallback(() => {
    const key = recipeSettings.preset as PresetKey;
    const resolved = resolvePreset(key);
    const sanitizedConfig = resolved
      ? stripSchemaMetadataRoot(resolved.config)
      : stripSchemaMetadataRoot(pipelineConfig);
    if (!isPlainObject(sanitizedConfig)) {
      toast("Preset export failed: config must be an object", { variant: "error" });
      return;
    }
    const payload = resolved
      ? {
          label: resolved.label,
          description: resolved.description,
          config: sanitizedConfig,
        }
      : {
          label: "Current Config",
          config: sanitizedConfig,
        };
    const built = buildPresetExportFile({ recipeId: recipeSettings.recipe, preset: payload });
    downloadPresetFile(built.filename, built.json);
    toast("Preset exported", { variant: "success" });
  }, [pipelineConfig, recipeSettings.preset, recipeSettings.recipe, resolvePreset, toast]);

  const importPresetValue = useCallback(
    (presetFile: StudioPresetExportFileV1) => {
      const resolved = resolveImportedPreset({
        presetFile,
        findRecipeArtifacts,
      });
      if (!resolved.ok) {
        toast("Preset import failed", { variant: "error" });
        setPresetError({
          title: resolved.kind === "unknown-recipe" ? "Unknown recipe" : "Preset invalid",
          message: resolved.message,
          details: resolved.details,
        });
        return;
      }
      const result = presetActions.saveAsNew({
        recipeId: resolved.recipeId,
        label: resolved.label,
        description: resolved.description,
        config: resolved.config,
      });
      if (result.persistenceError) {
        toast(`Preset imported but could not persist: ${result.persistenceError}`, { variant: "error" });
      } else {
        toast("Preset imported", { variant: "success" });
      }
      setRecipeSettings((prev) => ({
        ...prev,
        recipe: resolved.recipeId,
        preset: `local:${result.preset.id}`,
      }));
    },
    [presetActions, toast]
  );

  const handleImportPreset = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const handleImportFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      const text = await file.text();
      const parsed = parsePresetExportFile(text);
      if (!parsed.ok) {
        toast("Preset import failed", { variant: "error" });
        setPresetError({
          title: "Preset import failed",
          message: parsed.message,
          details: parsed.details,
        });
        return;
      }
      if (parsed.value.recipeId !== recipeSettings.recipe) {
        setPendingImport(parsed.value);
        return;
      }
      importPresetValue(parsed.value);
    },
    [importPresetValue, recipeSettings.recipe, toast]
  );

  const confirmImportSwitch = useCallback(() => {
    if (!pendingImport) return;
    const next = pendingImport;
    setPendingImport(null);
    importPresetValue(next);
  }, [importPresetValue, pendingImport]);

  const cancelImportSwitch = useCallback(() => setPendingImport(null), []);

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

  const selectedDataType = useMemo(() => {
    if (!dataTypeModel || !selection) return null;
    return dataTypeModel.dataTypes.find((x) => x.dataTypeId === selection.dataTypeId) ?? null;
  }, [dataTypeModel, selection]);

  const selectedSpace = useMemo(() => {
    if (!selectedDataType || !selection) return null;
    return selectedDataType.spaces.find((s) => s.spaceId === selection.spaceId) ?? selectedDataType.spaces[0] ?? null;
  }, [selectedDataType, selection]);

  const selectedRenderMode = useMemo(() => {
    if (!selectedSpace || !selection) return null;
    return selectedSpace.renderModes.find((rm) => rm.renderModeId === selection.renderModeId) ?? selectedSpace.renderModes[0] ?? null;
  }, [selectedSpace, selection]);

  const selectedVariants = selectedRenderMode?.variants ?? [];
  const selectedVariant = useMemo(() => {
    if (!selection) return selectedVariants[0] ?? null;
    return selectedVariants.find((v) => v.variantId === selection.variantId) ?? selectedVariants[0] ?? null;
  }, [selectedVariants, selection]);
  const selectedVariantKey = selectedVariant?.layer.variantKey ?? null;

  const spaceOptions: SpaceOption[] = useMemo(() => {
    if (!selectedDataType) return [];
    return selectedDataType.spaces.map((s) => ({ value: s.spaceId, label: s.label }));
  }, [selectedDataType]);

  const renderModeOptions: RenderModeOption[] = useMemo(() => {
    if (!selectedSpace) return [];
    return selectedSpace.renderModes.map((rm) => ({
      value: rm.renderModeId,
      label: rm.label,
    }));
  }, [selectedSpace]);

  const variantOptions: VariantOption[] = useMemo(
    () => selectedVariants.map((v) => ({ value: v.variantId, label: v.label })),
    [selectedVariants]
  );

  const eraVariants = useMemo(() => listEraVariants(selectedVariants), [selectedVariants]);
  const eraRange = useMemo(() => {
    if (!eraVariants.length) return null;
    const min = eraVariants[0]?.era ?? 1;
    const max = eraVariants[eraVariants.length - 1]?.era ?? min;
    return { min, max };
  }, [eraVariants]);
  const autoEra = useMemo(() => parseEraVariantKey(selectedVariantKey), [selectedVariantKey]);
  const eraEnabled = Boolean(eraRange);
  const fixedEraUiValue = useMemo(
    () =>
      resolveFixedEraUiValue({
        variants: selectedVariants,
        selectedVariantKey,
        requestedEra: manualEra,
      }),
    [manualEra, selectedVariantKey, selectedVariants]
  );
  const eraDisplayValue = eraMode === "fixed" ? fixedEraUiValue : autoEra ?? eraRange?.min ?? 1;

  useEffect(() => {
    if (!eraRange) return;
    setManualEra((prev) => clampNumber(prev, eraRange.min, eraRange.max));
  }, [eraRange]);

  const overlayCandidates: OverlayOption[] = useMemo(() => {
    if (!dataTypeModel || !selection) return [];
    const out: OverlayOption[] = [];
    for (const suggestion of overlaySuggestions) {
      if (suggestion.primaryDataTypeKey !== selection.dataTypeId) continue;
      const overlayDt = dataTypeModel.dataTypes.find((dt) => dt.dataTypeId === suggestion.overlayDataTypeKey);
      if (!overlayDt) continue;
      out.push({ value: suggestion.id, label: suggestion.label });
    }
    return out;
  }, [dataTypeModel, overlaySuggestions, selection]);

  const overlayOptions: OverlayOption[] = useMemo(() => {
    if (!overlayCandidates.length) return [];
    return [{ value: "", label: "No overlay" }, ...overlayCandidates];
  }, [overlayCandidates]);

  useEffect(() => {
    if (!overlayCandidates.length) {
      if (overlaySelectionId) setOverlaySelectionId("");
      return;
    }
    if (overlaySelectionId && !overlayCandidates.some((opt) => opt.value === overlaySelectionId)) {
      setOverlaySelectionId("");
    }
  }, [overlayCandidates, overlaySelectionId]);

  useEffect(() => {
    if (eraMode !== "fixed" || !overlaySelection || !dataTypeModel || !selection) {
      setOverlayVariantKeyPreference((prev) => (prev === null ? prev : null));
      return;
    }

    const overlayDataType = dataTypeModel.dataTypes.find(
      (dataType) => dataType.dataTypeId === overlaySelection.overlayDataTypeKey
    );
    if (!overlayDataType) {
      setOverlayVariantKeyPreference((prev) => (prev === null ? prev : null));
      return;
    }

    const preferredSpace =
      overlayDataType.spaces.find((space) => space.spaceId === selection.spaceId) ??
      overlayDataType.spaces[0] ??
      null;
    if (!preferredSpace) {
      setOverlayVariantKeyPreference((prev) => (prev === null ? prev : null));
      return;
    }

    const preferredRenderMode =
      preferredSpace.renderModes.find((renderMode) => renderMode.renderModeId === selection.renderModeId) ??
      preferredSpace.renderModes[0] ??
      null;

    const availableVariants =
      preferredRenderMode?.variants.length
        ? preferredRenderMode.variants
        : preferredSpace.renderModes.flatMap((renderMode) => renderMode.variants);
    const resolvedVariantKey = findVariantKeyForEra(availableVariants, manualEra);
    setOverlayVariantKeyPreference((prev) => (prev === resolvedVariantKey ? prev : resolvedVariantKey));
  }, [dataTypeModel, eraMode, manualEra, overlaySelection, selection]);

  const selectLayerFor = useCallback(
    (
      dataTypeId: string,
      spaceId: string,
      renderModeId: string,
      opts?: { variantId?: string; variantKey?: string; era?: number }
    ) => {
      if (!dataTypeModel) return;
      const dt = dataTypeModel.dataTypes.find((x) => x.dataTypeId === dataTypeId);
      const space = dt?.spaces.find((s) => s.spaceId === spaceId) ?? dt?.spaces[0];
      const rm = space?.renderModes.find((x) => x.renderModeId === renderModeId) ?? space?.renderModes[0];
      if (!space || !rm) return;
      let variant =
        opts?.variantId ? rm.variants.find((v) => v.variantId === opts.variantId) ?? null : null;
      if (!variant && opts?.variantKey) {
        variant = rm.variants.find((v) => v.layer.variantKey === opts.variantKey) ?? null;
      }
      if (!variant && opts?.era != null) {
        const eraVariantId = findVariantIdForEra(rm.variants, opts.era);
        variant = eraVariantId ? rm.variants.find((v) => v.variantId === eraVariantId) ?? null : null;
      }
      if (!variant) variant = rm.variants[0] ?? null;
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
      if (!space || !rm) return;
      if (eraMode === "fixed") {
        selectLayerFor(next, space.spaceId, rm.renderModeId, { era: manualEra });
        return;
      }
      selectLayerFor(next, space.spaceId, rm.renderModeId);
    },
    [dataTypeModel, eraMode, manualEra, selectLayerFor]
  );

  const handleSpaceChange = useCallback(
    (next: string) => {
      if (!selection) return;
      const dataTypeId = selection.dataTypeId;
      if (!dataTypeModel) return;
      const dt = dataTypeModel.dataTypes.find((x) => x.dataTypeId === dataTypeId);
      const space = dt?.spaces.find((s) => s.spaceId === next) ?? dt?.spaces[0];
      const rm = space?.renderModes[0];
      if (!space || !rm) return;
      if (eraMode === "fixed") {
        selectLayerFor(dataTypeId, space.spaceId, rm.renderModeId, { era: manualEra });
        return;
      }
      selectLayerFor(dataTypeId, space.spaceId, rm.renderModeId);
    },
    [dataTypeModel, eraMode, manualEra, selectLayerFor, selection]
  );

  const handleRenderModeChange = useCallback(
    (next: string) => {
      if (!selection) return;
      if (eraMode === "fixed") {
        selectLayerFor(selection.dataTypeId, selection.spaceId, next, { era: manualEra });
        return;
      }
      selectLayerFor(selection.dataTypeId, selection.spaceId, next);
    },
    [eraMode, manualEra, selectLayerFor, selection]
  );

  const handleVariantChange = useCallback(
    (next: string) => {
      if (!selection) return;
      const variant = selectedVariants.find((v) => v.variantId === next) ?? null;
      const parsedEra = parseEraVariantKey(variant?.layer.variantKey ?? null);
      if (parsedEra != null) setManualEra(parsedEra);
      if (parsedEra == null && eraMode === "fixed") setEraMode("auto");
      selectLayerFor(selection.dataTypeId, selection.spaceId, selection.renderModeId, { variantId: next });
    },
    [eraMode, selectLayerFor, selection, selectedVariants]
  );

  const handleEraModeChange = useCallback(
    (nextMode: "auto" | "fixed") => {
      if (nextMode === "auto") {
        setEraMode("auto");
        return;
      }
      if (!selection || !eraRange) {
        setEraMode("fixed");
        return;
      }
      const seedEra = autoEra ?? manualEra ?? eraRange.min;
      const clampedEra = clampNumber(seedEra, eraRange.min, eraRange.max);
      setManualEra(clampedEra);
      setEraMode("fixed");
      selectLayerFor(selection.dataTypeId, selection.spaceId, selection.renderModeId, { era: clampedEra });
    },
    [autoEra, eraRange, manualEra, selectLayerFor, selection]
  );

  const handleEraValueChange = useCallback(
    (nextEra: number) => {
      if (!selection || !eraRange) return;
      const clampedEra = clampNumber(nextEra, eraRange.min, eraRange.max);
      setManualEra(clampedEra);
      if (eraMode !== "fixed") setEraMode("fixed");
      selectLayerFor(selection.dataTypeId, selection.spaceId, selection.renderModeId, { era: clampedEra });
    },
    [eraMode, eraRange, selectLayerFor, selection]
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
      const isEditable = isEditableTarget(event.target);

      // While typing in inputs/textareas/etc, ignore bare keys (so typing doesn't trigger app shortcuts).
      // Allow modifier+Arrow so Cmd/Opt shortcuts still work when focus is in a field.
      if (
        shouldIgnoreGlobalShortcutsInEditableTarget({
          isEditableTarget: isEditable,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          altKey: event.altKey,
        })
      )
        return;

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

        // Cmd+Shift+Up/Down => step
        if (event.shiftKey) {
          if (!ctx.steps.length) return;
          event.preventDefault();
          const idx = ctx.steps.findIndex((s) => s.value === ctx.selectedStepId);
          const nextIdx = clampIndex(idx + dir, ctx.steps.length - 1);
          const nextStep = ctx.steps[nextIdx]?.value ?? null;
          if (!nextStep || nextStep === ctx.selectedStepId) return;
          ctx.setSelectedStepId(nextStep);
          return;
        }

        // Cmd+Up/Down => stage
        if (!ctx.stages.length) return;
        event.preventDefault();
        const idx = ctx.stages.findIndex((s) => s.value === ctx.selectedStageId);
        const nextIdx = clampIndex(idx + dir, ctx.stages.length - 1);
        const nextStage = ctx.stages[nextIdx]?.value ?? null;
        if (!nextStage || nextStage === ctx.selectedStageId) return;
        ctx.handleStageChange(nextStage);
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
        onApiReady={handleDeckApiReady}
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
      configSchema={recipeArtifacts.configSchema}
      onConfigChange={(next) => setPipelineConfig(next)}
      onConfigReset={() =>
        setPipelineConfig(
          buildDefaultConfig(
            recipeArtifacts.configSchema,
            recipeArtifacts.uiMeta,
            recipeArtifacts.defaultConfig
          )
        )
      }
      recipeOptions={recipeOptions}
      presetOptions={presetOptions}
      theme={theme}
      lightMode={isLightMode}
      selectedStep={selectedStageId}
      settings={recipeSettings}
      onSettingsChange={(next) => {
        setRecipeSettings((prev) =>
          next.recipe !== prev.recipe ? { ...next, preset: "none" } : next
        );
        if (next.recipe !== recipeSettings.recipe) toast(`Recipe: ${next.recipe}`, { variant: "info" });
      }}
      onRun={triggerRun}
      onSaveToCurrent={handleSaveToCurrent}
      onSaveAsNew={handleSaveAsNew}
      onImportPreset={handleImportPreset}
      onExportPreset={handleExportPreset}
      onDeletePreset={handleDeletePreset}
      canDeletePreset={isLocalPresetSelected}
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

  const presetDialogs = (
    <>
      <PresetSaveDialog
        open={saveDialogState.open}
        lightMode={isLightMode}
        initialLabel={saveDialogState.label}
        initialDescription={saveDialogState.description}
        onCancel={closeSaveDialog}
        onConfirm={handleSaveDialogConfirm}
      />
      <PresetErrorDialog
        open={Boolean(presetError)}
        lightMode={isLightMode}
        title={presetError?.title ?? "Preset error"}
        message={presetError?.message ?? "Preset operation failed."}
        details={presetError?.details}
        onOpenChange={(open) => {
          if (!open) setPresetError(null);
        }}
      />
      <PresetConfirmDialog
        open={Boolean(pendingImport)}
        lightMode={isLightMode}
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

  return (
    <div ref={containerRef} className={`relative w-full min-h-screen ${isLightMode ? "bg-[#f5f5f7]" : "bg-[#0a0a12]"}`}>
      {canvas}
      {presetDialogs}
      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportFileChange}
      />

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
