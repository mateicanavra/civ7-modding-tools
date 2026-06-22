import {
  type BiomeCommandRequest,
  BiomeProvider,
  biomeArgv,
  makeFakeBiomeProviderLayer,
} from "@internal/habitat-harness/providers/biome/index";
import {
  GitProvider,
  makeFakeGitProviderLayer,
} from "@internal/habitat-harness/providers/git/index";
import {
  GraphiteProvider,
  makeFakeGraphiteProviderLayer,
} from "@internal/habitat-harness/providers/graphite/index";
import {
  affectedArgv,
  makeFakeNxProviderLayer,
  type NxAffectedRequest,
  NxProvider,
  type NxRunTargetRequest,
  runTargetArgv,
} from "@internal/habitat-harness/providers/nx/index";
import {
  captureOutput,
  makeHabitatCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import type { HabitatCommandResult } from "@internal/habitat-harness/resources/command/types";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import type { HabitatReportEvent } from "@internal/habitat-harness/resources/reporter/index";
import type {
  CheckOptions,
  CheckReport,
} from "@internal/habitat-harness/service/model/check/index";
import {
  makeFakeStructuralCheckLayer,
  StructuralCheck,
} from "@internal/habitat-harness/service/model/check/policy/structural/index";
import type { HookServiceRunInput } from "@internal/habitat-harness/service/modules/hook/contract";
import type { HookResourcePolicy } from "@internal/habitat-harness/service/modules/hook/model/policy/runtime.policy";
import { hookRouter } from "@internal/habitat-harness/service/modules/hook/router";
import { habitatServiceRouter } from "@internal/habitat-harness/service/router";
import { createRouterClient } from "@orpc/server";
import { Effect, Layer } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { describe, expect, test } from "vitest";
import { makeTestHabitatServiceDeps } from "../support/habitat-service-deps";

const prePushAffectedTargets =
  "check,validate:boundary-taxonomy,validate:grit-patterns,validate:service-module-shape";
const prePushSourceArtifactTargets = "source:check";
const prePushNonSourceRuleArtifactTargets = "habitat:rule:import-boundaries";
const prePushMixedRuleArtifactTargets = "source:check,habitat:rule:import-boundaries";
const prePushBoundaryTaxonomyTargets = "validate:boundary-taxonomy";
const prePushStructuralTargetDeclarationTargets =
  "validate:boundary-taxonomy,validate:grit-patterns,validate:service-module-shape";
const prePushNoChangedSourceCheck =
  "source checks: no changed TypeScript/JavaScript/docs files in hook source-check roots\n";

describe("Habitat hook service", () => {
  test("runs owned hook orchestration from service input", async () => {
    const fake = makePrePushFixture();

    const result = await runHookServiceInTest({ name: "pre-push", base: "HEAD~1" });

    expect(result).toEqual({
      exitCode: 0,
      stdout: `hook result: workstation check only; CI remains authoritative.\n${prePushNoChangedSourceCheck}habitat hook pre-push: repo Nx affected base=HEAD~1\naffected ok\n`,
      stderr: "",
    });
    expect(fake.calls).toEqual([]);
  });

  test("preserves unknown hook stream behavior", async () => {
    const result = await runHookServiceInTest({});

    expect(result).toEqual({
      exitCode: 2,
      stdout: "",
      stderr: "Unknown Habitat hook '(missing)'. Expected pre-commit or pre-push.\n",
    });
  });

  test("resolves empty pre-push base from Graphite", async () => {
    const fake = makePrePushFixture({ graphiteParent: "agent-parent" });

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "" },
      {},
      undefined,
      undefined,
      undefined,
      undefined,
      graphiteLayer(fake)
    );

    expect(result.stdout).toContain("base=agent-parent");
    expect(fake.calls).toEqual(["gt branch info --no-interactive"]);
  });

  test("resolves pre-push merge-base through GitProvider when Graphite parent is absent", async () => {
    const fake = makePrePushFixture();
    const gitCalls: string[] = [];

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "" },
      {},
      makeFakeGitProviderLayer((argv, options) => {
        gitCalls.push(argv.join(" "));
        const stdout =
          argv[0] === "symbolic-ref"
            ? "origin/main\n"
            : argv[0] === "merge-base"
              ? "abc123mergebase\n"
              : "";
        return commandResult(argv, options.cwd, stdout);
      }),
      undefined,
      undefined,
      undefined,
      graphiteLayer(fake)
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("base=abc123mergebase");
    expect(fake.calls).toEqual(["gt branch info --no-interactive"]);
    expect(gitCalls).toEqual([
      "symbolic-ref --quiet --short refs/remotes/origin/HEAD",
      "merge-base HEAD origin/main",
      "diff --name-only -z abc123mergebase HEAD",
    ]);
  });

  test("refuses pre-push when no affected base can be resolved", async () => {
    const fake = makePrePushFixture();
    const gitCalls: string[] = [];

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "" },
      {},
      makeFakeGitProviderLayer((argv, options) => {
        gitCalls.push(argv.join(" "));
        return commandResult(argv, options.cwd, "", 1);
      }),
      undefined,
      undefined,
      undefined,
      graphiteLayer(fake)
    );

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("could not resolve an affected base");
    expect(fake.calls).toEqual(["gt branch info --no-interactive"]);
    expect(gitCalls).toEqual(["symbolic-ref --quiet --short refs/remotes/origin/HEAD"]);
  });

  test("propagates Nx affected failures with base provenance", async () => {
    const fake = makePrePushFixture({ graphiteParent: "agent-HR-parent" });

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "" },
      {},
      undefined,
      nxLayer(() =>
        commandResult(
          affectedArgv({
            base: "agent-HR-parent",
            targets: prePushAffectedTargets.split(","),
            head: "HEAD",
            excludeTaskDependencies: true,
          }),
          repoRootForTestCommand(),
          "affected failed\n",
          1,
          "target failed\n",
          "nx"
        )
      ),
      undefined,
      undefined,
      graphiteLayer(fake)
    );

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("habitat hook pre-push: repo Nx affected base=agent-HR-parent");
    expect(result.stdout).toContain(prePushNoChangedSourceCheck);
    expect(result.stdout).toContain("affected failed");
    expect(result.stderr).toContain("target failed");
  });

  test("reports pre-push output through an injected reporter service", async () => {
    const events: HabitatReportEvent[] = [];
    const fake = makePrePushFixture({ graphiteParent: "agent-HR-parent" });

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "" },
      { reporterEvents: events },
      undefined,
      nxLayer(() =>
        commandResult(
          affectedArgv({
            base: "agent-HR-parent",
            targets: prePushAffectedTargets.split(","),
            head: "HEAD",
            excludeTaskDependencies: true,
          }),
          repoRootForTestCommand(),
          "affected failed\n",
          1,
          "target failed\n",
          "nx"
        )
      ),
      undefined,
      undefined,
      graphiteLayer(fake)
    );

    expect(result.exitCode).toBe(1);
    expect(renderReported(events, "stdout")).toBe(result.stdout);
    expect(renderReported(events, "stderr")).toBe(result.stderr);
    expect(events).toContainEqual({
      kind: "stdout",
      text: "hook result: workstation check only; CI remains authoritative.\n",
    });
    expect(events).toContainEqual({
      kind: "stdout",
      text: prePushNoChangedSourceCheck,
    });
    expect(events).toContainEqual({
      kind: "stderr",
      text: "target failed\n",
    });
  });

  test("runs pre-push through provider-backed service execution", async () => {
    const fake = makePrePushFixture();

    const result = await runHookServiceInTest({ name: "pre-push", base: "HEAD~1" });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("base=HEAD~1");
    expect(fake.calls).toEqual([]);
  });

  test("runs pre-push source checks over changed hook source paths", async () => {
    const fake = makePrePushFixture();
    const checkRequests: CheckOptions[] = [];
    const changedPath = "packages/sdk/src/index.ts";

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "HEAD~1" },
      {},
      makeFakeGitProviderLayer((argv, options) => {
        const stdout =
          argv.join(" ") === "diff --name-only -z HEAD~1 HEAD" ? `${changedPath}\0` : "";
        return commandResult(argv, options.cwd, stdout);
      }),
      nxLayer(),
      makeFakeStructuralCheckLayer({
        createReport: (options = {}) =>
          Effect.sync(() => {
            checkRequests.push(options);
            return passingCheckReport(options.command?.serialized ?? "habitat check");
          }),
        expandBaselines: () => Effect.succeed({ ok: true, messages: [] }),
      })
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("[source-check changed-path hook check]");
    expect(checkRequests).toEqual([
      expect.objectContaining({
        tool: "source-check",
        hookCheck: true,
        staged: true,
        stagedPaths: [changedPath],
      }),
    ]);
  });

  test("uses source-check target only for source rule artifact pre-push changes", async () => {
    const fake = makePrePushFixture();
    const affectedRequests: NxAffectedRequest[] = [];
    const changedPath = ".habitat/rules/rng-authority-static/rule.json";

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "HEAD~1" },
      {},
      makeFakeGitProviderLayer((argv, options) => {
        const stdout =
          argv.join(" ") === "diff --name-only -z HEAD~1 HEAD" ? `${changedPath}\0` : "";
        return commandResult(argv, options.cwd, stdout);
      }),
      nxLayer((request) => {
        affectedRequests.push(request);
        return commandResult(
          affectedArgv(request),
          repoRootForTestCommand(),
          "affected ok\n",
          0,
          "",
          "nx"
        );
      })
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("habitat hook pre-push: repo Nx affected base=HEAD~1");
    expect(affectedRequests).toEqual([
      {
        base: "HEAD~1",
        targets: prePushSourceArtifactTargets.split(","),
        head: "HEAD",
        excludeTaskDependencies: true,
      },
    ]);
  });

  test("uses the owning rule target for non-source rule artifact pre-push changes", async () => {
    const fake = makePrePushFixture();
    const affectedRequests: NxAffectedRequest[] = [];
    const changedPath = ".habitat/rules/import-boundaries/rule.json";

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "HEAD~1" },
      {},
      makeFakeGitProviderLayer((argv, options) => {
        const stdout =
          argv.join(" ") === "diff --name-only -z HEAD~1 HEAD" ? `${changedPath}\0` : "";
        return commandResult(argv, options.cwd, stdout);
      }),
      nxLayer((request) => {
        affectedRequests.push(request);
        return commandResult(
          affectedArgv(request),
          repoRootForTestCommand(),
          "affected ok\n",
          0,
          "",
          "nx"
        );
      })
    );

    expect(result.exitCode).toBe(0);
    expect(affectedRequests).toEqual([
      {
        base: "HEAD~1",
        targets: prePushNonSourceRuleArtifactTargets.split(","),
        head: "HEAD",
        excludeTaskDependencies: true,
      },
    ]);
  });

  test("uses source-check plus owning rule targets for mixed rule artifact pre-push changes", async () => {
    const fake = makePrePushFixture();
    const affectedRequests: NxAffectedRequest[] = [];
    const changedPaths = [
      ".habitat/rules/rng-authority-static/rule.json",
      ".habitat/rules/import-boundaries/rule.json",
    ];

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "HEAD~1" },
      {},
      makeFakeGitProviderLayer((argv, options) => {
        const stdout =
          argv.join(" ") === "diff --name-only -z HEAD~1 HEAD"
            ? `${changedPaths.join("\0")}\0`
            : "";
        return commandResult(argv, options.cwd, stdout);
      }),
      nxLayer((request) => {
        affectedRequests.push(request);
        return commandResult(
          affectedArgv(request),
          repoRootForTestCommand(),
          "affected ok\n",
          0,
          "",
          "nx"
        );
      })
    );

    expect(result.exitCode).toBe(0);
    expect(affectedRequests).toEqual([
      {
        base: "HEAD~1",
        targets: prePushMixedRuleArtifactTargets.split(","),
        head: "HEAD",
        excludeTaskDependencies: true,
      },
    ]);
  });

  test("uses owner-local check without structural affected targets for ordinary tooling changes", async () => {
    const fake = makePrePushFixture();
    const affectedRequests: NxAffectedRequest[] = [];
    const runTargetRequests: NxRunTargetRequest[] = [];
    const changedPath = "tools/habitat-harness/src/nx-plugin.ts";

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "HEAD~1" },
      {},
      makeFakeGitProviderLayer((argv, options) => {
        const stdout =
          argv.join(" ") === "diff --name-only -z HEAD~1 HEAD" ? `${changedPath}\0` : "";
        return commandResult(argv, options.cwd, stdout);
      }),
      nxLayer({
        affected: (request) => {
          affectedRequests.push(request);
          return commandResult(
            affectedArgv(request),
            repoRootForTestCommand(),
            "affected ok\n",
            0,
            "",
            "nx"
          );
        },
        runTarget: (request) => {
          runTargetRequests.push(request);
          return commandResult(
            runTargetArgv(request),
            repoRootForTestCommand(),
            "target ok\n",
            0,
            "",
            "nx"
          );
        },
      })
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "habitat hook pre-push: repo Nx target @internal/habitat-harness:check"
    );
    expect(result.stdout).toContain("target ok");
    expect(result.stdout).toContain("habitat hook pre-push: no repo Nx affected targets selected");
    expect(runTargetRequests).toEqual([{ project: "@internal/habitat-harness", target: "check" }]);
    expect(affectedRequests).toEqual([]);
  });

  test("uses boundary taxonomy target for boundary taxonomy tooling changes", async () => {
    const fake = makePrePushFixture();
    const affectedRequests: NxAffectedRequest[] = [];
    const runTargetRequests: NxRunTargetRequest[] = [];
    const changedPath =
      "tools/habitat-harness/src/service/model/graph/policy/boundary-taxonomy.policy.ts";

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "HEAD~1" },
      {},
      makeFakeGitProviderLayer((argv, options) => {
        const stdout =
          argv.join(" ") === "diff --name-only -z HEAD~1 HEAD" ? `${changedPath}\0` : "";
        return commandResult(argv, options.cwd, stdout);
      }),
      nxLayer({
        affected: (request) => {
          affectedRequests.push(request);
          return commandResult(
            affectedArgv(request),
            repoRootForTestCommand(),
            "affected ok\n",
            0,
            "",
            "nx"
          );
        },
        runTarget: (request) => {
          runTargetRequests.push(request);
          return commandResult(
            runTargetArgv(request),
            repoRootForTestCommand(),
            "target ok\n",
            0,
            "",
            "nx"
          );
        },
      })
    );

    expect(result.exitCode).toBe(0);
    expect(runTargetRequests).toEqual([{ project: "@internal/habitat-harness", target: "check" }]);
    expect(affectedRequests).toEqual([
      {
        base: "HEAD~1",
        targets: prePushBoundaryTaxonomyTargets.split(","),
        head: "HEAD",
        excludeTaskDependencies: true,
      },
    ]);
  });

  test("uses all structural targets for structural target declaration changes", async () => {
    const fake = makePrePushFixture();
    const affectedRequests: NxAffectedRequest[] = [];
    const runTargetRequests: NxRunTargetRequest[] = [];
    const changedPath = "tools/habitat-harness/package.json";

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "HEAD~1" },
      {},
      makeFakeGitProviderLayer((argv, options) => {
        const stdout =
          argv.join(" ") === "diff --name-only -z HEAD~1 HEAD" ? `${changedPath}\0` : "";
        return commandResult(argv, options.cwd, stdout);
      }),
      nxLayer({
        affected: (request) => {
          affectedRequests.push(request);
          return commandResult(
            affectedArgv(request),
            repoRootForTestCommand(),
            "affected ok\n",
            0,
            "",
            "nx"
          );
        },
        runTarget: (request) => {
          runTargetRequests.push(request);
          return commandResult(
            runTargetArgv(request),
            repoRootForTestCommand(),
            "target ok\n",
            0,
            "",
            "nx"
          );
        },
      })
    );

    expect(result.exitCode).toBe(0);
    expect(runTargetRequests).toEqual([{ project: "@internal/habitat-harness", target: "check" }]);
    expect(affectedRequests).toEqual([
      {
        base: "HEAD~1",
        targets: prePushStructuralTargetDeclarationTargets.split(","),
        head: "HEAD",
        excludeTaskDependencies: true,
      },
    ]);
  });

  test("runs pre-commit through the in-process Habitat service router", async () => {
    const fake = makePreCommitFixture();

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const biome = yield* BiomeProvider;
        const git = yield* GitProvider;
        const graphite = yield* GraphiteProvider;
        const nx = yield* NxProvider;
        const structuralCheck = yield* StructuralCheck;
        return yield* Effect.promise(() =>
          createRouterClient(habitatServiceRouter, {
            context: {
              deps: {
                ...makeTestHabitatServiceDeps({
                  biome,
                  git,
                  graphite,
                  hashFile: fake.hashFile,
                  nx,
                  pathExists: fake.pathExists,
                  repoRoot,
                  structuralCheck,
                }),
              },
            },
          }).hook.run({ name: "pre-commit" })
        );
      }).pipe(
        Effect.provide(
          Layer.mergeAll(
            prePushGitLayer(makePrePushFixture()),
            nxLayer(),
            makeFakeStructuralCheckLayer({
              createReport: (options = {}) =>
                Effect.succeed(
                  fileLayerPassingCheckReport(options.command?.serialized ?? "habitat check")
                ),
              expandBaselines: () =>
                Effect.succeed({
                  kind: "expanded",
                  messages: [],
                }),
            }),
            biomeLayer(),
            makeFakeGraphiteProviderLayer(() => null)
          )
        )
      )
    );

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("habitat hook pre-commit\n");
    expect(result.stdout).toContain("\n[file-layer staged check]\n");
    expect(result.stdout).toContain('"command": "habitat check --staged --tool file-layer --json"');
    expect(result.stdout).toContain('"ruleId": "file-layer-pnpm-artifacts"');
    expect(result.stdout).toContain("biome: no staged supported files\n");
    expect(result.stdout).toContain(
      "source checks: no staged TypeScript/JavaScript files in approved source-check roots\n"
    );
    expect(result.stdout).toContain("habitat hook pre-commit: PASS\n");
    expect(fake.calls).toEqual([]);
  });

  test("routes pre-commit Biome execution through the Biome provider", async () => {
    const stagedPath = "tools/habitat-harness/src/service/modules/hook/router.ts";
    const fake = makePreCommitFixture({
      stagedPaths: [stagedPath],
      fileHashes: { [stagedPath]: ["before-format", "after-format"] },
    });
    const biomeRequests: BiomeCommandRequest[] = [];

    const result = await runHookServiceInTest(
      { name: "pre-commit" },
      { hashFile: fake.hashFile, pathExists: fake.pathExists },
      preCommitGitLayer(fake),
      undefined,
      makeFakeStructuralCheckLayer({
        createReport: (options = {}) =>
          Effect.succeed(passingCheckReport(options.command?.serialized ?? "habitat check")),
        expandBaselines: () => Effect.succeed({ ok: true, messages: [] }),
      }),
      biomeLayer((request) => {
        biomeRequests.push(request);
        return commandResult(
          biomeArgv(request),
          repoRootForTestCommand(),
          `${request.kind} ok\n`,
          0,
          "",
          "biome"
        );
      })
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("[biome format]\nformat ok\n");
    expect(result.stdout).toContain("[biome check]\ncheck ok\n");
    expect(fake.calls.some((call) => call.startsWith("biome "))).toBe(false);
    expect(fake.calls).toContain(`git add -- ${stagedPath}`);
    expect(biomeRequests).toEqual([
      {
        kind: "format",
        write: true,
        noErrorsOnUnmatched: true,
        paths: [stagedPath],
      },
      {
        kind: "check",
        noErrorsOnUnmatched: true,
        paths: [stagedPath],
      },
    ]);
  });
});

