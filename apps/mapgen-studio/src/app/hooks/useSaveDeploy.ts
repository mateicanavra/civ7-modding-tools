import {
  isMapConfigEnvelope,
  type MapConfigEnvelope,
  type MapConfigSaveDeployStatus,
} from "@civ7/studio-contract";
import type { PipelineConfig } from "@swooper/mapgen-studio-ui/types";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyPresetConfig,
  createStudioEditorCanonicalConfig,
  STUDIO_EDITOR_CANONICAL_METADATA,
} from "../../features/configAuthoring/canonicalConfig";
import { saveRepoBackedConfig, toConfigId } from "../../features/mapConfigSave/api";
import {
  createMapConfigSaveDeployStatus,
  isSaveDeployTerminal,
  saveDeployFailureMessage,
  saveDeployResultFromTerminalStatus,
} from "../../features/mapConfigSave/status";
import type { AuthoringConfigSource } from "../../features/presets/types";
import { findRecipeArtifacts } from "../../recipes/catalog";
import type { StudioOperations } from "./useStudioOperations";
import type { ToastFn } from "./useToast";

const SAVE_DEPLOY_TERMINAL_EVENT_TIMEOUT_MS = 5 * 60_000;

type SaveDeployTerminalWaiter = Readonly<{
  resolve(status: MapConfigSaveDeployStatus): void;
  reject(error: Error): void;
  timeoutId: ReturnType<typeof setTimeout>;
}>;

function createNamedEditorCanonicalConfig(args: {
  id: string;
  name: string;
  description?: string;
  config: PipelineConfig;
}): MapConfigEnvelope {
  return createStudioEditorCanonicalConfig({
    metadata: {
      id: args.id,
      name: args.name,
      description: args.description ?? "Studio editor configuration.",
      recipe: "standard",
      sortIndex: STUDIO_EDITOR_CANONICAL_METADATA.sortIndex,
      latitudeBounds: STUDIO_EDITOR_CANONICAL_METADATA.latitudeBounds,
    },
    config: args.config,
  });
}

function isValidEditorCanonicalConfig(args: {
  recipeId: string;
  canonicalConfig: MapConfigEnvelope;
}): boolean {
  const recipeArtifacts = findRecipeArtifacts(args.recipeId);
  return (
    isMapConfigEnvelope(args.canonicalConfig) &&
    recipeArtifacts !== null &&
    applyPresetConfig({
      schema: recipeArtifacts.configSchema,
      presetConfig: args.canonicalConfig.config,
      label: "save-editor",
    }).ok
  );
}

export type UseSaveDeployArgs = {
  saveDeployOperation: StudioOperations["saveDeployOperation"];
  setSaveDeployOperation: StudioOperations["setSaveDeployOperation"];
  saveDeployRunning: StudioOperations["saveDeployRunning"];
  browserRunning: boolean;
  runInGameRunning: StudioOperations["runInGameRunning"];
  recipeId: string;
  authoringConfigSource: AuthoringConfigSource;
  pipelineConfig: PipelineConfig | null;
  adoptSavedEditorConfig: (canonicalConfig: MapConfigEnvelope) => void;
  toast: ToastFn;
};

export type UseSaveDeployResult = {
  saveDialogState: { open: boolean; label: string; description?: string };
  openSaveDialog: (seed?: { label?: string; description?: string }) => void;
  closeSaveDialog: () => void;
  handleSaveDialogConfirm: (args: { label: string; description?: string }) => Promise<void>;
  handleSaveAsNew: () => void;
  handleSaveToCurrent: () => Promise<void>;
  canSaveToCurrent: boolean;
};

