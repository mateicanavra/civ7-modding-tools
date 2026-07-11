import type { MapConfigEnvelope } from "@civ7/studio-contract";
import { type StudioPresetExportFileV1 } from "@swooper/mapgen-core/authoring";
import type { PipelineConfig, RecipeSettings } from "@swooper/mapgen-studio-ui/types";
import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applyPresetConfig,
  createStudioEditorCanonicalConfig,
  formatPresetErrors,
  getRecipeDefaultConfig,
  isPlainObject,
} from "../../features/configAuthoring/canonicalConfig";
import type { PresetErrorState } from "../../features/presets/dialogState";
import {
  buildPresetExportFile,
  downloadPresetFile,
  parsePresetExportFile,
} from "../../features/presets/importExport";
import { resolveImportedPreset } from "../../features/presets/importFlow";
import { type AuthoringConfigSource, parsePresetKey } from "../../features/presets/types";
import { usePresets } from "../../features/presets/usePresets";
import { type BuiltInPreset, findRecipeArtifacts, getRecipeArtifacts } from "../../recipes/catalog";
import type { AuthoringState } from "../../stores/authoringStore";
import type { RunState } from "../../stores/runStore";
import type { ToastFn } from "./useToast";

export type UsePresetLifecycleArgs = {
  recipeSettings: RecipeSettings;
  authoringConfigSource: AuthoringConfigSource;
  setAuthoringConfigSource: AuthoringState["setAuthoringConfigSource"];
  setAuthoringSelection: AuthoringState["setAuthoringSelection"];
  setConfigEditingEnabled: AuthoringState["setConfigEditingEnabled"];
  setRecipeSettings: AuthoringState["setRecipeSettings"];
  setLastRunSnapshot: RunState["setLastRunSnapshot"];
  toast: ToastFn;
};

export type UsePresetLifecycleResult = {
  recipeArtifacts: ReturnType<typeof getRecipeArtifacts>;
  builtInPresets: ReadonlyArray<BuiltInPreset>;
  presetOptions: ReturnType<typeof usePresets>["options"];
  resolvePreset: ReturnType<typeof usePresets>["resolvePreset"];
  pipelineConfig: PipelineConfig | null;
  setPipelineConfig: (next: PipelineConfig) => void;
  canSaveToCurrent: boolean;
  presetError: PresetErrorState | null;
  setPresetError: (next: PresetErrorState | null) => void;
  pendingImport: StudioPresetExportFileV1 | null;
  importInputRef: React.RefObject<HTMLInputElement | null>;
  applyRecipeSettingsChange: (next: RecipeSettings) => void;
  isAuthoringBlocked: boolean;
  authoringBlockReason: "missing-catalog-source" | "invalid-persistence" | null;
  recoverWithCatalogConfig: () => void;
  recoverWithNewEditorConfig: () => void;
  adoptSavedEditorConfig: (canonicalConfig: MapConfigEnvelope) => void;
  handleExportPreset: () => void;
  handleImportPreset: () => void;
  handleImportFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  confirmImportSwitch: () => void;
  cancelImportSwitch: () => void;
};

function editorCanonicalConfig(args: {
  config: unknown;
  existing?: MapConfigEnvelope;
}): MapConfigEnvelope {
  const { existing } = args;
  return createStudioEditorCanonicalConfig({
    ...(existing === undefined
      ? {}
      : {
          metadata: {
            id: existing.id,
            name: existing.name,
            description: existing.description,
            recipe: "standard",
            sortIndex: existing.sortIndex,
            latitudeBounds: existing.latitudeBounds,
          },
        }),
    config: args.config,
  });
}

/**
 * Owns selection changes and converts a catalog edit to one editor-owned
 * envelope before any authoring state changes.
 */