function runHookServiceInTest(
  input: HookServiceRunInput,
  options: {
    readonly hashFile?: (targetPath: string) => string | null;
    readonly pathExists?: (targetPath: string) => boolean;
    readonly reporterEvents?: HabitatReportEvent[];
    readonly resourcePolicy?: HookResourcePolicy;
  } = {},
  gitLayer = makeFakeGitProviderLayer((argv, options) => commandResult(argv, options.cwd, "")),
  nx = nxLayer(),
  structuralCheck?: ReturnType<typeof makeFakeStructuralCheckLayer>,
  biome = biomeLayer(),
  graphite = makeFakeGraphiteProviderLayer(() => null)
) {
  const layer = structuralCheck
    ? Layer.mergeAll(gitLayer, nx, structuralCheck, biome, graphite)
    : Layer.mergeAll(
        gitLayer,
        nx,
        makeFakeStructuralCheckLayer({
          createReport: (options = {}) =>
            Effect.succeed(passingCheckReport(options.command?.serialized ?? "habitat check")),
          expandBaselines: () =>
            Effect.succeed({
              kind: "expanded",
              messages: [],
            }),
        }),
        biome,
        graphite
      );
  return Effect.runPromise(
    Effect.gen(function* () {
      const biome = yield* BiomeProvider;
      const git = yield* GitProvider;
      const graphite = yield* GraphiteProvider;
      const nx = yield* NxProvider;
      const resolvedStructuralCheck = yield* StructuralCheck;
      const runHook = hookRouter.run.callable({
        context: {
          deps: {
            ...makeTestHabitatServiceDeps({
              biome,
              git,
              graphite,
              nx,
              platform: {
                ...makeTestHabitatServiceDeps().platform,
                ...(options.hashFile ? { hashFile: options.hashFile } : {}),
                ...(options.pathExists ? { pathExists: options.pathExists } : {}),
                repoRoot,
              },
              ...(options.reporterEvents
                ? {
                    reporter: {
                      emit: (event: HabitatReportEvent) =>
                        Effect.sync(() => {
                          options.reporterEvents?.push(event);
                        }),
                    },
                  }
                : {}),
              structuralCheck: resolvedStructuralCheck,
            }),
          },
        },
      });
      return yield* withFiberContext(() =>
        runHook({
          ...input,
          ...(options.resourcePolicy ? { resourcePolicy: options.resourcePolicy } : {}),
        })
      );
    }).pipe(Effect.provide(layer))
  );
}

