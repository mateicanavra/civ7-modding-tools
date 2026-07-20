import { describe, expect, it } from "vitest";

import { parseMapConfigSaveRequest } from "../../src/server/mapConfigs/requestValidation";

const canonicalConfig = {
  id: "studio-current",
  name: "Studio Current",
  description: "Current Studio editor configuration.",
  recipe: "standard",
  sortIndex: 9999,
  latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
  config: { ok: true },
};

describe("Map config save request validation", () => {
  it("rejects save-side Civ lifecycle requests before deploy work can start", () => {
    expect(() =>
      parseMapConfigSaveRequest({
        canonicalConfig,
        restart: true,
      })
    ).toThrow("does not restart Civ");

    expect(() =>
      parseMapConfigSaveRequest({
        canonicalConfig,
        verifyRestart: true,
      })
    ).toThrow("does not restart Civ");
  });

  it("accepts stable request ids for resumable save/deploy status", () => {
    const parsed = parseMapConfigSaveRequest({
      requestId: "studio-save-deploy-test",
      canonicalConfig,
    });
    expect(parsed).toEqual({
      requestId: "studio-save-deploy-test",
      canonicalConfig,
    });
    expect(parsed.canonicalConfig).not.toBe(canonicalConfig);
    expect(Object.isFrozen(parsed.canonicalConfig)).toBe(true);
  });

  it("rejects caller-selected source paths", () => {
    const hostile = {
      canonicalConfig,
      sourcePath: "../../outside.config.json",
    };
    expect(() => parseMapConfigSaveRequest(hostile)).toThrow("does not accept sourcePath");
  });

  it("rejects incomplete canonical config envelopes at the request boundary", () => {
    expect(() =>
      parseMapConfigSaveRequest({
        canonicalConfig: {
          ...canonicalConfig,
          latitudeBounds: undefined,
        },
      })
    ).toThrow("complete config envelope");
  });

  it("rejects Run in Game identity fields while retaining the operation request id", () => {
    for (const [field, value] of Object.entries({
      launchEnvelopeDigest: "launch-envelope-digest",
      launchSourceDigest: { canonicalConfigDigest: "config-digest" },
      runArtifactId: "run-artifact",
      runCorrelation: { requestId: "run-request" },
      generationManifestDigest: "manifest-digest",
    })) {
      expect(() =>
        parseMapConfigSaveRequest({
          requestId: "save-deploy-operation",
          canonicalConfig,
          [field]: value,
        })
      ).toThrow(`does not accept Run in Game identity: ${field}`);
    }
  });
});
