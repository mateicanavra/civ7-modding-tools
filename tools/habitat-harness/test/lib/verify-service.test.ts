import { Effect, Layer } from "effect";
import { describe, expect, test, vi } from "vitest";
import { makeFakeStructuralCheckLayer } from "../../src/domains/structural-check/index.js";
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

vi.mock("../../src/domains/workspace-graph-integration/index.js", async () => {
  const schema = await import("../../src/providers/nx/schema.js");
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
    const { runVerifyService } = await import("../../src/service/modules/verify/router.js");
    const gitCalls: string[][] = [];
    const nxRequests: Array<{ base: string; targets: readonly string[] }> = [];
    const checkRequests: unknown[] = [];
    const layer = Layer.mergeAll(
      makeFakeHabitatClockLayer(Date.parse("2026-06-13T00:00:00.000Z")),
      makeFakeStructuralCheckLayer({
        createReport: (request) =>
          Effect.sync(() => {
            checkRequests.push(request);
            return mockReport;
          }),
        expandBaselines: () => Effect.succeed({ ok: true, messages: [] }),
      }),
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
    expect(checkRequests).toEqual([expect.objectContaining({ base: "fake-merge-base" })]);
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
