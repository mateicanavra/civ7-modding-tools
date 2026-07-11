import { materializationStatus } from "@civ7/studio-contract";
import { Value } from "typebox/value";
import { describe, expect, it } from "vitest";

describe("Run in Game materialization contract", () => {
  it("accepts launchEnvelopeDigest and rejects the retired envelopeHash field", () => {
    const materialization = {
      mapScript: "{mod-swooper-studio-run}/maps/studio-run.js",
      canonicalConfigDigest: "canonical-config-digest",
      launchEnvelopeDigest: "launch-envelope-digest",
      generationManifestDigest: "generation-manifest-digest",
      runArtifactId: "run-artifact",
      generatedModRoot: "/tmp/generated-mod",
      generatedModFileCount: 2,
      generatedModDigest: "generated-mod-digest",
      mapRowId: "MAP_STUDIO_RUN",
    };

    expect(Value.Check(materializationStatus, materialization)).toBe(true);
    expect(
      Value.Check(materializationStatus, {
        ...materialization,
        envelopeHash: materialization.launchEnvelopeDigest,
      })
    ).toBe(false);
  });
});
