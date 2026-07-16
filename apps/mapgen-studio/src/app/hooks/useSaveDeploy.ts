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
import { mergeSaveDeployFailureResponse, mergeSaveDeployOperation } from "../operationAdoption";
import type { StudioOperations } from "./useStudioOperations";
import type { ToastFn } from "./useToast";

const SAVE_DEPLOY_TERMINAL_EVENT_TIMEOUT_MS = 5 * 60_000;
const SAVE_DEPLOY_WAIT_CANCELLED_MESSAGE = "Save/Deploy wait was cancelled";

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
  adoptSaveDeployOperation: StudioOperations["setSaveDeployOperation"];
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
  const saveDeployOperationRef = useRef<MapConfigSaveDeployStatus | null>(saveDeployOperation);
  const saveDeployWaitersRef = useRef<Map<string, SaveDeployTerminalWaiter>>(new Map());
  const saveDeployInFlightRef = useRef(false);
  const mountedRef = useRef(true);

  const adoptSaveDeployOperation = useCallback<StudioOperations["setSaveDeployOperation"]>(
    (update) => {
      const current = saveDeployOperationRef.current;
      const next = typeof update === "function" ? update(current) : update;
      saveDeployOperationRef.current = next;
      setSaveDeployOperation(next);
      if (!next || !isSaveDeployTerminal(next)) return;
      const waiter = saveDeployWaitersRef.current.get(next.requestId);
      if (!waiter) return;
      saveDeployWaitersRef.current.delete(next.requestId);
      clearTimeout(waiter.timeoutId);
      waiter.resolve(next);
    },
    [setSaveDeployOperation]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      for (const waiter of saveDeployWaitersRef.current.values()) {
        clearTimeout(waiter.timeoutId);
        waiter.reject(new Error(SAVE_DEPLOY_WAIT_CANCELLED_MESSAGE));
      }
      saveDeployWaitersRef.current.clear();
    };
  }, []);

  const waitForSaveDeployTerminalEvent = useCallback((requestId: string) => {
    if (!mountedRef.current) {
      return Promise.reject(new Error(SAVE_DEPLOY_WAIT_CANCELLED_MESSAGE));
    }
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
      if (
        saveDeployInFlightRef.current ||
        browserRunning ||
        runInGameRunning ||
        saveDeployRunning
      ) {
        const reason = saveDeployInFlightRef.current
          ? "Save/deploy admission is already in progress"
          : browserRunning
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
      saveDeployInFlightRef.current = true;
      try {
        adoptSaveDeployOperation(createMapConfigSaveDeployStatus({ requestId, phase: "queued" }));
        const result = await saveRepoBackedConfig({
          requestId,
          canonicalConfig: value,
          onStatus: (status) =>
            adoptSaveDeployOperation((current) =>
              current === null || current.requestId === requestId
                ? mergeSaveDeployOperation(current, status)
                : current
            ),
        });
        if (!mountedRef.current) {
          return {
            ok: false as const,
            error: SAVE_DEPLOY_WAIT_CANCELLED_MESSAGE,
            saved: result.status.saved,
            deployed: result.status.deployed,
          };
        }
        if (!result.ok) {
          const observed = saveDeployOperationRef.current;
          if (observed?.requestId === requestId && isSaveDeployTerminal(observed)) {
            return saveDeployResultFromTerminalStatus(observed);
          }
          adoptSaveDeployOperation((current) =>
            mergeSaveDeployFailureResponse(current, result.status)
          );
          return saveDeployResultFromTerminalStatus(result.status);
        }
        try {
          const terminal = isSaveDeployTerminal(result.status)
            ? result.status
            : await waitForSaveDeployTerminalEvent(requestId);
          return saveDeployResultFromTerminalStatus(terminal);
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
      } finally {
        saveDeployInFlightRef.current = false;
      }
    },
    [
      browserRunning,
      runInGameRunning,
      saveDeployRunning,
      adoptSaveDeployOperation,
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
      if (!mountedRef.current) return;
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
    const result = await saveCanonicalConfig(canonicalConfig);
    if (mountedRef.current) presentSaveResult(result);
  }, [canonicalConfig, presentSaveResult, saveCanonicalConfig]);

  return {
    adoptSaveDeployOperation,
    saveDialogState,
    openSaveDialog,
    closeSaveDialog,
    handleSaveDialogConfirm,
    handleSaveAsNew,
    handleSaveToCurrent,
    canSaveToCurrent: true,
  };
}
