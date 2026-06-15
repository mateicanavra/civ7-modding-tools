import type { RunInGameOperationStatus } from "@civ7/studio-server";
import { describe, expect, it } from "vitest";
import {
  formatRunInGameDiagnostics,
  formatRunInGamePhaseLabel,
  isRunInGameTerminalPhase,
  kindForRunInGamePhase,
  runInGamePrimaryActionLabel,
  runInGameRequiresProcessRestart,
} from "../../src/features/runInGame/status";

describe("Run in Game status helpers", () => {
  it("classifies running and terminal phases", () => {
    expect(kindForRunInGamePhase("checking-civ7")).toBe("running");
    expect(kindForRunInGamePhase("complete")).toBe("complete");
    expect(kindForRunInGamePhase("uncertain")).toBe("uncertain");
    expect(isRunInGameTerminalPhase("waiting-for-proof")).toBe(false);
    expect(isRunInGameTerminalPhase("failed")).toBe(true);
  });

  it("formats compact phase labels for footer controls", () => {
    expect(formatRunInGamePhaseLabel("preparing-setup")).toBe("Preparing Setup");
    expect(formatRunInGamePhaseLabel("restarting-civ")).toBe("Restarting Civ");
    expect(formatRunInGamePhaseLabel("waiting-for-proof")).toBe("Waiting for Proof");
  });

  it("serializes stable copyable diagnostics", () => {
    const status: RunInGameOperationStatus = {
      ok: false,
      requestId: "studio-run-in-game-test",
      phase: "failed",
      status: "failed",
      startedAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:01.000Z",
      completedPhases: ["materializing", "deploying"],
      materialization: {
        mode: "disposable",
        mapScript: "{swooper-maps}/maps/studio-current.js",
      },
      error: "Civ7 setup cannot see studio-current",
      details: {
        code: "setup-map-row-not-visible",
        reloadRequired: true,
      },
    };

    const diagnostics = formatRunInGameDiagnostics(status);
    expect(diagnostics).toContain('"requestId": "studio-run-in-game-test"');
    expect(diagnostics).toContain('"phase": "failed"');
    expect(diagnostics.indexOf('"completedPhases"')).toBeLessThan(diagnostics.indexOf('"details"'));
  });

  it("marks process-restart recovery as an explicit Run in Game action", () => {
    const status: RunInGameOperationStatus = {
      ok: false,
      requestId: "studio-run-in-game-reload",
      phase: "blocked",
      status: "blocked",
      startedAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:01.000Z",
      completedPhases: ["materializing", "deploying", "checking-civ7"],
      details: {
        code: "setup-map-row-not-visible",
        reloadBoundary: "process-restart-required",
      },
    };

    expect(runInGameRequiresProcessRestart(status)).toBe(true);
    expect(runInGamePrimaryActionLabel(status, "current")).toBe("Restart Civ & Run");
    expect(runInGamePrimaryActionLabel({ ...status, details: { code: "other" } }, "current")).toBe(
      "Retry Run"
    );
    expect(runInGamePrimaryActionLabel({ ...status, details: { code: "other" } }, "stale")).toBe(
      "Run Current"
    );
  });
});
