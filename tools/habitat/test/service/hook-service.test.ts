import {
  type BiomeCommandRequest,
  BiomeProvider,
  biomeArgv,
  makeFakeBiomeProviderLayer,
} from "@habitat/cli/providers/biome/index";
import { GitProvider, makeFakeGitProviderLayer } from "@habitat/cli/providers/git/index";
import {
  GraphiteProvider,
  makeFakeGraphiteProviderLayer,
} from "@habitat/cli/providers/graphite/index";
import {
  affectedArgv,
  makeFakeNxProviderLayer,
  type NxAffectedRequest,
  NxProvider,
  type NxRunTargetRequest,
  runTargetArgv,
} from "@habitat/cli/providers/nx/index";
import { captureOutput, makeHabitatCommandResult } from "@habitat/cli/resources/command/index";
import type { HabitatCommandResult } from "@habitat/cli/resources/command/types";
import { repoRoot } from "@habitat/cli/resources/paths";
import type { HabitatReportEvent } from "@habitat/cli/resources/reporter/index";
import type { CheckOptions, CheckReport } from "@habitat/cli/service/model/check/index";
import type {
  HookPreCommitInput,
  HookPrePushInput,
} from "@habitat/cli/service/modules/hook/contract";
import type { HookResourcePolicy } from "@habitat/cli/service/modules/hook/model/policy/runtime.policy";
import { hookRouter } from "@habitat/cli/service/modules/hook/router";
import { Effect, Layer } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { makeTestHabitatServiceDeps, makeTestRuleFacts } from "../support/habitat-service-deps";

type StructuralCheckPolicy = {
  readonly createReport: (options?: CheckOptions) => Effect.Effect<CheckReport>;
};

const mockCreateCheckReportEffect = vi.hoisted(() =>
  vi.fn<StructuralCheckPolicy["createReport"]>()
);

vi.mock("@habitat/cli/service/model/check/policy/structural/index", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@habitat/cli/service/model/check/policy/structural/index")
    >();
  return {
    ...actual,
    createCheckReportEffect: mockCreateCheckReportEffect,
  };
});

const prePushAffectedTargets = "check,lint";
const prePushGritRuleArtifactTargets = "habitat:rule:require_runtime_domain_op_bundle_imports";
const prePushNonSourceRuleArtifactTargets = "habitat:rule:enforce_workspace_import_boundaries";
const prePushMixedRuleArtifactTargets =
  "habitat:rule:enforce_workspace_import_boundaries,habitat:rule:require_runtime_domain_op_bundle_imports";
const prePushBoundaryTaxonomyTargets = "lint";
const prePushStructuralTargetDeclarationTargets = "lint";
const prePushNoChangedSourceCheck =
  "source checks: no changed TypeScript/JavaScript/docs files in hook source-check roots\n";

