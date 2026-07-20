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
  type NxRunManyRequest,
  runManyArgv,
} from "@habitat/cli/providers/nx/index";
import { captureOutput, makeHabitatCommandResult } from "@habitat/cli/resources/command/index";
import type { HabitatCommandResult } from "@habitat/cli/resources/command/types";
import { repoRoot } from "@habitat/cli/resources/paths";
import type { HabitatReportEvent } from "@habitat/cli/resources/reporter/index";
import type { CheckOptions, CheckReport } from "@habitat/cli/service/model/check/index";
import type { createCheckReportEffect } from "@habitat/cli/service/model/check/policy/structural/index";
import type { RuleFactsCatalog } from "@habitat/cli/service/model/rules/index";
import type {
  HookPreCommitInput,
  HookPrePushInput,
} from "@habitat/cli/service/modules/hook/contract";
import type { HookResourcePolicy } from "@habitat/cli/service/modules/hook/model/policy/runtime.policy";
import { hookRouter } from "@habitat/cli/service/modules/hook/router";
import { Effect, Layer, Match, Option } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { makeTestHabitatServiceDeps, makeTestRuleFacts } from "../support/habitat-service-deps";

type StructuralCheckPolicy = {
  readonly createReport: typeof createCheckReportEffect;
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

const prePushExpected = {
  affectedTargets: ["check"],
  gritRuleAuthorityTargets: ["habitat:rule:require_runtime_domain_op_bundle_imports"],
  noChangedSourceCheck:
    "source checks: no changed TypeScript/JavaScript files in hook source-check roots\n",
} as const;

describe("Habitat hook service", () => {
  beforeEach(() => {
    mockCreateCheckReportEffect.mockReset();
    installStructuralCheckPolicy(defaultStructuralCheckPolicy());
  });

  test("runs owned hook orchestration from service input", async () => {
    const fake = makePrePushFixture();

    const result = await runPrePushHookServiceInTest({ base: "HEAD~1" });

    expect(result).toEqual({
      exitCode: 0,
      stdout: `hook result: workstation check only; CI remains authoritative.\n${prePushExpected.noChangedSourceCheck}habitat hook pre-push: repo Nx affected base=HEAD~1\naffected ok\n`,
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
          new Map([
            ["symbolic-ref", "origin/main\n"],
            ["merge-base", "abc123mergebase\n"],
          ]).get(argv[0] ?? "") ?? "";
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
      nxLayer({
        affected: () =>
          commandResult(
            affectedArgv({
              base: "agent-HR-parent",
              targets: prePushExpected.affectedTargets,
              head: "HEAD",
            }),
            repoRootForTestCommand(),
            "affected failed\n",
            1,
            "target failed\n",
            "nx"
          ),
      }),
      undefined,
      undefined,
      graphiteLayer(fake)
    );

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("habitat hook pre-push: repo Nx affected base=agent-HR-parent");
    expect(result.stdout).toContain(prePushExpected.noChangedSourceCheck);
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
      nxLayer({
        affected: () =>
          commandResult(
            affectedArgv({
              base: "agent-HR-parent",
              targets: prePushExpected.affectedTargets,
              head: "HEAD",
            }),
            repoRootForTestCommand(),
            "affected failed\n",
            1,
            "target failed\n",
            "nx"
          ),
      }),
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
      text: prePushExpected.noChangedSourceCheck,
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
    const checkRequests: CheckOptions[] = [];
    const changedPaths = ["packages/sdk/src/index.ts"] as const;

    const result = await runPrePushHookServiceInTest(
      { base: "HEAD~1" },
      {
        sourceCheckHookEnabled: true,
        pathExists: (targetPath) => changedPaths.some((path) => targetPath.endsWith(path)),
      },
      makeFakeGitProviderLayer((argv, options) => {
        const stdout = stdoutForCommand(
          argv,
          "diff --name-only -z HEAD~1 HEAD",
          renderPathList([...changedPaths])
        );
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
        stagedPaths: changedPaths,
      }),
    ]);
    const affectedRequests: NxAffectedRequest[] = [];
    const notApplicableResult = await runPrePushHookServiceInTest(
      { base: "HEAD~1" },
      {
        sourceCheckHookEnabled: true,
        pathExists: (targetPath) => changedPaths.some((path) => targetPath.endsWith(path)),
      },
      makeFakeGitProviderLayer((argv, options) => {
        const stdout = stdoutForCommand(
          argv,
          "diff --name-only -z HEAD~1 HEAD",
          renderPathList([...changedPaths])
        );
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
      }),
      {
        createReport: (options = {}) =>
          Effect.succeed(notApplicableCheckReport(options.command?.serialized ?? "habitat check")),
      }
    );

    expect(notApplicableResult.exitCode).toBe(0);
    expect(notApplicableResult.stdout).toContain("[source-check changed-path hook check]");
    expect(notApplicableResult.stdout).toContain("affected ok");
    expect(affectedRequests).toHaveLength(1);
  });

  test("excludes deleted paths from pre-push diagnostics without dropping affected planning", async () => {
    const checkRequests: CheckOptions[] = [];
    const affectedRequests: NxAffectedRequest[] = [];

    const result = await runPrePushHookServiceInTest(
      { base: "HEAD~1" },
      { sourceCheckHookEnabled: true, pathExists: () => false },
      makeFakeGitProviderLayer((argv, options) => {
        const stdout = stdoutForCommand(
          argv,
          "diff --name-only -z HEAD~1 HEAD",
          renderPathList(["packages/sdk/src/deleted.ts"])
        );
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
      }),
      {
        createReport: (options = {}) =>
          Effect.sync(() => {
            checkRequests.push(options);
            return passingCheckReport(options.command?.serialized ?? "habitat check");
          }),
      }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(prePushExpected.noChangedSourceCheck.trim());
    expect(checkRequests).toEqual([]);
    expect(affectedRequests).toHaveLength(1);
  });

  test("uses the owning Grit rule target for migrated source rule authority-file pre-push changes", async () => {
    const affectedRequests: NxAffectedRequest[] = [];
    const runManyRequests: NxRunManyRequest[] = [];
    const changedPaths = [
      ".habitat/blueprints/recipe/require_runtime_domain_op_bundle_imports/rule.json",
    ] as const;

    const result = await runPrePushHookServiceInTest(
      { base: "HEAD~1" },
      {},
      makeFakeGitProviderLayer((argv, options) => {
        const stdout = stdoutForCommand(
          argv,
          "diff --name-only -z HEAD~1 HEAD",
          renderPathList([...changedPaths])
        );
        return commandResult(argv, options.cwd, stdout);
      }),
      trackingNxLayer(affectedRequests, runManyRequests)
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("habitat hook pre-push: repo Nx policy graph");
    expect(runManyRequests).toEqual([{ targets: prePushExpected.gritRuleAuthorityTargets }]);
    expect(affectedRequests).toEqual([]);
  });

  test("runs the generated rule alias for graph-backed rule authority changes", async () => {
    const affectedRequests: NxAffectedRequest[] = [];
    const runManyRequests: NxRunManyRequest[] = [];
    const changedPaths = [
      ".habitat/global/workspace/_blueprints/project-boundary-model/enforce_workspace_import_boundaries/rule.json",
    ] as const;

    const result = await runPrePushHookServiceInTest(
      { base: "HEAD~1" },
      {},
      makeFakeGitProviderLayer((argv, options) => {
        const stdout = stdoutForCommand(
          argv,
          "diff --name-only -z HEAD~1 HEAD",
          renderPathList([...changedPaths])
        );
        return commandResult(argv, options.cwd, stdout);
      }),
      trackingNxLayer(affectedRequests, runManyRequests)
    );

    expect(result.exitCode).toBe(0);
    expect(runManyRequests).toEqual([
      { targets: ["habitat:rule:enforce_workspace_import_boundaries"] },
    ]);
    expect(affectedRequests).toEqual([]);
  });

  test("uses owning rule targets for mixed rule authority-file pre-push changes", async () => {
    const affectedRequests: NxAffectedRequest[] = [];
    const runManyRequests: NxRunManyRequest[] = [];
    const changedPaths = [
      ".habitat/blueprints/recipe/require_runtime_domain_op_bundle_imports/rule.json",
      ".habitat/global/workspace/_blueprints/project-boundary-model/enforce_workspace_import_boundaries/rule.json",
    ];

    const result = await runPrePushHookServiceInTest(
      { base: "HEAD~1" },
      {},
      makeFakeGitProviderLayer((argv, options) => {
        const stdout = stdoutForCommand(
          argv,
          "diff --name-only -z HEAD~1 HEAD",
          renderPathList(changedPaths)
        );
        return commandResult(argv, options.cwd, stdout);
      }),
      trackingNxLayer(affectedRequests, runManyRequests)
    );

    expect(result.exitCode).toBe(0);
    expect(runManyRequests).toEqual([
      {
        targets: [
          "habitat:rule:enforce_workspace_import_boundaries",
          ...prePushExpected.gritRuleAuthorityTargets,
        ],
      },
    ]);
    expect(affectedRequests).toEqual([]);
  });

  test("runs the generated formatting rule alias when its authority changes", async () => {
    const affectedRequests: NxAffectedRequest[] = [];
    const runManyRequests: NxRunManyRequest[] = [];
    const changedPaths = [
      ".habitat/global/workspace/rules/enforce_formatting_and_import_hygiene/rule.json",
    ] as const;

    const result = await runPrePushHookServiceInTest(
      { base: "HEAD~1" },
      {},
      makeFakeGitProviderLayer((argv, options) => {
        const stdout = stdoutForCommand(
          argv,
          "diff --name-only -z HEAD~1 HEAD",
          renderPathList([...changedPaths])
        );
        return commandResult(argv, options.cwd, stdout);
      }),
      trackingNxLayer(affectedRequests, runManyRequests)
    );

    expect(result.exitCode).toBe(0);
    expect(runManyRequests).toEqual([
      { targets: ["habitat:rule:enforce_formatting_and_import_hygiene"] },
    ]);
    expect(affectedRequests).toEqual([]);
  });

  test("runs the policy graph for unclassified Habitat authority changes", async () => {
    const affectedRequests: NxAffectedRequest[] = [];
    const runManyRequests: NxRunManyRequest[] = [];
    const changedPaths = [".habitat/index.json"] as const;

    const result = await runPrePushHookServiceInTest(
      { base: "HEAD~1" },
      {},
      makeFakeGitProviderLayer((argv, options) => {
        const stdout = stdoutForCommand(
          argv,
          "diff --name-only -z HEAD~1 HEAD",
          renderPathList([...changedPaths])
        );
        return commandResult(argv, options.cwd, stdout);
      }),
      trackingNxLayer(affectedRequests, runManyRequests)
    );

    expect(result.exitCode).toBe(0);
    expect(runManyRequests).toEqual([{ targets: ["check:policy"] }]);
    expect(affectedRequests).toEqual([]);
  });

  test.each([
    "tools/habitat/src/nx-plugin.ts",
    "tools/habitat/src/service/model/graph/policy/validate_boundary_taxonomy_against_workspace_graph.policy.ts",
    "tools/habitat/package.json",
  ])("uses one dependency-complete affected check graph for ordinary change %s", async (changedPath) => {
    const affectedRequests: NxAffectedRequest[] = [];
    const runManyRequests: NxRunManyRequest[] = [];

    const result = await runPrePushHookServiceInTest(
      { base: "HEAD~1" },
      {},
      makeFakeGitProviderLayer((argv, options) => {
        const stdout = stdoutForCommand(
          argv,
          "diff --name-only -z HEAD~1 HEAD",
          renderPathList([changedPath])
        );
        return commandResult(argv, options.cwd, stdout);
      }),
      trackingNxLayer(affectedRequests, runManyRequests)
    );

    expect(result.exitCode).toBe(0);
    expect(affectedRequests).toEqual([
      {
        base: "HEAD~1",
        targets: ["check"],
        head: "HEAD",
      },
    ]);
    expect(runManyRequests).toEqual([]);
  });

  test("runs pre-commit through the in-process Habitat service router", async () => {
    const fake = makePreCommitFixture();
    installStructuralCheckPolicy({
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
    expect(result.stdout).toContain('"ruleId": "prohibit_pnpm_files_in_bun_workspace"');
    expect(result.stdout).toContain("biome: no staged supported files\n");
    expect(result.stdout).toContain(
      "source checks: no staged TypeScript/JavaScript files in approved source-check roots\n"
    );
    expect(result.stdout).toContain("habitat hook pre-commit: PASS\n");
    expect(fake.calls).toEqual([]);
  });

  test("routes pre-commit Biome execution through the Biome provider", async () => {
    const stagedPaths = ["tools/habitat/src/service/modules/hook/router.ts"] as const;
    const fake = makePreCommitFixture({
      stagedPaths: [...stagedPaths],
      fileHashes: { [stagedPaths[0]]: ["before-format", "after-format"] },
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
    expect(fake.calls).toContain(`git add -- ${stagedPaths[0]}`);
    expect(biomeRequests).toEqual([
      {
        kind: "format",
        write: true,
        noErrorsOnUnmatched: true,
        paths: stagedPaths,
      },
      {
        kind: "check",
        noErrorsOnUnmatched: true,
        paths: stagedPaths,
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

function installStructuralCheckPolicy(policy: StructuralCheckPolicy) {
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
  Option.match(Option.fromNullable(structuralCheck), {
    onNone: () => undefined,
    onSome: installStructuralCheckPolicy,
  });
  const layer = Layer.mergeAll(gitLayer, nx, biome, graphite);
  const program = Effect.gen(function* () {
    const services = yield* Effect.all({
      biome: BiomeProvider,
      git: GitProvider,
      graphite: GraphiteProvider,
      nx: NxProvider,
    });
    const context = makeHookServiceContext(options, services);
    const prePushHook = hookRouter.prePush.callable({ context });
    return yield* withFiberContext(() => prePushHook(input));
  });
  const provided = program.pipe(Effect.provide(layer));
  return Effect.runPromise(provided);
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
  Option.match(Option.fromNullable(structuralCheck), {
    onNone: () => undefined,
    onSome: installStructuralCheckPolicy,
  });
  const layer = Layer.mergeAll(gitLayer, nx, biome, graphite);
  const program = Effect.gen(function* () {
    const services = yield* Effect.all({
      biome: BiomeProvider,
      git: GitProvider,
      graphite: GraphiteProvider,
      nx: NxProvider,
    });
    const context = makeHookServiceContext(options, services);
    const preCommitHook = hookRouter.preCommit.callable({ context });
    const resourcePolicy = Option.match(Option.fromNullable(options.resourcePolicy), {
      onNone: () => ({}),
      onSome: (value) => ({ resourcePolicy: value }),
    });
    return yield* withFiberContext(() => preCommitHook({ ...input, ...resourcePolicy }));
  });
  const provided = program.pipe(Effect.provide(layer));
  return Effect.runPromise(provided);
}

function makeHookServiceContext(
  options: {
    readonly hashFile?: (targetPath: string) => string | null;
    readonly pathExists?: (targetPath: string) => boolean;
    readonly reporterEvents?: HabitatReportEvent[];
    readonly sourceCheckHookEnabled?: boolean;
  },
  services: Pick<ReturnType<typeof makeTestHabitatServiceDeps>, "biome" | "git" | "graphite" | "nx">
) {
  const hashFile = Option.match(Option.fromNullable(options.hashFile), {
    onNone: () => ({}),
    onSome: (value) => ({ hashFile: value }),
  });
  const pathExists = Option.match(Option.fromNullable(options.pathExists), {
    onNone: () => ({}),
    onSome: (value) => ({ pathExists: value }),
  });
  const reporter = Option.match(Option.fromNullable(options.reporterEvents), {
    onNone: () => ({}),
    onSome: (events) => ({
      reporter: {
        emit: (event: HabitatReportEvent) =>
          Effect.sync(() => {
            events.push(event);
          }),
      },
    }),
  });
  const rules = Option.match(
    Option.liftPredicate(options.sourceCheckHookEnabled, (enabled) => enabled === true),
    {
      onNone: () => ({}),
      onSome: () => ({ rules: makeSyntheticSourceCheckHookRules() }),
    }
  );
  return {
    deps: makeTestHabitatServiceDeps({
      ...services,
      platform: {
        ...makeTestHabitatServiceDeps().platform,
        ...hashFile,
        ...pathExists,
        repoRoot,
      },
      ...reporter,
      ...rules,
    }),
  };
}

function makeSyntheticSourceCheckHookRules() {
  const rules = makeTestRuleFacts();
  return {
    ...rules,
    diagnostic: [
      {
        id: "hook-source-check-probe",
        lane: "enforced" as const,
        message: "source-check hook check probe",
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
  } satisfies RuleFactsCatalog;
}

function commandResult(
  argv: readonly string[],
  cwd: string,
  stdout: string,
  exitCode = 0,
  stderr = "",
  executable = "git"
): HabitatCommandResult {
  const kind = Match.value(executable).pipe(
    Match.when("git", () => "git-state" as const),
    Match.orElse(() => "workspace-tool" as const)
  );
  return makeHabitatCommandResult(
    {
      commandId: `${executable}-${argv.join("-")}`,
      kind,
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
    return Match.value(argv.join(" ")).pipe(
      Match.when("branch --show-current", () =>
        commandResult(argv, options.cwd, "agent-HR-test\n")
      ),
      Match.when("rev-parse HEAD", () => commandResult(argv, options.cwd, "abc123head\n")),
      Match.orElse(() => commandResult(argv, options.cwd, ""))
    );
  });
}

function nxLayer(handlers?: {
  affected?: (request: NxAffectedRequest) => HabitatCommandResult;
  runMany?: (request: NxRunManyRequest) => HabitatCommandResult;
}) {
  return makeFakeNxProviderLayer({
    affected: (request) =>
      handlers?.affected?.(request) ??
      commandResult(affectedArgv(request), repoRootForTestCommand(), "affected ok\n", 0, "", "nx"),
    runMany: (request) =>
      handlers?.runMany?.(request) ??
      commandResult(runManyArgv(request), repoRootForTestCommand(), "run-many ok\n", 0, "", "nx"),
  });
}

function trackingNxLayer(
  affectedRequests: NxAffectedRequest[],
  runManyRequests: NxRunManyRequest[]
) {
  return nxLayer({
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
    runMany: (request) => {
      runManyRequests.push(request);
      return commandResult(
        runManyArgv(request),
        repoRootForTestCommand(),
        "run-many ok\n",
        0,
        "",
        "nx"
      );
    },
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
    return Option.match(Option.fromNullable(options.fileHashes?.[repoRelativePath]), {
      onNone: () => `stable:${repoRelativePath}`,
      onSome: (sequence) => {
        const readCount = hashReads.get(repoRelativePath) ?? 0;
        hashReads.set(repoRelativePath, readCount + 1);
        return sequence[Math.min(readCount, sequence.length - 1)] ?? null;
      },
    });
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
  return Match.value(targetPath.startsWith(prefix)).pipe(
    Match.when(true, () => targetPath.slice(prefix.length)),
    Match.orElse(() => targetPath)
  );
}

function preCommitGitLayer(fake: ReturnType<typeof makePreCommitFixture>) {
  return makeFakeGitProviderLayer((argv, options) => {
    const call = ["git", ...argv].join(" ");
    fake.calls.push(call);
    return Match.value(call).pipe(
      Match.when("git branch --show-current", () =>
        commandResult(argv, options.cwd, "agent-HR-test\n")
      ),
      Match.when("git rev-parse HEAD", () => commandResult(argv, options.cwd, "abc123head\n")),
      Match.when("git diff --name-only -z", () => commandResult(argv, options.cwd, "")),
      Match.when("git diff --cached --name-only -z", () =>
        commandResult(argv, options.cwd, renderPathList(fake.options.stagedPaths ?? []))
      ),
      Match.when("git diff --cached --name-status -z", () =>
        commandResult(argv, options.cwd, renderNameStatus(fake.options.stagedPaths ?? []))
      ),
      Match.when(
        (command) => command.startsWith("git diff --name-only -z --"),
        () => commandResult(argv, options.cwd, renderPathList(fake.options.unstagedPaths ?? []))
      ),
      Match.when(
        (command) => command.startsWith("git add --"),
        () => commandResult(argv, options.cwd, "")
      ),
      Match.orElse((unexpected) => {
        throw new Error(`Unexpected hook pre-commit service test command: ${unexpected}`);
      })
    );
  });
}

function renderNameStatus(paths: readonly string[]): string {
  return paths.map((target) => `A\0${target}\0`).join("");
}

function renderPathList(paths: readonly string[]): string {
  return paths.map((target) => `${target}\0`).join("");
}

function stdoutForCommand(
  argv: readonly string[],
  expectedCommand: string,
  stdout: string
): string {
  return new Map([[expectedCommand, stdout]]).get(argv.join(" ")) ?? "";
}

function renderReported(
  events: HabitatReportEvent[],
  kind: Exclude<HabitatReportEvent["kind"], "trace">
): string {
  return events
    .filter(
      (event): event is Extract<HabitatReportEvent, { kind: typeof kind }> => event.kind === kind
    )
    .map((event) => event.text)
    .join("");
}

function passingCheckReport(command: string): CheckReport {
  return {
    schemaVersion: 2,
    command,
    startedAt: "2026-06-21T00:00:00.000Z",
    ok: true,
    rules: [],
  };
}

function fileLayerPassingCheckReport(command: string): CheckReport {
  return {
    schemaVersion: 2,
    command,
    startedAt: "2026-06-21T00:00:00.000Z",
    ok: true,
    rules: [
      {
        ruleId: "prohibit_pnpm_files_in_bun_workspace",
        runner: "habitat",
        lane: "enforced",
        status: "pass",
        locked: true,
        durationMs: 1,
        disposition: { kind: "executed" },
        diagnostics: [],
        message: "File-layer pnpm files are controlled by package manager commands.",
        remediate: null,
      },
    ],
  };
}

function notApplicableCheckReport(command: string): CheckReport {
  return {
    schemaVersion: 2,
    command,
    startedAt: "2026-06-21T00:00:00.000Z",
    ok: true,
    rules: [
      {
        ruleId: "not-applicable-rule",
        runner: "grit",
        lane: "enforced",
        status: "pass",
        locked: true,
        durationMs: 1,
        disposition: { kind: "not-applicable", reason: "no-matched-scan-roots" },
        diagnostics: [],
        message: "not applicable",
        remediate: null,
      },
    ],
  };
}
