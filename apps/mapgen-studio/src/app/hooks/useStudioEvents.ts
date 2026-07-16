import type {
  RunInGameOperationStatus,
  StudioEvent,
  StudioHelloEvent,
  StudioLiveGameEvent,
  StudioOperationEvent,
  StudioOperationsCurrent,
} from "@civ7/studio-contract";
import type { ClientRetryPluginContext } from "@orpc/client/plugins";
import { useEffect } from "react";
import type { LiveRuntimeStatusState } from "../../features/liveRuntime/model";
import { orpcClient } from "../../lib/orpc";
import { isAbortLikeError } from "../../shared/async";
import {
  applyStudioLiveGameEvent,
  applyStudioOperationEvent,
  readAndAdoptStudioOperationsCurrent,
  type StudioOperationAdoptionTargets,
} from "../operationAdoption";
import {
  formatStudioDaemonIdentityMismatch,
  formatStudioEventStreamError,
  identityFromStudioOperationsCurrent,
  type StudioDaemonIdentity,
} from "../studioEventRecovery";
import { useLatestRef } from "./useLatestRef";

export const STUDIO_RECOVERY_RETRY_ATTEMPTS = Number.POSITIVE_INFINITY;
const STUDIO_EVENT_STREAM_REOPEN_DELAY_MS = 2_000;

/** ClientRetryPlugin owns thrown transport retries until the caller cancels. */
export function studioRecoveryClientContext(
  onRetry: (error: unknown) => void
): ClientRetryPluginContext {
  return {
    retry: STUDIO_RECOVERY_RETRY_ATTEMPTS,
    shouldRetry: ({ signal }) => signal?.aborted !== true,
    retryDelay: ({ signal, lastEventRetry }) => {
      const delayMs = lastEventRetry ?? STUDIO_EVENT_STREAM_REOPEN_DELAY_MS;
      if (!signal) return delayMs;
      return waitForAbortableStudioRetry(signal, delayMs).then(() => 0);
    },
    onRetry: ({ error, signal }) => {
      if (signal?.aborted) return;
      onRetry(error);
    },
  };
}

function waitForAbortableStudioRetry(signal: AbortSignal, delayMs: number): Promise<void> {
  if (signal.aborted) return Promise.reject(signal.reason);
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timeoutId);
      signal.removeEventListener("abort", onAbort);
      reject(signal.reason);
    };
    const timeoutId = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

type StudioEventIterator = AsyncIteratorObject<StudioEvent, unknown, void>;
type StudioEventRecoveryLane = "stream" | "current";
type StudioHelloDisposition = "continue" | "reopen";

/** Keeps independent recovery owners behind one prioritized, exact-clear banner. */
export function createStudioEventRecoveryErrors(args: {
  setLocalError(message: string): void;
  clearLocalError(message: string): void;
}) {
  const errors: Record<StudioEventRecoveryLane, string | null> = {
    stream: null,
    current: null,
  };
  let published: string | null = null;

  const publish = () => {
    const next = errors.current ?? errors.stream;
    if (next === published) return;
    const previous = published;
    published = next;
    if (next !== null) {
      args.setLocalError(next);
    } else if (previous !== null) {
      args.clearLocalError(previous);
    }
  };

  return {
    set(lane: StudioEventRecoveryLane, message: string) {
      errors[lane] = message;
      publish();
    },
    clear(lane: StudioEventRecoveryLane) {
      errors[lane] = null;
      publish();
    },
  };
}

function waitForStudioEventStreamReopen(signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timeoutId);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timeoutId = setTimeout(finish, STUDIO_EVENT_STREAM_REOPEN_DELAY_MS);
    signal.addEventListener("abort", finish, { once: true });
  });
}

/** Reconciles current state only when it belongs to the subscribing daemon. */
export async function reconcileStudioOperationsCurrent(
  args: Readonly<{
    signal: AbortSignal;
    expectedIdentity: StudioDaemonIdentity;
    readCurrent(): Promise<StudioOperationsCurrent>;
    targets: StudioOperationAdoptionTargets;
    getCurrentRunInGameOperation(): RunInGameOperationStatus | null;
    onRecoveryError(message: string): void;
    onRecovered(): void;
  }>
): Promise<boolean> {
  let adopted = false;
  await readAndAdoptStudioOperationsCurrent({
    readCurrent: args.readCurrent,
    targets: args.targets,
    isCancelled: () => args.signal.aborted,
    getCurrentRunInGameOperation: args.getCurrentRunInGameOperation,
    shouldAdopt: (current) => {
      const mismatch = formatStudioDaemonIdentityMismatch(
        args.expectedIdentity,
        identityFromStudioOperationsCurrent(current)
      );
      if (!mismatch) return true;
      args.onRecoveryError(mismatch);
      return false;
    },
    onAdopted: () => {
      adopted = true;
      args.onRecovered();
    },
    onError: args.onRecoveryError,
  });
  return adopted;
}

function unhandledStudioEvent(event: never): never {
  throw new Error(`Unhandled Studio event: ${String(event)}`);
}

