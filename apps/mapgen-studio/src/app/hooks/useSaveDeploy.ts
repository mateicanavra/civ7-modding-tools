import type { MapConfigSaveDeployStatus } from "@civ7/studio-contract";
import { stripSchemaMetadataRoot } from "@swooper/mapgen-core/authoring";
import type { PipelineConfig, RecipeSettings } from "@swooper/mapgen-studio-ui/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { saveRepoBackedConfig, toConfigId } from "../../features/mapConfigSave/api";
import {
  createMapConfigSaveDeployStatus,
  isSaveDeployTerminal,
  saveDeployResultFromTerminalStatus,
  updateMapConfigSaveDeployStatus,
} from "../../features/mapConfigSave/status";
import { toRepoBackedPreset } from "../../features/presets/repoBacked";
import { type PresetKey, parsePresetKey } from "../../features/presets/types";
import type { AuthoringState } from "../../stores/authoringStore";
import type { RunState } from "../../stores/runStore";
import type { UsePresetLifecycleResult } from "./usePresetLifecycle";
import type { StudioOperations } from "./useStudioOperations";
import type { ToastFn } from "./useToast";

const SAVE_DEPLOY_TERMINAL_EVENT_TIMEOUT_MS = 5 * 60_000;

type SaveDeployTerminalWaiter = Readonly<{
  resolve(status: MapConfigSaveDeployStatus): void;
  reject(error: Error): void;
  timeoutId: ReturnType<typeof setTimeout>;
}>;

export type UseSaveDeployArgs = {
  /** Live save/deploy operation status (owned by `useStudioOperations`). */
  saveDeployOperation: StudioOperations["saveDeployOperation"];
  /** Setter for the save/deploy operation status (owned by `useStudioOperations`). */
  setSaveDeployOperation: StudioOperations["setSaveDeployOperation"];
  /** Synchronous busy flag for save/deploy (owned by `useStudioOperations`). */
  saveDeployRunning: StudioOperations["saveDeployRunning"];
  /** Synchronous busy flag for browser map generation (busy-gate priority 1). */
  browserRunning: boolean;
  /** Synchronous busy flag for run-in-game (busy-gate priority 2). */
  runInGameRunning: StudioOperations["runInGameRunning"];
  /** Preset resolver (from `usePresetLifecycle`) — read by the save handlers. */
  resolvePreset: UsePresetLifecycleResult["resolvePreset"];
  /** Records a repo-backed override (from `usePresetLifecycle`) before the key-flip. */
  rememberRepoBackedConfig: UsePresetLifecycleResult["rememberRepoBackedConfig"];
  /** Synchronous `lastAppliedPresetRef` writer (from `usePresetLifecycle`) — PL-7/PL-11. */
  markPresetApplied: UsePresetLifecycleResult["markPresetApplied"];
  /** Merged built-in presets (from `usePresetLifecycle`) — scratch id-collision check. */
  builtInPresets: UsePresetLifecycleResult["builtInPresets"];
  /** Local-preset persistence actions (from `usePresetLifecycle`) — save-to-current scratch path. */
  presetActions: UsePresetLifecycleResult["presetActions"];
  /** Current authoring recipe/preset selection. */
  recipeSettings: RecipeSettings;
  /** Current authoring pipeline config — the save payload source. */
  pipelineConfig: PipelineConfig;
  setRecipeSettings: AuthoringState["setRecipeSettings"];
  setPipelineConfig: AuthoringState["setPipelineConfig"];
  setLastSaveDeployConfig: RunState["setLastSaveDeployConfig"];
  toast: ToastFn;
};

export type UseSaveDeployResult = {
  saveDialogState: { open: boolean; label: string; description?: string };
  openSaveDialog: (seed?: { label?: string; description?: string }) => void;
  closeSaveDialog: () => void;
  handleSaveDialogConfirm: (args: { label: string; description?: string }) => Promise<void>;
  handleSaveAsNew: () => void;
  handleSaveToCurrent: () => Promise<void>;
};

