import { makeGitProviderFromCommandHandler } from "@habitat/cli/providers/git/index";
import { captureOutput, makeHabitatCommandResult } from "@habitat/cli/resources/command/index";
import { resolveVerifyBaseEffect } from "@habitat/cli/service/modules/verify/model/index";
import { Effect, Match } from "effect";
import { describe, expect, test } from "vitest";

describe("verify base resolution", () => {
  test("prefers explicit base", async () => {
    await expect(resolveBase("HEAD~1")).resolves.toEqual({
      kind: "resolved",
      base: "HEAD~1",
      source: "flag",
    });
  });

  test("prefers Graphite parent before remote merge-base", async () => {
    await expect(resolveBase()).resolves.toEqual({
      kind: "resolved",
      base: "agent-parent",
      source: "graphite-parent",
    });
  });

  test("falls back to remote merge-base when Graphite parent is unavailable", async () => {
    await expect(resolveBase(undefined, { graphiteExitCode: 1 })).resolves.toEqual({
      kind: "resolved",
      base: "merge-base-sha",
      source: "merge-base",
    });
  });
});

function resolveBase(base?: string, options: { graphiteExitCode?: number } = {}) {
  const git = makeGitProviderFromCommandHandler((argv, runOptions) => {
    const stdout = Match.value(argv[0]).pipe(
      Match.when("symbolic-ref", () => "origin/main\n"),
      Match.when("merge-base", () => "merge-base-sha\n"),
      Match.orElse(() => "")
    );
    return makeHabitatCommandResult(
      {
        commandId: `git-${argv.join("-")}`,
        kind: "git-state",
        executable: "git",
        argv,
        cwd: runOptions.cwd,
        captureGitState: false,
      },
      {
        exit: { code: 0, signal: null, interrupted: false },
        stdout: captureOutput(stdout),
        stderr: captureOutput(""),
      }
    );
  });
  const parent = Match.value(options.graphiteExitCode).pipe(
    Match.when(0, () => "agent-parent"),
    Match.when(Match.undefined, () => "agent-parent"),
    Match.orElse(() => null)
  );
  const graphite = {
    parent: () => Effect.succeed(parent),
  };
  return Effect.runPromise(resolveVerifyBaseEffect({ git, graphite, repoRoot: "/repo" }, base));
}
