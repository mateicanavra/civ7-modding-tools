import { describe, expect, it } from "vitest";

import { parseMapConfigSaveRequest } from "../../src/server/mapConfigs/requestValidation";

describe("Map config save request validation", () => {
  it("rejects save-side Civ lifecycle requests before deploy work can start", () => {
    expect(() => parseMapConfigSaveRequest({
      id: "studio-current",
      envelope: { ok: true },
      restart: true,
    })).toThrow("does not restart Civ");

    expect(() => parseMapConfigSaveRequest({
      id: "studio-current",
      envelope: { ok: true },
      verifyRestart: true,
    })).toThrow("does not restart Civ");
  });

  it("accepts stable request ids for resumable save/deploy status", () => {
    expect(parseMapConfigSaveRequest({
      requestId: "studio-save-deploy-test",
      id: "studio-current",
      sourcePath: "mods/mod-swooper-maps/src/maps/configs/studio-current.config.json",
      envelope: { ok: true },
    })).toEqual({
      requestId: "studio-save-deploy-test",
      id: "studio-current",
      sourcePath: "mods/mod-swooper-maps/src/maps/configs/studio-current.config.json",
      envelope: { ok: true },
    });
  });
});
