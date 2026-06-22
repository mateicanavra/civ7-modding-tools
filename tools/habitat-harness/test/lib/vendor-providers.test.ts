import {
  BiomeProvider,
  biomeArgv,
  makeFakeBiomeProviderLayer,
} from "@internal/habitat-harness/providers/biome/index";
import {
  captureOutput,
  makeHabitatCommandResult,
  materializeDefaultHabitatCommand,
} from "@internal/habitat-harness/resources/command/index";
import {
  GitProvider,
  makeFakeGitProviderLayer,
} from "@internal/habitat-harness/providers/git/index";
import {
  GraphiteProvider,
  makeFakeGraphiteProviderLayer,
} from "@internal/habitat-harness/providers/graphite/index";
import {
  GritProvider,
  makeFakeGritProviderLayer,
} from "@internal/habitat-harness/providers/grit/index";
import {
  affectedArgv,
  graphArgv,
  makeFakeNxProviderLayer,
  NxProvider,
  runManyArgv,
  runTargetArgv,
} from "@internal/habitat-harness/providers/nx/index";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import { Effect } from "effect";
import { describe, expect, test } from "vitest";

describe("vendor providers", () => {
  test("GitProvider fake layer owns git command families without spawning", async () => {
    const observed: string[][] = [];
    const result = await Effect.runPromise(
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

  test("GraphiteProvider owns stack parent discovery", async () => {
    const observed: string[] = [];
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const graphite = yield* GraphiteProvider;
        return yield* graphite.parent();
      }).pipe(
        Effect.provide(
          makeFakeGraphiteProviderLayer((options) => {
            observed.push(options.cwd);
            return "agent-parent";
          })
        )
      )
    );

    expect(result).toBe("agent-parent");
    expect(observed).toEqual([repoRoot]);
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

    const result = await Effect.runPromise(
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
      "nx",
      "graph",
      "--file",
      "/tmp/habitat-graph-fake/graph.json",
    ]);
  });

  test("NxProvider batches graph-owned targets through run-many", async () => {
    const request = {
      projects: ["mod-swooper-maps", "@swooper/mapgen-core"],
      targets: ["test:architecture-cutover", "test:architecture-core-purity"],
    };

    expect(runManyArgv(request)).toEqual([
      "nx",
      "run-many",
      "--targets",
      "test:architecture-cutover,test:architecture-core-purity",
      "--projects",
      "mod-swooper-maps,@swooper/mapgen-core",
      "--outputStyle=static",
    ]);

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const nx = yield* NxProvider;
        return yield* nx.runMany(request);
      }).pipe(
        Effect.provide(
          makeFakeNxProviderLayer({
            runMany: (runManyRequest) =>
              commandResult(
                "workspace-tool",
                "nx",
                runManyArgv(runManyRequest).slice(1),
                repoRoot,
                "batched ok\n"
              ),
          })
        )
      )
    );

    expect(result.stdout.text).toBe("batched ok\n");
  });

  test("NxProvider owns single target execution without run-many", async () => {
    const request = {
      project: "@internal/habitat-harness",
      target: "boundaries",
    };

    expect(runTargetArgv(request)).toEqual([
      "nx",
      "run",
      "@internal/habitat-harness:boundaries",
      "--outputStyle=static",
    ]);

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const nx = yield* NxProvider;
        return yield* nx.runTarget(request);
      }).pipe(
        Effect.provide(
          makeFakeNxProviderLayer({
            runTarget: (runTargetRequest) =>
              commandResult(
                "workspace-tool",
                "nx",
                runTargetArgv(runTargetRequest).slice(1),
                repoRoot,
                "single target ok\n"
              ),
          })
        )
      )
    );

    expect(result.stdout.text).toBe("single target ok\n");
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

    const result = await Effect.runPromise(
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

  test("BiomeProvider executable materializes through the workspace binary policy", () => {
    expect(materializeDefaultHabitatCommand("biome", ["ci", "."])).toMatchObject({
      requestedExecutable: "biome",
      executable: "bun",
      argv: ["run", "--cwd", repoRoot, "biome", "ci", "."],
      cwd: repoRoot,
      executionPlane: "workspace-bun-run",
    });
  });

  test("GritProvider owns check request construction and cache policy", async () => {
    const result = await Effect.runPromise(
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
