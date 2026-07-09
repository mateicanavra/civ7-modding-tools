import {
  type StudioPresetExportFileV1,
} from "@swooper/mapgen-core/authoring";
import type {
  PipelineConfig,
  RecipeSettings,
  WorldSettings,
} from "@swooper/mapgen-studio-ui/types";
import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Civ7StudioSetupConfig } from "../../features/civ7Setup/setupConfig";
import {
  type AppliedPresetSnapshot,
  applyPresetConfig,
  formatPresetErrors,
  isPlainObject,
} from "../../features/configOverrides/configBuilders";
import { getMaterializedRecipeDefaultConfig } from "../../features/configOverrides/effectiveConfig";
import type { PresetErrorState } from "../../features/presets/dialogState";
import {
  buildPresetExportFile,
  downloadPresetFile,
  parsePresetExportFile,
} from "../../features/presets/importExport";
import { resolveImportedPreset } from "../../features/presets/importFlow";
import { mergeBuiltInPresetsWithSessionPresets } from "../../features/presets/repoBacked";
import { type PresetKey, parsePresetKey } from "../../features/presets/types";
import { type LivePreset, usePresets } from "../../features/presets/usePresets";
import { type BuiltInPreset, findRecipeArtifacts, getRecipeArtifacts } from "../../recipes/catalog";
import type { AuthoringState } from "../../stores/authoringStore";
import type { RunState } from "../../stores/runStore";
import type { ToastFn } from "./useToast";

/**
 * The fully-resolved authoring snapshot consumed by {@link applyAuthoringSnapshot}.
 * `recipeSettings` is computed by the caller (the run-in-game sync path) — the hook
 * performs the ordered 5-setter write, it does not reshape the payload.
 */
export type AuthoringSnapshotInput = {
  key: PresetKey;
  worldSettings: WorldSettings;
  pipelineConfig: PipelineConfig;
  setupConfig: Civ7StudioSetupConfig;
  recipeSettings: RecipeSettings;
};

export type UsePresetLifecycleArgs = {
  /** Authoring recipe/preset selection — drives the catalog + apply-effects. */
  recipeSettings: RecipeSettings;
  /** Session-only configs saved before the generated recipe catalog reloads. */
  repoBackedSessionPresetsByRecipe: Record<string, Record<string, BuiltInPreset>>;
  /**
   * Host-owned live-preset projection (cycle break, design.md §7.6) threaded in so
   * `resolvePreset(LIVE_GAME_PRESET_KEY).config` stays referentially the proved
   * `lastRunInGameSource.pipelineConfig` — the live-sync identity invariant (ADD-1b).
   */
  livePresets: ReadonlyArray<LivePreset>;
  /** Current authoring pipeline config — the export handler's fallback source. */
  pipelineConfig: PipelineConfig;
  setWorldSettings: AuthoringState["setWorldSettings"];
  setSetupConfig: AuthoringState["setSetupConfig"];
  setPipelineConfig: AuthoringState["setPipelineConfig"];
  setOverridesDisabled: AuthoringState["setOverridesDisabled"];
  setRecipeSettings: AuthoringState["setRecipeSettings"];
  setRepoBackedSessionPresetsByRecipe: AuthoringState["setRepoBackedSessionPresetsByRecipe"];
  setLastRunSnapshot: RunState["setLastRunSnapshot"];
  toast: ToastFn;
};