/**
 * `useSaveDeploy` — owns the repo-backed save/deploy cluster: the save-dialog
 * state, the save/deploy terminal-event waiter machinery (`waitForSaveDeploy
 * TerminalEvent` + the SSE-mirror effect that resolves a matching waiter and the
 * unmount-cleanup effect that rejects all pending waiters), and the three save
 * handlers (`handleSaveDialogConfirm`, `handleSaveAsNew`, `handleSaveToCurrent`)
 * plus their shared `saveRepoBackedConfigWithState` core.
 *
 * Load-bearing invariants preserved verbatim from the prior host body:
 * - SD-10: `saveDeployOperationRef.current = saveDeployOperation` is the FIRST
 *   statement of the SSE-mirror effect (so the sync waiter-check branch never
 *   reads a stale ref).
 * - SD-5: the SSE-mirror effect is declared BEFORE the unmount-cleanup effect
 *   (Tier-B ordered pair — same-commit, mirror wins).
 * - SD-8: `setSaveDeployOperation(initial 'queued')` runs BEFORE the first await
 *   in `saveRepoBackedConfigWithState`.
 * - SD-7: the waiter is awaited ONLY when the RPC status is not already terminal.
 * - SD-6: busy-gate priority browser ≻ run ≻ save.
 * - PL-7/PL-11: `markPresetApplied` + `rememberRepoBackedConfig` run BEFORE the
 *   key-flip `setRecipeSettings` (the apply-effect resolver must see the new
 *   repo-backed entry / pre-recorded ref so it skips a redundant re-apply).
 *
 * The operation state itself (`saveDeployOperation` + its current-ref) stays in
 * `useStudioOperations` and is threaded IN; the busy booleans are threaded IN
 * from the same owner (never republished).
 */
