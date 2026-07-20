import {
  type MapConfigSaveDeployStatus,
  operationStatusTypeSchema,
  type RunInGameOperationStatus,
  type StudioEvent,
  type StudioLiveGameEvent,
  type StudioOperationEvent,
  type StudioOperationsCurrent,
  studio,
  typeboxOutputSchemaFromContractProcedure,
} from "@civ7/studio-contract";
import { ClientRetryPlugin, type ClientRetryPluginContext } from "@orpc/client/plugins";
import type { StandardLinkOptions } from "@orpc/client/standard";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  consumeStudioEventStream,
  createStudioEventRecoveryErrors,
  reconcileStudioOperationsCurrent,
  STUDIO_RECOVERY_RETRY_ATTEMPTS,
  studioRecoveryClientContext,
} from "../../src/app/hooks/useStudioEvents";
import {
  adoptStudioOperationsCurrent,
  applyStudioLiveGameEvent,
  applyStudioOperationEvent,
  mergeRunInGameOperation,
  mergeSaveDeployFailureResponse,
  mergeSaveDeployOperation,
  readAndAdoptStudioOperationsCurrent,
  type StudioOperationStateUpdate,
} from "../../src/app/operationAdoption";
import {
  formatStudioDaemonIdentityMismatch,
  formatStudioEventStreamError,
  identityFromStudioOperationsCurrent,
  sameStudioDaemonIdentity,
  studioBusyGateMessage,
} from "../../src/app/studioEventRecovery";
import type { LiveRuntimeStatusState } from "../../src/features/liveRuntime/model";

const operationsCurrentOutputSchema = typeboxOutputSchemaFromContractProcedure(
  studio.operationsCurrent
);

