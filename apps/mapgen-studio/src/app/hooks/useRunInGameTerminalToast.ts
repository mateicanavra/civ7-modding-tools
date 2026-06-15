import { type MutableRefObject, useEffect } from "react";

import {
  isRunInGameTerminalPhase,
  type RunInGameOperationStatus,
} from "../../features/runInGame/status";
import type { ToastFn } from "./useToast";

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
