import {
  createHookTrace,
  type HookReportEvent,
  type HookRuntime,
} from "@internal/habitat-harness/core/domains/hook-runtime/runtime";
import {
  type CheckOptions,
  type CheckReport,
  makeFakeStructuralCheckLayer,
} from "@internal/habitat-harness/core/domains/structural-check/index";
import { createHabitatServiceClient } from "@internal/habitat-harness/service/client";
import { runHookService } from "@internal/habitat-harness/service/modules/hook/router";
import { repoRoot } from "@internal/habitat-harness/substrate/lib/paths";
import {
  type BiomeCommandRequest,
  biomeArgv,
  makeFakeBiomeProviderLayer,
} from "@internal/habitat-harness/substrate/providers/biome/index";
import {
  captureOutput,
  makeHabitatCommandResult,
} from "@internal/habitat-harness/substrate/providers/command/index";
import type { HabitatCommandResult } from "@internal/habitat-harness/substrate/providers/command/types";
import { makeFakeGitProviderLayer } from "@internal/habitat-harness/substrate/providers/git/index";
import {
  affectedArgv,
  makeFakeNxProviderLayer,
  type NxAffectedRequest,
  type NxRunTargetRequest,
  runTargetArgv,
} from "@internal/habitat-harness/substrate/providers/nx/index";
import { Effect, Layer } from "effect";
import { describe, expect, test } from "vitest";

const prePushAffectedTargets = "check,validate:boundary-taxonomy,validate:grit-patterns";
const prePushSourceArtifactTargets = "source:check";
const prePushNonSourceRuleArtifactTargets = "habitat:rule:import-boundaries";
const prePushMixedRuleArtifactTargets = "source:check,habitat:rule:import-boundaries";
const prePushBoundaryTaxonomyTargets = "validate:boundary-taxonomy";
const prePushStructuralTargetDeclarationTargets =
  "validate:boundary-taxonomy,validate:grit-patterns";
const prePushNoChangedSourceCheck =
  "source checks: no changed TypeScript/JavaScript/docs files in hook source-check roots\n";

