// @vitest-environment jsdom

import type { RunInGameOperationStatus } from "@civ7/studio-contract";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "./_setup";

vi.mock("../../src/features/runInGame/api", () => ({ runCurrentConfigInGame: vi.fn() }));
vi.mock("../../src/lib/orpc", () => ({
  orpcClient: {
    runInGame: { diagnostics: vi.fn() },
    studio: { operations: { current: vi.fn() } },
  },
}));

import { type UseRunInGameArgs, useRunInGame } from "../../src/app/hooks/useRunInGame";
import { useRunInGameTerminalToast } from "../../src/app/hooks/useRunInGameTerminalToast";
import { getRecipeDefaultCanonicalConfig } from "../../src/features/configAuthoring/canonicalConfig";
import { runCurrentConfigInGame } from "../../src/features/runInGame/api";
import { DEFAULT_WORLD_SETTINGS } from "../../src/ui/constants/defaults";

const canonicalConfig = getRecipeDefaultCanonicalConfig("standard");
const runRpc = vi.mocked(runCurrentConfigInGame);
const setupConfig = { gameOptions: {}, playerOptions: [{ playerId: 0, options: {} }] };

function runningStatus(requestId = "run-request"): RunInGameOperationStatus {
  return {
    requestId,
    phase: "deploying",
    status: "running",
    recoveryActions: [],
  };
}

function completedStatus(requestId: string): RunInGameOperationStatus {
  return {
    requestId,
    phase: "completed",
    status: "completed",
    recoveryActions: ["copy-diagnostics"],
  };
}

function makeArgs(over: Partial<UseRunInGameArgs> = {}): UseRunInGameArgs {
  return {
    seed: "123",
    worldSettings: { ...DEFAULT_WORLD_SETTINGS },
    canonicalConfig,
    authoringRevision: 3,
    setupConfig,
    setSeed: vi.fn(),
    setSetupConfig: vi.fn(),
    liveRuntime: { status: "idle" },
    liveRuntimeSuggestions: [],
    runInGameOperation: null,
    setRunInGameOperation: vi.fn(),
    runInGameRunning: false,
    saveDeployRunning: false,
    browserRunning: false,
    runInGameSnapshot: null,
    setRunInGameSnapshot: vi.fn(),
    lastRunInGameToastRef: { current: null },
    setLocalError: vi.fn(),
    toast: vi.fn(),
    ...over,
  };
}

function setup(over: Partial<UseRunInGameArgs> = {}) {
  const setRunInGameSnapshot = vi.fn<UseRunInGameArgs["setRunInGameSnapshot"]>();
  const props = makeArgs({ ...over, setRunInGameSnapshot });
  const view = renderHook((current: UseRunInGameArgs) => useRunInGame(current), {
    initialProps: props,
  });
  return { ...view, props, setRunInGameSnapshot };
}

afterEach(() => vi.clearAllMocks());

describe("useRunInGame config handoff", () => {
  it("sends the complete config and retains an immutable submitted snapshot", async () => {
    runRpc.mockResolvedValue(runningStatus("config-run"));
    const { result, setRunInGameSnapshot } = setup();

    await act(async () => result.current.handleRunInGame());

    expect(runRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        canonicalConfig,
        seed: "123",
      })
    );
    expect(runRpc.mock.calls[0]?.[0].canonicalConfig).toBe(canonicalConfig);
    const snapshotUpdate = setRunInGameSnapshot.mock.calls[0]?.[0];
    if (typeof snapshotUpdate === "function") {
      throw new Error("Run in Game launch must store an exact submitted snapshot");
    }
    const snapshot = snapshotUpdate;
    expect(snapshot).toMatchObject({
      requestId: "config-run",
      authoringRevision: 3,
      launchEnvelope: { seed: "123", canonicalConfig },
    });
    expect(snapshot?.launchEnvelope.canonicalConfig).not.toBe(canonicalConfig);
    expect(Object.isFrozen(snapshot?.launchEnvelope.canonicalConfig)).toBe(true);
  });

  it("rejects invalid configs before invoking Run in Game RPC", async () => {
    const { result, props } = setup({
      canonicalConfig: { ...canonicalConfig, config: {} },
    });

    await act(async () => result.current.handleRunInGame());

    expect(runRpc).not.toHaveBeenCalled();
    expect(props.setLocalError).toHaveBeenCalledWith(
      "Run in Game failed: config is invalid for this recipe."
    );
  });

  it("does not fabricate an operation identity when admission fails", async () => {
    runRpc.mockResolvedValue({
      ok: false,
      error: "admission failed",
      safeFailureCategory: "request-validation",
    });
    const { result, props } = setup();

    await act(async () => result.current.handleRunInGame());

    expect(props.setRunInGameOperation).not.toHaveBeenCalled();
    expect(props.setRunInGameSnapshot).not.toHaveBeenCalled();
  });

  it("does not regress a terminal event when the accepted start response arrives later", async () => {
    const requestId = "run-terminal-before-response";
    const response = deferred<RunInGameOperationStatus>();
    const toastStamp = { current: null as string | null };
    let operation: RunInGameOperationStatus | null = null;
    const setRunInGameOperation: UseRunInGameArgs["setRunInGameOperation"] = (update) => {
      operation = typeof update === "function" ? update(operation) : update;
    };
    runRpc.mockReturnValue(response.promise);
    const { result, props } = setup({ setRunInGameOperation, lastRunInGameToastRef: toastStamp });
    let launch: Promise<void> | undefined;

    await act(async () => {
      launch = result.current.handleRunInGame();
      await Promise.resolve();
    });
    operation = completedStatus(requestId);
    toastStamp.current = requestId;
    await act(async () => result.current.handleRunInGame());
    expect(runRpc).toHaveBeenCalledTimes(1);
    expect(props.toast).toHaveBeenCalledWith(
      "Run in Game is still being admitted; wait for the request to settle.",
      { variant: "info" }
    );
    await act(async () => {
      response.resolve(runningStatus(requestId));
      await launch;
    });

    expect(operation).toEqual(completedStatus(requestId));
    expect(toastStamp.current).toBe(requestId);
    expect(props.toast).not.toHaveBeenCalledWith(expect.stringContaining("started"), {
      variant: "info",
    });
  });

  it("toasts a newly pushed terminal once and suppresses retained historical terminals", () => {
    const requestId = "run-terminal-toast";
    const toast = vi.fn();
    const toastStamp = { current: null as string | null };
    const view = renderHook(
      ({ operation }: { operation: RunInGameOperationStatus }) =>
        useRunInGameTerminalToast({
          runInGameOperation: operation,
          lastRunInGameToastRef: toastStamp,
          toast,
        }),
      { initialProps: { operation: runningStatus(requestId) } }
    );

    view.rerender({ operation: completedStatus(requestId) });
    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith(`Run in Game complete: ${requestId}`, {
      variant: "success",
    });
    view.rerender({ operation: completedStatus(requestId) });
    expect(toast).toHaveBeenCalledTimes(1);
    view.unmount();

    const historicalToast = vi.fn();
    renderHook(() =>
      useRunInGameTerminalToast({
        runInGameOperation: completedStatus(requestId),
        lastRunInGameToastRef: { current: requestId },
        toast: historicalToast,
      })
    );
    expect(historicalToast).not.toHaveBeenCalled();
  });
});

function deferred<T>() {
  let resolvePromise = (_value: T): void => {
    throw new Error("Deferred promise resolver was not initialized");
  };
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });
  return { promise, resolve: resolvePromise };
}