function commandResult(
  argv: readonly string[],
  cwd: string,
  stdout: string,
  exitCode = 0,
  stderr = "",
  executable = "git"
): HabitatCommandResult {
  return makeHabitatCommandResult(
    {
      commandId: `${executable}-${argv.join("-")}`,
      kind: executable === "git" ? "git-state" : "workspace-tool",
      executable,
      argv,
      cwd,
      captureGitState: false,
    },
    {
      exit: { code: exitCode, signal: null, interrupted: false },
      stdout: captureOutput(stdout),
      stderr: captureOutput(stderr),
    }
  );
}

function makePrePushFixture(options: { graphiteParent?: string } = {}): {
  calls: string[];
  options: { graphiteParent?: string };
} {
  const calls: string[] = [];
  return {
    calls,
    options,
  };
}

function graphiteLayer(fake: { calls: string[]; options: { graphiteParent?: string } }) {
  return makeFakeGraphiteProviderLayer(() => {
    fake.calls.push("gt branch info --no-interactive");
    return fake.options.graphiteParent ?? null;
  });
}

function prePushGitLayer(_fake: ReturnType<typeof makePrePushFixture>) {
  return makeFakeGitProviderLayer((argv, options) => {
    const call = argv.join(" ");
    if (call === "branch --show-current") {
      return commandResult(argv, options.cwd, "agent-HR-test\n");
    }
    if (call === "rev-parse HEAD") {
      return commandResult(argv, options.cwd, "abc123head\n");
    }
    if (call === "diff --cached --name-only -z" || call === "diff --name-only -z") {
      return commandResult(argv, options.cwd, "");
    }
    return commandResult(argv, options.cwd, "");
  });
}

