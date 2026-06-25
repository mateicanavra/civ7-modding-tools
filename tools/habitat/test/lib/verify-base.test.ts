import { makeGitProviderFromCommandHandler } from "@habitat/cli/providers/git/index";
import {
  captureOutput,
  makeHabitatCommandResult,
} from "@habitat/cli/resources/command/index";
import { resolveVerifyBaseEffect } from "@habitat/cli/service/modules/verify/model/index";
import { Effect } from "effect";
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
    const stdout =
      argv[0] === "symbolic-ref"
        ? "origin/main\n"
        : argv[0] === "merge-base"
          ? "merge-base-sha\n"
          : "";
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
  const graphite = {
    parent: () =>
      Effect.succeed(
        options.graphiteExitCode === 0 || options.graphiteExitCode === undefined
          ? "agent-parent"
          : null
      ),
  };
  return Effect.runPromise(resolveVerifyBaseEffect({ git, graphite, repoRoot: "/repo" }, base));
}