describe("Habitat hook service", () => {
  beforeEach(() => {
    mockCreateCheckReportEffect.mockReset();
    useStructuralCheckPolicy(defaultStructuralCheckPolicy());
  });

  test("runs owned hook orchestration from service input", async () => {
    const fake = makePrePushFixture();

    const result = await runPrePushHookServiceInTest({ base: "HEAD~1" });

    expect(result).toEqual({
      exitCode: 0,
      stdout: `hook result: workstation check only; CI remains authoritative.\n${prePushNoChangedSourceCheck}habitat hook pre-push: repo Nx affected base=HEAD~1\naffected ok\n`,
      stderr: "",
    });
    expect(fake.calls).toEqual([]);
  });

  test("resolves empty pre-push base from Graphite", async () => {
    const fake = makePrePushFixture({ graphiteParent: "agent-parent" });

    const result = await runPrePushHookServiceInTest(
      { base: "" },
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

    const result = await runPrePushHookServiceInTest(
      { base: "" },
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

    const result = await runPrePushHookServiceInTest(
      { base: "" },
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

    const result = await runPrePushHookServiceInTest(
      { base: "" },
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

    const result = await runPrePushHookServiceInTest(
      { base: "" },
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

    const result = await runPrePushHookServiceInTest({ base: "HEAD~1" });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("base=HEAD~1");
    expect(fake.calls).toEqual([]);
  });

  test("runs pre-push source checks over changed hook source paths", async () => {
    const fake = makePrePushFixture();
    const checkRequests: CheckOptions[] = [];
    const changedPath = "packages/sdk/src/index.ts";

    const result = await runPrePushHookServiceInTest(
      { base: "HEAD~1" },
      { sourceCheckHookEnabled: true },
      makeFakeGitProviderLayer((argv, options) => {
        const stdout =
          argv.join(" ") === "diff --name-only -z HEAD~1 HEAD" ? `${changedPath}\0` : "";
        return commandResult(argv, options.cwd, stdout);
      }),
      nxLayer(),
      {
        createReport: (options = {}) =>
          Effect.sync(() => {
            checkRequests.push(options);
            return passingCheckReport(options.command?.serialized ?? "habitat check");
          }),
      }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("[source-check changed-path hook check]");
    expect(checkRequests).toEqual([
      expect.objectContaining({
        runner: "grit",
        hookCheck: true,
        staged: true,
        stagedPaths: [changedPath],
      }),
    ]);
  });

  test("uses the owning Grit rule target for migrated source rule artifact pre-push changes", async () => {
    const fake = makePrePushFixture();
    const affectedRequests: NxAffectedRequest[] = [];
    const changedPath =
      ".habitat/civ7/mapgen/pipeline/blueprints/recipe/execution/check/require_runtime_domain_op_bundle_imports/rule.json";

    const result = await runPrePushHookServiceInTest(
      { base: "HEAD~1" },
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
        targets: prePushGritRuleArtifactTargets.split(","),
        head: "HEAD",
        excludeTaskDependencies: true,
      },
    ]);
  });

  test("uses the owning rule target for non-source rule artifact pre-push changes", async () => {
    const fake = makePrePushFixture();
    const affectedRequests: NxAffectedRequest[] = [];
    const changedPath =
      ".habitat/global/workspace/blueprints/project-boundary-model/boundary/check/enforce_workspace_import_boundaries/rule.json";

    const result = await runPrePushHookServiceInTest(
      { base: "HEAD~1" },
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

  test("uses owning rule targets for mixed rule artifact pre-push changes", async () => {
    const fake = makePrePushFixture();
    const affectedRequests: NxAffectedRequest[] = [];
    const changedPaths = [
      ".habitat/civ7/mapgen/pipeline/blueprints/recipe/execution/check/require_runtime_domain_op_bundle_imports/rule.json",
      ".habitat/global/workspace/blueprints/project-boundary-model/boundary/check/enforce_workspace_import_boundaries/rule.json",
    ];

    const result = await runPrePushHookServiceInTest(
      { base: "HEAD~1" },
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
    const changedPath = "tools/habitat/src/nx-plugin.ts";

    const result = await runPrePushHookServiceInTest(
      { base: "HEAD~1" },
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
    expect(result.stdout).toContain("habitat hook pre-push: repo Nx target habitat:check");
    expect(result.stdout).toContain("target ok");
    expect(result.stdout).toContain("habitat hook pre-push: no repo Nx affected targets selected");
    expect(runTargetRequests).toEqual([{ project: "habitat", target: "check" }]);
    expect(affectedRequests).toEqual([]);
  });

  test("uses Toolkit lint target for boundary taxonomy tooling changes", async () => {
    const fake = makePrePushFixture();
    const affectedRequests: NxAffectedRequest[] = [];
    const runTargetRequests: NxRunTargetRequest[] = [];
    const changedPath =
      "tools/habitat/src/service/model/graph/policy/validate_boundary_taxonomy_against_workspace_graph.policy.ts";

    const result = await runPrePushHookServiceInTest(
      { base: "HEAD~1" },
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
    expect(runTargetRequests).toEqual([{ project: "habitat", target: "check" }]);
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
    const changedPath = "tools/habitat/package.json";

    const result = await runPrePushHookServiceInTest(
      { base: "HEAD~1" },
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
    expect(runTargetRequests).toEqual([{ project: "habitat", target: "check" }]);
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
    useStructuralCheckPolicy({
      createReport: (options = {}) =>
        Effect.succeed(fileLayerPassingCheckReport(options.command?.serialized ?? "habitat check")),
    });

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const biome = yield* BiomeProvider;
        const git = yield* GitProvider;
        const graphite = yield* GraphiteProvider;
        const nx = yield* NxProvider;
        const preCommitHook = hookRouter.preCommit.callable({
          context: {
            deps: makeTestHabitatServiceDeps({
              biome,
              git,
              graphite,
              nx,
              platform: {
                ...makeTestHabitatServiceDeps().platform,
                hashFile: fake.hashFile,
                pathExists: fake.pathExists,
                repoRoot,
              },
            }),
          },
        });
        return yield* withFiberContext(() => preCommitHook({}));
      }).pipe(
        Effect.provide(
          Layer.mergeAll(
            prePushGitLayer(makePrePushFixture()),
            nxLayer(),
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
    expect(result.stdout).toContain('"command": "habitat check --staged --runner habitat --json"');
    expect(result.stdout).toContain('"ruleId": "prohibit_pnpm_artifacts_in_bun_workspace"');
    expect(result.stdout).toContain("biome: no staged supported files\n");
    expect(result.stdout).toContain(
      "source checks: no staged TypeScript/JavaScript files in approved source-check roots\n"
    );
    expect(result.stdout).toContain("habitat hook pre-commit: PASS\n");
    expect(fake.calls).toEqual([]);
  });

  test("routes pre-commit Biome execution through the Biome provider", async () => {
    const stagedPath = "tools/habitat/src/service/modules/hook/router.ts";
    const fake = makePreCommitFixture({
      stagedPaths: [stagedPath],
      fileHashes: { [stagedPath]: ["before-format", "after-format"] },
    });
    const biomeRequests: BiomeCommandRequest[] = [];

    const result = await runPreCommitHookServiceInTest(
      {},
      { hashFile: fake.hashFile, pathExists: fake.pathExists },
      preCommitGitLayer(fake),
      undefined,
      {
        createReport: (options = {}) =>
          Effect.succeed(passingCheckReport(options.command?.serialized ?? "habitat check")),
      },
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

function defaultStructuralCheckPolicy(): StructuralCheckPolicy {
  return {
    createReport: (options = {}) =>
      Effect.succeed(passingCheckReport(options.command?.serialized ?? "habitat check")),
  };
}

function useStructuralCheckPolicy(policy: StructuralCheckPolicy) {
  mockCreateCheckReportEffect.mockImplementation(policy.createReport);
}

function runPrePushHookServiceInTest(
  input: HookPrePushInput = {},
  options: {
    readonly hashFile?: (targetPath: string) => string | null;
    readonly pathExists?: (targetPath: string) => boolean;
    readonly reporterEvents?: HabitatReportEvent[];
    readonly resourcePolicy?: HookResourcePolicy;
    readonly sourceCheckHookEnabled?: boolean;
  } = {},
  gitLayer = makeFakeGitProviderLayer((argv, options) => commandResult(argv, options.cwd, "")),
  nx = nxLayer(),
  structuralCheck?: StructuralCheckPolicy,
  biome = biomeLayer(),
  graphite = makeFakeGraphiteProviderLayer(() => null)
) {
  if (structuralCheck) useStructuralCheckPolicy(structuralCheck);
  const layer = Layer.mergeAll(gitLayer, nx, biome, graphite);
  return Effect.runPromise(
    Effect.gen(function* () {
      const context = yield* hookServiceContext(options);
      const prePushHook = hookRouter.prePush.callable({ context });
      return yield* withFiberContext(() => prePushHook(input));
    }).pipe(Effect.provide(layer))
  );
}

function runPreCommitHookServiceInTest(
  input: HookPreCommitInput = {},
  options: {
    readonly hashFile?: (targetPath: string) => string | null;
    readonly pathExists?: (targetPath: string) => boolean;
    readonly reporterEvents?: HabitatReportEvent[];
    readonly resourcePolicy?: HookResourcePolicy;
    readonly sourceCheckHookEnabled?: boolean;
  } = {},
  gitLayer = makeFakeGitProviderLayer((argv, options) => commandResult(argv, options.cwd, "")),
  nx = nxLayer(),
  structuralCheck?: StructuralCheckPolicy,
  biome = biomeLayer(),
  graphite = makeFakeGraphiteProviderLayer(() => null)
) {
  if (structuralCheck) useStructuralCheckPolicy(structuralCheck);
  const layer = Layer.mergeAll(gitLayer, nx, biome, graphite);
  return Effect.runPromise(
    Effect.gen(function* () {
      const context = yield* hookServiceContext(options);
      const preCommitHook = hookRouter.preCommit.callable({ context });
      return yield* withFiberContext(() =>
        preCommitHook({
          ...input,
          ...(options.resourcePolicy ? { resourcePolicy: options.resourcePolicy } : {}),
        })
      );
    }).pipe(Effect.provide(layer))
  );
}

function hookServiceContext(options: {
  readonly hashFile?: (targetPath: string) => string | null;
  readonly pathExists?: (targetPath: string) => boolean;
  readonly reporterEvents?: HabitatReportEvent[];
  readonly sourceCheckHookEnabled?: boolean;
}) {
  return Effect.gen(function* () {
    const biome = yield* BiomeProvider;
    const git = yield* GitProvider;
    const graphite = yield* GraphiteProvider;
    const nx = yield* NxProvider;
    return {
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
          ...(options.sourceCheckHookEnabled ? { rules: makeSyntheticSourceCheckHookRules() } : {}),
        }),
      },
    };
  });
}

function makeSyntheticSourceCheckHookRules() {
  const rules = makeTestRuleFacts();
  return {
    ...rules,
    source: [
      {
        id: "hook-source-check-probe",
        lane: "enforced" as const,
        message: "source-check hook check probe",
        patternName: "hook-source-check-probe",
        pathCoverage: [
          {
            kind: "exact-path" as const,
            patterns: ["packages/example/src/**", "packages/sdk/src/**"],
          },
        ],
        scanRoots: ["packages/example/src", "packages/sdk/src"],
      },
    ],
    hookCheck: [{ id: "hook-source-check-probe", hookCheck: true as const }],
  };
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
  return process.cwd().replace(/\/tools\/cli$/, "");
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
        ruleId: "prohibit_pnpm_artifacts_in_bun_workspace",
        runner: "habitat",
        lane: "enforced",
        status: "pass",
        locked: true,
        durationMs: 1,
        diagnostics: [],
        message: "File-layer pnpm artifacts are controlled by package manager commands.",
        remediate: null,
      },
    ],
  };
}