function nxLayer(
  handlerOrHandlers?:
    | ((request: NxAffectedRequest) => HabitatCommandResult)
    | {
        affected?: (request: NxAffectedRequest) => HabitatCommandResult;
        runTarget?: (request: NxRunTargetRequest) => HabitatCommandResult;
      }
) {
  const handlers =
    typeof handlerOrHandlers === "function" ? { affected: handlerOrHandlers } : handlerOrHandlers;
  return makeFakeNxProviderLayer({
    affected: (request) =>
      handlers?.affected?.(request) ??
      commandResult(affectedArgv(request), repoRootForTestCommand(), "affected ok\n", 0, "", "nx"),
    runTarget: (request) =>
      handlers?.runTarget?.(request) ??
      commandResult(runTargetArgv(request), repoRootForTestCommand(), "target ok\n", 0, "", "nx"),
  });
}

function biomeLayer(handler?: (request: BiomeCommandRequest) => HabitatCommandResult) {
  return makeFakeBiomeProviderLayer(
    (request) =>
      handler?.(request) ??
      commandResult(biomeArgv(request), repoRootForTestCommand(), "biome ok\n", 0, "", "biome")
  );
}

function repoRootForTestCommand(): string {
  return process.cwd().replace(/\/tools\/habitat-harness$/, "");
}

