import path from "node:path";
import { NodeContext } from "@effect/platform-node";
import {
  BiomeProvider,
  biomeArgv,
  makeFakeBiomeProviderLayer,
} from "@habitat/cli/providers/biome/index";
import {
  GitProvider,
  makeFakeGitProviderLayer,
  makeGitStateProviderLayer,
} from "@habitat/cli/providers/git/index";
import {
  GraphiteProvider,
  makeFakeGraphiteProviderLayer,
} from "@habitat/cli/providers/graphite/index";
import {
  affectedArgv,
  graphArgv,
  makeFakeNxProviderLayer,
  NxProvider,
  runManyArgv,
  runTargetArgv,
} from "@habitat/cli/providers/nx/index";
import {
  CommandRunner,
  captureOutput,
  type HabitatProcessRequest,
  makeHabitatCommandResult,
  materializeDefaultHabitatCommand,
} from "@habitat/cli/resources/command/index";
import { makeHabitatConfig, makeHabitatConfigLayer } from "@habitat/cli/resources/config/index";
import { repoRoot } from "@habitat/cli/resources/paths";
import { defaultGritCommandTimeoutMs } from "@habitat/cli/resources/rule-diagnostics/providers/grit/constants";
import {
  makeFakeGritCommandService,
  makeGritCommandService,
} from "@habitat/cli/resources/rule-diagnostics/providers/grit/index";
import { Effect, Layer } from "effect";
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
          makeFakeGraphiteProviderLayer(
            (options) => {
              observed.push(options.cwd);
              return "agent-parent";
            },
            { repoRoot }
          )
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
      projects: ["mod-swooper-maps", "mapgen-core"],
      targets: ["habitat:check", "test"],
    };

    expect(runManyArgv(request)).toEqual([
      "nx",
      "run-many",
      "--targets",
      "habitat:check,test",
      "--projects",
      "mod-swooper-maps,mapgen-core",
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
      project: "habitat",
      target: "boundaries",
    };

    expect(runTargetArgv(request)).toEqual([
      "nx",
      "run",
      "habitat:boundaries",
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
      paths: ["tools/habitat/src/index.ts"],
      write: true,
      noErrorsOnUnmatched: true,
    };

    expect(biomeArgv(request)).toEqual([
      "biome",
      "format",
      "--write",
      "--no-errors-on-unmatched",
      "tools/habitat/src/index.ts",
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
      "tools/habitat/src/index.ts",
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

  test("the Grit command service owns the direct-native hermetic check request", async () => {
    const providerRequest = {
      scanRoots: ["/tmp/habitat-grit-target"],
      cwd: "/tmp/habitat-grit-catalog-parent",
      gritDir: "/tmp/habitat-grit-catalog-parent/.grit",
      cacheDir: "/tmp/habitat-grit-provider-test-cache",
      gritUserConfigDir: "/tmp/habitat-grit-catalog-parent/user-config",
      timeoutMs: 1234,
    } as const;
    const grit = makeFakeGritCommandService(
      (request) =>
        commandResult(
          "pattern-check",
          "grit",
          ["--json", "check", "--level", "error", ...request.scanRoots],
          repoRoot,
          ""
        ),
      { repoRoot }
    );
    const request = grit.checkRequest(providerRequest);
    const checked = await Effect.runPromise(grit.check(providerRequest));
    const result = { request, checked };

    expect(result.request.argv).toEqual([
      "--json",
      "check",
      "--level",
      "error",
      "--no-cache",
      "--grit-dir",
      "/tmp/habitat-grit-catalog-parent/.grit",
      "/tmp/habitat-grit-target",
    ]);
    expect(result.request.executable).toBe(
      `${repoRoot}/node_modules/@getgrit/cli/node_modules/.bin_real/grit`
    );
    expect(result.request.cwd).toBe("/tmp/habitat-grit-catalog-parent");
    expect(result.request.env).toMatchObject({
      GRIT_DOWNLOADS_DISABLED: "true",
      GRIT_USER_CONFIG: "/tmp/habitat-grit-catalog-parent/user-config",
      GRIT_MAX_FILE_SIZE_BYTES: "0",
    });
    expect(result.request.cachePolicy).toMatchObject({
      mode: "isolated",
      cacheDir: "/tmp/habitat-grit-provider-test-cache",
    });
    expect(result.request.timeoutMs).toBe(1234);
    expect(result.checked.kind).toBe("pattern-check");
  });

  test("Grit preflight rejects nonzero exit even with the exact native version", async () => {
    const providerRequest = {
      scanRoots: [repoRoot],
      cwd: repoRoot,
      gritDir: path.join(repoRoot, ".grit"),
      cacheDir: "/tmp/habitat-grit-preflight-cache",
      gritUserConfigDir: "/tmp/habitat-grit-preflight-user",
      timeoutMs: 2468,
    };
    const observed: HabitatProcessRequest[] = [];
    const runner = {
      run: (request: HabitatProcessRequest) => {
        observed.push(request);
        return Effect.succeed(
          makeHabitatCommandResult(request, {
            exit: { code: 2, signal: null, interrupted: false },
            stdout: captureOutput("grit 0.1.1\n"),
          })
        );
      },
      runSync: (request: Parameters<typeof makeHabitatCommandResult>[0]) =>
        makeHabitatCommandResult(request),
    };
    const prerequisites = Layer.mergeAll(
      NodeContext.layer,
      Layer.succeed(CommandRunner, runner),
      makeHabitatConfigLayer(makeHabitatConfig({ repoRoot })),
      makeGitStateProviderLayer(repoRoot)
    );
    const result = await Effect.runPromise(
      makeGritCommandService(repoRoot).pipe(
        Effect.flatMap((grit) => Effect.either(grit.check(providerRequest))),
        Effect.provide(prerequisites)
      )
    );

    expect(result).toMatchObject({
      _tag: "Left",
      left: {
        _tag: "CommandFailed",
        commandId: "grit-pinned-native-preflight",
        exitCode: 2,
      },
    });
    expect(observed).toHaveLength(1);
    expect(observed[0]).toMatchObject({
      commandId: "grit-pinned-native-preflight",
      scanRoots: [],
      timeoutMs: defaultGritCommandTimeoutMs,
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
