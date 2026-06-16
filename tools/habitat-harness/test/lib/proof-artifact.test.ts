import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { makeHabitatCommandResult } from "../../src/lib/habitat-process.js";
import { repoRoot } from "../../src/lib/paths.js";
import {
  adapterProofArtifactPath,
  buildAdapterProofArtifact,
  writeAdapterProofArtifact,
} from "../../src/lib/proof-artifact.js";

describe("adapter proof artifacts", () => {
  test("builds the packet-local proof path and rejects unsafe ids", () => {
    expect(adapterProofArtifactPath("adapter-smoke-1")).toBe(
      path.join(
        repoRoot,
        "openspec/changes/habitat-effect-grit-adapter/workstream/proofs/adapter-smoke-1.json"
      )
    );
    expect(() => adapterProofArtifactPath("../escape")).toThrow(/invalid proof id/);
  });

  test("builds redacted proof metadata without persisting sensitive env values", () => {
    const commandResult = makeHabitatCommandResult({
      commandId: "proof-test",
      kind: "grit-check",
      executable: "grit",
      argv: ["--json", "check"],
      cwd: repoRoot,
      env: {
        GRIT_TELEMETRY_DISABLED: "true",
        HABITAT_SECRET_TOKEN: "do-not-persist",
      },
      nonClaims: ["does-not-prove-injected-violation"],
    });

    const artifact = buildAdapterProofArtifact({
      proofId: "proof-test",
      commandResult,
      proofClass: "adapter-smoke",
      normalizedSummary: { failureTag: null },
      nonClaims: ["does-not-prove-current-tree-row"],
      downstreamLinks: ["not-consumed"],
    });

    expect(artifact.schemaVersion).toBe(1);
    expect(artifact.redaction.redactedEnvKeys).toContain("HABITAT_SECRET_TOKEN");
    expect(artifact.nonClaims).toEqual([
      "does-not-prove-injected-violation",
      "does-not-prove-current-tree-row",
    ]);
    expect(JSON.stringify(artifact)).not.toContain("do-not-persist");
  });

  test("writes proof artifacts under the configured workstream root", () => {
    const tempRoot = mkdtempSync(path.join(tmpdir(), "habitat-proof-artifact-"));
    try {
      const commandResult = makeHabitatCommandResult({
        commandId: "proof-write-test",
        kind: "grit-check",
        executable: "grit",
        argv: ["--json", "check"],
        cwd: repoRoot,
      });
      const artifact = writeAdapterProofArtifact({
        proofId: "proof-write-test",
        commandResult,
        proofClass: "adapter-smoke",
        repoRootOverride: tempRoot,
      });

      expect(readFileSync(artifact.artifactPath, "utf8")).toContain(
        '"proofId": "proof-write-test"'
      );
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
