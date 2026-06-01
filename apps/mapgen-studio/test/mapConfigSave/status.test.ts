import { describe, expect, it } from "vitest";

import {
  createMapConfigSaveDeployStatus,
  formatMapConfigSaveDeployPhaseLabel,
  kindForMapConfigSaveDeployPhase,
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