export type UsePresetLifecycleResult = {
  recipeArtifacts: ReturnType<typeof getRecipeArtifacts>;
  builtInPresets: ReadonlyArray<BuiltInPreset>;
  presetOptions: ReturnType<typeof usePresets>["options"];
  resolvePreset: ReturnType<typeof usePresets>["resolvePreset"];
  presetActions: ReturnType<typeof usePresets>["actions"];
  isLocalPresetSelected: boolean;
  presetError: PresetErrorState | null;
  setPresetError: (next: PresetErrorState | null) => void;
  pendingImport: StudioPresetExportFileV1 | null;
  importInputRef: React.RefObject<HTMLInputElement | null>;
  /**
   * The single synchronous writer of `lastAppliedPresetRef` for OUT-OF-EFFECT
   * callers (save + run-in-game). Stores the same `{key, config}` object — no
   * clone/normalize — so the apply-effect skip-guard
   * (`lastApplied.config === resolved.config`) short-circuits a redundant
   * re-apply (ADD-1).
   */
  markPresetApplied: (snapshot: AppliedPresetSnapshot) => void;
  /**
   * The ordered authoring write used by run-in-game sync: `markPresetApplied`
   * FIRST, then `setWorldSettings → setPipelineConfig → setSetupConfig →
   * setOverridesDisabled(false) → setRecipeSettings` (LAST). The `config` recorded
   * is `snapshot.pipelineConfig` (the same object set into the store) — live-sync
   * identity (ADD-1b).
   */
  applyAuthoringSnapshot: (snapshot: AuthoringSnapshotInput) => void;
  applyRecipeSettingsChange: (next: RecipeSettings) => void;
  rememberRepoBackedConfig: (recipeId: string, preset: BuiltInPreset) => void;
  handleDeletePreset: () => void;
  handleExportPreset: () => void;
  handleImportPreset: () => void;
  handleImportFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  confirmImportSwitch: () => void;
  cancelImportSwitch: () => void;
};

/**
 * `usePresetLifecycle` — owns the preset catalog/local-preset surface, the
 * recipe-artifact projection, the two Tier-A preset apply-effects, and the
 * `lastAppliedPresetRef` (this hook is its SOLE owner and reader). It synthesizes
 * the two cross-hook contracts the save + run-in-game owners drive through it
 * (`markPresetApplied`, `applyAuthoringSnapshot`).
 *
 * Live-source-aware derivations (`provedRunInGameSource`, `livePresets`,
 * `displayedPresetOptions`, `runInGameMaterializationMode`,
 * `studioMatchesProvedLiveSource`) stay in the host (design.md §7.6) and the
 * live-preset projection is threaded IN so `resolvePreset` can see it without the
 * hook reaching into run-state.
 */