export function usePresetLifecycle(args: UsePresetLifecycleArgs): UsePresetLifecycleResult {
  const {
    recipeSettings,
    authoringConfigSource,
    setAuthoringConfigSource,
    setAuthoringSelection,
    setConfigEditingEnabled,
    setRecipeSettings,
    setLastRunSnapshot,
    toast,
  } = args;
  const [presetError, setPresetError] = useState<PresetErrorState | null>(null);
  const [pendingImport, setPendingImport] = useState<StudioPresetExportFileV1 | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const previousSelectionRef = useRef({
    recipe: recipeSettings.recipe,
    preset: recipeSettings.preset,
  });

  const recipeArtifacts = useMemo(
    () => getRecipeArtifacts(recipeSettings.recipe),
    [recipeSettings.recipe]
  );
  // Catalog entries resolve from generated recipe artifacts, never session data.
  const builtInPresets = recipeArtifacts.studioBuiltInPresets ?? [];
  const { options: presetOptions, resolvePreset } = usePresets({
    recipeId: recipeSettings.recipe,
    builtIns: builtInPresets,
  });
  const catalogCanonicalConfig = useMemo(
    () =>
      authoringConfigSource.kind === "catalog"
        ? (builtInPresets.find((preset) => preset.sourcePath === authoringConfigSource.sourcePath)
            ?.canonicalConfig ?? null)
        : null,
    [authoringConfigSource, builtInPresets]
  );
  const canonicalConfig =
    authoringConfigSource.kind === "editor"
      ? authoringConfigSource.canonicalConfig
      : authoringConfigSource.kind === "catalog"
        ? catalogCanonicalConfig
        : null;
  const resolvedPipelineConfig = useMemo(
    () =>
      canonicalConfig === null
        ? null
        : applyPresetConfig({
            schema: recipeArtifacts.configSchema,
            presetConfig: canonicalConfig.config,
            label: "current-authoring",
          }),
    [canonicalConfig, recipeArtifacts.configSchema]
  );
  const pipelineConfig = resolvedPipelineConfig?.ok ? resolvedPipelineConfig.value : null;
  const isAuthoringBlocked = pipelineConfig === null;
  const canSaveToCurrent = authoringConfigSource.kind === "editor";

  const validateCanonicalConfig = useCallback(
    (canonicalConfig: MapConfigEnvelope, label: string): boolean => {
      const applied = applyPresetConfig({
        schema: recipeArtifacts.configSchema,
        presetConfig: canonicalConfig.config,
        label,
      });
      if (applied.ok) return true;
      toast("Preset invalid", { variant: "error" });
      setPresetError({
        title: "Preset invalid",
        message: "The selected preset failed schema validation.",
        details: formatPresetErrors(applied.errors),
      });
      return false;
    },
    [recipeArtifacts.configSchema, toast]
  );

  const applyResolvedPreset = useCallback(
    (key: string, nextRecipeSettings: RecipeSettings): boolean => {
      const resolved = resolvePreset(key);
      if (!resolved) {
        toast("Preset not found", { variant: "error" });
        setPresetError({
          title: "Preset not found",
          message: "The selected preset could not be resolved for this recipe.",
        });
        return false;
      }
      if (!validateCanonicalConfig(resolved.canonicalConfig, resolved.label)) return false;
      const nextSource: AuthoringConfigSource = {
        kind: "catalog",
        sourcePath: resolved.sourcePath,
      };
      const appliedRecipeSettings = nextRecipeSettings;
      previousSelectionRef.current = {
        recipe: appliedRecipeSettings.recipe,
        preset: appliedRecipeSettings.preset,
      };
      setConfigEditingEnabled(true);
      setLastRunSnapshot(null);
      setAuthoringSelection(nextSource, appliedRecipeSettings);
      return true;
    },
    [
      resolvePreset,
      setAuthoringSelection,
      setLastRunSnapshot,
      setConfigEditingEnabled,
      toast,
      validateCanonicalConfig,
    ]
  );

  useEffect(() => {
    if (
      previousSelectionRef.current.recipe === recipeSettings.recipe &&
      previousSelectionRef.current.preset === recipeSettings.preset
    ) {
      return;
    }
    previousSelectionRef.current = {
      recipe: recipeSettings.recipe,
      preset: recipeSettings.preset,
    };
    const parsed = parsePresetKey(recipeSettings.preset);
    if (parsed.kind === "none") {
      setAuthoringSelection(
        {
          kind: "editor",
          canonicalConfig: editorCanonicalConfig({
            config: getRecipeDefaultConfig(recipeSettings.recipe, "preset-none"),
          }),
        },
        recipeSettings
      );
      setConfigEditingEnabled(true);
      setLastRunSnapshot(null);
      return;
    }
    const resolved = resolvePreset(recipeSettings.preset);
    if (!resolved || !validateCanonicalConfig(resolved.canonicalConfig, resolved.label)) return;
    setAuthoringSelection({ kind: "catalog", sourcePath: resolved.sourcePath }, recipeSettings);
    setConfigEditingEnabled(true);
    setLastRunSnapshot(null);
  }, [
    recipeSettings,
    resolvePreset,
    setAuthoringSelection,
    setLastRunSnapshot,
    setConfigEditingEnabled,
    validateCanonicalConfig,
  ]);

  const setPipelineConfig = useCallback(
    (next: PipelineConfig) => {
      if (isAuthoringBlocked) {
        toast("Recover the authoring source before editing config.", { variant: "info" });
        return;
      }
      let nextCanonicalConfig: MapConfigEnvelope;
      try {
        nextCanonicalConfig = editorCanonicalConfig({
          config: next,
          ...(authoringConfigSource.kind === "editor" && canonicalConfig !== null
            ? { existing: canonicalConfig }
            : {}),
        });
      } catch {
        toast("Config edit failed: config is invalid for this recipe.", { variant: "error" });
        return;
      }
      const applied = applyPresetConfig({
        schema: recipeArtifacts.configSchema,
        presetConfig: nextCanonicalConfig.config,
        label: "editor",
      });
      if (!applied.ok) {
        toast("Config edit failed: config is invalid for this recipe.", { variant: "error" });
        return;
      }
      if (authoringConfigSource.kind === "catalog") {
        const nextSettings = { ...recipeSettings, preset: "none" };
        previousSelectionRef.current = {
          recipe: nextSettings.recipe,
          preset: nextSettings.preset,
        };
        setAuthoringSelection(
          { kind: "editor", canonicalConfig: nextCanonicalConfig },
          nextSettings
        );
      } else {
        setAuthoringConfigSource({ kind: "editor", canonicalConfig: nextCanonicalConfig });
      }
    },
    [
      authoringConfigSource,
      canonicalConfig,
      isAuthoringBlocked,
      recipeArtifacts.configSchema,
      recipeSettings,
      setAuthoringConfigSource,
      setAuthoringSelection,
      toast,
    ]
  );

  const applyRecipeSettingsChange = useCallback(
    (next: RecipeSettings) => {
      if (isAuthoringBlocked) {
        toast("Recover the authoring source before changing config selection.", {
          variant: "info",
        });
        return;
      }
      const nextSettings =
        next.recipe === recipeSettings.recipe ? next : { ...next, preset: "none" };
      if (
        nextSettings.recipe === recipeSettings.recipe &&
        nextSettings.preset === recipeSettings.preset
      ) {
        setRecipeSettings(nextSettings);
        return;
      }
      if (parsePresetKey(nextSettings.preset).kind !== "none") {
        applyResolvedPreset(nextSettings.preset, nextSettings);
        return;
      }
      const nextCanonicalConfig = editorCanonicalConfig({
        config: getRecipeDefaultConfig(
          nextSettings.recipe,
          nextSettings.recipe === recipeSettings.recipe ? "preset-none" : "recipe-switch"
        ),
      });
      previousSelectionRef.current = {
        recipe: nextSettings.recipe,
        preset: nextSettings.preset,
      };
      setAuthoringSelection({ kind: "editor", canonicalConfig: nextCanonicalConfig }, nextSettings);
      setConfigEditingEnabled(true);
      setLastRunSnapshot(null);
    },
    [
      applyResolvedPreset,
      isAuthoringBlocked,
      recipeSettings.preset,
      recipeSettings.recipe,
      setAuthoringSelection,
      setLastRunSnapshot,
      setConfigEditingEnabled,
      setRecipeSettings,
      toast,
    ]
  );

  const recoverWithCatalogConfig = useCallback(() => {
    const catalog = builtInPresets[0];
    if (!catalog) {
      toast("No catalog config is available for this recipe.", { variant: "error" });
      return;
    }
    const nextSettings = {
      ...recipeSettings,
      preset: `builtin:${catalog.canonicalConfig.id}`,
    };
    previousSelectionRef.current = {
      recipe: nextSettings.recipe,
      preset: nextSettings.preset,
    };
    setAuthoringSelection({ kind: "catalog", sourcePath: catalog.sourcePath }, nextSettings);
    setConfigEditingEnabled(true);
    setLastRunSnapshot(null);
  }, [
    builtInPresets,
    recipeSettings,
    setAuthoringSelection,
    setLastRunSnapshot,
    setConfigEditingEnabled,
    toast,
  ]);

  const recoverWithNewEditorConfig = useCallback(() => {
    const nextSettings = { ...recipeSettings, preset: "none" };
    const canonicalConfig = editorCanonicalConfig({
      config: getRecipeDefaultConfig(recipeSettings.recipe, "recovery-new-editor"),
    });
    previousSelectionRef.current = {
      recipe: nextSettings.recipe,
      preset: nextSettings.preset,
    };
    setAuthoringSelection({ kind: "editor", canonicalConfig }, nextSettings);
    setConfigEditingEnabled(true);
    setLastRunSnapshot(null);
  }, [recipeSettings, setAuthoringSelection, setConfigEditingEnabled, setLastRunSnapshot]);

  const adoptSavedEditorConfig = useCallback(
    (canonicalConfig: MapConfigEnvelope) => {
      const nextSettings = { ...recipeSettings, preset: "none" };
      previousSelectionRef.current = { recipe: nextSettings.recipe, preset: nextSettings.preset };
      setAuthoringSelection({ kind: "editor", canonicalConfig }, nextSettings);
    },
    [recipeSettings, setAuthoringSelection]
  );

  const handleExportPreset = useCallback(() => {
    if (canonicalConfig === null) {
      toast("Recover the authoring source before exporting config.", { variant: "info" });
      return;
    }
    if (pipelineConfig === null || !isPlainObject(pipelineConfig)) {
      toast("Preset export failed: config must be an object", { variant: "error" });
      return;
    }
    const applied = applyPresetConfig({
      schema: recipeArtifacts.configSchema,
      presetConfig: pipelineConfig,
      label: "export",
    });
    if (!applied.ok) {
      toast("Preset export failed: config is invalid for this recipe", { variant: "error" });
      setPresetError({
        title: "Preset export failed",
        message: "The selected config failed schema validation.",
        details: formatPresetErrors(applied.errors),
      });
      return;
    }
    const built = buildPresetExportFile({
      recipeId: recipeSettings.recipe,
      preset: {
        label: canonicalConfig.name,
        description: canonicalConfig.description,
        config: pipelineConfig,
      },
    });
    downloadPresetFile(built.filename, built.json);
    toast("Preset exported", { variant: "success" });
  }, [canonicalConfig, pipelineConfig, recipeArtifacts.configSchema, recipeSettings.recipe, toast]);

  const importPresetValue = useCallback(
    (presetFile: StudioPresetExportFileV1) => {
      const resolved = resolveImportedPreset({ presetFile, findRecipeArtifacts });
      if (!resolved.ok) {
        toast("Preset import failed", { variant: "error" });
        setPresetError({
          title: resolved.kind === "unknown-recipe" ? "Unknown recipe" : "Preset invalid",
          message: resolved.message,
          details: resolved.details,
        });
        return;
      }
      let nextCanonicalConfig: MapConfigEnvelope;
      try {
        nextCanonicalConfig = editorCanonicalConfig({
          config: resolved.config,
          existing: createStudioEditorCanonicalConfig({
            metadata: {
              id: `import-${Date.now().toString(36)}`,
              name: resolved.label,
              description: resolved.description ?? "Imported Studio editor configuration.",
              recipe: "standard",
              sortIndex: 9999,
              latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
            },
          }),
        });
      } catch {
        toast("Preset import failed", { variant: "error" });
        return;
      }
      const nextSettings = { ...recipeSettings, recipe: resolved.recipeId, preset: "none" };
      previousSelectionRef.current = { recipe: resolved.recipeId, preset: "none" };
      setAuthoringSelection({ kind: "editor", canonicalConfig: nextCanonicalConfig }, nextSettings);
      setConfigEditingEnabled(true);
      setLastRunSnapshot(null);
      toast("Preset imported", { variant: "success" });
    },
    [recipeSettings, setAuthoringSelection, setConfigEditingEnabled, setLastRunSnapshot, toast]
  );

  const handleImportPreset = useCallback(() => importInputRef.current?.click(), []);
  const handleImportFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      const parsed = parsePresetExportFile(await file.text());
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
    setPendingImport(null);
    importPresetValue(pendingImport);
  }, [importPresetValue, pendingImport]);
  const cancelImportSwitch = useCallback(() => setPendingImport(null), []);

  return {
    recipeArtifacts,
    builtInPresets,
    presetOptions,
    resolvePreset,
    pipelineConfig,
    setPipelineConfig,
    canSaveToCurrent,
    presetError,
    setPresetError,
    pendingImport,
    importInputRef,
    applyRecipeSettingsChange,
    isAuthoringBlocked,
    authoringBlockReason: isAuthoringBlocked
      ? authoringConfigSource.kind === "blocked"
        ? authoringConfigSource.reason
        : authoringConfigSource.kind === "catalog"
          ? "missing-catalog-source"
          : "invalid-persistence"
      : null,
    recoverWithCatalogConfig,
    recoverWithNewEditorConfig,
    adoptSavedEditorConfig,
    handleExportPreset,
    handleImportPreset,
    handleImportFileChange,
    confirmImportSwitch,
    cancelImportSwitch,
  };
}