/** Consumes ordered oRPC iterators, reopening after stale identity or clean end. */
export async function consumeStudioEventStream(
  args: Readonly<{
    signal: AbortSignal;
    open(signal: AbortSignal): Promise<StudioEventIterator>;
    onHello(event: StudioHelloEvent): Promise<StudioHelloDisposition>;
    onOperation(event: StudioOperationEvent): void;
    onLiveGame(event: StudioLiveGameEvent): void;
    onUnexpectedEnd(error: Error): void;
    waitBeforeReopen?(signal: AbortSignal): Promise<void>;
  }>
): Promise<void> {
  while (!args.signal.aborted) {
    const source = await args.open(args.signal);
    let reopenRequested = false;
    let closePromise: Promise<void> | null = null;
    const close = () => {
      if (closePromise) return closePromise;
      closePromise = Promise.resolve(source.return?.()).then(() => undefined);
      return closePromise;
    };
    const closeOnAbort = () => {
      void close();
    };
    args.signal.addEventListener("abort", closeOnAbort, { once: true });

    try {
      while (!args.signal.aborted) {
        const result = await source.next();
        if (result.done || args.signal.aborted) break;
        const event = result.value;
        switch (event.type) {
          case "hello":
            reopenRequested = (await args.onHello(event)) === "reopen";
            break;
          case "operation":
            args.onOperation(event);
            break;
          case "live-game":
            args.onLiveGame(event);
            break;
          default:
            unhandledStudioEvent(event);
        }
        if (reopenRequested) break;
      }
    } finally {
      args.signal.removeEventListener("abort", closeOnAbort);
      await close();
    }

    if (args.signal.aborted) return;
    if (!reopenRequested) {
      args.onUnexpectedEnd(new Error("Studio event stream ended before cancellation"));
    }
    await (args.waitBeforeReopen ?? waitForStudioEventStreamReopen)(args.signal);
  }
}

/**
 * Owns one ordered subscription loop. Hello owns current-state recovery; following
 * operation and live-game events are applied in wire order across iterator reopenings.
 */
export function useStudioEvents(
  args: StudioOperationAdoptionTargets & {
    applyLiveGameState(state: LiveRuntimeStatusState): void;
    currentRunInGameOperation?: RunInGameOperationStatus | null;
    setLocalError(message: string | null): void;
    clearLocalError(message: string): void;
  }
): void {
  const {
    applyLiveGameState,
    currentRunInGameOperation,
    setRunInGameOperation,
    setSaveDeployOperation,
    markRunInGameToastHandled,
    setLocalError,
    clearLocalError,
  } = args;
  const currentRunInGameOperationRef = useLatestRef(currentRunInGameOperation ?? null);

  useEffect(() => {
    const abortController = new AbortController();
    const recoveryErrors = createStudioEventRecoveryErrors({ setLocalError, clearLocalError });

    void consumeStudioEventStream({
      signal: abortController.signal,
      open: (signal) =>
        orpcClient.studio.events.watch(
          {},
          {
            signal,
            context: studioRecoveryClientContext((error) => {
              recoveryErrors.set("stream", formatStudioEventStreamError(error));
            }),
          }
        ),
      onHello: async (event) => {
        recoveryErrors.clear("stream");
        const matched = await reconcileStudioOperationsCurrent({
          signal: abortController.signal,
          expectedIdentity: {
            serverInstanceId: event.serverInstanceId,
            serverStartedAt: event.serverStartedAt,
          },
          readCurrent: () =>
            orpcClient.studio.operations.current(
              {},
              {
                signal: abortController.signal,
                context: studioRecoveryClientContext((error) => {
                  recoveryErrors.set("current", formatStudioEventStreamError(error));
                }),
              }
            ),
          targets: {
            setRunInGameOperation,
            setSaveDeployOperation,
            markRunInGameToastHandled,
          },
          getCurrentRunInGameOperation: () => currentRunInGameOperationRef.current,
          onRecoveryError: (message) => recoveryErrors.set("current", message),
          onRecovered: () => recoveryErrors.clear("current"),
        });
        return matched ? "continue" : "reopen";
      },
      onOperation: (event) => {
        recoveryErrors.clear("stream");
        applyStudioOperationEvent(event, {
          setRunInGameOperation,
          setSaveDeployOperation,
        });
      },
      onLiveGame: (event) => {
        recoveryErrors.clear("stream");
        applyStudioLiveGameEvent(event, { applyLiveGameState });
      },
      onUnexpectedEnd: (error) => {
        recoveryErrors.set("stream", formatStudioEventStreamError(error));
      },
    }).catch((error: unknown) => {
      if (abortController.signal.aborted || isAbortLikeError(error)) return;
      recoveryErrors.set("stream", formatStudioEventStreamError(error));
    });

    return () => {
      abortController.abort();
    };
  }, [
    applyLiveGameState,
    clearLocalError,
    currentRunInGameOperationRef,
    markRunInGameToastHandled,
    setLocalError,
    setRunInGameOperation,
    setSaveDeployOperation,
  ]);
}