export function useSaveDeploy(args: UseSaveDeployArgs): UseSaveDeployResult {
  const {
    saveDeployOperation,
    setSaveDeployOperation,
    saveDeployRunning,
    browserRunning,
    runInGameRunning,
    resolvePreset,
    rememberRepoBackedConfig,
    markPresetApplied,
    builtInPresets,
    presetActions,
    recipeSettings,
    pipelineConfig,
    setRecipeSettings,
    setPipelineConfig,
    setLastSaveDeployConfig,
    toast,
  } = args;

  const [saveDialogState, setSaveDialogState] = useState<{
    open: boolean;
    label: string;
    description?: string;
  }>({
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

  useEffect(() => {
    return () => {
      for (const waiter of saveDeployWaitersRef.current.values()) {
        clearTimeout(waiter.timeoutId);
        waiter.reject(new Error("Save/Deploy wait cancelled"));
      }
      saveDeployWaitersRef.current.clear();
    };
  }, []);

  const waitForSaveDeployTerminalEvent = useCallback(
    (requestId: string): Promise<MapConfigSaveDeployStatus> => {
      const current = saveDeployOperationRef.current;
      if (current?.requestId === requestId && isSaveDeployTerminal(current)) {
        return Promise.resolve(current);
      }
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          saveDeployWaitersRef.current.delete(requestId);
          reject(new Error("Save/Deploy event stream did not report a terminal status in time"));
        }, SAVE_DEPLOY_TERMINAL_EVENT_TIMEOUT_MS);
        saveDeployWaitersRef.current.set(requestId, { resolve, reject, timeoutId });
      });
    },
    []
  );

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

  const saveRepoBackedConfigWithState = useCallback(
    async (args: {
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
        return {
          ok: false as const,
          error: `${reason}; finish that operation before saving.`,
          saved: false,
          deployed: false,
        };
      }

      const requestId = `studio-save-deploy-${Date.now().toString(36)}`;
      const initial = createMapConfigSaveDeployStatus({ requestId, phase: "queued" });
      setSaveDeployOperation(initial);

      const result = await saveRepoBackedConfig({
        ...args,
        requestId,
        onStatus: (status) => {
          setSaveDeployOperation((current) =>
            current?.requestId === requestId ? status : current
          );
        },
      });
      if (!result.ok) {
        setSaveDeployOperation((current) => {
          if (!current || current.requestId !== requestId) return current;
          return updateMapConfigSaveDeployStatus(current, {
            phase: "failed",
            error: result.error,
            path: result.path,
            saved: result.saved,
            deployed: result.deployed,
          });
        });
        return result;
      }

      try {
        const terminal = isSaveDeployTerminal(result.status)
          ? result.status
          : await waitForSaveDeployTerminalEvent(requestId);
        const terminalResult = saveDeployResultFromTerminalStatus(terminal, result.path);
        if (terminalResult.ok) setLastSaveDeployConfig(stripSchemaMetadataRoot(args.config));
        return terminalResult;
      } catch (err) {
        return {
          ok: false as const,
          error:
            err instanceof Error
              ? err.message
              : "Save/Deploy event stream did not report a terminal status",
          saved: result.status.saved,
          deployed: result.status.deployed,
          path: result.path,
        };
      }
    },
    [
      browserRunning,
      runInGameRunning,
      saveDeployRunning,
      setLastSaveDeployConfig,
      waitForSaveDeployTerminalEvent,
    ]
  );

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
        markPresetApplied({ key: `builtin:${id}`, config: sanitized });
        setRecipeSettings((prev) => ({ ...prev, preset: `builtin:${id}` }));
        setPipelineConfig(sanitized as PipelineConfig);
      }
      if (!result.ok) {
        toast(
          result.saved && result.deployed
            ? `Config saved and deployed from ${result.path ?? `${id}.config.json`} but post-save action failed: ${result.error}`
            : result.saved
              ? `Config saved to ${result.path ?? `${id}.config.json`} but deploy failed: ${result.error}`
              : `Config save failed: ${result.error}`,
          { variant: "error" }
        );
      } else {
        toast(`Config saved and deployed from ${result.path ?? `${id}.config.json`}`, {
          variant: "success",
        });
      }
      setSaveDialogState({ open: false, label: "", description: "" });
    },
    [
      pipelineConfig,
      recipeSettings.preset,
      recipeSettings.recipe,
      rememberRepoBackedConfig,
      resolvePreset,
      saveRepoBackedConfigWithState,
      toast,
    ]
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
        markPresetApplied({
          key: recipeSettings.preset as PresetKey,
          config: sanitized,
        });
        setPipelineConfig(sanitized as PipelineConfig);
      }
      if (!result.ok) {
        toast(
          result.saved && result.deployed
            ? `Config saved and deployed from ${result.path ?? resolved.sourcePath ?? resolved.id} but post-save action failed: ${result.error}`
            : result.saved
              ? `Config saved to ${result.path ?? resolved.sourcePath ?? resolved.id} but deploy failed: ${result.error}`
              : `Config save failed: ${result.error}`,
          { variant: "error" }
        );
      } else {
        toast(
          `Config saved and deployed from ${result.path ?? resolved.sourcePath ?? resolved.id}`,
          { variant: "success" }
        );
      }
      return;
    }
    if (parsed.kind !== "local") {
      handleSaveAsNew();
      toast("Save to Current requires a repo config or scratch config. Save as new instead.", {
        variant: "info",
      });
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
      toast(`Scratch config updated but could not persist: ${result.persistenceError}`, {
        variant: "error",
      });
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
      markPresetApplied({ key: `builtin:${id}`, config: sanitized });
      setRecipeSettings((prev) => ({ ...prev, preset: `builtin:${id}` }));
      setPipelineConfig(sanitized as PipelineConfig);
    }
    if (!repoResult.ok) {
      toast(
        repoResult.saved && repoResult.deployed
          ? `Config saved and deployed from ${repoResult.path ?? `${id}.config.json`} but post-save action failed: ${repoResult.error}`
          : repoResult.saved
            ? `Config saved to ${repoResult.path ?? `${id}.config.json`} but deploy failed: ${repoResult.error}`
            : `Config save failed: ${repoResult.error}`,
        { variant: "error" }
      );
    } else {
      toast(`Config saved and deployed from ${repoResult.path ?? `${id}.config.json`}`, {
        variant: "success",
      });
    }
  }, [
    builtInPresets,
    handleSaveAsNew,
    pipelineConfig,
    presetActions,
    recipeSettings.preset,
    recipeSettings.recipe,
    rememberRepoBackedConfig,
    resolvePreset,
    saveRepoBackedConfigWithState,
    toast,
  ]);

  return {
    saveDialogState,
    openSaveDialog,
    closeSaveDialog,
    handleSaveDialogConfirm,
    handleSaveAsNew,
    handleSaveToCurrent,
  };
}
