import type { RunInGameOperationStatus } from "@civ7/studio-contract";
import { type MutableRefObject, useEffect } from "react";
import { isRunInGameTerminalPhase } from "../../features/runInGame/status";
import type { ToastFn } from "./useToast";

/**
 * `useRunInGameTerminalToast` — fires the single success/failure toast when a
 * run-in-game operation reaches a terminal phase.
 *
 * The same operation can be observed terminal from MULTIPLE sources — the
 * studio-events push, the mount-time `operations.current` adoption, and the
 * run-in-game handler's own completion — so the toast must be idempotent. The
 * `lastRunInGameToastRef` (keyed by `requestId`) is the shared dedupe guard: it is
 * stamped here AND by the adoption/event paths via `markRunInGameToastHandled`, so
 * whichever observes the terminal status first wins and the others no-op. Without it,
 * adopting an already-finished operation on reload would re-toast a stale result.
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
    if (runInGameOperation.status === "complete") {
      toast(
        `Run in Game complete: ${runInGameOperation.materialization?.mapScript ?? runInGameOperation.requestId}`,
        { variant: "success" }
      );
    } else if (runInGameOperation.status !== "running") {
      toast(
        `Run in Game ${runInGameOperation.status}: ${runInGameOperation.error ?? runInGameOperation.requestId}`,
        {
          variant: "error",
        }
      );
    }
  }, [lastRunInGameToastRef, runInGameOperation, toast]);
}
