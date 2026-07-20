import type { RunInGameOperationStatus } from "@civ7/studio-contract";
import { type MutableRefObject, useEffect } from "react";
import { isRunInGameTerminalPhase } from "../../features/runInGame/status";
import type { ToastFn } from "./useToast";

/**
 * `useRunInGameTerminalToast` — fires the single success/failure toast when a
 * run-in-game operation reaches a terminal phase.
 *
 * Pushed terminal events can be observed again after iterator recovery, so the toast
 * is idempotent by request ID. Hello/current recovery premarks retained historical
 * terminals before they render; a newly pushed terminal remains toast-producing.
 *
 * This hook only emits the notification; the operation state itself is owned by
 * `useStudioOperations` / `useRunInGame`.
 */
export function useRunInGameTerminalToast(args: {
  runInGameOperation: RunInGameOperationStatus | null;
  lastRunInGameToastRef: MutableRefObject<string | null>;
  toast: ToastFn;
}): void {
  const { runInGameOperation, lastRunInGameToastRef, toast } = args;

  useEffect(() => {
    if (!runInGameOperation) return;
    if (!isRunInGameTerminalPhase(runInGameOperation.phase)) return;
    if (lastRunInGameToastRef.current === runInGameOperation.requestId) return;
    lastRunInGameToastRef.current = runInGameOperation.requestId;
    if (runInGameOperation.status === "completed") {
      toast(`Run in Game complete: ${runInGameOperation.requestId}`, { variant: "success" });
    } else if (runInGameOperation.status !== "running") {
      toast(
        `Run in Game ${runInGameOperation.status}: ${runInGameOperation.safeFailureCategory ?? runInGameOperation.requestId}`,
        {
          variant: "error",
        }
      );
    }
  }, [lastRunInGameToastRef, runInGameOperation, toast]);
}
