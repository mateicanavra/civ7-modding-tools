import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";
import {
  createVerifyReceipt,
  VerifyReceiptSchema,
  validateVerifyReceipt,
} from "../../src/domains/proof-contract/index.js";
import {
  type VerifyTargetPlan,
  verifyTargetPlan,
} from "../../src/domains/workspace-graph-integration/index.js";
import type { CheckReport } from "../../src/lib/diagnostics.js";

describe("verify receipt", () => {
  test("embeds bounded Nx stream metadata and keeps cache state task-local", () => {
    const receipt = createVerifyReceipt({
      requestedBase: "HEAD",
      resolvedBase: "HEAD",
      commandArgs: ["--base", "HEAD", "--json"],
      startedAt: "2026-06-15T00:00:00.000Z",
      durationMs: 12,
      exitCode: 0,
      checkReport: checkReport(),
      verifyTargetPlan: verifyTargetPlanFixture(),
      gitStatus: gitStatusFixture(),
      affectedResult: {
        exitCode: 0,
        stdout:
          "> nx run @internal/habitat-harness:boundaries  [existing outputs match the cache, left as is]\n" +
          "> nx run @internal/habitat-harness:check\n" +
          "Nx read the output from the cache instead of running the command for 1 out of 2 tasks.\n",
        stderr: "warning stream\n",
      },
    });

    expect(receipt.outcome).toBe("succeeded");
    expect(receipt.base).toEqual({ requested: "HEAD", resolved: "HEAD", source: "flag" });
    expect(receipt.habitatCheck.consumption).toBe("allows-affected-execution");
    expect(receipt.habitatCheck.selectorState).toEqual({ kind: "none" });
    expect(receipt.targetPlan.kind).toBe("target-plan-ready");
    expect(receipt.postState.kind).toBe("observed-clean");
    expect(receipt.nxAffected.kind).toBe("executed");
    expect(receipt.nxAffected).not.toHaveProperty("stdout");
    expect(receipt.nxAffected).not.toHaveProperty("stderr");
    if (receipt.nxAffected.kind !== "executed") throw new Error("expected executed receipt");
    expect(receipt.nxAffected.stdoutLength).toBeGreaterThan(0);
    expect(receipt.nxAffected.stderrLength).toBe("warning stream\n".length);
    expect(receipt.nxAffected.stdoutPreview).toContain("@internal/habitat-harness:boundaries");
    expect(receipt.nxAffected.stderrPreview).toBe("warning stream\n");
    expect(receipt.nxAffected.stdoutTruncated).toBe(false);
    expect(receipt.nxAffected.cacheStateByTask).toEqual([
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
        cacheState: "not-observed",
      },
    ]);
    expect(Value.Check(VerifyReceiptSchema, receipt)).toBe(true);
    expect(validateVerifyReceipt(receipt)).toEqual([]);
  });

  test("bounds large Nx stream previews without serializing full output bodies", () => {
    const stdout = `start\n${"x".repeat(6000)}`;
    const receipt = createVerifyReceipt({
      requestedBase: "HEAD",
      resolvedBase: "HEAD",
      commandArgs: ["--base", "HEAD", "--json"],
      startedAt: "2026-06-15T00:00:00.000Z",
      durationMs: 12,
      exitCode: 0,
      checkReport: checkReport(),
      verifyTargetPlan: verifyTargetPlanFixture(),
      gitStatus: gitStatusFixture(),
      affectedResult: {
        exitCode: 0,
        stdout,
        stderr: "",
      },
    });

    if (receipt.nxAffected.kind !== "executed") throw new Error("expected executed receipt");
    expect(receipt.nxAffected.stdoutLength).toBe(stdout.length);
    expect(receipt.nxAffected.stdoutPreview.length).toBeLessThan(stdout.length);
    expect(receipt.nxAffected.stdoutTruncated).toBe(true);
  });

  test("represents skipped Nx affected truthfully when Habitat check fails first", () => {
    const receipt = createVerifyReceipt({
      requestedBase: "HEAD",
      resolvedBase: "HEAD",
      commandArgs: ["--base", "HEAD", "--json"],
      startedAt: "2026-06-15T00:00:00.000Z",
      durationMs: 12,
      exitCode: 1,
      checkReport: checkReport({ ok: false }),
      verifyTargetPlan: verifyTargetPlanFixture(),
      gitStatus: gitStatusFixture(),
    });

    expect(receipt.outcome).toBe("blocked");
    expect(receipt.habitatCheck.consumption).toBe("blocks-affected-execution");
    expect(receipt.nxAffected).toEqual({
      kind: "skipped",
      skipReason: "habitat-check-failed",
      argv: [
        "nx",
        "affected",
        "-t",
        "build,check,test,boundaries,biome:ci,grit:check,generated:check",
        "--base",
        "HEAD",
        "--head",
        "HEAD",
        "--outputStyle=static",
      ],
      targets: [
        "build",
        "check",
        "test",
        "boundaries",
        "biome:ci",
        "grit:check",
        "generated:check",
      ],
      projects: [],
      cacheStateByTask: [],
      exitCode: null,
      stdoutLength: 0,
      stderrLength: 0,
      stdoutPreview: "",
      stderrPreview: "",
      stdoutTruncated: false,
      stderrTruncated: false,
    });
  });

  test("ignores affected results when the Habitat check failed", () => {
    const receipt = createVerifyReceipt({
      requestedBase: "HEAD",
      resolvedBase: "HEAD",
      commandArgs: ["--base", "HEAD", "--json"],
      startedAt: "2026-06-15T00:00:00.000Z",
      durationMs: 12,
      exitCode: 1,
      checkReport: checkReport({ ok: false }),
      verifyTargetPlan: verifyTargetPlanFixture(),
      gitStatus: gitStatusFixture(),
      affectedResult: {
        exitCode: 0,
        stdout: "should not be serialized",
        stderr: "should not be serialized",
      },
    });

    expect(receipt.nxAffected.kind).toBe("skipped");
    expect(receipt.nxAffected.stdoutLength).toBe(0);
  });

  test("records failed Nx execution as a distinct receipt state", () => {
    const receipt = createVerifyReceipt({
      requestedBase: "HEAD",
      resolvedBase: "HEAD",
      commandArgs: ["--base", "HEAD", "--json"],
      startedAt: "2026-06-15T00:00:00.000Z",
      durationMs: 12,
      exitCode: 1,
      checkReport: checkReport(),
      verifyTargetPlan: verifyTargetPlanFixture(),
      gitStatus: gitStatusFixture({ stdout: " M tools/habitat-harness/src/index.ts\n" }),
      affectedResult: {
        exitCode: 1,
        stdout: "affected failed\n",
        stderr: "boom\n",
      },
    });

    expect(receipt.outcome).toBe("failed");
    expect(receipt.nxAffected.kind).toBe("failed");
    if (receipt.nxAffected.kind !== "failed") throw new Error("expected failed receipt");
    expect(receipt.nxAffected.exitCode).toBe(1);
    expect(receipt.nxAffected.stdoutPreview).toBe("affected failed\n");
    expect(receipt.nxAffected.stderrPreview).toBe("boom\n");
    expect(validateVerifyReceipt(receipt)).toEqual([]);
  });

  test("records refused workspace target planning as a blocked receipt", () => {
    const receipt = createVerifyReceipt({
      requestedBase: undefined,
      resolvedBase: "merge-base-sha",
      baseSource: "merge-base",
      commandArgs: ["--json"],
      startedAt: "2026-06-15T00:00:00.000Z",
      durationMs: 12,
      exitCode: 1,
      checkReport: checkReport(),
      verifyTargetPlan: refusedVerifyTargetPlanFixture(),
      gitStatus: gitStatusFixture(),
    });

    expect(receipt.outcome).toBe("blocked");
    expect(receipt.base).toEqual({
      requested: null,
      resolved: "merge-base-sha",
      source: "merge-base",
    });
    expect(receipt.targetPlan).toEqual({
      kind: "target-plan-refused",
      targets: ["build"],
      reason: "nx-read-failure",
      message: "graph unavailable",
    });
    expect(receipt.nxAffected.kind).toBe("skipped");
    expect(receipt.nxAffected.skipReason).toBe("workspace-graph-refused");
    expect(validateVerifyReceipt(receipt)).toEqual([]);
  });

  test("rejects structurally invalid verify receipts with TypeBox validation", () => {
    const receipt = createVerifyReceipt({
      requestedBase: "HEAD",
      resolvedBase: "HEAD",
      commandArgs: ["--base", "HEAD", "--json"],
      startedAt: "2026-06-15T00:00:00.000Z",
      durationMs: 12,
      exitCode: 0,
      checkReport: checkReport(),
      verifyTargetPlan: verifyTargetPlanFixture(),
      gitStatus: gitStatusFixture(),
      affectedResult: {
        exitCode: 0,
        stdout: "affected ok\n",
        stderr: "",
      },
    });
    const invalid = {
      ...receipt,
      nxAffected: { ...receipt.nxAffected, stdout: "raw output body" },
    };

    expect(validateVerifyReceipt(invalid)).not.toEqual([]);
  });
});