/** Writes only editor-owned envelopes; catalog selections are read-only references. */
export function useSaveDeploy(args: UseSaveDeployArgs): UseSaveDeployResult {
  const {
    saveDeployOperation,
    setSaveDeployOperation,
    saveDeployRunning,
    browserRunning,
    runInGameRunning,
    recipeId,
    authoringConfigSource,
    pipelineConfig,
    adoptSavedEditorConfig,
    toast,
  } = args;
  const [saveDialogState, setSaveDialogState] = useState({
    open: false,
    label: "",
    description: "",
  });
  const saveDeployOperationRef = useRef<MapConfigSaveDeployStatus | null>(null);
  const saveDeployWaitersRef = useRef<Map<string, SaveDeployTerminalWaiter>>(new Map());

  useEffect(() => {
    saveDeployOperationRef.current = saveDeployOperation;
    if (!saveDeployOperation || !isSaveDeployTerminal(saveDeployOperation)) return;
    const waiter = saveDeployWaitersRef.current.get(saveDeployOperation.requestId);
    if (!waiter) return;
    saveDeployWaitersRef.current.delete(saveDeployOperation.requestId);
    clearTimeout(waiter.timeoutId);
    waiter.resolve(saveDeployOperation);
  }, [saveDeployOperation]);

  useEffect(
    () => () => {
      for (const waiter of saveDeployWaitersRef.current.values()) {
        clearTimeout(waiter.timeoutId);
        waiter.reject(new Error("Save/Deploy wait cancelled"));
      }
      saveDeployWaitersRef.current.clear();
    },
    []
  );

  const waitForSaveDeployTerminalEvent = useCallback((requestId: string) => {
    const current = saveDeployOperationRef.current;
    if (current?.requestId === requestId && isSaveDeployTerminal(current)) {
      return Promise.resolve(current);
    }
    return new Promise<MapConfigSaveDeployStatus>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        saveDeployWaitersRef.current.delete(requestId);
        reject(new Error("Save/Deploy event stream did not report a terminal status in time"));
      }, SAVE_DEPLOY_TERMINAL_EVENT_TIMEOUT_MS);
      saveDeployWaitersRef.current.set(requestId, { resolve, reject, timeoutId });
    });
  }, []);

  const saveEditorCanonicalConfig = useCallback(
    async (canonicalConfig: MapConfigEnvelope) => {
      if (browserRunning || runInGameRunning || saveDeployRunning) {
        const reason = browserRunning
          ? "Map generation is running"
          : runInGameRunning
            ? "Run in Game is running"
            : "Save/deploy is already running";
        return { ok: false as const, error: `${reason}; finish that operation before saving.` };
      }
      if (!isValidEditorCanonicalConfig({ recipeId, canonicalConfig })) {
        return { ok: false as const, error: "Config is invalid for this recipe." };
      }
      const requestId = `studio-save-deploy-${Date.now().toString(36)}`;
      setSaveDeployOperation(createMapConfigSaveDeployStatus({ requestId, phase: "queued" }));
      const result = await saveRepoBackedConfig({
        requestId,
        canonicalConfig,
        onStatus: (status) =>
          setSaveDeployOperation((current) =>
            current?.requestId === requestId ? status : current
          ),
      });
      if (!result.ok) {
        setSaveDeployOperation((current) => {
          if (!current || current.requestId !== requestId) return current;
          return result.status;
        });
        return saveDeployResultFromTerminalStatus(result.status);
      }
      try {
        const terminal = isSaveDeployTerminal(result.status)
          ? result.status
          : await waitForSaveDeployTerminalEvent(requestId);
        const terminalResult = saveDeployResultFromTerminalStatus(terminal);
        return terminalResult;
      } catch (error) {
        return {
          ok: false as const,
          error:
            error instanceof Error
              ? error.message
              : "Save/Deploy event stream did not report a terminal status",
          saved: result.status.saved,
          deployed: result.status.deployed,
        };
      }
    },
    [
      browserRunning,
      recipeId,
      runInGameRunning,
      saveDeployRunning,
      setSaveDeployOperation,
      waitForSaveDeployTerminalEvent,
    ]
  );

  const presentSaveResult = useCallback(
    (result: Awaited<ReturnType<typeof saveEditorCanonicalConfig>>) => {
      if (!result.ok) {
        const message =
          "safeFailureCategory" in result
            ? saveDeployFailureMessage(result.safeFailureCategory)
            : result.error;
        toast(`Config save failed: ${message}`, { variant: "error" });
        return;
      }
      toast("Config saved and deployed.", { variant: "success" });
    },
    [toast]
  );

  const openSaveDialog = useCallback((seed?: { label?: string; description?: string }) => {
    setSaveDialogState({
      open: true,
      label: seed?.label ?? "",
      description: seed?.description ?? "",
    });
  }, []);
  const closeSaveDialog = useCallback(
    () => setSaveDialogState((current) => ({ ...current, open: false })),
    []
  );

  const handleSaveDialogConfirm = useCallback(
    async ({ label, description }: { label: string; description?: string }) => {
      if (pipelineConfig === null) {
        toast("Recover the authoring source before saving config.", { variant: "info" });
        closeSaveDialog();
        return;
      }
      const id = toConfigId(label);
      let canonicalConfig: MapConfigEnvelope;
      try {
        canonicalConfig = createNamedEditorCanonicalConfig({
          id,
          name: label,
          description,
          config: pipelineConfig,
        });
      } catch {
        toast("Config save failed: config is invalid for this recipe.", { variant: "error" });
        closeSaveDialog();
        return;
      }
      if (!isValidEditorCanonicalConfig({ recipeId, canonicalConfig })) {
        toast("Config save failed: config is invalid for this recipe.", { variant: "error" });
        closeSaveDialog();
        return;
      }
      const result = await saveEditorCanonicalConfig(canonicalConfig);
      if (result.ok) adoptSavedEditorConfig(canonicalConfig);
      presentSaveResult(result);
      closeSaveDialog();
    },
    [
      adoptSavedEditorConfig,
      closeSaveDialog,
      pipelineConfig,
      presentSaveResult,
      recipeId,
      saveEditorCanonicalConfig,
      toast,
    ]
  );

  const handleSaveAsNew = useCallback(() => {
    const current =
      authoringConfigSource.kind === "editor" ? authoringConfigSource.canonicalConfig : null;
    openSaveDialog({
      label: current ? `Copy of ${current.name}` : "New Editor Config",
      description: current?.description,
    });
  }, [authoringConfigSource, openSaveDialog]);

  const handleSaveToCurrent = useCallback(async () => {
    if (authoringConfigSource.kind === "blocked") {
      toast("Recover the authoring source before saving config.", {
        variant: "info",
      });
      return;
    }
    if (authoringConfigSource.kind === "catalog") {
      toast("Catalog configs are read-only. Save & Deploy As creates an editor config.", {
        variant: "info",
      });
      return;
    }
    await presentSaveResult(await saveEditorCanonicalConfig(authoringConfigSource.canonicalConfig));
  }, [authoringConfigSource, presentSaveResult, saveEditorCanonicalConfig, toast]);

  return {
    saveDialogState,
    openSaveDialog,
    closeSaveDialog,
    handleSaveDialogConfirm,
    handleSaveAsNew,
    handleSaveToCurrent,
    canSaveToCurrent: authoringConfigSource.kind === "editor",
  };
}
