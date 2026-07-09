import type { RunInGameOperationStatus } from "@civ7/studio-contract";
// The formatters/predicate moved to the package with the B5 statusLabels
// split; their pins stay here (this suite covers the whole run-in-game status
// vocabulary the app consumes) and exercise the package's public surface.
import {
  formatRunInGamePhaseLabel,
  runInGamePrimaryActionLabel,
} from "@swooper/mapgen-studio-ui";
import { describe, expect, it } from "vitest";
import { isRunInGameTerminalPhase, kindForRunInGamePhase } from "../../src/features/runInGame/status";

describe("Run in Game status helpers", () => {
  it("classifies running and terminal phases", () => {
    expect(kindForRunInGamePhase("preparing-civ7")).toBe("running");
    expect(kindForRunInGamePhase("completed")).toBe("completed");
    expect(isRunInGameTerminalPhase("observing-runtime")).toBe(false);
    expect(isRunInGameTerminalPhase("failed")).toBe(true);
  });

  it("formats compact phase labels for footer controls", () => {
    expect(formatRunInGamePhaseLabel("preparing-civ7")).toBe("Preparing Civ7");
    expect(formatRunInGamePhaseLabel("starting-game")).toBe("Starting Game");
    expect(formatRunInGamePhaseLabel("observing-runtime")).toBe("Observing Runtime");
  });

  it("keeps process-restart recovery as a diagnostic suggestion, not the Play action", () => {
    const status: RunInGameOperationStatus = {
      requestId: "studio-run-in-game-reload",
      phase: "failed",
      status: "failed",
      safeFailureCategory: "runtime-control",
      recoveryActions: ["restart-civ-process-and-retry", "copy-diagnostics"],
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:01.000Z",
      terminalAt: "2026-06-01T00:00:01.000Z",
    };

    expect(runInGamePrimaryActionLabel(status, "current")).toBe("Retry Run");
    expect(runInGamePrimaryActionLabel(status, "stale")).toBe("Run Current");
    expect(
      runInGamePrimaryActionLabel({ ...status, recoveryActions: ["retry-run"] }, "current")
    ).toBe("Retry Run");
    expect(
      runInGamePrimaryActionLabel({ ...status, recoveryActions: ["retry-run"] }, "stale")
    ).toBe("Run Current");
  });
});