describe("Habitat hook service", () => {
  test("runs owned hook orchestration from service input", async () => {
    const fake = makePrePushRuntime();

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "HEAD~1" },
      { runtime: fake.runtime }
    );

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

  test("preserves empty base as hook runtime input", async () => {
    const fake = makePrePushRuntime({ graphiteParent: "agent-parent" });

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "" },
      { runtime: fake.runtime }
    );

    expect(result.stdout).toContain("base=agent-parent");
    expect(fake.calls).toEqual(["gt branch info --no-interactive"]);
  });

  test("resolves pre-push merge-base through GitProvider when Graphite parent is absent", async () => {
    const fake = makePrePushRuntime();
    const gitCalls: string[] = [];

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "" },
      { runtime: fake.runtime },
      makeFakeGitProviderLayer((argv, options) => {
        gitCalls.push(argv.join(" "));
        const stdout =
          argv[0] === "symbolic-ref"
            ? "origin/main\n"
            : argv[0] === "merge-base"
              ? "abc123mergebase\n"
              : "";
        return commandResult(argv, options.cwd, stdout);
      })
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
    const fake = makePrePushRuntime();
    const gitCalls: string[] = [];

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "" },
      { runtime: fake.runtime },
      makeFakeGitProviderLayer((argv, options) => {
        gitCalls.push(argv.join(" "));
        return commandResult(argv, options.cwd, "", 1);
      })
    );

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("could not resolve an affected base");
    expect(fake.calls).toEqual(["gt branch info --no-interactive"]);
    expect(gitCalls).toEqual(["symbolic-ref --quiet --short refs/remotes/origin/HEAD"]);
  });

  test("propagates Nx affected failures with base provenance", async () => {
    const fake = makePrePushRuntime({ graphiteParent: "agent-HR-parent" });

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "" },
      { runtime: fake.runtime },
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
      )
    );

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("habitat hook pre-push: repo Nx affected base=agent-HR-parent");
    expect(result.stdout).toContain(prePushNoChangedSourceCheck);
    expect(result.stdout).toContain("affected failed");
    expect(result.stderr).toContain("target failed");
  });

  test("records pre-push base and affected provenance through providers", async () => {
    const trace = createHookTrace();
    const fake = makePrePushRuntime({ graphiteParent: "agent-HR-parent" });

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "" },
      { runtime: { ...fake.runtime, trace } }
    );

    expect(result.exitCode).toBe(0);
    expect(trace.prePush).toMatchObject({
      base: "agent-HR-parent",
      baseSource: "graphite-parent",
      outcome: "pass",
      exitCode: 0,
      preState: {
        branch: "agent-HR-test",
        head: "abc123head",
        resourceState: "not-configured",
      },
      postState: {
        branch: "agent-HR-test",
        head: "abc123head",
        resourceState: "not-configured",
      },
    });
    expect(trace.commands.find((command) => command.phase === "pre-push-base")).toMatchObject({
      argv: ["gt", "branch", "info", "--no-interactive"],
      cwd: repoRoot,
      env: undefined,
      exitCode: 0,
    });
    expect(trace.commands.find((command) => command.phase === "pre-push-affected")).toMatchObject({
      argv: [
        "nx",
        "affected",
        "-t",
        prePushAffectedTargets,
        "--base",
        "agent-HR-parent",
        "--head",
        "HEAD",
        "--outputStyle=static",
        "--excludeTaskDependencies",
      ],
      cwd: repoRoot,
      env: undefined,
      exitCode: 0,
    });
  });

  test("reports pre-push output through an injected reporter service", async () => {
    const events: HookReportEvent[] = [];
    const fake = makePrePushRuntime({ graphiteParent: "agent-HR-parent" });

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "" },
      {
        runtime: {
          ...fake.runtime,
          reporter: { write: (event) => events.push(event) },
        },
      },
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
      )
    );

    expect(result.exitCode).toBe(1);
    expect(renderReported(events, "stdout")).toBe(result.stdout);
    expect(renderReported(events, "stderr")).toBe(result.stderr);
    expect(events).toContainEqual({
      channel: "stdout",
      text: "hook result: workstation check only; CI remains authoritative.\n",
    });
    expect(events).toContainEqual({
      channel: "stdout",
      text: prePushNoChangedSourceCheck,
    });
    expect(events).toContainEqual({
      channel: "stderr",
      text: "target failed\n",
    });
  });

  test("runs pre-push through provider-backed service execution", async () => {
    const fake = makePrePushRuntime();

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "HEAD~1" },
      { runtime: fake.runtime }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("base=HEAD~1");
    expect(fake.calls).toEqual([]);
  });

  test("runs pre-push source checks over changed hook source paths", async () => {
    const fake = makePrePushRuntime();
    const checkRequests: CheckOptions[] = [];
    const changedPath = "tools/habitat-harness/src/adapters/grit/runner.ts";

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "HEAD~1" },
      { runtime: fake.runtime },
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
    const fake = makePrePushRuntime();
    const affectedRequests: NxAffectedRequest[] = [];
    const changedPath = ".habitat/rules/rng-authority-static/rule.json";

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "HEAD~1" },
      { runtime: fake.runtime },
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
    const fake = makePrePushRuntime();
    const affectedRequests: NxAffectedRequest[] = [];
    const changedPath = ".habitat/rules/import-boundaries/rule.json";

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "HEAD~1" },
      { runtime: fake.runtime },
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
    const fake = makePrePushRuntime();
    const affectedRequests: NxAffectedRequest[] = [];
    const changedPaths = [
      ".habitat/rules/rng-authority-static/rule.json",
      ".habitat/rules/import-boundaries/rule.json",
    ];

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "HEAD~1" },
      { runtime: fake.runtime },
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
    const fake = makePrePushRuntime();
    const affectedRequests: NxAffectedRequest[] = [];
    const runTargetRequests: NxRunTargetRequest[] = [];
    const changedPath = "tools/habitat-harness/src/core/domains/source-check/source-rules.ts";

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "HEAD~1" },
      { runtime: fake.runtime },
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
    const fake = makePrePushRuntime();
    const affectedRequests: NxAffectedRequest[] = [];
    const runTargetRequests: NxRunTargetRequest[] = [];
    const changedPath = "tools/habitat-harness/src/substrate/lib/boundary-taxonomy.ts";

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "HEAD~1" },
      { runtime: fake.runtime },
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
    const fake = makePrePushRuntime();
    const affectedRequests: NxAffectedRequest[] = [];
    const runTargetRequests: NxRunTargetRequest[] = [];
    const changedPath = "tools/habitat-harness/package.json";

    const result = await runHookServiceInTest(
      { name: "pre-push", base: "HEAD~1" },
      { runtime: fake.runtime },
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

  test("runs pre-commit through the in-process Habitat service client", async () => {
    const fake = makePreCommitRuntime();

    const result = await createHabitatServiceClient({
      hook: { runtime: fake.runtime },
    }).hook.run({ name: "pre-commit" });

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
    expect(fake.calls).toEqual(["git diff --cached --name-status -z"]);
  });

  test("routes pre-commit Biome execution through the Biome provider", async () => {
    const trace = createHookTrace();
    const stagedPath = "tools/habitat-harness/src/service/modules/hook/router.ts";
    const fake = makePreCommitRuntime({
      stagedPaths: [stagedPath],
      fileHashes: { [stagedPath]: ["before-format", "after-format"] },
    });
    const biomeRequests: BiomeCommandRequest[] = [];

    const result = await runHookServiceInTest(
      { name: "pre-commit" },
      { runtime: { ...fake.runtime, trace } },
      undefined,
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
    expect(trace.commands.map((command) => command.phase)).toEqual(
      expect.arrayContaining(["biome-format", "formatter-restage", "biome-check"])
    );
  });
});

