import type { MapConfigSaveDeployStatus, RunInGameOperationStatus } from "@civ7/studio-contract";
import { type Dispatch, type RefObject, type SetStateAction, useCallback, useState } from "react";

import { useLatestRef } from "./useLatestRef";

export type StudioOperations = Readonly<{
  // Operation state — the DECLARATIONS live here; domain hooks own the LOGIC
  // (handlers/effects/fingerprints) and receive these value+setter pairs.
  runInGameOperation: RunInGameOperationStatus | null;
  setRunInGameOperation: Dispatch<SetStateAction<RunInGameOperationStatus | null>>;
  saveDeployOperation: MapConfigSaveDeployStatus | null;
  setSaveDeployOperation: Dispatch<SetStateAction<MapConfigSaveDeployStatus | null>>;
  // Error channel — single owner. All writers (viz onError, browser run, run-in-
  // game, the operations-adoption effect, the studio-events stream) surface
  // through this one `setLocalError`; `clearLocalErrorIfCurrent` is the
  // identity-guarded clear used by the event stream.
  localError: string | null;
  setLocalError: Dispatch<SetStateAction<string | null>>;
  clearLocalErrorIfCurrent: (message: string) => void;
  // Busy booleans — derived SYNCHRONOUSLY from op status, stable-from-first-render.
  runInGameRunning: boolean;
  saveDeployRunning: boolean;
  // Render-fresh mirrors of the op state for callbacks/effects that must read the
  // latest value WITHOUT taking it as a dependency (the operations-adoption
  // effect reads these so it does not re-run on every status change).
  runInGameOperationRef: RefObject<RunInGameOperationStatus | null>;
  saveDeployOperationCurrentRef: RefObject<MapConfigSaveDeployStatus | null>;
}>;

/**
 * `useStudioOperations` — the coordination layer the host calls FIRST (before
 * `useViewportLayout`/`useBrowserRun`/`useVizSelection`). It owns the operation
 * state and error channel that several downstream hooks must share, and it
 * resolves the init-order paradox: the busy booleans the auto-run trio reads
 * (`runInGameRunning`/`saveDeployRunning`) are produced HERE and threaded
 * downward, never republished, so they are correct from the first render.
 *
 * Deliberately effect-free. The busy booleans are plain render-scope `const`s,
 * so they flip in the SAME render the operation status changes — there is no
 * `useState`+`useEffect` republish (which would lag one render and let a second
 * operation race through the busy gate). For the same reason `error`/`status`
 * are NOT derived here: they additionally depend on `browserRunner.state`
 * (owned by `useBrowserRun`), so the host completes that composite after both
 * hooks have run; pulling it in would reintroduce a `browserRunner` ordering
 * dependency this layer exists to avoid.
 */
export function useStudioOperations(): StudioOperations {
  const [runInGameOperation, setRunInGameOperation] = useState<RunInGameOperationStatus | null>(
    null
  );
  const [saveDeployOperation, setSaveDeployOperation] = useState<MapConfigSaveDeployStatus | null>(
    null
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const clearLocalErrorIfCurrent = useCallback((message: string) => {
    setLocalError((current) => (current === message ? null : current));
  }, []);

  // Render-phase mirrors (write-on-render via `useLatestRef`, never effect-synced).
  const runInGameOperationRef = useLatestRef(runInGameOperation);
  const saveDeployOperationCurrentRef = useLatestRef(saveDeployOperation);

  // Synchronous busy derivation — plain consts, default `false` on render 1.
  const saveDeployRunning = saveDeployOperation?.status === "running";
  const runInGameRunning = runInGameOperation?.status === "running";

  return {
    runInGameOperation,
    setRunInGameOperation,
    saveDeployOperation,
    setSaveDeployOperation,
    localError,
    setLocalError,
    clearLocalErrorIfCurrent,
    runInGameRunning,
    saveDeployRunning,
    runInGameOperationRef,
    saveDeployOperationCurrentRef,
  };
}
