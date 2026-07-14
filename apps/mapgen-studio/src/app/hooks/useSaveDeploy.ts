import { type MapConfigEnvelope, type MapConfigSaveDeployStatus } from "@civ7/studio-contract";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  admitCanonicalConfig,
  createNamedCanonicalConfig,
} from "../../features/configAuthoring/canonicalConfig";
import { saveRepoBackedConfig, toConfigId } from "../../features/mapConfigSave/api";
import {
  createMapConfigSaveDeployStatus,
  isSaveDeployTerminal,
  saveDeployFailureMessage,
  saveDeployResultFromTerminalStatus,
} from "../../features/mapConfigSave/status";
import type { AuthoringState } from "../../stores/authoringStore";
import type { StudioOperations } from "./useStudioOperations";
import type { ToastFn } from "./useToast";

const SAVE_DEPLOY_TERMINAL_EVENT_TIMEOUT_MS = 5 * 60_000;

type SaveDeployTerminalWaiter = Readonly<{
  resolve(status: MapConfigSaveDeployStatus): void;
  reject(error: Error): void;
  timeoutId: ReturnType<typeof setTimeout>;
}>;

export type UseSaveDeployArgs = {
  saveDeployOperation: StudioOperations["saveDeployOperation"];
  setSaveDeployOperation: StudioOperations["setSaveDeployOperation"];
  saveDeployRunning: StudioOperations["saveDeployRunning"];
  browserRunning: boolean;
  runInGameRunning: StudioOperations["runInGameRunning"];
  canonicalConfig: MapConfigEnvelope;
  setCanonicalConfig: AuthoringState["setCanonicalConfig"];
  toast: ToastFn;
};

export type UseSaveDeployResult = {
  saveDialogState: { open: boolean; name: string; description?: string };
  openSaveDialog: (seed?: { name?: string; description?: string }) => void;
  closeSaveDialog: () => void;
  handleSaveDialogConfirm: (args: { name: string; description?: string }) => Promise<void>;
  handleSaveAsNew: () => void;
  handleSaveToCurrent: () => Promise<void>;
  canSaveToCurrent: boolean;
};

export function useSaveDeploy(args: UseSaveDeployArgs): UseSaveDeployResult {
  const {
    saveDeployOperation,
    setSaveDeployOperation,
    saveDeployRunning,
    browserRunning,
    runInGameRunning,
    canonicalConfig,
    setCanonicalConfig,
    toast,
  } = args;
  const [saveDialogState, setSaveDialogState] = useState({
    open: false,
    name: "",
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

  const saveCanonicalConfig = useCallback(
    async (value: MapConfigEnvelope) => {
      if (browserRunning || runInGameRunning || saveDeployRunning) {
        const reason = browserRunning
          ? "Map generation is running"
          : runInGameRunning
            ? "Run in Game is running"
            : "Save/deploy is already running";
        return { ok: false as const, error: `${reason}; finish that operation before saving.` };
      }
      if (admitCanonicalConfig(value) === undefined) {
        return { ok: false as const, error: "Config is invalid for this recipe." };
      }
      const requestId = `studio-save-deploy-${Date.now().toString(36)}`;
      setSaveDeployOperation(createMapConfigSaveDeployStatus({ requestId, phase: "queued" }));
      const result = await saveRepoBackedConfig({
        requestId,
        canonicalConfig: value,
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
      runInGameRunning,
      saveDeployRunning,
      setSaveDeployOperation,
      waitForSaveDeployTerminalEvent,
    ]
  );

  const presentSaveResult = useCallback(
    (result: Awaited<ReturnType<typeof saveCanonicalConfig>>) => {
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

  const openSaveDialog = useCallback((seed?: { name?: string; description?: string }) => {
    setSaveDialogState({
      open: true,
      name: seed?.name ?? "",
      description: seed?.description ?? "",
    });
  }, []);
  const closeSaveDialog = useCallback(
    () => setSaveDialogState((current) => ({ ...current, open: false })),
    []
  );

  const handleSaveDialogConfirm = useCallback(
    async ({ name, description }: { name: string; description?: string }) => {
      const next = createNamedCanonicalConfig({
        current: canonicalConfig,
        id: toConfigId(name),
        name,
        description,
      });
      if (next === undefined) {
        toast("Config save failed: config is invalid for this recipe.", { variant: "error" });
        closeSaveDialog();
        return;
      }
      const result = await saveCanonicalConfig(next);
      if (result.ok) setCanonicalConfig(next);
      presentSaveResult(result);
      closeSaveDialog();
    },
    [
      canonicalConfig,
      closeSaveDialog,
      presentSaveResult,
      saveCanonicalConfig,
      setCanonicalConfig,
      toast,
    ]
  );

  const handleSaveAsNew = useCallback(() => {
    openSaveDialog({
      name: `Copy of ${canonicalConfig.name}`,
      description: canonicalConfig.description,
    });
  }, [canonicalConfig.description, canonicalConfig.name, openSaveDialog]);

  const handleSaveToCurrent = useCallback(async () => {
    await presentSaveResult(await saveCanonicalConfig(canonicalConfig));
  }, [canonicalConfig, presentSaveResult, saveCanonicalConfig]);

  return {
    saveDialogState,
    openSaveDialog,
    closeSaveDialog,
    handleSaveDialogConfirm,
    handleSaveAsNew,
    handleSaveToCurrent,
    canSaveToCurrent: true,
  };
}
