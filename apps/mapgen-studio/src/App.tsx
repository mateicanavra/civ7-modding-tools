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

import { useBrowserRunner } from "./features/browserRunner/useBrowserRunner";
import { capturePinnedSelection } from "./features/browserRunner/retention";
import { getCiv7MapSizePreset } from "./features/browserRunner/mapSizes";
import {
  buildRunInGameClientSnapshot,
  buildRunInGameFingerprint,
  buildRunInGameSourceSnapshot,
  parseRunInGameClientSnapshot,
  parseRunInGameSourceSnapshot,
  relationForRunInGameOperation,
  type RunInGameClientSnapshot,
  type RunInGameCurrentRelation,
  type RunInGameSourceSnapshot,
} from "./features/runInGame/clientState";
import {
  formatRunInGameDiagnostics,
  isRunInGameTerminalPhase,
  runInGameRequiresProcessRestart,
  type RunInGameFailureDetails,
  type RunInGameOperationStatus,
} from "./features/runInGame/status";
import { createStudioCiv7ControlOrpcClient } from "./features/runInGame/civ7ControlOrpcClient";
import {
  DEFAULT_CIV7_STUDIO_SETUP_CONFIG,
  getLocalPlayerSetup,
  labelForCiv7SetupValue,
  normalizeStudioSetupConfig,
  optionRowsFromParameter,
  studioSetupConfigFromLiveSnapshot,
  updateStudioSetupSavedConfig,
  studioSetupConfigsEqual,
  type Civ7SavedSetupConfigFile,
  type Civ7SetupParameterSnapshotLike,
  type Civ7SetupSnapshotLike,
  type Civ7StudioSetupConfig,
} from "./features/civ7Setup/setupConfig";
import {
  formatCiv7StudioSeedError,
  parseCiv7StudioSeed,
  randomCiv7StudioSeed,
} from "./features/civ7Setup/seedPolicy";
import {
  createMapConfigSaveDeployStatus,
  updateMapConfigSaveDeployStatus,
  type MapConfigSaveDeployStatus,
} from "./features/mapConfigSave/status";
import {
  createStudioServerOrpcClient,
  studioServerOrpcFailure,
} from "./features/studioServer/studioServerClient";
import {
  buildLiveRuntimeErrorState,
  buildLiveRuntimeSnapshotQuery,
  buildLiveRuntimeSnapshotRequest,
  buildLiveRuntimeSnapshotState,
  buildLiveRuntimeStatusState,
  buildLiveRuntimeSuggestionRecords,
  nextLiveRuntimePollDelayMs,
  shouldCommitLiveRuntimeSnapshot,
  type LiveRuntimeSnapshotState,
  type LiveRuntimeStatusState,
  type LiveRuntimeSuggestionRecord,
} from "./features/liveRuntime/model";
import { DeckCanvas, type DeckCanvasApi } from "./features/viz/DeckCanvas";
import { useVizState } from "./features/viz/useVizState";
import { createStudioRecipeDagClient, type RecipeDagResult } from "./features/recipeDag/client";
import { RecipeDagStatsBar, RecipeDagView } from "./features/recipeDag/RecipeDagView";
import {
  findVariantIdForEra,
  findVariantKeyForEra,
  listEraVariants,
  parseEraVariantKey,
  resolveFixedEraUiValue,
} from "./features/viz/era";
import {
  buildRiverLakeFloodplainInspectorSummary,
  type RiverLakeInspectorLayerRef,
} from "./features/viz/riverLakeInspector";
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
import { migratePipelineConfig, migratePipelineConfigUnknown } from "./features/configMigrations/pipelineConfig";
import {
  loadStudioAuthoringState,
  saveStudioAuthoringState,
} from "./features/studioState/persistence";
import {
  DEFAULT_STUDIO_RECIPE_ID,
  findRecipeArtifacts,
  getRecipeArtifacts,
  STUDIO_RECIPE_OPTIONS,
  type BuiltInPreset,
  type StudioRecipeUiMeta,
} from "./recipes/catalog";
import { getOverlaySuggestions } from "./recipes/overlaySuggestions";

const civ7ControlOrpcClient = createStudioCiv7ControlOrpcClient();
const recipeDagClient = createStudioRecipeDagClient();
const studioServerClient = createStudioServerOrpcClient();

type StudioView = "map" | "dag";

type RecipeDagClientState = Readonly<{
  status: "idle" | "loading" | "ready" | "error";
  recipeId: string | null;
  dag: RecipeDagResult | null;
  error: string | null;
}>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toConfigId(label: string): string {
  const id = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return id || `map-config-${Date.now()}`;
}

async function saveRepoBackedConfig(args: {
  requestId: string;
  id: string;
  name: string;
  description?: string;
  sourcePath?: string;
  sortIndex: number;
  latitudeBounds?: Readonly<{
    topLatitude: number;
    bottomLatitude: number;
  }>;
  config: unknown;
  onStatus?: (status: MapConfigSaveDeployStatus) => void;
}): Promise<
  | { ok: true; path?: string; deploy?: MapConfigSaveDeployStatus["deploy"] }
  | { ok: false; error: string; saved?: boolean; deployed?: boolean; path?: string }