export function usePresetLifecycle(args: UsePresetLifecycleArgs): UsePresetLifecycleResult {
  const {
    recipeSettings,
    repoBackedSessionPresetsByRecipe,
    livePresets,
    pipelineConfig,
    setWorldSettings,
    setSetupConfig,
    setPipelineConfig,
    setOverridesDisabled,
    setRecipeSettings,
    setRepoBackedSessionPresetsByRecipe,
    setLastRunSnapshot,
    toast,
  } = args;

  const [presetError, setPresetError] = useState<PresetErrorState | null>(null);
  const [pendingImport, setPendingImport] = useState<StudioPresetExportFileV1 | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const lastAppliedPresetRef = useRef<AppliedPresetSnapshot | null>(null);
  const lastPresetKeyRef = useRef(recipeSettings.preset);
  const lastRecipeIdRef = useRef(recipeSettings.recipe);

  const recipeArtifacts = useMemo(
    () => getRecipeArtifacts(recipeSettings.recipe),
    [recipeSettings.recipe]
  );
  const builtInPresets = useMemo(() => {
    const catalogPresets = (recipeArtifacts.studioBuiltInPresets ?? []).map((preset) => ({
      ...preset,
      catalogSourceId: preset.id,
    }));
    return mergeBuiltInPresetsWithSessionPresets(
      catalogPresets,
      repoBackedSessionPresetsByRecipe[recipeSettings.recipe] ?? {}
    );
  }, [
    recipeArtifacts.studioBuiltInPresets,
    recipeSettings.recipe,
    repoBackedSessionPresetsByRecipe,
  ]);
  const {
    options: presetOptions,
    resolvePreset,
    actions: presetActions,
    loadWarning,
  } = usePresets({
    recipeId: recipeSettings.recipe,
    builtIns: builtInPresets,
    livePresets,
  });
  const isLocalPresetSelected = parsePresetKey(recipeSettings.preset).kind === "local";

  useEffect(() => {
    const previousPreset = lastPresetKeyRef.current;
    const previousRecipe = lastRecipeIdRef.current;
    lastPresetKeyRef.current = recipeSettings.preset;
    lastRecipeIdRef.current = recipeSettings.recipe;
    if (parsePresetKey(recipeSettings.preset).kind !== "none") return;
    if (previousPreset === recipeSettings.preset && previousRecipe === recipeSettings.recipe)
      return;
    setPipelineConfig(getMaterializedRecipeDefaultConfig(recipeSettings.recipe, "preset-none"));
    setOverridesDisabled(false);
    setLastRunSnapshot(null);
    lastAppliedPresetRef.current = null;
  }, [
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- This effect applies the selected preset: it resolves the preset, validates it, surfaces toasts, and on failure records the error. The interleaved side effects (toast, resolvePreset, applyPresetConfig) make it genuinely effect-shaped, not render-derivable.
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
      presetConfig: resolved.config,
      label: resolved.label,
    });
    if (!applied.ok) {
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
    recipeSettings.preset,
    toast,
  ]);

  useEffect(() => {
    if (!loadWarning) return;
    toast(loadWarning, { variant: "info" });
  }, [loadWarning, toast]);

  const markPresetApplied = useCallback((snapshot: AppliedPresetSnapshot) => {
    lastAppliedPresetRef.current = snapshot;
  }, []);

  const applyAuthoringSnapshot = useCallback(
    (snapshot: AuthoringSnapshotInput) => {
      markPresetApplied({ key: snapshot.key, config: snapshot.pipelineConfig });
      lastPresetKeyRef.current = snapshot.recipeSettings.preset;
      lastRecipeIdRef.current = snapshot.recipeSettings.recipe;
      setWorldSettings(snapshot.worldSettings);
      setPipelineConfig(snapshot.pipelineConfig);
      setSetupConfig(snapshot.setupConfig);
      setOverridesDisabled(false);
      setRecipeSettings(snapshot.recipeSettings);
    },
    [
      markPresetApplied,
      setWorldSettings,
      setPipelineConfig,
      setSetupConfig,
      setOverridesDisabled,
      setRecipeSettings,
    ]
  );

  const applyRecipeSettingsChange = useCallback(
    (next: RecipeSettings) => {
      const nextSettings =
        next.recipe !== recipeSettings.recipe ? { ...next, preset: "none" } : next;
      const recipeChanged = nextSettings.recipe !== recipeSettings.recipe;
      const presetChanged = nextSettings.preset !== recipeSettings.preset;

      if (recipeChanged || presetChanged) {
        const parsed = parsePresetKey(nextSettings.preset);
        if (parsed.kind === "none") {
          const defaultConfig = getMaterializedRecipeDefaultConfig(
            nextSettings.recipe,
            recipeChanged ? "recipe-switch" : "preset-none"
          );
          lastPresetKeyRef.current = nextSettings.preset;
          lastRecipeIdRef.current = nextSettings.recipe;
          lastAppliedPresetRef.current = null;
          setPipelineConfig(defaultConfig);
          setOverridesDisabled(false);
          setLastRunSnapshot(null);
          setRecipeSettings(nextSettings);
          return;
        }

        const key = nextSettings.preset as PresetKey;
        const resolved = resolvePreset(key);
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
          presetConfig: resolved.config,
          label: resolved.label,
        });
        if (!applied.ok) {
          toast("Preset invalid", { variant: "error" });
          setPresetError({
            title: "Preset invalid",
            message: "The selected preset failed schema validation.",
            details: formatPresetErrors(applied.errors),
          });
          return;
        }
        lastPresetKeyRef.current = nextSettings.preset;
        lastRecipeIdRef.current = nextSettings.recipe;
        lastAppliedPresetRef.current = { key, config: resolved.config };
        setPipelineConfig(applied.value);
        setOverridesDisabled(false);
        setLastRunSnapshot(null);
        setRecipeSettings(nextSettings);
        return;
      }

      setRecipeSettings(nextSettings);
    },
    [
      recipeArtifacts.configSchema,
      recipeSettings.preset,
      recipeSettings.recipe,
      resolvePreset,
      setLastRunSnapshot,
      setOverridesDisabled,
      setPipelineConfig,
      setRecipeSettings,
      toast,
    ]
  );

  const rememberRepoBackedConfig = useCallback(
    (recipeId: string, preset: BuiltInPreset) => {
      setRepoBackedSessionPresetsByRecipe((prev) => ({
        ...prev,
        [recipeId]: {
          ...(prev[recipeId] ?? {}),
          [preset.id]: preset,
        },
      }));
    },
    [setRepoBackedSessionPresetsByRecipe]
  );

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
      toast(`Scratch config deleted but could not persist: ${result.persistenceError}`, {
        variant: "error",
      });
    } else {
      toast("Scratch config deleted", { variant: "success" });
    }
    if (result.deleted) {
      applyRecipeSettingsChange({ ...recipeSettings, preset: "none" });
    }
  }, [applyRecipeSettingsChange, presetActions, recipeSettings, toast]);

  const handleExportPreset = useCallback(() => {
    const key = recipeSettings.preset as PresetKey;
    const resolved = resolvePreset(key);
    const config = resolved ? resolved.config : pipelineConfig;
    if (!isPlainObject(config)) {
      toast("Preset export failed: config must be an object", { variant: "error" });
      return;
    }
    const validated = applyPresetConfig({
      schema: recipeArtifacts.configSchema,
      presetConfig: config,
      label: "export",
    });
    if (!validated.ok) {
      toast("Preset export failed: config is invalid for this recipe", { variant: "error" });
      setPresetError({
        title: "Preset export failed",
        message: "The selected config failed schema validation.",
        details: formatPresetErrors(validated.errors),
      });
      return;
    }
    const payload = resolved
      ? {
          label: resolved.label,
          description: resolved.description,
          config: validated.value as Record<string, unknown>,
        }
      : {
          label: "Current Config",
          config: validated.value as Record<string, unknown>,
        };
    const built = buildPresetExportFile({ recipeId: recipeSettings.recipe, preset: payload });
    downloadPresetFile(built.filename, built.json);
    toast("Preset exported", { variant: "success" });
  }, [
    pipelineConfig,
    recipeArtifacts.configSchema,
    recipeSettings.preset,
    recipeSettings.recipe,
    resolvePreset,
    toast,
  ]);

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
        toast(`Preset imported but could not persist: ${result.persistenceError}`, {
          variant: "error",
        });
      } else {
        toast("Preset imported", { variant: "success" });
      }
      const key = `local:${result.preset.id}` as PresetKey;
      markPresetApplied({ key, config: resolved.config });
      lastPresetKeyRef.current = key;
      lastRecipeIdRef.current = resolved.recipeId;
      setPipelineConfig(resolved.config);
      setOverridesDisabled(false);
      setLastRunSnapshot(null);
      setRecipeSettings({
        ...recipeSettings,
        recipe: resolved.recipeId,
        preset: key,
      });
    },
    [
      markPresetApplied,
      presetActions,
      recipeSettings,
      setLastRunSnapshot,
      setOverridesDisabled,
      setPipelineConfig,
      setRecipeSettings,
      toast,
    ]
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

  return {
    recipeArtifacts,
    builtInPresets,
    presetOptions,
    resolvePreset,
    presetActions,
    isLocalPresetSelected,
    presetError,
    setPresetError,
    pendingImport,
    importInputRef,
    markPresetApplied,
    applyAuthoringSnapshot,
    applyRecipeSettingsChange,
    rememberRepoBackedConfig,
    handleDeletePreset,
    handleExportPreset,
    handleImportPreset,
    handleImportFileChange,
    confirmImportSwitch,
    cancelImportSwitch,
  };
}