function runHookServiceInTest(
  input: Parameters<typeof runHookService>[0],
  options: Parameters<typeof runHookService>[1] = {},
  gitLayer = makeFakeGitProviderLayer((argv, options) => commandResult(argv, options.cwd, "")),
  nx = nxLayer(),
  structuralCheck?: ReturnType<typeof makeFakeStructuralCheckLayer>,
  biome = biomeLayer()
) {
  const layer = structuralCheck
    ? Layer.mergeAll(gitLayer, nx, structuralCheck, biome)
    : Layer.mergeAll(gitLayer, nx, biome);
  return Effect.runPromise(runHookService(input, options).pipe(Effect.provide(layer)));
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

function makePrePushRuntime(options: { graphiteParent?: string } = {}): {
  runtime: HookRuntime;
  calls: string[];
} {
  const calls: string[] = [];
  return {
    calls,
    runtime: {
      runCommand: (argv) => {
        const call = argv.join(" ");
        calls.push(call);
        if (call === "gt branch info --no-interactive") {
          return options.graphiteParent
            ? { exitCode: 0, stdout: `Parent: ${options.graphiteParent}\n`, stderr: "" }
            : { exitCode: 1, stdout: "", stderr: "no graphite parent\n" };
        }
        if (call === "git branch --show-current") {
          return { exitCode: 0, stdout: "agent-HR-test\n", stderr: "" };
        }
        if (call === "git rev-parse HEAD") {
          return { exitCode: 0, stdout: "abc123head\n", stderr: "" };
        }
        if (call === "git diff --cached --name-only -z" || call === "git diff --name-only -z") {
          return { exitCode: 0, stdout: "", stderr: "" };
        }
        throw new Error(`Unexpected hook service test command: ${call}`);
      },
      nowMs: () => 1_000,
    },
  };
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

function makePreCommitRuntime(
  options: {
    stagedPaths?: string[];
    unstagedPaths?: string[];
    fileHashes?: Record<string, string[]>;
  } = {}
): {
  runtime: HookRuntime;
  calls: string[];
} {
  const calls: string[] = [];
  const hashReads = new Map<string, number>();
  return {
    calls,
    runtime: {
      runCommand: (argv) => {
        const call = argv.join(" ");
        calls.push(call);
        if (call === "git branch --show-current") {
          return { exitCode: 0, stdout: "agent-HR-test\n", stderr: "" };
        }
        if (call === "git rev-parse HEAD") {
          return { exitCode: 0, stdout: "abc123head\n", stderr: "" };
        }
        if (call === "git diff --name-only -z") {
          return { exitCode: 0, stdout: "", stderr: "" };
        }
        if (call === "git diff --cached --name-only -z") {
          return { exitCode: 0, stdout: renderPathList(options.stagedPaths ?? []), stderr: "" };
        }
        if (call === "git diff --cached --name-status -z") {
          return { exitCode: 0, stdout: renderNameStatus(options.stagedPaths ?? []), stderr: "" };
        }
        if (call.startsWith("git diff --name-only -z --")) {
          return { exitCode: 0, stdout: renderPathList(options.unstagedPaths ?? []), stderr: "" };
        }
        if (call.startsWith("git add --")) {
          return { exitCode: 0, stdout: "", stderr: "" };
        }
        throw new Error(`Unexpected hook pre-commit service test command: ${call}`);
      },
      pathExists: (target) =>
        (options.stagedPaths ?? []).some((candidate) => target.endsWith(candidate)),
      fileHash: (repoRelativePath) => {
        const sequence = options.fileHashes?.[repoRelativePath];
        if (!sequence) return `stable:${repoRelativePath}`;
        const readCount = hashReads.get(repoRelativePath) ?? 0;
        hashReads.set(repoRelativePath, readCount + 1);
        return sequence[Math.min(readCount, sequence.length - 1)] ?? null;
      },
      nowMs: () => 1_000,
    },
  };
}

function renderNameStatus(paths: string[]): string {
  return paths.map((target) => `A\0${target}\0`).join("");
}

function renderPathList(paths: string[]): string {
  return paths.length === 0 ? "" : `${paths.join("\0")}\0`;
}

function renderReported(events: HookReportEvent[], channel: HookReportEvent["channel"]): string {
  return events
    .filter((event) => event.channel === channel)
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
