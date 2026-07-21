import type { MapConfigEnvelope } from "@civ7/studio-contract";
import type { PipelineConfig, SelectOption } from "@swooper/mapgen-studio-ui/types";
import { type ChangeEvent, useCallback, useMemo, useRef } from "react";
import {
  getRecipeDefaultCanonicalConfig,
  replaceCanonicalConfig,
} from "../../features/configAuthoring/canonicalConfig";
import {
  downloadMapConfigFile,
  parseMapConfigFile,
  serializeMapConfigFile,
} from "../../features/configAuthoring/importExport";
import {
  findCatalogConfig,
  findRecipeArtifacts,
  getRecipeArtifacts,
  STUDIO_RECIPE_OPTIONS,
} from "../../recipes/catalog";
import type { AuthoringState } from "../../stores/authoringStore";
import type { ToastFn } from "./useToast";

export type UseConfigAuthoringArgs = Readonly<{
  canonicalConfig: MapConfigEnvelope;
  /** Working-config updates: the baseline stays put. */
  setCanonicalConfig: AuthoringState["setCanonicalConfig"];
  /** Whole-envelope installs: refreshes the working-change baseline too. */
  installCanonicalConfig: AuthoringState["installCanonicalConfig"];
  toast: ToastFn;
}>;

export type UseConfigAuthoringResult = Readonly<{
  recipeArtifacts: ReturnType<typeof getRecipeArtifacts>;
  recipeOptions: ReadonlyArray<SelectOption>;
  configOptions: ReadonlyArray<SelectOption>;
  pipelineConfig: PipelineConfig;
  setPipelineConfig: (next: PipelineConfig) => void;
  selectRecipe: (recipeId: string) => void;
  selectConfig: (configId: string) => void;
  importInputRef: React.RefObject<HTMLInputElement | null>;
  openImport: () => void;
  importFile: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  exportConfig: () => void;
}>;

export function useConfigAuthoring(args: UseConfigAuthoringArgs): UseConfigAuthoringResult {
  const { canonicalConfig, setCanonicalConfig, installCanonicalConfig, toast } = args;
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const recipeArtifacts = getRecipeArtifacts(canonicalConfig.recipe);
  const pipelineConfig = canonicalConfig.config;

  const recipeOptions = useMemo(
    () => STUDIO_RECIPE_OPTIONS.map((recipe) => ({ value: recipe.id, label: recipe.label })),
    []
  );
  const configOptions = useMemo(() => {
    const catalog = recipeArtifacts.catalogConfigs.map((config) => ({
      value: config.id,
      label: config.name,
    }));
    return catalog.some((option) => option.value === canonicalConfig.id)
      ? catalog
      : [{ value: canonicalConfig.id, label: canonicalConfig.name }, ...catalog];
  }, [canonicalConfig.id, canonicalConfig.name, recipeArtifacts.catalogConfigs]);

  // Whole-envelope installs (recipe select, config select, import) refresh
  // the working-change baseline; pipeline edits below go through
  // `setCanonicalConfig` and leave it untouched.
  const install = useCallback(
    (next: MapConfigEnvelope) => {
      installCanonicalConfig(next);
    },
    [installCanonicalConfig]
  );

  const setPipelineConfig = useCallback(
    (next: PipelineConfig) => {
      const updated = replaceCanonicalConfig(canonicalConfig, next);
      if (updated === undefined) {
        toast("Config edit failed: the value is invalid for this recipe.", { variant: "error" });
        return;
      }
      setCanonicalConfig(updated);
    },
    [canonicalConfig, setCanonicalConfig, toast]
  );

  const selectRecipe = useCallback(
    (recipeId: string) => {
      const recipe = findRecipeArtifacts(recipeId);
      if (recipe === null) {
        toast(`Recipe is not available: ${recipeId}`, { variant: "error" });
        return;
      }
      install(getRecipeDefaultCanonicalConfig(recipeId));
    },
    [install, toast]
  );

  const selectConfig = useCallback(
    (configId: string) => {
      if (configId === canonicalConfig.id) return;
      const next = findCatalogConfig(canonicalConfig.recipe, configId);
      if (next === null) {
        toast(`Config is not available: ${configId}`, { variant: "error" });
        return;
      }
      install(next);
    },
    [canonicalConfig.id, canonicalConfig.recipe, install, toast]
  );

  const exportConfig = useCallback(() => {
    const file = serializeMapConfigFile(canonicalConfig);
    downloadMapConfigFile(file.filename, file.json);
    toast("Config exported", { variant: "success" });
  }, [canonicalConfig, toast]);

  const openImport = useCallback(() => importInputRef.current?.click(), []);
  const importFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (file === undefined) return;
      const parsed = parseMapConfigFile(await file.text());
      if (!parsed.ok) {
        toast(`Config import failed: ${parsed.message}`, { variant: "error" });
        return;
      }
      install(parsed.value);
      toast("Config imported", { variant: "success" });
    },
    [install, toast]
  );

  return {
    recipeArtifacts,
    recipeOptions,
    configOptions,
    pipelineConfig,
    setPipelineConfig,
    selectRecipe,
    selectConfig,
    importInputRef,
    openImport,
    importFile,
    exportConfig,
  };
}
