import { Effect } from "effect";
import { describe, expect, test } from "vitest";
import { repoRoot } from "../../src/lib/paths.js";
import {
  BiomeProvider,
  biomeArgv,
  makeFakeBiomeProviderLayer,
} from "../../src/providers/biome/index.js";
import { captureOutput, makeHabitatCommandResult } from "../../src/providers/command/index.js";
import { GitProvider, makeFakeGitProviderLayer } from "../../src/providers/git/index.js";
import { GritProvider, makeFakeGritProviderLayer } from "../../src/providers/grit/index.js";
import { huskyDelegator } from "../../src/providers/husky/index.js";
import {
  affectedArgv,
  graphArgv,
  makeFakeNxProviderLayer,
  NxProvider,
} from "../../src/providers/nx/index.js";
import { runHabitatEffect } from "../../src/runtime/index.js";

describe("vendor providers", () => {
  test("GitProvider fake layer owns git command families without spawning", async () => {
    const observed: string[][] = [];
    const result = await runHabitatEffect(
      Effect.gen(function* () {
        const git = yield* GitProvider;
        return {
          defaultBranch: yield* git.remoteDefaultBranch(),
          mergeBase: yield* git.mergeBase("origin/main"),
          status: yield* git.statusShortBranch(),
        };
      }).pipe(
        Effect.provide(
          makeFakeGitProviderLayer((argv, options) => {
            observed.push([...argv]);
            const stdout =
              argv[0] === "symbolic-ref"
                ? "origin/main\n"
                : argv[0] === "merge-base"
                  ? "abc123\n"
                  : "## agent-DRA-effect-vendor-providers\n";
            return commandResult("git-state", "git", argv, options.cwd, stdout);
          })
        )
      )
    );

    expect(result.defaultBranch).toBe("origin/main");
    expect(result.mergeBase).toBe("abc123");
    expect(result.status.stdout.text).toContain("agent-DRA-effect-vendor-providers");
    expect(observed).toEqual([
      ["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"],
      ["merge-base", "HEAD", "origin/main"],
      ["status", "--short", "--branch"],
    ]);
  });

  test("NxProvider exposes affected argv and fake execution at the provider boundary", async () => {
    const request = { base: "HEAD~1", targets: ["build", "test"] };

    expect(affectedArgv(request)).toEqual([
      "nx",
      "affected",
      "-t",
      "build,test",
      "--base",
      "HEAD~1",
      "--head",
      "HEAD",
      "--outputStyle=static",
    ]);

    const result = await runHabitatEffect(
      Effect.gen(function* () {
        const nx = yield* NxProvider;
        return yield* nx.affected(request);
      }).pipe(
        Effect.provide(
          makeFakeNxProviderLayer((affectedRequest) =>
            commandResult(
              "workspace-tool",
              "nx",
              affectedArgv(affectedRequest).slice(1),
              repoRoot,
              "ok\n"
            )
          )
        )
      )
    );

    expect(result.commandId).toBe("workspace-tool-nx");
    expect(result.stdout.text).toBe("ok\n");
  });

  test("NxProvider owns graph argv construction", () => {
    expect(graphArgv({ outputPath: "/tmp/habitat-graph-fake/graph.json" })).toEqual([
      "target-check",
      "graph",
      "--file",
      "/tmp/habitat-graph-fake/graph.json",
    ]);
  });

  test("BiomeProvider owns safe command-vector construction", async () => {
    const request = {
      kind: "format" as const,
      paths: ["tools/habitat-harness/src/index.ts"],
      write: true,
      noErrorsOnUnmatched: true,
    };

    expect(biomeArgv(request)).toEqual([
      "biome",
      "format",
      "--write",
      "--no-errors-on-unmatched",
      "tools/habitat-harness/src/index.ts",
    ]);

    const result = await runHabitatEffect(
      Effect.gen(function* () {
        const biome = yield* BiomeProvider;
        return yield* biome.run(request);
      }).pipe(
        Effect.provide(
          makeFakeBiomeProviderLayer((biomeRequest) =>
            commandResult(
              "biome-handoff",
              "biome",
              biomeArgv(biomeRequest).slice(1),
              repoRoot,
              "formatted\n"
            )
          )
        )
      )
    );

    expect(result.argv).toEqual([
      "format",
      "--write",
      "--no-errors-on-unmatched",
      "tools/habitat-harness/src/index.ts",
    ]);
    expect(result.stdout.text).toBe("formatted\n");
  });

  test("GritProvider owns check request construction and cache policy", async () => {
    const result = await runHabitatEffect(
      Effect.gen(function* () {
        const grit = yield* GritProvider;
        const request = grit.checkRequest({
          scanRoots: ["tools/habitat-harness/src"],
          outputFormat: "json",
          cacheDir: "/tmp/habitat-grit-provider-test-cache",
          timeoutMs: 1234,
        });
        return {
          request,
          checked: yield* grit.check({
            scanRoots: ["tools/habitat-harness/src"],
            outputFormat: "json",
          }),
        };
      }).pipe(
        Effect.provide(
          makeFakeGritProviderLayer((request) =>
            commandResult(
              "pattern-check",
              "grit",
              ["--json", "check", "--level", "error", ...request.scanRoots],
              repoRoot,
              ""
            )
          )
        )
      )
    );

    expect(result.request.argv).toEqual([
      "--json",
      "check",
      "--level",
      "error",
      "tools/habitat-harness/src",
    ]);
    expect(result.request.cachePolicy).toMatchObject({
      mode: "isolated",
      cacheDir: "/tmp/habitat-grit-provider-test-cache",
    });
    expect(result.request.timeoutMs).toBe(1234);
    expect(result.checked.kind).toBe("pattern-check");
  });

  test("HuskyProvider stays limited to hook delegator facts", () => {
    expect(huskyDelegator("pre-commit")).toEqual({
      hook: "pre-commit",
      argv: ["bun", "run", "habitat", "hook", "pre-commit"],
    });
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
    },
    { stdout: captureOutput(stdout) }
  );
}
