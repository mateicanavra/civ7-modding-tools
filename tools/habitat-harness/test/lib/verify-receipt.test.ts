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

import {
  createVerifyReceipt,
  validateVerifyReceipt,
  VerifyReceiptSchema,
} from "../../src/lib/verify-receipt.js";
import { Value } from "typebox/value";

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
      affectedResult: {
        exitCode: 0,
        stdout:
          "> nx run @internal/habitat-harness:boundaries  [existing outputs match the cache, left as is]\n" +
          "> nx run @internal/habitat-harness:check\n" +
          "Nx read the output from the cache instead of running the command for 1 out of 2 tasks.\n",
        stderr: "warning stream\n",
      },
    });

    expect(receipt.nxAffected.status).toBe("executed");
    expect(receipt.nxAffected).not.toHaveProperty("stdout");
    expect(receipt.nxAffected).not.toHaveProperty("stderr");
    if (receipt.nxAffected.status !== "executed") throw new Error("expected executed receipt");
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
        cacheState: "unknown",
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
      affectedResult: {
        exitCode: 0,
        stdout,
        stderr: "",
      },
    });

    if (receipt.nxAffected.status !== "executed") throw new Error("expected executed receipt");
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
    });

    expect(receipt.nxAffected).toEqual({
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
      affectedResult: {
        exitCode: 0,
        stdout: "should not be serialized",
        stderr: "should not be serialized",
      },
    });

    expect(receipt.nxAffected.status).toBe("skipped");
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
      affectedResult: {
        exitCode: 1,
        stdout: "affected failed\n",
        stderr: "boom\n",
      },
    });

    expect(receipt.nxAffected.status).toBe("failed");
    if (receipt.nxAffected.status !== "failed") throw new Error("expected failed receipt");
    expect(receipt.nxAffected.exitCode).toBe(1);
    expect(receipt.nxAffected.stdoutPreview).toBe("affected failed\n");
    expect(receipt.nxAffected.stderrPreview).toBe("boom\n");
    expect(receipt.nonClaims).toEqual([
      "does-not-prove-ci",
      "does-not-prove-apply-safety",
      "does-not-prove-graphite-readiness",
      "does-not-prove-runtime",
      "does-not-prove-rule-correctness",
    ]);
    expect(validateVerifyReceipt(receipt)).toEqual([]);
  });

  test("rejects structurally invalid verify receipts with TypeBox validation", () => {
    const invalid = createVerifyReceipt({
      requestedBase: "HEAD",
      resolvedBase: "HEAD",
      commandArgs: ["--base", "HEAD", "--json"],
      startedAt: "2026-06-15T00:00:00.000Z",
      durationMs: 12,
      exitCode: 0,
      checkReport: checkReport(),
      affectedResult: {
        exitCode: 0,
        stdout: "affected ok\n",
        stderr: "",
      },
    }) as unknown as { nxAffected: { stdout?: string } };
    invalid.nxAffected.stdout = "raw output body";

    expect(validateVerifyReceipt(invalid)).not.toEqual([]);
  });
});

function checkReport(options: { ok?: boolean } = {}): CheckReport {
  const ok = options.ok ?? true;
  return {
    schemaVersion: 1,
    command: "habitat check",
    startedAt: "2026-06-15T00:00:00.000Z",
    ok,
    rules: [
      {
        ruleId: "workspace-entrypoints",
        ownerTool: "habitat-native",
        lane: "enforced",
        status: ok ? "pass" : "fail",
        locked: true,
        durationMs: 1,
        diagnostics: ok
          ? []
          : [
              {
                ruleId: "workspace-entrypoints",
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
