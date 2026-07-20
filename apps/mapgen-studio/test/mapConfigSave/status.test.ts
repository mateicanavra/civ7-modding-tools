import { formatMapConfigSaveDeployPhaseLabel } from "@swooper/mapgen-studio-ui";
import { describe, expect, it } from "vitest";

import {
  createMapConfigSaveDeployStatus,
  isSaveDeployTerminal,
  kindForMapConfigSaveDeployPhase,
  saveDeployResultFromTerminalStatus,
  updateMapConfigSaveDeployStatus,
} from "../../src/features/mapConfigSave/status";

describe("Map config save/deploy safe status projection", () => {
  it("classifies save/deploy phases without implying Civ lifecycle work", () => {
    expect(kindForMapConfigSaveDeployPhase("saving")).toBe("running");
    expect(kindForMapConfigSaveDeployPhase("queued")).toBe("running");
    expect(kindForMapConfigSaveDeployPhase("deploying")).toBe("running");
    expect(kindForMapConfigSaveDeployPhase("complete")).toBe("complete");
    expect(formatMapConfigSaveDeployPhaseLabel("queued")).toBe("Queued");
    expect(formatMapConfigSaveDeployPhaseLabel("failed")).toBe("Save Failed");
  });

  it("preserves only public operation fields while advancing status", () => {
    const status = createMapConfigSaveDeployStatus({
      requestId: "studio-save-deploy-test",
      phase: "saving",
      recoveryActions: ["retry-status"],
    });
    const next = updateMapConfigSaveDeployStatus(status, {
      phase: "complete",
      recoveryActions: ["copy-diagnostics"],
    });

    expect(next).toEqual({
      ok: true,
      requestId: "studio-save-deploy-test",
      phase: "complete",
      status: "complete",
      saved: true,
      deployed: true,
      recoveryActions: ["copy-diagnostics"],
    });
    expect(next).not.toHaveProperty("path");
    expect(next).not.toHaveProperty("startedAt");
    expect(next).not.toHaveProperty("updatedAt");
    expect(next).not.toHaveProperty("deploy");
    expect(next).not.toHaveProperty("details");
    expect(next).not.toHaveProperty("error");
  });

  it("requires a safe category and fixed recovery data for failed state", () => {
    const status = createMapConfigSaveDeployStatus({
      requestId: "failed-save",
      phase: "failed",
      saved: true,
      deployed: false,
      safeFailureCategory: "deployment",
      recoveryActions: ["retry-save-deploy", "copy-diagnostics"],
    });

    expect(status).toEqual({
      ok: false,
      requestId: "failed-save",
      phase: "failed",
      status: "failed",
      saved: true,
      deployed: false,
      safeFailureCategory: "deployment",
      recoveryActions: ["retry-save-deploy", "copy-diagnostics"],
    });
  });
});

describe("isSaveDeployTerminal", () => {
  it("treats only running status as non-terminal", () => {
    const running = createMapConfigSaveDeployStatus({ requestId: "r", phase: "saving" });
    const complete = createMapConfigSaveDeployStatus({ requestId: "r", phase: "complete" });
    const failed = createMapConfigSaveDeployStatus({
      requestId: "r",
      phase: "failed",
      safeFailureCategory: "save",
    });

    expect(isSaveDeployTerminal(running)).toBe(false);
    expect(isSaveDeployTerminal(complete)).toBe(true);
    expect(isSaveDeployTerminal(failed)).toBe(true);
  });
});

describe("saveDeployResultFromTerminalStatus", () => {
  it("projects success without recreating a host path or deploy details", () => {
    const result = saveDeployResultFromTerminalStatus(
      createMapConfigSaveDeployStatus({ requestId: "r", phase: "complete" })
    );

    expect(result).toEqual({
      ok: true,
      requestId: "r",
      phase: "complete",
      status: "complete",
      saved: true,
      deployed: true,
      recoveryActions: [],
    });
    expect(result).not.toHaveProperty("path");
    expect(result).not.toHaveProperty("deploy");
  });

  it("projects failure using only the safe category and recovery actions", () => {
    const result = saveDeployResultFromTerminalStatus(
      createMapConfigSaveDeployStatus({
        requestId: "r",
        phase: "failed",
        saved: true,
        deployed: false,
        safeFailureCategory: "deployment",
        recoveryActions: ["retry-save-deploy"],
      })
    );

    expect(result).toEqual({
      ok: false,
      requestId: "r",
      phase: "failed",
      status: "failed",
      saved: true,
      deployed: false,
      safeFailureCategory: "deployment",
      recoveryActions: ["retry-save-deploy"],
    });
  });
});
