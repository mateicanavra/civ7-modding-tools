// @vitest-environment jsdom
import type { MapConfigSaveDeployStatus, RunInGameOperationStatus } from "@civ7/studio-contract";
import { act, render, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  type StudioOperations,
  useStudioOperations,
} from "../../src/app/hooks/useStudioOperations";
import "./_setup";

const runOp = (status: RunInGameOperationStatus["status"]): RunInGameOperationStatus => {
  const base = {
    requestId: `run-${status}`,
    recoveryActions: [] as RunInGameOperationStatus["recoveryActions"],
  };
  switch (status) {
    case "running":
      return { ...base, status, phase: "observing-runtime" };
    case "completed":
      return { ...base, status, phase: "completed" };
    case "failed":
      return {
        ...base,
        status,
        phase: "failed",
        safeFailureCategory: "internal-defect",
      };
    case "cancelled":
      return {
        ...base,
        status,
        phase: "cancelled",
        safeFailureCategory: "operation-cancelled",
      };
  }
};
const saveOp = (status: MapConfigSaveDeployStatus["status"]) =>
  ({ status }) as unknown as MapConfigSaveDeployStatus;

describe("useStudioOperations — synchronous busy gate (BG-1 / ADD-3)", () => {
  it("keeps each busy boolean === (op.status === 'running') in the SAME render (no one-render lag)", () => {
    type Frame = {
      runOp: RunInGameOperationStatus | null;
      runRunning: boolean;
      runRef: RunInGameOperationStatus | null;
      saveOp: MapConfigSaveDeployStatus | null;
      saveRunning: boolean;
      saveRef: MapConfigSaveDeployStatus | null;
    };
    const frames: Frame[] = [];
    let latest!: StudioOperations;

    function Probe() {
      const ops = useStudioOperations();
      latest = ops;
      // Captured DURING render: a republish-via-effect would make `running` (or
      // the latest-ref) lag the op for exactly the render that changed it.
      frames.push({
        runOp: ops.runInGameOperation,
        runRunning: ops.runInGameRunning,
        runRef: ops.runInGameOperationRef.current,
        saveOp: ops.saveDeployOperation,
        saveRunning: ops.saveDeployRunning,
        saveRef: ops.saveDeployOperationCurrentRef.current,
      });
      return null;
    }

    render(<Probe />);
    const running = runOp("running");
    const complete = runOp("completed");
    const savingNow = saveOp("running");
    act(() => latest.setRunInGameOperation(running));
    act(() => latest.setSaveDeployOperation(savingNow));
    act(() => latest.setRunInGameOperation(complete));

    expect(frames.length).toBeGreaterThanOrEqual(4); // initial + 3 commits

    for (const f of frames) {
      // Busy boolean is synchronous with the op it derives from.
      expect(f.runRunning).toBe(f.runOp?.status === "running");
      expect(f.saveRunning).toBe(f.saveOp?.status === "running");
      // Latest-ref mirrors the op in the same render (useLatestRef render-write).
      expect(f.runRef).toBe(f.runOp);
      expect(f.saveRef).toBe(f.saveOp);
    }

    // End state sanity.
    expect(latest.runInGameRunning).toBe(false); // last set = complete
    expect(latest.saveDeployRunning).toBe(true);
  });

  it("defaults every derived signal to falsey on the first render", () => {
    const { result } = renderHook(() => useStudioOperations());
    expect(result.current.runInGameRunning).toBe(false);
    expect(result.current.saveDeployRunning).toBe(false);
    expect(result.current.localError).toBeNull();
    expect(result.current.runInGameOperation).toBeNull();
    expect(result.current.saveDeployOperation).toBeNull();
    expect(result.current.runInGameOperationRef.current).toBeNull();
    expect(result.current.saveDeployOperationCurrentRef.current).toBeNull();
  });
});

describe("useStudioOperations — error channel (ADD-2)", () => {
  it("is single-owner; clearLocalErrorIfCurrent clears only the matching message", () => {
    const { result } = renderHook(() => useStudioOperations());
    expect(result.current.localError).toBeNull();

    act(() => result.current.setLocalError("boom"));
    expect(result.current.localError).toBe("boom");

    // Non-matching clear is a no-op (a later error must not be wiped by an
    // earlier message's clear).
    act(() => result.current.clearLocalErrorIfCurrent("stale"));
    expect(result.current.localError).toBe("boom");

    // Matching clear resets.
    act(() => result.current.clearLocalErrorIfCurrent("boom"));
    expect(result.current.localError).toBeNull();
  });
});
