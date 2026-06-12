import { describe, expect, test } from "bun:test";

import {
  buildBlockedFinalSurfaceParityOutput,
  extractExactAuthorshipProof,
} from "./verify-final-surface-parity";

describe("final-surface parity verifier output", () => {
  test("preserves upstream exact-authorship unresolved links in blocked output", () => {
    const output = buildBlockedFinalSurfaceParityOutput({
      exact: {
        status: "unresolved",
        requestId: "studio-run-in-game-test",
        unresolvedLinks: ["civ-setup.player-count-readback"],
        sourceSnapshot: {
          configHash: "config-hash",
          envelopeHash: "envelope-hash",
        },
      },
      blockedBy: ["exact-authorship-proof.complete", "exact-authorship-proof.unresolved-links-empty"],
      dimensions: { width: 106, height: 66, seed: 138503614 },
    });

    expect(output).toMatchObject({
      ok: false,
      parityStatus: "blocked",
      exactAuthorshipUnresolvedLinks: ["civ-setup.player-count-readback"],
      exactAuthorshipSummary: {
        requestId: "studio-run-in-game-test",
        status: "unresolved",
        configHash: "config-hash",
        envelopeHash: "envelope-hash",
        dimensions: { width: 106, height: 66, seed: 138503614 },
      },
    });
    expect(output.blockedBy).toEqual([
      "exact-authorship-proof.complete",
      "exact-authorship-proof.unresolved-links-empty",
    ]);
  });

  test("accepts previous final-surface proof output as proof-file input", () => {
    const exactAuthorshipPacket = {
      status: "complete",
      requestId: "studio-run-in-game-test",
      unresolvedLinks: [],
      sourceSnapshot: { configHash: "config-hash" },
    };

    expect(
      extractExactAuthorshipProof({
        ok: false,
        parityStatus: "unresolved",
        proof: { exactAuthorshipPacket },
      })
    ).toEqual(exactAuthorshipPacket);
  });
});
