import type {
  MapConfigSaveDeployStatus,
  RunInGameOperationStatus,
  StudioEvent,
} from "@civ7/studio-server";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import type { LiveRuntimeStatusState } from "../../features/liveRuntime/model";
import { orpc, orpcClient } from "../../lib/orpc";
import {
  applyStudioLiveGameEvent,
  applyStudioOperationEvent,
  readAndAdoptStudioOperationsCurrent,
  type StudioOperationAdoptionTargets,
} from "../operationAdoption";
import {
  formatStudioDaemonIdentityMismatch,
  formatStudioEventStreamError,
  identityFromStudioEvent,
  identityFromStudioOperationsCurrent,
  studioEventClearsStreamError,
} from "../studioEventRecovery";
import { useLatestRef } from "./useLatestRef";

/**
 * The daemon event stream is a long-lived live query that must never give up:
 * losing it silently means the shell stops adopting daemon-side operation/live-game
 * changes. Infinite retry keeps it reconnecting across daemon restarts; the visible
 * failure is surfaced as a recoverable banner (see `formatStudioEventStreamError`),
 * not by tearing the subscription down. Exported so the retry contract is asserted
 * directly in tests.
 */
export const STUDIO_EVENT_STREAM_RETRY_ATTEMPTS = Number.POSITIVE_INFINITY;

/**
 * The oRPC client context carrying the infinite-retry policy for the watch call.
 * Split out from `studioEventsWatchLiveOptions` so the policy is independently
 * inspectable in tests without standing up a live-query subscription.
 */
export function studioEventsWatchClientContext() {
  return {
    retry: STUDIO_EVENT_STREAM_RETRY_ATTEMPTS,
  };
}

type StudioEventsWatchProcedure = Pick<typeof orpc.studio.events.watch, "experimental_liveOptions">;

/**
 * The live-query options consumed by the `useQuery` below — the real production
 * call, bound to the shared `orpc.studio.events.watch` procedure.
 */
export function studioEventsWatchLiveOptions() {
  return studioEventsWatchLiveOptionsFor(orpc.studio.events.watch);
}

/**
 * Builds the watch live-query options against an INJECTED watch procedure. The
 * `watch`-as-parameter indirection exists purely so tests can pass a fake procedure
 * and assert the exact options shape. The options pin the stream to be persistent:
 * `retry: false` here defers reconnection to the client-context infinite retry (above),
 * `refetchOnWindowFocus: false` + `staleTime: ∞` stop the cache machinery from
 * re-subscribing on focus/staleness, and `gcTime: 0` drops the snapshot the instant
 * the stream unmounts so a stale event can't replay on remount.
 */