function verifyTargetPlanFixture() {
  return verifyTargetPlan([
    {
      name: "@internal/habitat-harness",
      root: "tools/habitat-harness",
      sourceRoot: null,
      tags: ["kind:tooling"],
      targets: [
        { name: "build" },
        { name: "check" },
        { name: "test" },
        { name: "boundaries" },
        { name: "biome:ci" },
        { name: "grit:check" },
        { name: "generated:check" },
      ],
    },
  ]);
}

function refusedVerifyTargetPlanFixture(): VerifyTargetPlan {
  return {
    kind: "verify-target-plan-refused",
    targets: ["build"],
    refusal: {
      kind: "graph-refusal",
      reason: "nx-read-failure",
      message: "graph unavailable",
    },
  };
}

function gitStatusFixture(options: { stdout?: string; stderr?: string; exitCode?: number } = {}) {
  return {
    exitCode: options.exitCode ?? 0,
    stdout: options.stdout ?? "",
    stderr: options.stderr ?? "",
  };
}

function checkReport(options: { ok?: boolean } = {}): CheckReport {
  const ok = options.ok ?? true;
  return {
    schemaVersion: 1,
    command: "habitat check",
    startedAt: "2026-06-15T00:00:00.000Z",
    ok,
    rules: [
      {
        ruleId: "adapter-boundary",
        ownerTool: "command-check",
        lane: "enforced",
        status: ok ? "pass" : "fail",
        locked: true,
        durationMs: 1,
        diagnostics: ok
          ? []
          : [
              {
                ruleId: "adapter-boundary",
                path: ".",
                message: "failed",
                severity: "error",
                baselined: false,
              },
            ],
        detect: ["habitat", "check"],
        message: "ok",
        remediate: null,
      },
      {
        ruleId: "baseline-integrity",
        ownerTool: "command-check",
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