function makePreCommitFixture(
  options: {
    stagedPaths?: string[];
    unstagedPaths?: string[];
    fileHashes?: Record<string, string[]>;
  } = {}
): {
  hashFile: (targetPath: string) => string | null;
  pathExists: (targetPath: string) => boolean;
  calls: string[];
  options: {
    stagedPaths?: string[];
    unstagedPaths?: string[];
    fileHashes?: Record<string, string[]>;
  };
} {
  const calls: string[] = [];
  const hashReads = new Map<string, number>();
  const pathExists = (target: string) =>
    (options.stagedPaths ?? []).some((candidate) => target.endsWith(candidate));
  const hashFile = (targetPath: string) => {
    const repoRelativePath = toTestRepoRelative(targetPath);
    const sequence = options.fileHashes?.[repoRelativePath];
    if (!sequence) return `stable:${repoRelativePath}`;
    const readCount = hashReads.get(repoRelativePath) ?? 0;
    hashReads.set(repoRelativePath, readCount + 1);
    return sequence[Math.min(readCount, sequence.length - 1)] ?? null;
  };
  return {
    calls,
    hashFile,
    options,
    pathExists,
  };
}

function toTestRepoRelative(targetPath: string): string {
  const prefix = `${repoRoot}/`;
  return targetPath.startsWith(prefix) ? targetPath.slice(prefix.length) : targetPath;
}

