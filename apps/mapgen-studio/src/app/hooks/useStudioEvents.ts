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

export const STUDIO_EVENT_STREAM_RETRY_ATTEMPTS = Number.POSITIVE_INFINITY;

export function studioEventsWatchClientContext() {
  return {
    retry: STUDIO_EVENT_STREAM_RETRY_ATTEMPTS,
  };
}

type StudioEventsWatchProcedure = Pick<typeof orpc.studio.events.watch, "experimental_liveOptions">;

export function studioEventsWatchLiveOptions() {
  return studioEventsWatchLiveOptionsFor(orpc.studio.events.watch);
}

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
  const currentRunInGameOperationRef = useRef<RunInGameOperationStatus | null>(null);
  const currentSaveDeployOperationRef = useRef<MapConfigSaveDeployStatus | null>(null);
  currentRunInGameOperationRef.current = currentRunInGameOperation ?? null;
  currentSaveDeployOperationRef.current = currentSaveDeployOperation ?? null;
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