> {
  const envelope = {
    $schema: "../../../dist/recipes/standard-map-config.schema.json",
    id: args.id,
    name: args.name,
    description: args.description?.trim() || args.name,
    recipe: "standard",
    sortIndex: args.sortIndex,
    ...(args.latitudeBounds ? { latitudeBounds: args.latitudeBounds } : {}),
    config: args.config,
  };
  try {
    let status = await studioServerClient.mapConfigs.saveDeploy({
      requestId: args.requestId,
      id: args.id,
      sourcePath: args.sourcePath,
      envelope,
    });
    args.onStatus?.(status);
    while (status.status === "running") {
      await delay(500);
      const next = await fetchMapConfigSaveDeployStatus(status.requestId);
      if (!("requestId" in next)) {
        return { ok: false, error: next.error, saved: status.saved, deployed: status.deployed, path: status.path };
      }
      status = next;
      args.onStatus?.(status);
    }
    if (!status.ok || status.status === "failed") {
      return {
        ok: false,
        error: status.error ?? "Save/deploy failed",
        saved: status.saved,
        deployed: status.deployed,
        path: status.path,
      };
    }
    return { ok: true, path: status.path, deploy: status.deploy };
  } catch (err) {
    const failure = studioServerOrpcFailure(err, "Repo config save failed");
    return { ok: false, error: failure.error, path: failure.data?.path as string | undefined };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isAbortLikeError(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && (err as { name?: unknown }).name === "AbortError");
}

async function fetchMapConfigSaveDeployStatus(requestId: string): Promise<MapConfigSaveDeployStatus | { ok: false; error: string; statusCode?: number }> {
  try {
    return await studioServerClient.mapConfigs.status({ requestId });
  } catch (err) {
    const failure = studioServerOrpcFailure(err, "Save/Deploy status unavailable");
    return { ok: false, error: failure.error, statusCode: failure.statusCode };
  }
}

async function runCurrentConfigInGame(args: {
  recipeId: string;
  seed: string;
  mapSize: string;
  playerCount: number;
  resources: string;
  setupConfig: Civ7StudioSetupConfig;
  materializationMode: "durable" | "disposable";
  restartCivProcess?: boolean;
  selectedConfig?: {
    id?: string;
    label?: string;
    description?: string;
    sourcePath?: string;
    sortIndex?: number;
    latitudeBounds?: Readonly<{
      topLatitude: number;
      bottomLatitude: number;
    }>;
  };
  config: unknown;
  sourceSnapshot?: unknown;
}): Promise<
  | RunInGameOperationStatus
  | { ok: false; error: string; details?: RunInGameFailureDetails; statusCode?: number }
> {
  try {
    const status = await studioServerClient.runInGame.start({
      recipeId: args.recipeId,
      seed: args.seed,
      mapSize: args.mapSize,
      playerCount: args.playerCount,
      resources: args.resources,
      setupConfig: normalizeStudioSetupConfig(args.setupConfig),
      materialization: { mode: args.materializationMode },
      ...(args.restartCivProcess ? { recovery: { restartCivProcess: true } } : {}),
      selectedConfig: args.selectedConfig,
      config: args.config,
      sourceSnapshot: args.sourceSnapshot,
    });
    return status as RunInGameOperationStatus;
  } catch (err) {
    const failure = studioServerOrpcFailure(err, "Run in Game failed");
    return {
      ok: false,
      error: failure.error,
      details: failure.data?.details as RunInGameFailureDetails | undefined,
      statusCode: failure.statusCode,
    };
  }
}

async function fetchRunInGameStatus(requestId: string): Promise<RunInGameOperationStatus | { ok: false; error: string; statusCode?: number }> {
  try {
    const status = await studioServerClient.runInGame.status({ requestId });
    return status as RunInGameOperationStatus;
  } catch (err) {
    const failure = studioServerOrpcFailure(err, "Run in Game status unavailable");
    return { ok: false, error: failure.error, statusCode: failure.statusCode };
  }
}

async function fetchCiv7SetupConfig(options: { signal?: AbortSignal } = {}): Promise<
  | { ok: true; observedAt: string; setup: Civ7SetupSnapshotLike }
  | { ok: false; error: string; observedAt?: string; statusCode?: number }
> {
  try {
    const res = await fetch("/api/civ7/setup-config", options.signal ? { signal: options.signal } : undefined);
    const body = (await res.json().catch(() => null)) as {
      ok?: boolean;
      observedAt?: string;
      setup?: Civ7SetupSnapshotLike;
      error?: string;
    } | null;
    if (!res.ok || !body?.ok || !body.setup) {
      return {
        ok: false,
        error: body?.error ?? `HTTP ${res.status}`,
        observedAt: body?.observedAt,
        statusCode: res.status,
      };
    }
    return {
      ok: true,
      observedAt: body.observedAt ?? new Date().toISOString(),
      setup: body.setup,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Civ7 setup config unavailable" };
  }
}

type Civ7SetupCatalogOption = Readonly<{
  value: string;
  label: string;
  source?: string;
  sourcePath?: string;
}>;

type Civ7SetupCatalog = Readonly<{
  observedAt: string;
  leaders: ReadonlyArray<Civ7SetupCatalogOption>;
  civilizations: ReadonlyArray<Civ7SetupCatalogOption>;
  difficulties: ReadonlyArray<Civ7SetupCatalogOption>;
  gameSpeeds: ReadonlyArray<Civ7SetupCatalogOption>;
}>;

async function fetchCiv7SavedSetupConfigs(): Promise<
  | { ok: true; observedAt: string; directory: string; configurations: ReadonlyArray<Civ7SavedSetupConfigFile> }
  | { ok: false; error: string; observedAt?: string; statusCode?: number }
> {
  try {
    const res = await fetch("/api/civ7/saved-configs");
    const body = (await res.json().catch(() => null)) as {
      ok?: boolean;
      observedAt?: string;
      directory?: string;
      configurations?: ReadonlyArray<Civ7SavedSetupConfigFile>;
      error?: string;
    } | null;
    if (!res.ok || !body?.ok || !Array.isArray(body.configurations)) {
      return {
        ok: false,
        error: body?.error ?? `HTTP ${res.status}`,
        observedAt: body?.observedAt,
        statusCode: res.status,
      };
    }
    return {
      ok: true,
      observedAt: body.observedAt ?? new Date().toISOString(),
      directory: body.directory ?? "",
      configurations: body.configurations,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Civ7 saved configurations unavailable" };
  }
}

async function fetchCiv7SetupCatalog(): Promise<
  | { ok: true; catalog: Civ7SetupCatalog }
  | { ok: false; error: string; observedAt?: string; statusCode?: number }
> {
  try {
    const res = await fetch("/api/civ7/setup-catalog");
    const body = (await res.json().catch(() => null)) as {
      ok?: boolean;
      catalog?: Civ7SetupCatalog;
      error?: string;
      observedAt?: string;
    } | null;
    if (!res.ok || !body?.ok || !body.catalog) {
      return {
        ok: false,
        error: body?.error ?? `HTTP ${res.status}`,
        observedAt: body?.observedAt,
        statusCode: res.status,
      };
    }
    return { ok: true, catalog: body.catalog };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Civ7 setup catalog unavailable" };
  }
}

async function requestCiv7Autoplay(action: "start" | "stop"): Promise<{
  ok: boolean;
  action?: "start" | "stop";
  autoplay?: { isActive?: boolean; isPaused?: boolean; isPausedOrPending?: boolean };
  game?: { turn?: { ok?: boolean; value?: number } };
  error?: string;
}> {
  try {
    const res = await fetch("/api/civ7/autoplay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const body = (await res.json().catch(() => null)) as {
      ok?: boolean;
      action?: "start" | "stop";
      autoplay?: { isActive?: boolean; isPaused?: boolean; isPausedOrPending?: boolean };
      game?: { turn?: { ok?: boolean; value?: number } };
      error?: string;
    } | null;
    if (!res.ok || !body?.ok) {
      return { ok: false, error: body?.error ?? `HTTP ${res.status}` };
    }
    return { ok: true, action: body.action, autoplay: body.autoplay, game: body.game };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Civ7 autoplay request failed" };
  }
}

const RUN_IN_GAME_LAST_REQUEST_KEY = "mapgen-studio.runInGame.lastRequestId.v1";
const RUN_IN_GAME_LAST_SNAPSHOT_KEY = "mapgen-studio.runInGame.lastSnapshot.v1";
const RUN_IN_GAME_LAST_SOURCE_KEY = "mapgen-studio.runInGame.lastSource.v1";
const MAP_CONFIG_SAVE_LAST_REQUEST_KEY = "mapgen-studio.mapConfigSave.lastRequestId.v1";
const LIVE_GAME_PRESET_ID = "live-game";
const LIVE_GAME_PRESET_KEY = `live:${LIVE_GAME_PRESET_ID}` as const;

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

type AppliedPresetSnapshot = Readonly<{
  key: PresetKey;
  config: unknown;
}>;

function mergeBuiltInPresets(
  base: ReadonlyArray<BuiltInPreset>,
  overrides: Readonly<Record<string, BuiltInPreset>>
): ReadonlyArray<BuiltInPreset> {
  const overrideIds = new Set(Object.keys(overrides));
  if (overrideIds.size === 0) return base;
  const merged = base.map((preset) => {
    const override = overrides[preset.id];
    if (!override) return preset;
    overrideIds.delete(preset.id);
    return override;
  });
  for (const id of overrideIds) {
    const override = overrides[id];
    if (override) merged.push(override);
  }
  return merged;
}

function toRepoBackedPreset(args: {
  id: string;
  label: string;
  description?: string;
  sourcePath?: string;
  sortIndex?: number;
  latitudeBounds?: Readonly<{
    topLatitude: number;
    bottomLatitude: number;
  }>;
  config: unknown;
}): BuiltInPreset {
  return {
    id: args.id,
    label: args.label,
    description: args.description,
    sourcePath: args.sourcePath,
    sortIndex: args.sortIndex,
    latitudeBounds: args.latitudeBounds,
    config: args.config,
  };
}

function readStoredRunInGameSourceSnapshot(): RunInGameSourceSnapshot | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return parseRunInGameSourceSnapshot(localStorage.getItem(RUN_IN_GAME_LAST_SOURCE_KEY));
  } catch {
    return null;
  }
}

function applyPresetConfig(args: {
  schema: TSchema;
  uiMeta: StudioRecipeUiMeta;
  presetConfig: unknown;
  label: string;
}): PresetApplyResult {
  const { schema, uiMeta, presetConfig, label } = args;
  const skeleton = buildConfigSkeleton(uiMeta);
  const migratedPresetConfig = migratePipelineConfigUnknown(stripSchemaMetadataRoot(presetConfig));
  const merged = mergeDeterministic(skeleton, migratedPresetConfig);
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

function findSetupParameterLike(
  parameters: ReadonlyArray<Civ7SetupParameterSnapshotLike> | undefined,
  id: string,
): Civ7SetupParameterSnapshotLike | undefined {
  return parameters?.find((parameter) => parameter.id === id && parameter.exists !== false);
}

function ensureSelectOption(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: unknown,
): ReadonlyArray<{ value: string; label: string }> {
  if (typeof value !== "string" || value.length === 0 || options.some((option) => option.value === value)) return options;
  return [{ value, label: labelForCiv7SetupValue(value) }, ...options];
}

function mergeSelectOptions(
  ...groups: ReadonlyArray<ReadonlyArray<{ value: string; label: string }>>
): ReadonlyArray<{ value: string; label: string }> {
  const seen = new Set<string>();
  const out: Array<{ value: string; label: string }> = [];
  for (const group of groups) {
    for (const option of group) {
      if (!option.value && seen.has(option.value)) continue;
      if (option.value && seen.has(option.value)) continue;
      seen.add(option.value);
      out.push(option);
    }
  }
  return out;
}

function setupCatalogOptions(options: ReadonlyArray<Civ7SetupCatalogOption> | undefined): ReadonlyArray<{ value: string; label: string }> {
  return (options ?? []).map((option) => ({ value: option.value, label: option.label }));
}

type LastRunSnapshot = {
  worldSettings: WorldSettings;
  recipeSettings: RecipeSettings;
  pipelineConfig: PipelineConfig;
};

function liveSourceMatchesStudio(args: {
  source: RunInGameSourceSnapshot;
  recipeSettings: RecipeSettings;
  worldSettings: WorldSettings;
  pipelineConfig: PipelineConfig;
  setupConfig: Civ7StudioSetupConfig;
}): boolean {
  return (
    args.source.recipeSettings.recipe === args.recipeSettings.recipe &&
    args.source.recipeSettings.seed === args.recipeSettings.seed &&
    args.source.worldSettings.mapSize === args.worldSettings.mapSize &&
    args.source.worldSettings.playerCount === args.worldSettings.playerCount &&
    args.source.worldSettings.resources === args.worldSettings.resources &&
    studioSetupConfigsEqual(args.source.setupConfig, args.setupConfig) &&
    configsEqual(args.source.pipelineConfig, args.pipelineConfig)
  );
}

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
  const initialAuthoringStateRef = useRef<ReturnType<typeof loadStudioAuthoringState> | undefined>(undefined);
  if (initialAuthoringStateRef.current === undefined) {
    initialAuthoringStateRef.current = loadStudioAuthoringState();
  }
  const initialAuthoringState = initialAuthoringStateRef.current;

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
  const [activeStudioView, setActiveStudioView] = useState<StudioView>("map");
  const [recipeSectionCollapsed, setRecipeSectionCollapsed] = useState(false);
  const [configSectionCollapsed, setConfigSectionCollapsed] = useState(false);
  const [exploreStageExpanded, setExploreStageExpanded] = useState(true);
  const [exploreStepExpanded, setExploreStepExpanded] = useState(true);
  const [exploreLayersExpanded, setExploreLayersExpanded] = useState(true);
  const [autoRunEnabled, setAutoRunEnabled] = useState(false);
  const autoRunTimerRef = useRef<number | null>(null);
  const autoRunPendingRef = useRef(false);

  const [worldSettings, setWorldSettings] = useState<WorldSettings>(() => initialAuthoringState?.worldSettings ?? {
    mapSize: "MAPSIZE_STANDARD",
    playerCount: 6,
    resources: "balanced",
  });

  const [recipeSettings, setRecipeSettings] = useState<RecipeSettings>(() => initialAuthoringState?.recipeSettings ?? {
    recipe: DEFAULT_STUDIO_RECIPE_ID,
    preset: "none",
    seed: "123",
  });
  const [recipeDagState, setRecipeDagState] = useState<RecipeDagClientState>({
    status: "idle",
    recipeId: null,
    dag: null,
    error: null,
  });
  const [expandedRecipeDagStageIds, setExpandedRecipeDagStageIds] = useState<ReadonlySet<string>>(() => new Set());
  const [setupConfig, setSetupConfig] = useState<Civ7StudioSetupConfig>(() =>
    initialAuthoringState?.setupConfig ?? DEFAULT_CIV7_STUDIO_SETUP_CONFIG
  );
  const [presetError, setPresetError] = useState<PresetErrorState | null>(null);
  const [saveDialogState, setSaveDialogState] = useState<{ open: boolean; label: string; description?: string }>({
    open: false,
    label: "",
    description: "",
  });
  const [pendingImport, setPendingImport] = useState<StudioPresetExportFileV1 | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const lastAppliedPresetRef = useRef<AppliedPresetSnapshot | null>(null);
  const lastPresetKeyRef = useRef(recipeSettings.preset);
  const lastRecipeIdRef = useRef(recipeSettings.recipe);
  const [repoBackedPresetOverridesByRecipe, setRepoBackedPresetOverridesByRecipe] = useState<
    Record<string, Record<string, BuiltInPreset>>
  >(() => initialAuthoringState?.repoBackedPresetOverridesByRecipe ?? {});
  const [lastRunInGameSource, setLastRunInGameSource] = useState<RunInGameSourceSnapshot | null>(() =>
    readStoredRunInGameSourceSnapshot()
  );
  const [runInGameOperation, setRunInGameOperation] = useState<RunInGameOperationStatus | null>(null);

  useEffect(() => {
    if (activeStudioView !== "dag") return;
    const recipeId = recipeSettings.recipe;
    let cancelled = false;
    setRecipeDagState((prev) => ({
      status: "loading",
      recipeId,
      dag: prev.recipeId === recipeId ? prev.dag : null,
      error: null,
    }));
    void recipeDagClient.recipeDag.get({ recipeId }).then(
      (dag: RecipeDagResult) => {
        if (cancelled) return;
        setRecipeDagState({
          status: "ready",
          recipeId,
          dag,
          error: null,
        });
        const firstStageId = dag.stages[0]?.stageId;
        if (firstStageId) {
          setExpandedRecipeDagStageIds((prev) => (
            prev.size > 0 ? prev : new Set([firstStageId])
          ));
        }
      },
      (err: unknown) => {
        if (cancelled) return;
        setRecipeDagState({
          status: "error",
          recipeId,
          dag: null,
          error: formatErrorForUi(err),
        });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [activeStudioView, recipeSettings.recipe]);

  const overlaySuggestions = useMemo(() => getOverlaySuggestions(recipeSettings.recipe), [recipeSettings.recipe]);
  const overlaySelection = overlaySuggestions.find((opt) => opt.id === overlaySelectionId) ?? null;
  const overlayDataTypeKey = overlaySelection?.overlayDataTypeKey ?? null;

  const recipeArtifacts = useMemo(() => getRecipeArtifacts(recipeSettings.recipe), [recipeSettings.recipe]);
  const builtInPresets = useMemo(
    () => mergeBuiltInPresets(
      recipeArtifacts.studioBuiltInPresets ?? [],
      repoBackedPresetOverridesByRecipe[recipeSettings.recipe] ?? {}
    ),
    [recipeArtifacts.studioBuiltInPresets, recipeSettings.recipe, repoBackedPresetOverridesByRecipe]
  );
  const provedRunInGameSource = useMemo(
    () =>
      lastRunInGameSource &&
      runInGameOperation?.status === "complete" &&
      runInGameOperation.requestId === lastRunInGameSource.requestId
        ? lastRunInGameSource
        : null,
    [lastRunInGameSource, runInGameOperation]
  );
  const livePresets = useMemo(
    () =>
      lastRunInGameSource && lastRunInGameSource.recipeSettings.recipe === recipeSettings.recipe
        ? [
            {
              id: LIVE_GAME_PRESET_ID,
              label: lastRunInGameSource.materializationMode === "disposable"
                ? "Live Game"
                : lastRunInGameSource.selectedConfig?.label
                  ? `Live Game (${lastRunInGameSource.selectedConfig.label})`
                  : "Live Game",
              description: provedRunInGameSource
                ? "Config and seed last proved through Run in Game."
                : "Config and seed from the last Studio Run in Game request.",
              config: lastRunInGameSource.pipelineConfig,
            },
          ]
        : [],
    [lastRunInGameSource, provedRunInGameSource, recipeSettings.recipe]
  );
  const { options: presetOptions, resolvePreset, actions: presetActions, loadWarning } = usePresets({
    recipeId: recipeSettings.recipe,
    builtIns: builtInPresets,
    livePresets,
  });
  const isLocalPresetSelected = parsePresetKey(recipeSettings.preset).kind === "local";
  const [pipelineConfig, setPipelineConfig] = useState<PipelineConfig>(() => {
    if (initialAuthoringState?.pipelineConfig) return initialAuthoringState.pipelineConfig;
    const artifacts = recipeArtifacts;
    return buildDefaultConfig(artifacts.configSchema, artifacts.uiMeta, artifacts.defaultConfig);
  });
  const [overridesDisabled, setOverridesDisabled] = useState(() => initialAuthoringState?.overridesDisabled ?? false);
  const [lastRunSnapshot, setLastRunSnapshot] = useState<LastRunSnapshot | null>(null);

  useEffect(() => {
    const previousPreset = lastPresetKeyRef.current;
    const previousRecipe = lastRecipeIdRef.current;
    lastPresetKeyRef.current = recipeSettings.preset;
    lastRecipeIdRef.current = recipeSettings.recipe;
    if (parsePresetKey(recipeSettings.preset).kind !== "none") return;
    if (previousPreset === recipeSettings.preset && previousRecipe === recipeSettings.recipe) return;
    const base = buildDefaultConfig(
      recipeArtifacts.configSchema,
      recipeArtifacts.uiMeta,
      recipeArtifacts.defaultConfig
    );
    setPipelineConfig(base);
    setOverridesDisabled(false);
    setLastRunSnapshot(null);
    lastAppliedPresetRef.current = null;
  }, [
    recipeArtifacts.configSchema,
    recipeArtifacts.defaultConfig,
    recipeArtifacts.uiMeta,
    recipeSettings.recipe,
    recipeSettings.preset,
  ]);

  useEffect(() => {
    const nextKey = recipeSettings.preset as PresetKey;
    const parsed = parsePresetKey(nextKey);
    if (parsed.kind === "none") {
      lastAppliedPresetRef.current = null;
      return;
    }
    const resolved = resolvePreset(nextKey);
    if (!resolved) {
      toast("Preset not found", { variant: "error" });
      setPresetError({
        title: "Preset not found",
        message: "The selected preset could not be resolved for this recipe.",
      });
      return;
    }
    const lastApplied = lastAppliedPresetRef.current;
    if (lastApplied?.key === nextKey && lastApplied.config === resolved.config) return;
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
    lastAppliedPresetRef.current = { key: nextKey, config: resolved.config };
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

  useEffect(() => {
    saveStudioAuthoringState({
      worldSettings,
      recipeSettings,
      setupConfig,
      pipelineConfig,
      overridesDisabled,
      repoBackedPresetOverridesByRecipe,
    });
  }, [overridesDisabled, pipelineConfig, recipeSettings, repoBackedPresetOverridesByRecipe, setupConfig, worldSettings]);

  const vizIngestRef = useRef<(event: VizEvent) => void>(() => {});
  const handleVizEvent = useCallback((event: VizEvent) => {
    vizIngestRef.current?.(event);
  }, []);

  const browserRunner = useBrowserRunner({
    enabled: true,
    onVizEvent: handleVizEvent,
  });

  const browserRunning = browserRunner.state.running;
  const [localError, setLocalError] = useState<string | null>(null);
  const [saveDeployOperation, setSaveDeployOperation] = useState<MapConfigSaveDeployStatus | null>(null);
  const [runInGameSnapshot, setRunInGameSnapshot] = useState<RunInGameClientSnapshot | null>(null);
  const [lastSaveDeployConfig, setLastSaveDeployConfig] = useState<unknown>(null);
  const lastRunInGameToastRef = useRef<string | null>(null);
  const liveStatusFailureCountRef = useRef(0);
  const liveSnapshotFailureCountRef = useRef(0);
  const activeLiveSnapshotRequestKeyRef = useRef<string | null>(null);
  const liveSnapshotAbortRef = useRef<AbortController | null>(null);
  const [liveRuntime, setLiveRuntime] = useState<LiveRuntimeStatusState>({
    status: "idle",
    snapshotStatus: "idle",
    bindingStatus: "unbound-runtime",
    failureCount: 0,
  });
  const [, setLiveRuntimeSnapshot] = useState<LiveRuntimeSnapshotState | null>(null);
  const [liveRuntimeSuggestions, setLiveRuntimeSuggestions] = useState<ReadonlyArray<LiveRuntimeSuggestionRecord>>([]);
  const [liveSetup, setLiveSetup] = useState<{
    status: "idle" | "ok" | "error";
    setup?: Civ7SetupSnapshotLike;
    updatedAt?: string;
    error?: string;
  }>({ status: "idle" });
  const [savedSetupConfigs, setSavedSetupConfigs] = useState<{
    status: "idle" | "ok" | "error";
    directory?: string;
    configurations: ReadonlyArray<Civ7SavedSetupConfigFile>;
    updatedAt?: string;
    error?: string;
  }>({ status: "idle", configurations: [] });
  const [setupCatalog, setSetupCatalog] = useState<{
    status: "idle" | "ok" | "error";
    catalog?: Civ7SetupCatalog;
    updatedAt?: string;
    error?: string;
  }>({ status: "idle" });
  const [autoplayActionRunning, setAutoplayActionRunning] = useState(false);
  const saveDeployRunning = saveDeployOperation?.status === "running";
  const runInGameRunning = runInGameOperation?.status === "running";

  const viz = useVizState({
    enabled: true,
    showEdgeOverlay: showEdges,
    overlayDataTypeKey,
    overlayVariantKeyPreference,
    overlayOpacity,
    allowPendingSelection: browserRunning,
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
    browserRunner.state.error;

  useEffect(() => {
    let cancelled = false;
    let timer: number | null = null;
    let statusAbortController: AbortController | null = null;

    const scheduleNextPoll = () => {
      const failureCount = Math.max(liveStatusFailureCountRef.current, liveSnapshotFailureCountRef.current);
      timer = window.setTimeout(
        poll,
        nextLiveRuntimePollDelayMs({ failureCount, documentHidden: document.hidden }),
      );
    };

    const readSnapshot = async (request: NonNullable<ReturnType<typeof buildLiveRuntimeSnapshotRequest>>) => {
      liveSnapshotAbortRef.current?.abort();
      const snapshotAbortController = new AbortController();
      liveSnapshotAbortRef.current = snapshotAbortController;
      activeLiveSnapshotRequestKeyRef.current = request.key;

      try {
        const res = await fetch(`/api/civ7/live/snapshot?${buildLiveRuntimeSnapshotQuery(request)}`, {
          signal: snapshotAbortController.signal,
        });
        const body = (await res.json().catch(() => null)) as unknown;
        if (cancelled) return;
        if (!shouldCommitLiveRuntimeSnapshot({
          activeRequestKey: activeLiveSnapshotRequestKeyRef.current,
          resultRequestKey: request.key,
          aborted: snapshotAbortController.signal.aborted,
        })) {
          return;
        }
        const snapshotState = buildLiveRuntimeSnapshotState({
          request,
          body: res.ok ? body : { ok: false, error: isPlainObject(body) ? body.error : `HTTP ${res.status}` },
          observedAtFallback: new Date().toISOString(),
        });
        liveSnapshotFailureCountRef.current = snapshotState.status === "ok" ? 0 : liveSnapshotFailureCountRef.current + 1;
        setLiveRuntimeSnapshot(snapshotState);
        setLiveRuntime((current) => ({
          ...current,
          snapshotStatus: snapshotState.status,
          snapshotHash: snapshotState.snapshotHash ?? current.snapshotHash,
          bindingStatus: snapshotState.status === "ok" ? current.bindingStatus : "partial",
          failureCount: Math.max(liveStatusFailureCountRef.current, liveSnapshotFailureCountRef.current),
          error: snapshotState.status === "ok" ? current.error : snapshotState.error,
        }));
      } catch (err) {
        if (cancelled || isAbortLikeError(err)) return;
        if (!shouldCommitLiveRuntimeSnapshot({
          activeRequestKey: activeLiveSnapshotRequestKeyRef.current,
          resultRequestKey: request.key,
        })) {
          return;
        }
        liveSnapshotFailureCountRef.current += 1;
        const snapshotState: LiveRuntimeSnapshotState = {
          status: "error",
          requestKey: request.key,
          error: err instanceof Error ? err.message : "Live snapshot unavailable",
        };
        setLiveRuntimeSnapshot(snapshotState);
        setLiveRuntime((current) => ({
          ...current,
          snapshotStatus: "error",
          bindingStatus: "partial",
          failureCount: Math.max(liveStatusFailureCountRef.current, liveSnapshotFailureCountRef.current),
          error: snapshotState.error,
        }));
      }
    };

    const poll = async () => {
      statusAbortController?.abort();
      statusAbortController = new AbortController();
      try {
        const [res, readinessResult] = await Promise.all([
          fetch("/api/civ7/live/status", { signal: statusAbortController.signal }),
          civ7ControlOrpcClient.readiness.current({}),
        ]);
        const body = (await res.json().catch(() => null)) as unknown;
        if (cancelled) return;
        if (!res.ok || !body) throw new Error(isPlainObject(body) && typeof body.error === "string" ? body.error : `HTTP ${res.status}`);
        const bodyWithOrpcReadiness = isPlainObject(body)
          ? {
              ...body,
              status: {
                ...(isPlainObject(body.status) ? body.status : {}),
                readiness: readinessResult.readiness,
              },
            }
          : body;

        const statusState = buildLiveRuntimeStatusState({
          body: bodyWithOrpcReadiness,
          observedAtFallback: new Date().toISOString(),
          failureCount: 0,
        });
        liveStatusFailureCountRef.current = statusState.status === "ok" ? 0 : liveStatusFailureCountRef.current + 1;
        const snapshotRequest = buildLiveRuntimeSnapshotRequest({ status: statusState });
        setLiveRuntime((current) => ({
          ...statusState,
          snapshotStatus:
            snapshotRequest === null
              ? statusState.snapshotStatus
              : current.snapshotId === statusState.snapshotId && current.snapshotStatus === "ok"
                ? current.snapshotStatus
                : "loading",
          failureCount: Math.max(liveStatusFailureCountRef.current, liveSnapshotFailureCountRef.current),
        }));

        const setup = await fetchCiv7SetupConfig({ signal: statusAbortController.signal });
        if (cancelled) return;
        const suggestedSetupConfig = setup.ok
          ? normalizeStudioSetupConfig(studioSetupConfigFromLiveSnapshot(setup.setup))
          : undefined;
        if (setup.ok) {
          setLiveSetup({ status: "ok", setup: setup.setup, updatedAt: setup.observedAt });
        } else {
          setLiveSetup({
            status: "error",
            error: setup.error,
            updatedAt: setup.observedAt ?? new Date().toISOString(),
          });
        }
        setLiveRuntimeSuggestions(buildLiveRuntimeSuggestionRecords({
          sourceSnapshotId: statusState.snapshotId,
          seed: statusState.seed,
          setupConfig: suggestedSetupConfig,
          provedStudioRun: false,
        }));

        if (snapshotRequest) await readSnapshot(snapshotRequest);
      } catch (err) {
        if (cancelled || isAbortLikeError(err)) return;
        liveStatusFailureCountRef.current += 1;
        const errorState = buildLiveRuntimeErrorState({
          error: err,
          observedAt: new Date().toISOString(),
          failureCount: liveStatusFailureCountRef.current,
        });
        setLiveRuntime(errorState);
        setLiveSetup({
          status: "error",
          error: errorState.error ?? "Live setup unavailable",
          updatedAt: errorState.updatedAt,
        });
        setLiveRuntimeSuggestions([]);
      } finally {
        if (!cancelled) scheduleNextPoll();
      }
    };

    timer = window.setTimeout(poll, 250);
    return () => {
      cancelled = true;
      statusAbortController?.abort();
      liveSnapshotAbortRef.current?.abort();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: number | null = null;

    const load = async () => {
      const [configs, catalog] = await Promise.all([
        fetchCiv7SavedSetupConfigs(),
        fetchCiv7SetupCatalog(),
      ]);
      if (cancelled) return;
      if (configs.ok) {
        setSavedSetupConfigs({
          status: "ok",
          directory: configs.directory,
          configurations: configs.configurations,
          updatedAt: configs.observedAt,
        });
      } else {
        setSavedSetupConfigs({
          status: "error",
          configurations: [],
          error: configs.error,
          updatedAt: configs.observedAt ?? new Date().toISOString(),
        });
      }
      if (catalog.ok) {
        setSetupCatalog({
          status: "ok",
          catalog: catalog.catalog,
          updatedAt: catalog.catalog.observedAt,
        });
      } else {
        setSetupCatalog({
          status: "error",
          error: catalog.error,
          updatedAt: catalog.observedAt ?? new Date().toISOString(),
        });
      }

      if (!configs.ok || !catalog.ok) {
        retryTimer = window.setTimeout(load, document.hidden ? 10000 : 3000);
      }
    };

    const loadNow = () => {
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
        retryTimer = null;
      }
      void load();
    };

    void load();
    window.addEventListener("focus", loadNow);
    return () => {
      cancelled = true;
      if (retryTimer !== null) window.clearTimeout(retryTimer);
      window.removeEventListener("focus", loadNow);
    };
  }, []);

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

  const [selectedStageId, setSelectedStageId] = useState("");
  const [selectedStepId, setSelectedStepId] = useState("");
  const handleRecipeDagStageToggle = useCallback((stageId: string) => {
    setExpandedRecipeDagStageIds((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  }, []);

  const recipeOptions = useMemo(
    () => STUDIO_RECIPE_OPTIONS.map((opt) => ({ value: opt.id, label: opt.label })),
    []
  );

  const stages: StageOption[] = useMemo(() => {
    return recipeArtifacts.uiMeta.stages.map((stage, index) => ({
      value: stage.stageId,
      label: stage.stageLabel ?? formatStageName(stage.stageId),
      index: index + 1,
    }));
  }, [recipeArtifacts.uiMeta.stages]);

  const steps: StepOption[] = useMemo(() => {
    if (!selectedStageId) return [];

    const labelByFullStepId = new Map(
      recipeArtifacts.uiMeta.stages.flatMap((stage) =>
        stage.steps.map((step) => [step.fullStepId, step.stepLabel] as const)
      )
    );

    const stage = recipeArtifacts.uiMeta.stages.find((s) => s.stageId === selectedStageId);
    return (
      stage?.steps.map((step) => ({
        value: step.fullStepId,
        label: labelByFullStepId.get(step.fullStepId) ?? step.stepLabel ?? step.stepId,
        category: selectedStageId,
      })) ?? []
    );
  }, [recipeArtifacts.uiMeta.stages, selectedStageId]);

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
      const seedPolicy = parseCiv7StudioSeed(seedStr);
      if (!seedPolicy.ok) {
        const message = formatCiv7StudioSeedError(seedPolicy);
        setLocalError(message);
        toast(message, { variant: "error" });
        return;
      }
      const seed = seedPolicy.value;
      const mapSize = getCiv7MapSizePreset(worldSettings.mapSize);
      const runPipelineConfig = migratePipelineConfig(pipelineConfig);

      const pinned = capturePinnedSelection({
        selectedStepId: viz.selectedStepId,
        selectedLayerKey: viz.selectedLayerKey,
      });
      viz.clearStream();
      if (!pinned.retainStep) viz.setSelectedStepId(null);
      if (!pinned.retainLayer) viz.setSelectedLayerKey(null);

      browserRunner.actions.clearError();

      setLastRunSnapshot({
        worldSettings,
        recipeSettings: { ...recipeSettings, seed: seedStr },
        pipelineConfig: runPipelineConfig,
      });

      browserRunner.actions.start({
        recipeId: recipeSettings.recipe,
        seed,
        mapSizeId: mapSize.id,
        dimensions: mapSize.dimensions,
        latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
        playerCount: worldSettings.playerCount,
        resourcesMode: worldSettings.resources,
        configOverrides: overridesDisabled ? undefined : (runPipelineConfig as unknown),
      });
    },
    [browserRunner.actions, overridesDisabled, pipelineConfig, recipeSettings, toast, worldSettings, viz]
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
  }, [autoRunEnabled, browserRunning, lastRunSnapshot, overridesDisabled, pipelineConfig, runInGameRunning, saveDeployRunning, startBrowserRun]);

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

  const rememberRepoBackedConfig = useCallback((recipeId: string, preset: BuiltInPreset) => {
    setRepoBackedPresetOverridesByRecipe((prev) => ({
      ...prev,
      [recipeId]: {
        ...(prev[recipeId] ?? {}),
        [preset.id]: preset,
      },
    }));
  }, []);

  const saveRepoBackedConfigWithState = useCallback(async (args: {
    id: string;
    name: string;
    description?: string;
    sourcePath?: string;
    sortIndex: number;
    latitudeBounds?: Readonly<{
      topLatitude: number;
      bottomLatitude: number;
    }>;
    config: unknown;
  }) => {
    if (browserRunning || runInGameRunning || saveDeployRunning) {
      const reason = browserRunning
        ? "Map generation is running"
        : runInGameRunning
          ? "Run in Game is running"
          : "Save/deploy is already running";
      return { ok: false as const, error: `${reason}; finish that operation before saving.`, saved: false, deployed: false };
    }

    const requestId = `studio-save-deploy-${Date.now().toString(36)}`;
    const initial = createMapConfigSaveDeployStatus({ requestId, phase: "queued" });
    setSaveDeployOperation(initial);

    try {
      localStorage.setItem(MAP_CONFIG_SAVE_LAST_REQUEST_KEY, requestId);
    } catch {
      // Server status remains authoritative while the dev server is alive.
    }

    const result = await saveRepoBackedConfig({
      ...args,
      requestId,
      onStatus: (status) => {
        setSaveDeployOperation((current) => current?.requestId === requestId ? status : current);
        try {
          localStorage.setItem(MAP_CONFIG_SAVE_LAST_REQUEST_KEY, status.requestId);
        } catch {
          // Server status remains authoritative while the dev server is alive.
        }
      },
    });
    setSaveDeployOperation((current) => {
      if (!current || current.requestId !== requestId) return current;
      if ("requestId" in current && current.status === "complete" && result.ok) return current;
      return updateMapConfigSaveDeployStatus(current, {
        phase: result.ok ? "complete" : "failed",
        path: result.path,
        saved: "saved" in result ? result.saved : result.ok,
        deployed: "deployed" in result ? result.deployed : result.ok,
        error: result.ok ? undefined : result.error,
      });
    });
    if (result.ok) setLastSaveDeployConfig(stripSchemaMetadataRoot(args.config));
    return result;
  }, [browserRunning, runInGameRunning, saveDeployRunning]);

  const handleSaveDialogConfirm = useCallback(
    async (args: { label: string; description?: string }) => {
      const sanitized = stripSchemaMetadataRoot(pipelineConfig);
      const resolved = resolvePreset(recipeSettings.preset as PresetKey);
      const id = toConfigId(args.label);
      const sortIndex = (resolved?.sortIndex ?? 900) + 1000;
      const latitudeBounds = resolved?.latitudeBounds;
      const result = await saveRepoBackedConfigWithState({
        id,
        name: args.label,
        description: args.description,
        sortIndex,
        latitudeBounds,
        config: sanitized,
      });
      if (result.ok || result.saved) {
        rememberRepoBackedConfig(
          recipeSettings.recipe,
          toRepoBackedPreset({
            id,
            label: args.label,
            description: args.description,
            sourcePath: result.path ?? `mods/mod-swooper-maps/src/maps/configs/${id}.config.json`,
            sortIndex,
            latitudeBounds,
            config: sanitized,
          })
        );
        setRecipeSettings((prev) => ({ ...prev, preset: `builtin:${id}` }));
        lastAppliedPresetRef.current = { key: `builtin:${id}`, config: sanitized };
        setPipelineConfig(sanitized as PipelineConfig);
      }
      if (!result.ok) {
        toast(
          result.saved && result.deployed
            ? `Config saved and deployed from ${result.path ?? `${id}.config.json`} but post-save action failed: ${result.error}`
            : result.saved
              ? `Config saved to ${result.path ?? `${id}.config.json`} but deploy failed: ${result.error}`
              : `Config save failed: ${result.error}`,
          { variant: "error" },
        );
      } else {
        toast(`Config saved and deployed from ${result.path ?? `${id}.config.json`}`, { variant: "success" });
      }
      setSaveDialogState({ open: false, label: "", description: "" });
    },
    [pipelineConfig, recipeSettings.preset, recipeSettings.recipe, rememberRepoBackedConfig, resolvePreset, saveRepoBackedConfigWithState, toast]
  );

  const handleSaveAsNew = useCallback(() => {
    const resolved = resolvePreset(recipeSettings.preset as PresetKey);
    const suggested = resolved ? `Copy of ${resolved.label}` : "New Config";
    openSaveDialog({ label: suggested, description: resolved?.description });
  }, [openSaveDialog, recipeSettings.preset, resolvePreset]);

  const handleSaveToCurrent = useCallback(async () => {
    const parsed = parsePresetKey(recipeSettings.preset);
    const resolved = resolvePreset(recipeSettings.preset as PresetKey);
    const sanitized = stripSchemaMetadataRoot(pipelineConfig);
    if (parsed.kind === "builtin" && resolved) {
      const result = await saveRepoBackedConfigWithState({
        id: resolved.id,
        name: resolved.label,
        description: resolved.description,
        sourcePath: resolved.sourcePath,
        sortIndex: resolved.sortIndex ?? 500,
        latitudeBounds: resolved.latitudeBounds,
        config: sanitized,
      });
      if (result.ok || result.saved) {
        rememberRepoBackedConfig(
          recipeSettings.recipe,
          toRepoBackedPreset({
            id: resolved.id,
            label: resolved.label,
            description: resolved.description,
            sourcePath: result.path ?? resolved.sourcePath,
            sortIndex: resolved.sortIndex,
            latitudeBounds: resolved.latitudeBounds,
            config: sanitized,
          })
        );
        lastAppliedPresetRef.current = { key: recipeSettings.preset as PresetKey, config: sanitized };
        setPipelineConfig(sanitized as PipelineConfig);
      }
      if (!result.ok) {
        toast(
          result.saved && result.deployed
            ? `Config saved and deployed from ${result.path ?? resolved.sourcePath ?? resolved.id} but post-save action failed: ${result.error}`
            : result.saved
              ? `Config saved to ${result.path ?? resolved.sourcePath ?? resolved.id} but deploy failed: ${result.error}`
              : `Config save failed: ${result.error}`,
          { variant: "error" },
        );
      } else {
        toast(`Config saved and deployed from ${result.path ?? resolved.sourcePath ?? resolved.id}`, { variant: "success" });
      }
      return;
    }
    if (parsed.kind !== "local") {
      handleSaveAsNew();
      toast("Save to Current requires a repo config or scratch config. Save as new instead.", { variant: "info" });
      return;
    }
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
      toast(`Scratch config updated but could not persist: ${result.persistenceError}`, { variant: "error" });
      return;
    }

    const label = result.preset?.label ?? resolved?.label ?? "Scratch Config";
    const description = result.preset?.description ?? resolved?.description;
    const baseId = toConfigId(label);
    const id = builtInPresets.some((preset) => preset.id === baseId) ? `scratch-${baseId}` : baseId;
    const repoResult = await saveRepoBackedConfigWithState({
      id,
      name: label,
      description,
      sortIndex: (resolved?.sortIndex ?? 900) + 1000,
      latitudeBounds: resolved?.latitudeBounds,
      config: sanitized,
    });
    if (repoResult.ok || repoResult.saved) {
      rememberRepoBackedConfig(
        recipeSettings.recipe,
        toRepoBackedPreset({
          id,
          label,
          description,
          sourcePath: repoResult.path ?? `mods/mod-swooper-maps/src/maps/configs/${id}.config.json`,
          sortIndex: (resolved?.sortIndex ?? 900) + 1000,
          latitudeBounds: resolved?.latitudeBounds,
          config: sanitized,
        })
      );
      setRecipeSettings((prev) => ({ ...prev, preset: `builtin:${id}` }));
      lastAppliedPresetRef.current = { key: `builtin:${id}`, config: sanitized };
      setPipelineConfig(sanitized as PipelineConfig);
    }
    if (!repoResult.ok) {
      toast(
        repoResult.saved && repoResult.deployed
          ? `Config saved and deployed from ${repoResult.path ?? `${id}.config.json`} but post-save action failed: ${repoResult.error}`
          : repoResult.saved
            ? `Config saved to ${repoResult.path ?? `${id}.config.json`} but deploy failed: ${repoResult.error}`
            : `Config save failed: ${repoResult.error}`,
        { variant: "error" },
      );
    } else {
      toast(`Config saved and deployed from ${repoResult.path ?? `${id}.config.json`}`, { variant: "success" });
    }
  }, [builtInPresets, handleSaveAsNew, pipelineConfig, presetActions, recipeSettings.preset, recipeSettings.recipe, rememberRepoBackedConfig, resolvePreset, saveRepoBackedConfigWithState, toast]);

  const handleDeletePreset = useCallback(() => {
    const parsed = parsePresetKey(recipeSettings.preset);
    if (parsed.kind !== "local") {
      toast("Select a scratch config to delete.", { variant: "info" });
      return;
    }
    const result = presetActions.deleteLocal({
      recipeId: recipeSettings.recipe,
      presetId: parsed.id,
    });
    if (result.persistenceError) {
      toast(`Scratch config deleted but could not persist: ${result.persistenceError}`, { variant: "error" });
    } else {
      toast("Scratch config deleted", { variant: "success" });
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
    if (runInGameRunning || saveDeployRunning) {
      toast("Finish the current Studio operation before rerolling.", { variant: "info" });
      return;
    }
    const next = randomCiv7StudioSeed();
    setRecipeSettings((prev) => ({ ...prev, seed: next }));
    startBrowserRun({ seed: next });
  }, [runInGameRunning, saveDeployRunning, startBrowserRun, toast]);

  const triggerRun = useCallback(() => {
    if (runInGameRunning || saveDeployRunning) {
      toast("Finish the current Studio operation before running.", { variant: "info" });
      return;
    }
    startBrowserRun();
  }, [runInGameRunning, saveDeployRunning, startBrowserRun, toast]);

  const status: GenerationStatus = browserRunning ? "running" : error ? "error" : "ready";

  const isDirty = useMemo(() => {
    if (!lastRunSnapshot) return true;
    return (
      !worldSettingsEqual(lastRunSnapshot.worldSettings, worldSettings) ||
      !recipeSettingsEqual(lastRunSnapshot.recipeSettings, recipeSettings) ||
      !configsEqual(lastRunSnapshot.pipelineConfig, pipelineConfig)
    );
  }, [lastRunSnapshot, pipelineConfig, recipeSettings, worldSettings]);

  const runInGameMaterializationMode = useMemo<"durable" | "disposable">(() => {
    const parsed = parsePresetKey(recipeSettings.preset);
    const resolved = resolvePreset(recipeSettings.preset as PresetKey);
    const currentConfig = stripSchemaMetadataRoot(pipelineConfig);
    const selectedConfigMatches = resolved?.config
      ? configsEqual(stripSchemaMetadataRoot(resolved.config) as PipelineConfig, currentConfig as PipelineConfig)
      : false;
    const savedConfigMatches = lastSaveDeployConfig
      ? configsEqual(stripSchemaMetadataRoot(lastSaveDeployConfig) as PipelineConfig, currentConfig as PipelineConfig)
      : false;
    return parsed.kind === "builtin" && resolved?.sourcePath && (selectedConfigMatches || savedConfigMatches)
      ? "durable"
      : "disposable";
  }, [lastSaveDeployConfig, pipelineConfig, recipeSettings.preset, resolvePreset]);

  const runInGameCurrentFingerprint = useMemo(
    () => buildRunInGameFingerprint({
      recipeSettings,
      worldSettings,
      pipelineConfig: stripSchemaMetadataRoot(pipelineConfig) as PipelineConfig,
      setupConfig,
      materializationMode: runInGameMaterializationMode,
    }),
    [pipelineConfig, recipeSettings, runInGameMaterializationMode, setupConfig, worldSettings]
  );

  const runInGameCurrentRelation = useMemo<RunInGameCurrentRelation>(
    () => relationForRunInGameOperation({
      status: runInGameOperation,
      snapshot: runInGameSnapshot,
      currentFingerprint: runInGameCurrentFingerprint,
    }),
    [runInGameCurrentFingerprint, runInGameOperation, runInGameSnapshot]
  );

  const liveGameStudioRelation = useMemo<"current" | "stale" | "unknown">(() => {
    if (liveRuntime.status !== "ok") return "unknown";
    if (liveRuntime.seed !== undefined && String(liveRuntime.seed) !== recipeSettings.seed) return "stale";
    if (!provedRunInGameSource) return "unknown";
    if (
      liveRuntime.seed !== undefined &&
      String(liveRuntime.seed) !== provedRunInGameSource.recipeSettings.seed
    ) {
      return "unknown";
    }
    return liveSourceMatchesStudio({
      source: provedRunInGameSource,
      recipeSettings,
      worldSettings,
      setupConfig,
      pipelineConfig: stripSchemaMetadataRoot(pipelineConfig) as PipelineConfig,
    })
      ? "current"
      : "stale";
  }, [liveRuntime.seed, liveRuntime.status, pipelineConfig, provedRunInGameSource, recipeSettings, setupConfig, worldSettings]);

  const studioMatchesProvedLiveSource = useMemo(() => {
    if (!provedRunInGameSource) return false;
    return liveSourceMatchesStudio({
      source: provedRunInGameSource,
      recipeSettings,
      worldSettings,
      setupConfig,
      pipelineConfig: stripSchemaMetadataRoot(pipelineConfig) as PipelineConfig,
    });
  }, [pipelineConfig, provedRunInGameSource, recipeSettings, setupConfig, worldSettings]);

  const displayedPresetOptions = useMemo(
    () => {
      const relabelNoneAsLive =
        studioMatchesProvedLiveSource && provedRunInGameSource?.materializationMode === "disposable";
      return presetOptions
        .filter((option) => !(relabelNoneAsLive && option.value === LIVE_GAME_PRESET_KEY))
        .map((option) => (option.value === "none" && relabelNoneAsLive ? { ...option, label: "Live / Live Game" } : option));
    },
    [presetOptions, provedRunInGameSource?.materializationMode, studioMatchesProvedLiveSource]
  );

  const setupControlOptions = useMemo(() => {
    const setup = liveSetup.setup;
    const parameters = setup?.setup?.parameters ?? [];
    const localPlayerId = Number(setup?.setup?.localPlayerId?.ok === true ? setup.setup.localPlayerId.value : getLocalPlayerSetup(setupConfig).playerId);
    const playerParameters =
      setup?.setup?.playerParameters?.find((player) => player.playerId === localPlayerId)?.parameters ??
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
      leaderOptions: ensureSelectOption(mergeSelectOptions(
        [{ value: "", label: "Leader" }],
        optionRowsFromParameter(findSetupParameterLike(playerParameters, "PlayerLeader")),
        setupCatalogOptions(catalog?.leaders),
      ), leader),
      civilizationOptions: ensureSelectOption(mergeSelectOptions(
        [{ value: "", label: "Civilization" }],
        optionRowsFromParameter(findSetupParameterLike(playerParameters, "PlayerCivilization")),
        setupCatalogOptions(catalog?.civilizations),
      ), civilization),
      difficultyOptions: ensureSelectOption(mergeSelectOptions(
        [{ value: "", label: "Difficulty" }],
        optionRowsFromParameter(findSetupParameterLike(parameters, "Difficulty")),
        setupCatalogOptions(catalog?.difficulties),
      ), difficulty),
      gameSpeedOptions: ensureSelectOption(mergeSelectOptions(
        [{ value: "", label: "Speed" }],
        optionRowsFromParameter(findSetupParameterLike(parameters, "GameSpeeds")),
        setupCatalogOptions(catalog?.gameSpeeds),
      ), gameSpeed),
    };
  }, [liveSetup.setup, savedSetupConfigs.configurations, savedSetupConfigs.status, setupCatalog.catalog, setupConfig]);

  const handleSavedSetupConfigChange = useCallback((configId: string) => {
    const savedConfig = savedSetupConfigs.configurations.find((config) => config.id === configId);
    if (!savedConfig) {
      setSetupConfig((current) => updateStudioSetupSavedConfig(current, undefined));
      return;
    }
    setSetupConfig((current) => updateStudioSetupSavedConfig(current, savedConfig));
    const nextSeed = savedConfig.summary.mapSeed ?? savedConfig.summary.gameSeed;
    if (nextSeed !== undefined) {
      const seedPolicy = parseCiv7StudioSeed(nextSeed);
      if (seedPolicy.ok) {
        setRecipeSettings((current) => ({ ...current, seed: String(seedPolicy.value) }));
      } else {
        toast(`Saved config seed ignored: ${formatCiv7StudioSeedError(seedPolicy)}`, { variant: "info" });
      }
    }
  }, [savedSetupConfigs.configurations, toast]);

  const refreshRunInGameStatus = useCallback(async (requestId: string) => {
    const result = await fetchRunInGameStatus(requestId);
    if (!("requestId" in result)) {
      setRunInGameOperation((prev) => {
        if (!prev || prev.requestId !== requestId) return prev;
        return {
          ...prev,
          ok: false,
          phase: "uncertain",
          status: "uncertain",
          updatedAt: new Date().toISOString(),
          error: result.error,
          recoveryActions: ["copy-diagnostics", "retry-status", "retry-run"],
          details: {
            failureClass: "uncertain",
            code: result.statusCode === 404 ? "operation-status-missing" : "operation-status-unavailable",
            phase: "uncertain",
            completedPhases: prev.completedPhases,
          },
        };
      });
      return;
    }
    setRunInGameOperation(result);
    try {
      localStorage.setItem(RUN_IN_GAME_LAST_REQUEST_KEY, result.requestId);
    } catch {
      // Server status remains authoritative while the dev server is alive.
    }
  }, []);

  const refreshMapConfigSaveDeployStatus = useCallback(async (requestId: string) => {
    const result = await fetchMapConfigSaveDeployStatus(requestId);
    if (!("requestId" in result)) {
      setSaveDeployOperation((prev) => {
        if (!prev || prev.requestId !== requestId) return prev;
        return updateMapConfigSaveDeployStatus(prev, {
          phase: "failed",
          error: result.error,
          details: {
            code: result.statusCode === 404 ? "operation-status-missing" : "operation-status-unavailable",
          },
        });
      });
      return;
    }
    setSaveDeployOperation(result);
    try {
      localStorage.setItem(MAP_CONFIG_SAVE_LAST_REQUEST_KEY, result.requestId);
    } catch {
      // Server status remains authoritative while the dev server is alive.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let requestId: string | null = null;
    let snapshot: RunInGameClientSnapshot | null = null;
    try {
      requestId = localStorage.getItem(RUN_IN_GAME_LAST_REQUEST_KEY);
      snapshot = parseRunInGameClientSnapshot(localStorage.getItem(RUN_IN_GAME_LAST_SNAPSHOT_KEY));
    } catch {
      requestId = null;
      snapshot = null;
    }
    if (snapshot) setRunInGameSnapshot(snapshot);
    if (!requestId) return undefined;
    void refreshRunInGameStatus(requestId).then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [refreshRunInGameStatus]);

  useEffect(() => {
    let requestId: string | null = null;
    try {
      requestId = localStorage.getItem(MAP_CONFIG_SAVE_LAST_REQUEST_KEY);
    } catch {
      requestId = null;
    }
    if (!requestId) return undefined;
    void refreshMapConfigSaveDeployStatus(requestId);
    return undefined;
  }, [refreshMapConfigSaveDeployStatus]);

  useEffect(() => {
    if (!saveDeployOperation || saveDeployOperation.status !== "running") return undefined;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) void refreshMapConfigSaveDeployStatus(saveDeployOperation.requestId);
    }, document.hidden ? 3000 : 1000);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [refreshMapConfigSaveDeployStatus, saveDeployOperation]);

  useEffect(() => {
    if (!runInGameOperation) return undefined;
    if (isRunInGameTerminalPhase(runInGameOperation.phase)) {
      if (lastRunInGameToastRef.current !== runInGameOperation.requestId) {
        lastRunInGameToastRef.current = runInGameOperation.requestId;
        if (runInGameOperation.status === "complete") {
          toast(`Run in Game complete: ${runInGameOperation.materialization?.mapScript ?? runInGameOperation.requestId}`, { variant: "success" });
        } else if (runInGameOperation.status !== "running") {
          toast(`Run in Game ${runInGameOperation.status}: ${runInGameOperation.error ?? runInGameOperation.requestId}`, { variant: "error" });
        }
      }
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) void refreshRunInGameStatus(runInGameOperation.requestId);
    }, document.hidden ? 3000 : 1000);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [refreshRunInGameStatus, runInGameOperation, toast]);

  const handleRunInGame = useCallback(async (options?: { restartCivProcess?: boolean }) => {
    if (runInGameRunning || saveDeployRunning) return;
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
    const result = await runCurrentConfigInGame({
      recipeId: "mod-swooper-maps/standard",
      seed: recipeSettings.seed,
      mapSize: mapSize.id,
      playerCount: worldSettings.playerCount,
      resources: worldSettings.resources,
      setupConfig,
      materializationMode: runInGameMaterializationMode,
      restartCivProcess: options?.restartCivProcess,
      selectedConfig,
      config: sanitized,
      sourceSnapshot: {
        recipeSettings,
        worldSettings,
        pipelineConfig: sanitized,
        setupConfig: normalizeStudioSetupConfig(setupConfig),
        materializationMode: runInGameMaterializationMode,
        selectedConfig,
      },
    });
    if (!("requestId" in result)) {
      toast(`Run in Game failed: ${result.error}`, { variant: "error" });
      setRunInGameOperation({
        ok: false,
        requestId: `studio-run-in-game-client-error-${Date.now()}`,
        phase: "failed",
        status: "failed",
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedPhases: [],
        error: result.error,
        details: result.details,
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
    try {
      localStorage.setItem(RUN_IN_GAME_LAST_REQUEST_KEY, result.requestId);
      localStorage.setItem(RUN_IN_GAME_LAST_SNAPSHOT_KEY, JSON.stringify(snapshot));
      localStorage.setItem(RUN_IN_GAME_LAST_SOURCE_KEY, JSON.stringify(sourceSnapshot));
    } catch {
      // Server status remains authoritative while the dev server is alive.
    }
    toast(`Run in Game started: ${result.materialization?.mapScript ?? result.requestId}`, { variant: "info" });
  }, [
    pipelineConfig,
    recipeSettings.preset,
    recipeSettings,
    recipeSettings.seed,
    resolvePreset,
    runInGameMaterializationMode,
    runInGameRunning,
    saveDeployRunning,
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
      toast("Finish the current Studio operation before syncing from the live game.", { variant: "info" });
      return;
    }
    const currentSnapshotSuggestions = liveRuntimeSuggestions.filter(
      (record) =>
        record.applyPath === "visible-studio-control" &&
        record.sourceSnapshotId !== undefined &&
        record.sourceSnapshotId === liveRuntime.snapshotId,
    );
    const seedSuggestion = currentSnapshotSuggestions.find((record) => record.affectedConfigPath === "recipeSettings.seed");
    const setupSuggestion = currentSnapshotSuggestions.find((record) => record.affectedConfigPath === "setupConfig");
    const applySuggestedSeed = (value: unknown, source: string): boolean => {
      const parsedSeed = parseCiv7StudioSeed(value);
      if (!parsedSeed.ok) {
        toast(`${source} seed ignored: ${formatCiv7StudioSeedError(parsedSeed)}`, { variant: "info" });
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
        toast("Live game suggestions are unavailable; wait for a fresh keyed live snapshot.", { variant: "error" });
        return;
      }
      const didApplySeed = seedSuggestion ? applySuggestedSeed(seedSuggestion.value, "Live runtime suggestion") : false;
      const didApplySetup = setupSuggestion ? applySuggestedSetup(setupSuggestion.value) : false;
      if (!didApplySeed && !didApplySetup) {
        toast("Live game suggestions did not include an applicable Studio seed or setup change.", { variant: "error" });
        return;
      }
      toast(didApplySetup ? "Live runtime suggestion applied to Studio setup." : "Live runtime seed suggestion applied.", {
        variant: "success",
      });
      return;
    }
    const liveSeed = liveRuntime.seed === undefined ? provedRunInGameSource.recipeSettings.seed : String(liveRuntime.seed);
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
      toast("The proved Studio run did not include an applicable restore suggestion.", { variant: "error" });
      return;
    }
    const durablePresetKey =
      provedRunInGameSource.materializationMode === "durable" && provedRunInGameSource.selectedConfig?.id
        ? (`builtin:${provedRunInGameSource.selectedConfig.id}` as PresetKey)
        : null;
    const nextPreset = durablePresetKey && resolvePreset(durablePresetKey) ? durablePresetKey : LIVE_GAME_PRESET_KEY;

    lastAppliedPresetRef.current = {
      key: nextPreset,
      config: provedRunInGameSource.pipelineConfig,
    };
    setWorldSettings(provedRunInGameSource.worldSettings);
    setPipelineConfig(provedRunInGameSource.pipelineConfig);
    setSetupConfig(provedRunInGameSource.setupConfig);
    setOverridesDisabled(false);
    setRecipeSettings({
      ...provedRunInGameSource.recipeSettings,
      seed: liveSeed,
      preset: nextPreset,
    });
    toast(nextPreset === LIVE_GAME_PRESET_KEY ? "Studio synced to live game config" : "Studio synced to live game preset", {
      variant: "success",
    });
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
  ]);

  const handleToggleAutoplay = useCallback(async () => {
    if (autoplayActionRunning || browserRunning || runInGameRunning || saveDeployRunning) return;
    const action = liveRuntime.autoplayActive ? "stop" : "start";
    setAutoplayActionRunning(true);
    try {
      const result = await requestCiv7Autoplay(action);
      if (!result.ok) {
        toast(`Autoplay ${action} failed: ${result.error ?? "unknown error"}`, { variant: "error" });
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
      toast(action === "start" ? "Civ7 autoplay started" : "Civ7 autoplay stopped", { variant: "success" });
    } finally {
      setAutoplayActionRunning(false);
    }
  }, [autoplayActionRunning, browserRunning, liveRuntime.autoplayActive, runInGameRunning, saveDeployRunning, toast]);

  const copyRunInGameDiagnostics = useCallback(async () => {
    if (!runInGameOperation) return;
    try {
      await navigator.clipboard.writeText(formatRunInGameDiagnostics(runInGameOperation));
      toast("Run in Game diagnostics copied", { variant: "info" });
    } catch (err) {
      toast(`Could not copy diagnostics: ${err instanceof Error ? err.message : "clipboard unavailable"}`, { variant: "error" });
    }
  }, [runInGameOperation, toast]);

  const dataTypeModel = viz.dataTypeModel;
  const riverLakeInspectorSummary = useMemo(
    () => buildRiverLakeFloodplainInspectorSummary(viz.manifest),
    [viz.manifest]
  );
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

      const stageMeta = recipeArtifacts.uiMeta.stages.find((s) => s.stageId === stageId);
      const nextStep = stageMeta?.steps[0]?.fullStepId ?? "";
      setSelectedStepId(nextStep);
    },
    [recipeArtifacts.uiMeta.stages, stages]
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

  const handleRiverLakeInspectorLayerSelect = useCallback(
    (ref: RiverLakeInspectorLayerRef) => {
      const stage = recipeArtifacts.uiMeta.stages.find((candidate) =>
        candidate.steps.some((step) => step.fullStepId === ref.stepId)
      );
      if (stage) setSelectedStageId(stage.stageId);
      setSelectedStepId(ref.stepId);
      if (ref.visibility === "debug") viz.setShowDebugLayers(true);
      viz.setSelectedStepId(ref.stepId);
      viz.setSelectedLayerKey(ref.layerKey);
    },
    [recipeArtifacts.uiMeta.stages, viz]
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

  const [headerHeight, setHeaderHeight] = useState<number>(LAYOUT.HEADER_HEIGHT);
  const handleHeaderHeightChange = useCallback((height: number) => {
    setHeaderHeight((prev) => prev === height ? prev : height);
  }, []);
  const panelTop = LAYOUT.SPACING + headerHeight + LAYOUT.SPACING;

  const backgroundGridEnabled = useMemo(() => {
    if (!showGrid) return false;
    const layer = viz.effectiveLayer;
    if (!layer) return false;
    if (!(layer.kind === "points" || layer.kind === "segments")) return false;
    if (layer.meta?.showGrid === false) return false;
    return true;
  }, [showGrid, viz.effectiveLayer]);

  const recipeDagView = (
    <RecipeDagView
      recipeId={recipeSettings.recipe}
      dag={recipeDagState.recipeId === recipeSettings.recipe ? recipeDagState.dag : null}
      status={recipeDagState.recipeId === recipeSettings.recipe ? recipeDagState.status : "idle"}
      error={recipeDagState.recipeId === recipeSettings.recipe ? recipeDagState.error : null}
      lightMode={isLightMode}
      expandedStageIds={expandedRecipeDagStageIds}
      selectedStageId={selectedStageId || null}
      onToggleStage={handleRecipeDagStageToggle}
      onSelectStage={setSelectedStageId}
      topInset={panelTop + 84}
    />
  );

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
          Click Run to generate a map
        </div>
      ) : null}
    </div>
  );

  const lastRunSettings = lastRunSnapshot?.recipeSettings ?? recipeSettings;
  const lastGlobalSettings = lastRunSnapshot?.worldSettings ?? worldSettings;

  const header = (
    <AppHeader
      activeStudioView={activeStudioView}
      onActiveStudioViewChange={setActiveStudioView}
      isLightMode={isLightMode}
      themePreference={themePreference}
      onThemeCycle={cyclePreference}
      showGrid={showGrid}
      onShowGridChange={setShowGrid}
      globalSettings={worldSettings}
      onGlobalSettingsChange={setWorldSettings}
      setupConfig={setupConfig}
      setupOptions={setupControlOptions}
      onSetupConfigChange={setSetupConfig}
      onSavedConfigChange={handleSavedSetupConfigChange}
      statsAccessory={activeStudioView === "dag" ? (
        <RecipeDagStatsBar
          dag={recipeDagState.recipeId === recipeSettings.recipe ? recipeDagState.dag : null}
          recipeId={recipeSettings.recipe}
          lightMode={isLightMode}
        />
      ) : null}
      onHeaderHeightChange={handleHeaderHeightChange}
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
      presetOptions={displayedPresetOptions}
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
      isRunDisabled={runInGameRunning || saveDeployRunning}
      isSaveDeployRunning={saveDeployRunning}
      saveDeployStatus={saveDeployOperation}
      isSaveDisabled={browserRunning || runInGameRunning || saveDeployRunning}
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
      riverLakeInspectorSummary={riverLakeInspectorSummary}
      onRiverLakeInspectorLayerSelect={handleRiverLakeInspectorLayerSelect}
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
      onRunInGame={() => {
        void handleRunInGame({ restartCivProcess: runInGameRequiresProcessRestart(runInGameOperation) });
      }}
      onRunInGameRetryStatus={() => {
        if (runInGameOperation) void refreshRunInGameStatus(runInGameOperation.requestId);
      }}
      onCopyRunInGameDiagnostics={copyRunInGameDiagnostics}
      onReroll={reroll}
      isRunning={browserRunning}
      isRunInGameRunning={runInGameRunning}
      isSaveDeployRunning={saveDeployRunning}
      isAutoplayActionRunning={autoplayActionRunning}
      saveDeployStatus={saveDeployOperation}
      runInGameStatus={runInGameOperation}
      runInGameCurrentRelation={runInGameCurrentRelation}
      isDirty={isDirty}
      lightMode={isLightMode}
      liveRuntime={liveRuntime}
      liveGameStudioRelation={liveGameStudioRelation}
      onSyncFromLiveGame={syncStudioFromLiveGame}
      onToggleAutoplay={handleToggleAutoplay}
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
      {activeStudioView === "dag" ? recipeDagView : canvas}
      {presetDialogs}
      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportFileChange}
      />

      {activeStudioView === "map" ? (
        <>
          <div className="absolute left-4 z-10" style={{ top: panelTop }}>
            {leftPanel}
          </div>
          <div className="absolute right-4 z-10" style={{ top: panelTop }}>
            {rightPanel}
          </div>
        </>
      ) : null}

      {header}
      {footer}

      {activeStudioView === "map" && error ? (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-30 max-w-[min(720px,calc(100%-32px))] rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-2 text-[12px] text-red-200 backdrop-blur-sm"
          style={{ top: panelTop }}
        >
          {error}
        </div>
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