export function studioEventsWatchLiveOptionsFor(watch: StudioEventsWatchProcedure) {
  return watch.experimental_liveOptions({
    input: {},
    context: studioEventsWatchClientContext(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 0,
  });
}

/**
 * `useStudioEvents` — subscribes the shell to the daemon's single event stream and
 * fans each event into the host's operation/live-game/error state. This is the live
 * counterpart to the one-shot adoption effect in `StudioShell` (which reconciles
 * `studio.operations.current` on mount): here the daemon PUSHES changes and the host
 * stays in lockstep without polling.
 *
 * Event kinds are dispatched by a stable per-event key (`helloKey`/`operationKey`/
 * `liveGameKey`) so each effect re-runs only when its own event actually changes:
 * - `hello`: a daemon (re)start. Re-adopt `operations.current`, but ONLY if the
 *   running daemon's identity matches the hello — a mismatch means the snapshot
 *   belongs to a different daemon instance, surfaced as a recoverable banner.
 * - `operation`: a run-in-game / save-deploy status push, applied to the op setters.
 * - `live-game`: a live Civ7 runtime snapshot, applied via `applyLiveGameState`.
 *
 * The stream's own transport failure is mirrored into the shell error channel
 * (`setLocalError`) and cleared the moment any well-formed event arrives, so a
 * dropped daemon connection shows a banner that self-heals on reconnect rather than
 * a dead stream. The `current*OperationRef` mirrors let the adoption path read the
 * latest op state without making the hello effect depend on (and re-run for) every
 * status change.
 */
export function useStudioEvents(
  args: StudioOperationAdoptionTargets & {
    applyLiveGameState(state: LiveRuntimeStatusState): void;
    currentRunInGameOperation?: RunInGameOperationStatus | null;
    currentSaveDeployOperation?: MapConfigSaveDeployStatus | null;
    setLocalError(message: string | null): void;
    clearLocalError(message: string): void;
  }
): void {
  const {
    applyLiveGameState,
    currentRunInGameOperation,
    currentSaveDeployOperation,
    setRunInGameOperation,
    setSaveDeployOperation,
    markRunInGameToastHandled,
    setLocalError,
    clearLocalError,
  } = args;
  const eventRecoveryErrorRef = useRef<string | null>(null);
  // Mirror the latest operation status into refs so the long-lived getter
  // closures below (`getCurrentRunInGameOperation` / `getCurrentSaveDeployOperation`)
  // read fresh values without being recreated each change. `useLatestRef` owns the
  // sanctioned render-phase ref write, so these sites no longer write `.current`
  // during render directly (react-hooks/refs).
  const currentRunInGameOperationRef = useLatestRef(currentRunInGameOperation ?? null);
  const currentSaveDeployOperationRef = useLatestRef(currentSaveDeployOperation ?? null);
  const eventQuery = useQuery(studioEventsWatchLiveOptions());
  const event = eventQuery.data as StudioEvent | undefined;
  const helloKey =
    event?.type === "hello"
      ? `${event.serverInstanceId}:${event.serverStartedAt}:${event.observedAt}`
      : null;
  const operationKey =
    event?.type === "operation"
      ? `${event.kind}:${event.status.requestId}:${event.observedAt}`
      : null;
  const liveGameKey =
    event?.type === "live-game"
      ? `${event.state.snapshotId ?? event.state.snapshotHash ?? event.state.status}:${event.observedAt}`
      : null;

  // Stream-recovery error tracking. The ref remembers the message this hook
  // raised so it can clear EXACTLY that message later (via `clearLocalError`) and
  // not stomp an unrelated error some other writer put on the shared channel.
  const setEventRecoveryError = useCallback(
    (message: string) => {
      eventRecoveryErrorRef.current = message;
      setLocalError(message);
    },
    [setLocalError]
  );

  const clearEventRecoveryError = useCallback(() => {
    const message = eventRecoveryErrorRef.current;
    if (!message) return;
    eventRecoveryErrorRef.current = null;
    clearLocalError(message);
  }, [clearLocalError]);

  useEffect(() => {
    if (!helloKey || event?.type !== "hello") return;
    let cancelled = false;
    const expectedIdentity = identityFromStudioEvent(event);
    void readAndAdoptStudioOperationsCurrent({
      readCurrent: () => orpcClient.studio.operations.current({}),
      targets: {
        setRunInGameOperation,
        setSaveDeployOperation,
        markRunInGameToastHandled,
      },
      isCancelled: () => cancelled,
      getCurrentRunInGameOperation: () => currentRunInGameOperationRef.current,
      getCurrentSaveDeployOperation: () => currentSaveDeployOperationRef.current,
      shouldAdopt: (current) => {
        const observedIdentity = identityFromStudioOperationsCurrent(current);
        const mismatch =
          expectedIdentity === null
            ? null
            : formatStudioDaemonIdentityMismatch(expectedIdentity, observedIdentity);
        if (!mismatch) return true;
        setEventRecoveryError(mismatch);
        return false;
      },
      onAdopted: () => {
        if (cancelled) return;
        clearEventRecoveryError();
      },
      onError: setEventRecoveryError,
    });
    return () => {
      cancelled = true;
    };
  }, [
    clearEventRecoveryError,
    event,
    helloKey,
    markRunInGameToastHandled,
    setEventRecoveryError,
    setRunInGameOperation,
    setSaveDeployOperation,
  ]);

  useEffect(() => {
    if (!operationKey || event?.type !== "operation") return;
    if (studioEventClearsStreamError(event)) clearEventRecoveryError();
    applyStudioOperationEvent(event, {
      setRunInGameOperation,
      setSaveDeployOperation,
    });
  }, [clearEventRecoveryError, event, operationKey, setRunInGameOperation, setSaveDeployOperation]);

  useEffect(() => {
    if (!liveGameKey || event?.type !== "live-game") return;
    if (studioEventClearsStreamError(event)) clearEventRecoveryError();
    applyStudioLiveGameEvent(event, {
      applyLiveGameState,
    });
  }, [applyLiveGameState, clearEventRecoveryError, event, liveGameKey]);

  useEffect(() => {
    if (!eventQuery.error) return;
    setEventRecoveryError(formatStudioEventStreamError(eventQuery.error));
  }, [eventQuery.error, setEventRecoveryError]);
}
