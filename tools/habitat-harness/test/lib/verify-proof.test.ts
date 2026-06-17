import { describe, expect, test, vi } from "vitest";
import type { CheckReport } from "../../src/lib/diagnostics.js";

const runMock = vi.hoisted(() =>
  vi.fn((argv: string[]) => {
    if (argv[0] === "git") return { exitCode: 0, stdout: "", stderr: "" };
    if (argv[0] === "bun") {
      return {
        exitCode: 0,
        stdout: "resources-submodule: clean\n",
        stderr: "",
      };
    }
    return { exitCode: 0, stdout: "", stderr: "" };
  })
);

vi.mock("../../src/lib/spawn.js", () => ({
  run: runMock,
}));

import { createVerifyProof } from "../../src/lib/command-engine.js";

describe("verify proof artifact", () => {
  test("embeds bounded Nx streams truthfully and keeps cache state task-local", () => {
    const proof = createVerifyProof({
      requestedBase: "HEAD",
      resolvedBase: "HEAD",
      commandArgs: ["--base", "HEAD", "--json"],
      startedAt: "2026-06-15T00:00:00.000Z",
      durationMs: 12,
      exitCode: 0,
      checkReport: checkReport(),
      affectedResult: {
        exitCode: 0,
        stdout:
          "> nx run @internal/habitat-harness:boundaries  [existing outputs match the cache, left as is]\n" +
          "> nx run @internal/habitat-harness:check\n" +
          "Nx read the output from the cache instead of running the command for 1 out of 2 tasks.\n",
        stderr: "warning stream\n",
      },
    });

    expect(proof.nxAffected.status).toBe("executed");
    expect(proof.nxAffected).not.toHaveProperty("stdoutArtifact");
    expect(proof.nxAffected).not.toHaveProperty("stderrArtifact");
    expect(proof.nxAffected.stdout).toContain("@internal/habitat-harness:boundaries");
    expect(proof.nxAffected.stderr).toBe("warning stream\n");
    expect(proof.nxAffected.stdoutTruncated).toBe(false);
    expect(proof.nxAffected.cacheStateByTask).toEqual([
      {
        taskId: "@internal/habitat-harness:boundaries",
        project: "@internal/habitat-harness",
        target: "boundaries",
        cacheState: "cache-hit",
      },
      {
        taskId: "@internal/habitat-harness:check",
        project: "@internal/habitat-harness",
        target: "check",
        cacheState: "unknown",
      },
    ]);
  });

  test("represents skipped Nx affected truthfully when Habitat check fails first", () => {
    const proof = createVerifyProof({
      requestedBase: "HEAD",
      resolvedBase: "HEAD",
      commandArgs: ["--base", "HEAD", "--json"],
      startedAt: "2026-06-15T00:00:00.000Z",
      durationMs: 12,
      exitCode: 1,
      checkReport: checkReport({ ok: false }),
    });

    expect(proof.nxAffected).toEqual({
      status: "skipped",
      skipReason: "habitat-check-failed",
      argv: [
        "nx",
        "affected",
        "-t",
        "build,check,test,boundaries,biome:ci,grit:check,generated:check",
        "--base",
        "HEAD",
      ],
      targets: ["build", "check", "test", "boundaries", "biome:ci", "grit:check", "generated:check"],
      projects: [],
      cacheStateByTask: [],
      exitCode: null,
      stdout: "",
      stderr: "",
      stdoutTruncated: false,
      stderrTruncated: false,
    });
  });
});

function checkReport(options: { ok?: boolean } = {}): CheckReport {
  return {
    schemaVersion: 1,
    command: "habitat check",
    startedAt: "2026-06-15T00:00:00.000Z",
    ok: options.ok ?? true,
    rules: [
      {
        ruleId: "workspace-entrypoints",
        ownerTool: "habitat-native",
        lane: "enforced",
        status: "pass",
        locked: true,
        durationMs: 1,
        diagnostics: [],
        detect: ["habitat", "check"],
        message: "ok",
        remediate: null,
      },
      {
        ruleId: "baseline-integrity",
        ownerTool: "habitat-native",
        lane: "enforced",
        status: "pass",
        locked: true,
        durationMs: 1,
        diagnostics: [],
        detect: ["habitat", "check", "(built-in)"],
        message: "ok",
        remediate: null,
      },
    ],
  };
}
