import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import type { StudioEvent } from "@civ7/studio-server";

import { orpc, orpcClient } from "../../lib/orpc";
import {
  applyStudioLiveGameEvent,
  applyStudioOperationEvent,
  readAndAdoptStudioOperationsCurrent,
  type StudioOperationAdoptionTargets,
} from "../operationAdoption";
import type { LiveRuntimeStatusState } from "../../features/liveRuntime/model";

export const STUDIO_EVENT_STREAM_RETRY_ATTEMPTS = Number.POSITIVE_INFINITY;

export function studioEventsWatchClientContext() {
  return {
    retry: STUDIO_EVENT_STREAM_RETRY_ATTEMPTS,
  };
}

export function studioEventsWatchLiveOptions() {
  return orpc.studio.events.watch.experimental_liveOptions({
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
    setLocalError(message: string | null): void;
  }
): void {
  const {
    applyLiveGameState,
    setRunInGameOperation,
    setSaveDeployOperation,
    markRunInGameToastHandled,
    setLocalError,
  } = args;
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

  useEffect(() => {
    if (!helloKey) return;
    let cancelled = false;
    void readAndAdoptStudioOperationsCurrent({
      readCurrent: () => orpcClient.studio.operations.current({}),
      targets: {
        setRunInGameOperation,
        setSaveDeployOperation,
        markRunInGameToastHandled,
      },
      isCancelled: () => cancelled,
      onError: setLocalError,
    });
    return () => {
      cancelled = true;
    };
  }, [
    helloKey,
    markRunInGameToastHandled,
    setLocalError,
    setRunInGameOperation,
    setSaveDeployOperation,
  ]);

  useEffect(() => {
    if (!operationKey || event?.type !== "operation") return;
    applyStudioOperationEvent(event, {
      setRunInGameOperation,
      setSaveDeployOperation,
    });
  }, [event, operationKey, setRunInGameOperation, setSaveDeployOperation]);

  useEffect(() => {
    if (!liveGameKey || event?.type !== "live-game") return;
    applyStudioLiveGameEvent(event, {
      applyLiveGameState,
    });
  }, [applyLiveGameState, event, liveGameKey]);

  useEffect(() => {
    if (!eventQuery.error) return;
    setLocalError(
      eventQuery.error instanceof Error
        ? eventQuery.error.message
        : "Studio event stream unavailable"
    );
  }, [eventQuery.error, setLocalError]);
}