function preCommitGitLayer(fake: ReturnType<typeof makePreCommitFixture>) {
  return makeFakeGitProviderLayer((argv, options) => {
    const call = ["git", ...argv].join(" ");
    fake.calls.push(call);
    if (call === "git branch --show-current") {
      return commandResult(argv, options.cwd, "agent-HR-test\n");
    }
    if (call === "git rev-parse HEAD") {
      return commandResult(argv, options.cwd, "abc123head\n");
    }
    if (call === "git diff --name-only -z") {
      return commandResult(argv, options.cwd, "");
    }
    if (call === "git diff --cached --name-only -z") {
      return commandResult(argv, options.cwd, renderPathList(fake.options.stagedPaths ?? []));
    }
    if (call === "git diff --cached --name-status -z") {
      return commandResult(argv, options.cwd, renderNameStatus(fake.options.stagedPaths ?? []));
    }
    if (call.startsWith("git diff --name-only -z --")) {
      return commandResult(argv, options.cwd, renderPathList(fake.options.unstagedPaths ?? []));
    }
    if (call.startsWith("git add --")) {
      return commandResult(argv, options.cwd, "");
    }
    throw new Error(`Unexpected hook pre-commit service test command: ${call}`);
  });
}

function renderNameStatus(paths: string[]): string {
  return paths.map((target) => `A\0${target}\0`).join("");
}

function renderPathList(paths: string[]): string {
  return paths.length === 0 ? "" : `${paths.join("\0")}\0`;
}

function renderReported(events: HabitatReportEvent[], kind: HabitatReportEvent["kind"]): string {
  return events
    .filter((event) => event.kind === kind)
    .map((event) => event.text)
    .join("");
}

function passingCheckReport(command: string): CheckReport {
  return {
    schemaVersion: 1,
    command,
    startedAt: "2026-06-21T00:00:00.000Z",
    ok: true,
    rules: [],
  };
}

function fileLayerPassingCheckReport(command: string): CheckReport {
  return {
    schemaVersion: 1,
    command,
    startedAt: "2026-06-21T00:00:00.000Z",
    ok: true,
    rules: [
      {
        ruleId: "file-layer-pnpm-artifacts",
        ownerTool: "file-layer",
        lane: "enforced",
        status: "pass",
        locked: true,
        durationMs: 1,
        diagnostics: [],
        detect: ["habitat", "check", "--tool", "file-layer"],
        message: "File-layer pnpm artifacts are controlled by package manager commands.",
        remediate: null,
      },
    ],
  };
}
