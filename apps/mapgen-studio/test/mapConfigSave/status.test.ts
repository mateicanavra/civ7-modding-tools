import { describe, expect, it } from "vitest";

import {
  createMapConfigSaveDeployStatus,
  formatMapConfigSaveDeployPhaseLabel,
  isSaveDeployTerminal,
  kindForMapConfigSaveDeployPhase,
  saveDeployResultFromTerminalStatus,
  updateMapConfigSaveDeployStatus,
} from "../../src/features/mapConfigSave/status";

describe("Map config save/deploy status helpers", () => {
  it("classifies save/deploy phases without implying Civ lifecycle work", () => {
    expect(kindForMapConfigSaveDeployPhase("saving")).toBe("running");
    expect(kindForMapConfigSaveDeployPhase("queued")).toBe("running");
    expect(kindForMapConfigSaveDeployPhase("deploying")).toBe("running");
    expect(kindForMapConfigSaveDeployPhase("complete")).toBe("complete");
    expect(formatMapConfigSaveDeployPhaseLabel("queued")).toBe("Queued");
    expect(formatMapConfigSaveDeployPhaseLabel("failed")).toBe("Save Failed");
  });

  it("preserves request identity while advancing operation status", () => {
    const status = createMapConfigSaveDeployStatus({
      requestId: "studio-save-deploy-test",
      phase: "saving",
      now: () => new Date("2026-06-01T00:00:00.000Z"),
    });
    const next = updateMapConfigSaveDeployStatus(status, {
      phase: "complete",
      path: "mods/mod-swooper-maps/src/maps/configs/studio-current.config.json",
      saved: true,
      deployed: true,
      now: () => new Date("2026-06-01T00:00:01.000Z"),
    });

    expect(next.requestId).toBe("studio-save-deploy-test");
    expect(next.status).toBe("complete");
    expect(next.path).toContain("studio-current.config.json");
    expect(next.startedAt).toBe("2026-06-01T00:00:00.000Z");
    expect(next.updatedAt).toBe("2026-06-01T00:00:01.000Z");
  });
});

// H0 (Phase-8 slice): pure helpers moved out of StudioShell into this module.
describe("isSaveDeployTerminal", () => {
  it("treats only `running` as non-terminal", () => {
    const running = createMapConfigSaveDeployStatus({ requestId: "r", phase: "saving" });
    expect(isSaveDeployTerminal(running)).toBe(false);
    expect(isSaveDeployTerminal({ ...running, status: "complete" })).toBe(true);
    expect(isSaveDeployTerminal({ ...running, status: "failed" })).toBe(true);
    expect(isSaveDeployTerminal({ ...running, status: "idle" })).toBe(true);
  });
});

describe("saveDeployResultFromTerminalStatus", () => {
  it("maps a successful terminal status to ok:true with path + deploy flags", () => {
    const status = createMapConfigSaveDeployStatus({
      requestId: "r",
      phase: "complete",
      path: "configs/a.config.json",
      saved: true,
      deployed: true,
    });
    expect(saveDeployResultFromTerminalStatus(status)).toMatchObject({
      ok: true,
      path: "configs/a.config.json",
      saved: true,
      deployed: true,
    });
  });

  it("uses fallbackPath when the status carries no path", () => {
    const status = createMapConfigSaveDeployStatus({
      requestId: "r",
      phase: "complete",
      saved: true,
    });
    const result = saveDeployResultFromTerminalStatus(status, "configs/fallback.config.json");
    expect(result.ok).toBe(true);
    expect(result.path).toBe("configs/fallback.config.json");
  });

  it("maps a failed status to ok:false, preserving the error + saved/deployed flags", () => {
    const status = createMapConfigSaveDeployStatus({
      requestId: "r",
      phase: "failed",
      error: "deploy blew up",
      saved: true,
      deployed: false,
    });
    expect(saveDeployResultFromTerminalStatus(status)).toMatchObject({
      ok: false,
      error: "deploy blew up",
      saved: true,
      deployed: false,
    });
  });

  it("falls back to a default error message when ok is false but no error is set", () => {
    const status = createMapConfigSaveDeployStatus({ requestId: "r", phase: "failed" });
    const result = saveDeployResultFromTerminalStatus({ ...status, error: undefined });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Save/deploy failed");
  });
});