describe("Studio event operation adoption", () => {
  test("adopts active daemon current operations without marking terminal toasts", () => {
    const state = adoptionState();

    adoptStudioOperationsCurrent(
      currentOperations({
        runInGame: {
          active: runningRunStatus({ requestId: "run-1", phase: "deploying" }),
          recent: [],
        },
        saveDeploy: {
          active: null,
          recent: [
            {
              ok: true,
              requestId: "save-1",
              phase: "complete",
              status: "complete",
              saved: true,
              deployed: true,
              recoveryActions: [],
            },
          ],
        },
      }),
      state.targets
    );

    expect(state.readRunInGame()?.requestId).toBe("run-1");
    expect(state.readSaveDeploy()?.requestId).toBe("save-1");
    expect(state.handledRunInGameToasts).toEqual([]);
  });

  test("adopts retained terminal current operations as recent display state", () => {
    const state = adoptionState();

    adoptStudioOperationsCurrent(
      currentOperations({
        runInGame: {
          active: null,
          recent: [completedRunStatus({ requestId: "run-terminal" })],
        },
      }),
      state.targets
    );

    expect(state.readRunInGame()?.requestId).toBe("run-terminal");
    expect(state.handledRunInGameToasts).toEqual(["run-terminal"]);
  });

  test("missed terminal event recovery adopts daemon terminal current over local running state", () => {
    const state = adoptionState({
      runInGame: runningRunStatus({
        requestId: "run-missed-terminal",
        phase: "starting-game",
      }),
    });

    adoptStudioOperationsCurrent(
      currentOperations({
        observedAt: "2026-06-13T00:00:05.000Z",
        runInGame: {
          active: null,
          recent: [
            failedRunStatus({
              requestId: "run-missed-terminal",
              diagnosticsId: "run-diagnostics-missed-terminal",
              safeFailureCategory: "runtime-control",
            }),
          ],
        },
      }),
      state.targets,
      {
        currentRunInGameOperation: state.readRunInGame(),
      }
    );

    expect(state.readRunInGame()).toMatchObject({
      requestId: "run-missed-terminal",
      status: "failed",
      phase: "failed",
      diagnosticsId: "run-diagnostics-missed-terminal",
      safeFailureCategory: "runtime-control",
    });
    expect(state.handledRunInGameToasts).toEqual([]);
  });

  test("browser reload adoption displays daemon active and terminal state without replaying start", async () => {
    const state = adoptionState();
    const currentReads: StudioOperationsCurrent[] = [
      currentOperations({
        runInGame: {
          active: runningRunStatus({
            requestId: "run-reload-active",
            phase: "deploying",
          }),
          recent: [],
        },
      }),
      currentOperations({
        observedAt: "2026-06-13T00:00:04.000Z",
        runInGame: {
          active: null,
          recent: [completedRunStatus({ requestId: "run-reload-terminal" })],
        },
      }),
    ];
    let readIndex = 0;

    await readAndAdoptStudioOperationsCurrent({
      readCurrent: async () => currentReads[readIndex++] ?? currentOperations(),
      targets: state.targets,
      onError: () => {
        throw new Error("unexpected reload current read failure");
      },
    });

    expect(state.readRunInGame()).toMatchObject({
      requestId: "run-reload-active",
      status: "running",
      phase: "deploying",
    });

    await readAndAdoptStudioOperationsCurrent({
      readCurrent: async () => currentReads[readIndex++] ?? currentOperations(),
      targets: state.targets,
      getCurrentRunInGameOperation: state.readRunInGame,
      onError: () => {
        throw new Error("unexpected reload terminal current read failure");
      },
    });

    expect(state.readRunInGame()).toMatchObject({
      requestId: "run-reload-terminal",
      status: "completed",
      phase: "completed",
    });
    expect(readIndex).toBe(2);
    expect(state.handledRunInGameToasts).toEqual(["run-reload-terminal"]);
  });

  test("event stream reconciliation does not use terminal state as proof a toast fired", async () => {
    const state = adoptionState({
      runInGame: runningRunStatus({
        requestId: "run-reconnect",
        phase: "observing-runtime",
      }),
    });
    let adopted = 0;

    await readAndAdoptStudioOperationsCurrent({
      readCurrent: async () =>
        currentOperations({
          observedAt: "2026-06-13T00:00:05.000Z",
          runInGame: {
            active: null,
            recent: [
              completedRunStatus({
                requestId: "run-reconnect",
              }),
            ],
          },
        }),
      targets: state.targets,
      getCurrentRunInGameOperation: state.readRunInGame,
      onAdopted: () => {
        adopted += 1;
      },
      onError: () => {
        throw new Error("unexpected reconnect current read failure");
      },
    });

    await readAndAdoptStudioOperationsCurrent({
      readCurrent: async () =>
        currentOperations({
          observedAt: "2026-06-13T00:00:06.000Z",
          runInGame: {
            active: null,
            recent: [
              completedRunStatus({
                requestId: "run-reconnect",
              }),
            ],
          },
        }),
      targets: state.targets,
      getCurrentRunInGameOperation: state.readRunInGame,
      onAdopted: () => {
        adopted += 1;
      },
      onError: () => {
        throw new Error("unexpected second reconnect current read failure");
      },
    });

    expect(state.readRunInGame()).toMatchObject({
      requestId: "run-reconnect",
      status: "completed",
      phase: "completed",
    });
    expect(adopted).toBe(2);
    expect(state.handledRunInGameToasts).toEqual([]);
  });

  test("clears stale displayed operations when daemon current truth is empty", () => {
    const state = adoptionState({
      runInGame: runningRunStatus({
        requestId: "stale-run",
        phase: "generating-artifacts",
      }),
      saveDeploy: {
        ok: true,
        requestId: "stale-save",
        phase: "deploying",
        status: "running",
        recoveryActions: ["retry-status"],
      },
    });

    adoptStudioOperationsCurrent(currentOperations(), state.targets);

    expect(state.readRunInGame()).toBeNull();
    expect(state.readSaveDeploy()).toBeNull();
  });

  test("treats an empty registry snapshot as current truth over displayed local state", () => {
    const state = adoptionState({
      runInGame: failedRunStatus({
        requestId: "run-local-failed",
      }),
    });

    adoptStudioOperationsCurrent(currentOperations(), state.targets, {
      currentRunInGameOperation: state.readRunInGame(),
    });

    expect(state.readRunInGame()).toBeNull();
  });

  test("adopts daemon recent terminal Run in Game status over displayed local terminal state", () => {
    const state = adoptionState({
      runInGame: failedRunStatus({
        requestId: "run-local-failed",
      }),
    });

    adoptStudioOperationsCurrent(
      currentOperations({
        observedAt: "2026-06-13T00:00:06.000Z",
        runInGame: {
          active: null,
          recent: [completedRunStatus({ requestId: "daemon-terminal" })],
        },
      }),
      state.targets,
      {
        currentRunInGameOperation: state.readRunInGame(),
      }
    );

    expect(state.readRunInGame()?.requestId).toBe("daemon-terminal");
  });

  test("adopts daemon active current operation over displayed local terminal state", () => {
    const state = adoptionState({
      runInGame: failedRunStatus({
        requestId: "run-local-failed",
      }),
    });

    adoptStudioOperationsCurrent(
      currentOperations({
        observedAt: "2026-06-13T00:00:06.000Z",
        runInGame: {
          active: runningRunStatus({
            requestId: "run-daemon-active",
            phase: "deploying",
          }),
          recent: [],
        },
      }),
      state.targets,
      {
        currentRunInGameOperation: state.readRunInGame(),
      }
    );

    expect(state.readRunInGame()?.requestId).toBe("run-daemon-active");
  });

  test("shell boot adoption reads daemon current exactly once", async () => {
    const state = adoptionState();
    let currentReads = 0;

    await readAndAdoptStudioOperationsCurrent({
      readCurrent: async () => {
        currentReads += 1;
        return currentOperations({
          runInGame: {
            active: runningRunStatus({ requestId: "run-active", phase: "starting-game" }),
            recent: [],
          },
        });
      },
      targets: state.targets,
      onError: () => {
        throw new Error("unexpected current read failure");
      },
    });

    expect(currentReads).toBe(1);
    expect(state.readRunInGame()?.requestId).toBe("run-active");
  });

  test("current adoption does not let in-flight local status override registry sequencing", async () => {
    const state = adoptionState();
    let localOperation: RunInGameOperationStatus | null = null;
    const currentRead = deferred<StudioOperationsCurrent>();

    const read = readAndAdoptStudioOperationsCurrent({
      readCurrent: () => currentRead.promise,
      targets: state.targets,
      getCurrentRunInGameOperation: () => localOperation,
      onError: () => {
        throw new Error("unexpected current read failure");
      },
    });

    localOperation = failedRunStatus({
      requestId: "run-local-after-read-start",
    });
    currentRead.resolve(currentOperations());
    await read;

    expect(state.readRunInGame()).toBeNull();
  });

  test("classifies stream recovery, daemon identity mismatch, and busy gates", () => {
    const hello = checkedStudioEvent({
      type: "hello",
      serverInstanceId: "studio-a",
      serverStartedAt: "2026-06-13T00:00:00.000Z",
      observedAt: "2026-06-13T00:00:01.000Z",
    });
    const current = currentOperations({
      serverInstanceId: "studio-a",
      serverStartedAt: "2026-06-13T00:00:00.000Z",
    });
    const restarted = currentOperations({
      serverInstanceId: "studio-b",
      serverStartedAt: "2026-06-13T00:00:02.000Z",
    });

    expect(formatStudioEventStreamError(new Error("stream down"))).toBe("stream down");
    expect(sameStudioDaemonIdentity(identityFromStudioOperationsCurrent(current), hello)).toBe(
      true
    );
    expect(
      formatStudioDaemonIdentityMismatch(hello, identityFromStudioOperationsCurrent(restarted))
    ).toContain("refused mismatched daemon state");
    expect(studioBusyGateMessage({ subject: "Explore", runInGameRunning: true })).toContain(
      "Run in Game"
    );
  });

  test("keeps current-recovery errors visible when pushed events recover the stream lane", () => {
    const visible: string[] = [];
    const cleared: string[] = [];
    const errors = createStudioEventRecoveryErrors({
      setLocalError: (message) => visible.push(message),
      clearLocalError: (message) => cleared.push(message),
    });

    errors.set("stream", "stream retrying");
    errors.set("current", "current daemon identity mismatched");
    errors.clear("stream");

    expect(visible).toEqual(["stream retrying", "current daemon identity mismatched"]);
    expect(cleared).toEqual([]);

    errors.clear("current");
    expect(cleared).toEqual(["current daemon identity mismatched"]);
  });

  test("applies pushed Run in Game operation events without pre-handling terminal toasts", () => {
    const state = adoptionState();

    applyStudioOperationEvent(
      operationEvent({
        kind: "run-in-game",
        status: completedRunStatus({ requestId: "run-pushed-1" }),
      }),
      state.targets
    );

    expect(state.readRunInGame()?.requestId).toBe("run-pushed-1");
    expect(state.handledRunInGameToasts).toEqual([]);
  });

  test("pushed Run in Game terminal events replace local running state immediately", () => {
    const state = adoptionState({
      runInGame: runningRunStatus({
        requestId: "run-pushed-terminal",
        phase: "starting-game",
      }),
    });

    applyStudioOperationEvent(
      operationEvent({
        kind: "run-in-game",
        status: failedRunStatus({
          requestId: "run-pushed-terminal",
          diagnosticsId: "run-diagnostics-pushed-terminal",
        }),
      }),
      state.targets
    );

    expect(state.readRunInGame()).toMatchObject({
      requestId: "run-pushed-terminal",
      status: "failed",
      phase: "failed",
      diagnosticsId: "run-diagnostics-pushed-terminal",
    });
    expect(state.handledRunInGameToasts).toEqual([]);
  });

  test("same-request terminal operations cannot regress to older running observations", () => {
    const runTerminal = completedRunStatus({ requestId: "run-monotonic" });
    const saveTerminal: MapConfigSaveDeployStatus = {
      ok: true,
      requestId: "save-monotonic",
      phase: "complete",
      status: "complete",
      saved: true,
      deployed: true,
      recoveryActions: [],
    };

    expect(
      mergeRunInGameOperation(
        runTerminal,
        runningRunStatus({ requestId: "run-monotonic", phase: "starting-game" })
      )
    ).toBe(runTerminal);
    expect(
      mergeRunInGameOperation(runTerminal, failedRunStatus({ requestId: "run-monotonic" }))
    ).toBe(runTerminal);
    expect(
      mergeSaveDeployOperation(saveTerminal, {
        ok: true,
        requestId: "save-monotonic",
        phase: "deploying",
        status: "running",
        saved: true,
        deployed: false,
        recoveryActions: ["retry-status"],
      })
    ).toBe(saveTerminal);
    expect(
      mergeSaveDeployOperation(saveTerminal, {
        ok: false,
        requestId: "save-monotonic",
        phase: "failed",
        status: "failed",
        saved: true,
        deployed: false,
        safeFailureCategory: "deployment",
        recoveryActions: ["retry-save-deploy"],
      })
    ).toMatchObject({ status: "failed" });

    const syntheticFailure: Extract<MapConfigSaveDeployStatus, { ok: false }> = {
      ok: false,
      requestId: "save-monotonic",
      phase: "failed",
      status: "failed",
      saved: true,
      deployed: false,
      safeFailureCategory: "deployment",
      recoveryActions: ["retry-save-deploy"],
    };
    const runningSave: MapConfigSaveDeployStatus = {
      ok: true,
      requestId: "save-monotonic",
      phase: "deploying",
      status: "running",
      saved: true,
      deployed: false,
      recoveryActions: ["retry-status"],
    };
    expect(mergeSaveDeployFailureResponse(saveTerminal, syntheticFailure)).toBe(saveTerminal);
    expect(
      mergeSaveDeployOperation(
        mergeSaveDeployFailureResponse(runningSave, syntheticFailure),
        saveTerminal
      )
    ).toBe(saveTerminal);
  });

  test("applies pushed Save&Deploy operation events", () => {
    const state = adoptionState();

    applyStudioOperationEvent(
      operationEvent({
        kind: "save-deploy",
        status: {
          ok: true,
          requestId: "save-pushed-1",
          phase: "complete",
          status: "complete",
          saved: true,
          deployed: true,
          recoveryActions: [],
        },
      }),
      state.targets
    );

    expect(state.readSaveDeploy()?.requestId).toBe("save-pushed-1");
  });

  test("applies pushed live-game events", () => {
    const appliedStates: LiveRuntimeStatusState[] = [];

    applyStudioLiveGameEvent(
      liveGameEvent({
        status: "ok",
        turn: 12,
        gameHash: 987654,
        seed: 123,
        readiness: "ready",
        snapshotStatus: "idle",
        snapshotId: "status:12:abcdef01",
        snapshotHash: "abcdef01",
        bindingStatus: "unbound-runtime",
        failureCount: 0,
      }),
      {
        applyLiveGameState(state) {
          appliedStates.push(state);
        },
      }
    );

    expect(appliedStates[0]?.status).toBe("ok");
    expect(appliedStates[0]?.turn).toBe(12);
    expect(appliedStates[0]?.snapshotId).toBe("status:12:abcdef01");
  });

  test("assigns retry to oRPC while refusing callbacks after abort", async () => {
    const retryErrors: unknown[] = [];
    const context = studioRecoveryClientContext((error) => retryErrors.push(error));
    const retryError = new Error("stream disconnected");
    const active = new AbortController();
    const aborted = new AbortController();
    aborted.abort();

    expect(context.retry).toBe(Number.POSITIVE_INFINITY);
    expect(STUDIO_RECOVERY_RETRY_ATTEMPTS).toBe(Number.POSITIVE_INFINITY);
    if (typeof context.shouldRetry !== "function") {
      throw new Error("Expected abort-aware stream retry decision");
    }
    if (!context.onRetry) throw new Error("Expected stream retry callback");
    const attempt = (signal: AbortSignal) =>
      ({ error: retryError, signal }) as Parameters<NonNullable<typeof context.onRetry>>[0];

    expect(await context.shouldRetry(attempt(active.signal))).toBe(true);
    expect(await context.shouldRetry(attempt(aborted.signal))).toBe(false);
    context.onRetry(attempt(active.signal));
    context.onRetry(attempt(aborted.signal));
    expect(retryErrors).toEqual([retryError]);
  });

  test("aborting during the native retry delay prevents another transport call", async () => {
    const retryStarted = deferred<void>();
    const abortController = new AbortController();
    const options: StandardLinkOptions<ClientRetryPluginContext> = {};
    new ClientRetryPlugin<ClientRetryPluginContext>().init(options);
    const interceptor = options.interceptors?.[0];
    if (!interceptor) throw new Error("Expected ClientRetryPlugin interceptor");
    const disconnect = new Error("stream disconnected during retry");
    let transportCalls = 0;

    const output = await interceptor({
      path: ["studio", "events", "watch"],
      input: {},
      signal: abortController.signal,
      context: studioRecoveryClientContext(() => retryStarted.resolve()),
      next: async () => {
        transportCalls += 1;
        return transportCalls === 1
          ? rejectingEventIterator(disconnect)
          : trackedEventIterator([], { onNext: () => undefined, onReturn: () => undefined });
      },
    });
    const iterator = output as AsyncIteratorObject<StudioEvent, unknown, void>;
    const pull = iterator.next();
    await retryStarted.promise;
    abortController.abort();

    await expect(pull).rejects.toBe(abortController.signal.reason);
    expect(transportCalls).toBe(1);
    await iterator.return?.();
  });

  test("discards a stale daemon stream before adopting the replacement", async () => {
    const abortController = new AbortController();
    const state = adoptionState();
    const order: string[] = [];
    const returns = [0, 0];
    const sources = [
      trackedEventIterator(
        [
          checkedStudioEvent({
            type: "hello",
            serverInstanceId: "studio-old",
            serverStartedAt: "2026-06-13T00:00:00.000Z",
            observedAt: "2026-06-13T00:00:01.000Z",
          }),
          operationEvent({
            kind: "run-in-game",
            status: completedRunStatus({ requestId: "run-old-buffered" }),
          }),
        ],
        {
          onNext: () => undefined,
          onReturn: () => {
            returns[0] = (returns[0] ?? 0) + 1;
          },
        }
      ),
      trackedEventIterator(
        [
          checkedStudioEvent({
            type: "hello",
            serverInstanceId: "studio-new",
            serverStartedAt: "2026-06-13T00:00:02.000Z",
            observedAt: "2026-06-13T00:00:03.000Z",
          }),
          operationEvent({
            kind: "run-in-game",
            status: completedRunStatus({ requestId: "run-new-buffered" }),
          }),
        ],
        {
          onNext: () => undefined,
          onReturn: () => {
            returns[1] = (returns[1] ?? 0) + 1;
          },
        }
      ),
    ];
    const currentReads = [
      currentOperations({
        serverInstanceId: "studio-new",
        serverStartedAt: "2026-06-13T00:00:02.000Z",
      }),
      currentOperations({
        serverInstanceId: "studio-new",
        serverStartedAt: "2026-06-13T00:00:02.000Z",
        runInGame: {
          active: runningRunStatus({ requestId: "run-matched", phase: "deploying" }),
          recent: [],
        },
      }),
    ];
    let opens = 0;
    let readIndex = 0;

    await consumeStudioEventStream({
      signal: abortController.signal,
      open: async () => sources[opens++] ?? sources[1]!,
      onHello: async (event) => {
        const matched = await reconcileStudioOperationsCurrent({
          signal: abortController.signal,
          expectedIdentity: event,
          readCurrent: async () => {
            order.push(`current:${readIndex}`);
            return currentReads[readIndex++] ?? currentOperations();
          },
          targets: state.targets,
          getCurrentRunInGameOperation: state.readRunInGame,
          onRecoveryError: () => order.push("mismatch"),
          onRecovered: () => order.push("matched"),
        });
        return matched ? "continue" : "reopen";
      },
      onOperation: (event) => {
        order.push("operation");
        applyStudioOperationEvent(event, state.targets);
        abortController.abort();
      },
      onLiveGame: () => undefined,
      onUnexpectedEnd: () => {
        throw new Error("neither daemon stream should end before its disposition");
      },
      waitBeforeReopen: async () => undefined,
    });

    expect(order).toEqual(["current:0", "mismatch", "current:1", "matched", "operation"]);
    expect(opens).toBe(2);
    expect(returns).toEqual([1, 1]);
    expect(state.readRunInGame()?.requestId).toBe("run-new-buffered");
  });

  test("consumes adjacent operation and live-game events in order without losing either", async () => {
    const abortController = new AbortController();
    const helloStarted = deferred<void>();
    const releaseHello = deferred<void>();
    const order: string[] = [];
    let nextCalls = 0;
    let returnCalls = 0;
    const events: StudioEvent[] = [
      checkedStudioEvent({
        type: "hello",
        serverInstanceId: "studio-test",
        serverStartedAt: "2026-06-13T00:00:00.000Z",
        observedAt: "2026-06-13T00:00:01.000Z",
      }),
      operationEvent({
        kind: "run-in-game",
        status: completedRunStatus({ requestId: "run-adjacent-terminal" }),
      }),
      liveGameEvent({
        status: "ok",
        turn: 1,
        gameHash: 123,
        seed: 456,
        readiness: "ready",
        snapshotStatus: "idle",
        snapshotId: "status:1:abcdef01",
        snapshotHash: "abcdef01",
        bindingStatus: "unbound-runtime",
        failureCount: 0,
      }),
    ];
    const iterator = trackedEventIterator(events, {
      onNext: () => {
        nextCalls += 1;
      },
      onReturn: () => {
        returnCalls += 1;
      },
    });

    const consumption = consumeStudioEventStream({
      signal: abortController.signal,
      open: async () => iterator,
      onHello: async () => {
        order.push("hello:start");
        helloStarted.resolve();
        await releaseHello.promise;
        order.push("hello:end");
        return "continue";
      },
      onOperation: () => order.push("operation"),
      onLiveGame: () => {
        order.push("live-game");
        abortController.abort();
      },
      onUnexpectedEnd: () => {
        throw new Error("stream should be aborted after the adjacent events");
      },
    });
    await helloStarted.promise;
    expect(nextCalls).toBe(1);

    releaseHello.resolve();
    await consumption;

    expect(order).toEqual(["hello:start", "hello:end", "operation", "live-game"]);
    expect(returnCalls).toBe(1);
  });

  test("aborting while next is pending closes the iterator exactly once", async () => {
    const abortController = new AbortController();
    let nextCalls = 0;
    let returnCalls = 0;
    const nextStarted = deferred<void>();
    const nextResult = deferred<IteratorResult<StudioEvent, unknown>>();
    const iterator = {
      next() {
        nextCalls += 1;
        nextStarted.resolve();
        return nextResult.promise;
      },
      async return() {
        returnCalls += 1;
        nextResult.resolve({ done: true, value: undefined });
        return { done: true, value: undefined };
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    } as AsyncIteratorObject<StudioEvent, unknown, void>;

    const consumption = consumeStudioEventStream({
      signal: abortController.signal,
      open: async () => iterator,
      onHello: async () => "continue",
      onOperation: () => undefined,
      onLiveGame: () => undefined,
      onUnexpectedEnd: () => {
        throw new Error("aborted pending reads are not clean stream endings");
      },
    });
    await nextStarted.promise;
    abortController.abort();
    await consumption;

    expect(nextCalls).toBe(1);
    expect(returnCalls).toBe(1);
  });

  test("reopens after clean iterator completion and closes every source once", async () => {
    const abortController = new AbortController();
    const returns = [0, 0];
    const sources = [
      trackedEventIterator([], {
        onNext: () => undefined,
        onReturn: () => {
          returns[0] = (returns[0] ?? 0) + 1;
        },
      }),
      trackedEventIterator(
        [
          checkedStudioEvent({
            type: "hello",
            serverInstanceId: "studio-test",
            serverStartedAt: "2026-06-13T00:00:00.000Z",
            observedAt: "2026-06-13T00:00:01.000Z",
          }),
        ],
        {
          onNext: () => undefined,
          onReturn: () => {
            returns[1] = (returns[1] ?? 0) + 1;
          },
        }
      ),
    ];
    let opens = 0;
    let unexpectedEnds = 0;

    await consumeStudioEventStream({
      signal: abortController.signal,
      open: async () => sources[opens++] ?? sources[1]!,
      onHello: async () => {
        abortController.abort();
        return "continue";
      },
      onOperation: () => undefined,
      onLiveGame: () => undefined,
      onUnexpectedEnd: () => {
        unexpectedEnds += 1;
      },
      waitBeforeReopen: async () => undefined,
    });

    expect(opens).toBe(2);
    expect(unexpectedEnds).toBe(1);
    expect(returns).toEqual([1, 1]);
  });
});

function adoptionState(initial?: {
  runInGame?: RunInGameOperationStatus | null;
  saveDeploy?: MapConfigSaveDeployStatus | null;
}) {
  let runInGame = initial?.runInGame ?? null;
  let saveDeploy = initial?.saveDeploy ?? null;
  const handledRunInGameToasts: string[] = [];
  return {
    readRunInGame: () => runInGame,
    readSaveDeploy: () => saveDeploy,
    handledRunInGameToasts,
    targets: {
      setRunInGameOperation(update: StudioOperationStateUpdate<RunInGameOperationStatus>) {
        runInGame = applyOperationUpdate(runInGame, update);
      },
      setSaveDeployOperation(update: StudioOperationStateUpdate<MapConfigSaveDeployStatus>) {
        saveDeploy = applyOperationUpdate(saveDeploy, update);
      },
      markRunInGameToastHandled(requestId: string) {
        handledRunInGameToasts.push(requestId);
      },
    },
  };
}

function applyOperationUpdate<Operation>(
  current: Operation | null,
  update: StudioOperationStateUpdate<Operation>
): Operation | null {
  return typeof update === "function"
    ? (update as (value: Operation | null) => Operation | null)(current)
    : update;
}

type StudioOperationEventInput =
  | { kind: "run-in-game"; status: RunInGameOperationStatus }
  | { kind: "save-deploy"; status: MapConfigSaveDeployStatus };

function operationEvent(event: StudioOperationEventInput): StudioOperationEvent {
  if (event.kind === "run-in-game") {
    return checkedStudioEvent({
      type: "operation",
      kind: event.kind,
      status: event.status,
      observedAt: "2026-06-13T00:00:02.000Z",
    });
  }
  return checkedStudioEvent({
    type: "operation",
    kind: event.kind,
    status: event.status,
    observedAt: "2026-06-13T00:00:02.000Z",
  });
}

type RunInGameRunningStatus = Extract<RunInGameOperationStatus, { status: "running" }>;
type RunInGameCompletedStatus = Extract<RunInGameOperationStatus, { status: "completed" }>;
type RunInGameFailedStatus = Extract<RunInGameOperationStatus, { status: "failed" }>;

function runningRunStatus(
  overrides: Partial<RunInGameRunningStatus> & Pick<RunInGameRunningStatus, "requestId">
): RunInGameRunningStatus {
  return checkedRunStatus({
    status: "running",
    phase: "observing-runtime",
    recoveryActions: ["retry-status"],
    ...overrides,
  });
}

function completedRunStatus(
  overrides: Partial<RunInGameCompletedStatus> & Pick<RunInGameCompletedStatus, "requestId">
): RunInGameCompletedStatus {
  return checkedRunStatus({
    status: "completed",
    phase: "completed",
    recoveryActions: ["copy-diagnostics"],
    ...overrides,
  });
}

function failedRunStatus(
  overrides: Partial<RunInGameFailedStatus> & Pick<RunInGameFailedStatus, "requestId">
): RunInGameFailedStatus {
  return checkedRunStatus({
    status: "failed",
    phase: "failed",
    safeFailureCategory: "runtime-control",
    recoveryActions: ["copy-diagnostics", "retry-status", "retry-run"],
    ...overrides,
  });
}

function checkedRunStatus<T extends RunInGameOperationStatus>(status: T): T {
  expect(Value.Check(operationStatusTypeSchema, status)).toBe(true);
  return status;
}

function liveGameEvent(state: StudioLiveGameEvent["state"]): StudioLiveGameEvent {
  return checkedStudioEvent({
    type: "live-game",
    observedAt: "2026-06-13T00:00:02.000Z",
    state,
  });
}

function checkedStudioEvent<const Event extends StudioEvent>(event: Event): Event {
  expect(Value.Check(studio.studioEventSchema, event)).toBe(true);
  return event;
}

function trackedEventIterator(
  events: readonly StudioEvent[],
  callbacks: Readonly<{ onNext(): void; onReturn(): void }>
): AsyncIteratorObject<StudioEvent, unknown, void> {
  let index = 0;
  return {
    async next() {
      callbacks.onNext();
      const event = events[index];
      index += 1;
      return event === undefined ? { done: true, value: undefined } : { done: false, value: event };
    },
    async return() {
      callbacks.onReturn();
      return { done: true, value: undefined };
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  } as AsyncIteratorObject<StudioEvent, unknown, void>;
}

function rejectingEventIterator(error: Error): AsyncIteratorObject<StudioEvent, unknown, void> {
  return {
    async next() {
      throw error;
    },
    async return() {
      return { done: true, value: undefined };
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}

function deferred<T>(): { promise: Promise<T>; resolve(value: T): void } {
  let resolvePromise = (_value: T): void => {
    throw new Error("Deferred promise resolver was not initialized");
  };
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });
  return { promise, resolve: resolvePromise };
}

function currentOperations(overrides?: Partial<StudioOperationsCurrent>): StudioOperationsCurrent {
  const current: StudioOperationsCurrent = {
    ok: true,
    serverInstanceId: "studio-test",
    serverStartedAt: "2026-06-13T00:00:00.000Z",
    observedAt: "2026-06-13T00:00:00.000Z",
    runInGame: {
      active: null,
      recent: [],
    },
    saveDeploy: {
      active: null,
      recent: [],
    },
    ...overrides,
  };
  expect(Value.Check(operationsCurrentOutputSchema, current)).toBe(true);
  return current;
}
