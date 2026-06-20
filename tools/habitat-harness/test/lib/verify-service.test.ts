import { Effect, Layer } from "effect";
import { describe, expect, test, vi } from "vitest";
import * as checkReport from "../../src/lib/check-report.js";
import { repoRoot } from "../../src/lib/paths.js";
import { captureOutput, makeHabitatCommandResult } from "../../src/providers/command/index.js";
import { makeFakeGitProviderLayer } from "../../src/providers/git/index.js";
import { affectedArgv, makeFakeNxProviderLayer } from "../../src/providers/nx/index.js";
import { makeFakeHabitatClockLayer } from "../../src/resources/index.js";

const mockReport = vi.hoisted(() => ({
  schemaVersion: 1,
  command: "habitat check --json",
  startedAt: "2026-06-13T00:00:00.000Z",
  ok: true,
  rules: [],
}));

const mockVerifyTargetPlan = vi.hoisted(() => ({
  kind: "verify-target-plan" as const,
  targets: ["build", "test"],
  states: [],
}));

vi.mock("../../src/lib/check-report.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/lib/check-report.js")>();
  return {
    ...actual,
    checkCommandContext: vi.fn((argv: string[]) => ({
      bin: "habitat",
      id: "check",
      argv,
      serialized: ["habitat", "check", ...argv].join(" "),
    })),
    verifyCheckSummary: vi.fn(() => ({
      reportSchemaVersion: 1,
      requestedSelectors: {},
      selectedRuleIds: [],
      selectedRealRuleIds: [],
      builtInRuleIds: [],
      statusCounts: {},
      advisoryCount: 0,
      failingCount: 0,
      refusedCount: 0,
      notApplicableCount: 0,
      allowsAffectedExecution: true,
    })),
  };
});

vi.mock("../../src/service/modules/check/report.js", () => ({
  createCheckReportEffect: vi.fn(() => Effect.succeed(mockReport)),
}));

vi.mock("../../src/lib/workspace-graph/index.js", async () => {
  const schema = await import("../../src/lib/workspace-graph/schema.js");
  return {
    ...schema,
    readWorkspaceGraph: vi.fn(() => ({
      kind: "graph-ready",
      snapshot: { projects: [] },
    })),
    verifyTargetNames: vi.fn(() => ["build", "test"]),
    verifyTargetPlan: vi.fn(() => mockVerifyTargetPlan),
  };
});

describe("Habitat verify service", () => {
  test("uses provided Git and Nx layers for owned verify orchestration", async () => {
    const checkServiceReport = await import("../../src/service/modules/check/report.js");
    expect(vi.isMockFunction(checkServiceReport.createCheckReportEffect)).toBe(true);
    const { runVerifyService } = await import("../../src/service/modules/verify/run.js");
    const gitCalls: string[][] = [];
    const nxRequests: Array<{ base: string; targets: readonly string[] }> = [];
    const layer = Layer.mergeAll(
      makeFakeHabitatClockLayer(Date.parse("2026-06-13T00:00:00.000Z")),
      makeFakeGitProviderLayer((argv, options) => {
        gitCalls.push([...argv]);
        const stdout =
          argv[0] === "symbolic-ref"
            ? "origin/main\n"
            : argv[0] === "merge-base"
              ? "fake-merge-base\n"
              : "";
        return commandResult("git-state", "git", argv, options.cwd, stdout);
      }),
      makeFakeNxProviderLayer((request) => {
        nxRequests.push(request);
        return commandResult(
          "workspace-tool",
          "nx",
          affectedArgv(request).slice(1),
          repoRoot,
          "affected ok\n"
        );
      })
    );

    const result = await Effect.runPromise(
      runVerifyService({ commandArgs: ["--json"] }).pipe(Effect.provide(layer))
    );

    expect(result.kind).toBe("completed");
    if (result.kind !== "completed") throw new Error("expected completed verify service result");
    expect(result.base).toBe("fake-merge-base");
    expect(result.affectedResult?.stdout).toBe("affected ok\n");
    expect(result.receipt.base).toEqual({
      requested: null,
      resolved: "fake-merge-base",
      source: "merge-base",
    });
    expect(nxRequests).toEqual([{ base: "fake-merge-base", targets: ["build", "test"] }]);
    expect(gitCalls).toEqual([
      ["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"],
      ["merge-base", "HEAD", "origin/main"],
      ["status", "--short", "--branch"],
    ]);
    expect(checkServiceReport.createCheckReportEffect).toHaveBeenCalledWith(
      expect.objectContaining({ base: "fake-merge-base" })
    );
  });
});

function commandResult(
  kind: Parameters<typeof makeHabitatCommandResult>[0]["kind"],
  executable: string,
  argv: readonly string[],
  cwd: string,
  stdout: string
) {
  return makeHabitatCommandResult(
    {
      commandId: `${kind}-${executable}`,
      kind,
      executable,
      argv,
      cwd,
      captureGitState: false,
    },
    { stdout: captureOutput(stdout) }
  );
}
