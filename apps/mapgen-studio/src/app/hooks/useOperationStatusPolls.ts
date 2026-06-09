import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  isRunInGameTerminalPhase,
  type RunInGameOperationStatus,
} from "../../features/runInGame/status";
import type { MapConfigSaveDeployStatus } from "../../features/mapConfigSave/status";
import type { ToastFn } from "./useToast";

/**
 * `useOperationStatusPolls` — the run-in-game + save-deploy STATUS POLLS, realised as
 * TanStack Query `refetchInterval` polls (architecture/10 §2/§3) instead of the prior
 * self-rescheduling `setTimeout` effects.
 *
 * PARITY (architecture/10 §7 — run-in-game/save status is do-not-break): this MOVES the
 * scheduling, it does NOT rewrite the fetch/merge logic. Each poll's `queryFn` calls the
 * SAME `refresh*` callback the `setTimeout` did (which performs the oRPC status read and
 * merges the result — including the 404 → synthetic `uncertain` / `operation-status-missing`
 * mapping — into the operation state). Cadence is preserved exactly:
 * - `enabled` only while there is an active, non-terminal/running operation (matches the
 *   prior effect's early-return guards), so a terminal operation STOPS polling;
 * - `refetchInterval` is `document.hidden ? 3000 : 1000` ms, the prior `setTimeout` delay;
 * - the query is seeded with `initialData` (the current operation) and `staleTime` equal to
 *   the interval, so there is NO immediate mount fetch — the first refetch fires after the
 *   interval, exactly as the prior "schedule a timeout, then refresh" flow did. The start /
 *   save mutations seed the operation state synchronously (unchanged), so the poll picks up
 *   from the seeded value without an extra round-trip.
 *
 * The run-in-game terminal TOAST is a derived-state effect, NOT part of the poll — it stays
 * here as a small effect on the operation (verbatim from the prior poll effect's terminal
 * branch) so the poll hook owns the full run-in-game status lifecycle.
 */
export function useOperationStatusPolls(args: {
  runInGameOperation: RunInGameOperationStatus | null;
  saveDeployOperation: MapConfigSaveDeployStatus | null;
  refreshRunInGameStatus: (requestId: string) => Promise<void>;
  refreshMapConfigSaveDeployStatus: (requestId: string) => Promise<void>;
  lastRunInGameToastRef: React.MutableRefObject<string | null>;
  toast: ToastFn;
}): void {
  const {
    runInGameOperation,
    saveDeployOperation,
    refreshRunInGameStatus,
    refreshMapConfigSaveDeployStatus,
    lastRunInGameToastRef,
    toast,
  } = args;

  const pollDelayMs = (): number => (document.hidden ? 3000 : 1000);

  // --- run-in-game status poll ---------------------------------------------------------
  const runInGameActive =
    runInGameOperation !== null && !isRunInGameTerminalPhase(runInGameOperation.phase);
  const runInGameRequestId = runInGameActive ? runInGameOperation.requestId : null;

  useQuery({
    queryKey: ["studio", "runInGame", "status-poll", runInGameRequestId],
    queryFn: async () => {
      if (runInGameRequestId) await refreshRunInGameStatus(runInGameRequestId);
      return Date.now();
    },
    enabled: runInGameRequestId !== null,
    // No immediate mount fetch: the seeded operation is fresh for one interval, so the first
    // network refresh is the `refetchInterval`-driven one (prior `setTimeout` cadence).
    initialData: () => Date.now(),
    staleTime: pollDelayMs(),
    refetchInterval: () => (runInGameRequestId !== null ? pollDelayMs() : false),
    refetchIntervalInBackground: true,
    gcTime: 0,
  });

  // Terminal toast (derived-state effect, verbatim from the prior poll effect's terminal
  // branch) — fires once per terminal requestId.
  useEffect(() => {
    if (!runInGameOperation) return;
    if (!isRunInGameTerminalPhase(runInGameOperation.phase)) return;
    if (lastRunInGameToastRef.current === runInGameOperation.requestId) return;
    lastRunInGameToastRef.current = runInGameOperation.requestId;
    if (runInGameOperation.status === "complete") {
      toast(
        `Run in Game complete: ${runInGameOperation.materialization?.mapScript ?? runInGameOperation.requestId}`,
        { variant: "success" },
      );
    } else if (runInGameOperation.status !== "running") {
      toast(`Run in Game ${runInGameOperation.status}: ${runInGameOperation.error ?? runInGameOperation.requestId}`, {
        variant: "error",
      });
    }
  }, [lastRunInGameToastRef, runInGameOperation, toast]);

  // --- save-deploy status poll ---------------------------------------------------------
  const saveDeployActive = saveDeployOperation !== null && saveDeployOperation.status === "running";
  const saveDeployRequestId = saveDeployActive ? saveDeployOperation.requestId : null;

  useQuery({
    queryKey: ["studio", "mapConfigSave", "status-poll", saveDeployRequestId],
    queryFn: async () => {
      if (saveDeployRequestId) await refreshMapConfigSaveDeployStatus(saveDeployRequestId);
      return Date.now();
    },
    enabled: saveDeployRequestId !== null,
    initialData: () => Date.now(),
    staleTime: pollDelayMs(),
    refetchInterval: () => (saveDeployRequestId !== null ? pollDelayMs() : false),
    refetchIntervalInBackground: true,
    gcTime: 0,
  });
}
