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
import { makeFakeNxProviderLayer, NxProvider } from "@habitat/cli/providers/nx/index";
import {
  captureOutput,
  makeHabitatCommandResult,
  type SpawnResult,
} from "@habitat/cli/resources/command/index";
import type { HabitatCommandResult } from "@habitat/cli/resources/command/types";
import { repoRoot } from "@habitat/cli/resources/paths";
import type { HabitatReportEvent } from "@habitat/cli/resources/reporter/index";
import type { CheckOptions, CheckReport } from "@habitat/cli/service/model/check/index";
import {
  classifyResourcePreCommitDecisionEffect,
  classifyResourcesState,
} from "@habitat/cli/service/modules/hook/model/policy/resource-inspection.policy";
import type { HookResourcePolicy } from "@habitat/cli/service/modules/hook/model/policy/runtime.policy";
import { hookRouter } from "@habitat/cli/service/modules/hook/router";
import { Effect, Layer } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { describe, expect, test, vi } from "vitest";
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

describe("Habitat hook resource policy", () => {
  test("passes clean resources without invoking the publish script", async () => {
    const fake = makeFakeRuntime({ resourcePolicy: true });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("resources: clean");
    expect(result.stdout).toContain(
      "hook result: workstation check only; CI remains authoritative."
    );
    expect(result.stdout).toContain("habitat hook pre-commit: PASS");
    expect(fake.checkRequests.map((request) => request.runner)).toContain("habitat");
  });

  test("fails dirty resources before file-layer, Biome, Grit, or publish commands", async () => {
    const fake = makeFakeRuntime({ resourcePolicy: true, submoduleStatus: " M resources.xml\n" });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("resources: dirty-submodule");
    expect(result.stderr).toContain("resource publish");
    expect(result.stderr).toContain("resource status");
    expect(fake.checkRequests).toEqual([]);
    expect(fake.biomeRequests).toEqual([]);
    expect(fake.calls.some((call) => call.startsWith("grit "))).toBe(false);
  });

  test("fails uninitialized resources with init and status remediation", async () => {
    const fake = makeFakeRuntime({ resourcePolicy: true, resourcesRootExists: false });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("resources: uninitialized");
    expect(result.stderr).toContain("resource init");
    expect(result.stderr).toContain("resource status");
    expect(fake.checkRequests).toEqual([]);
  });

  test("fails a present resources directory that resolves to the monorepo Git root", async () => {
    const fake = makeFakeRuntime({ resourcePolicy: true, resourcesTopLevel: "/repo" });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("resources: uninitialized");
    expect(result.stderr).toContain("exists but is not an initialized resource Git worktree");
    expect(fake.checkRequests).toEqual([]);
  });

  test("fails locked resources with unlock and status remediation", async () => {
    const fake = makeFakeRuntime({ resourcePolicy: true, indexLockExists: true });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("resources: locked");
    expect(result.stderr).toContain("resource unlock");
    expect(result.stderr).toContain("resource status");
    expect(fake.checkRequests).toEqual([]);
  });

  test("fails an unstaged resources gitlink before file-layer checks", async () => {
    const fake = makeFakeRuntime({ resourcePolicy: true, unstagedGitlink: true });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("resources: unstaged-gitlink");
    expect(result.stderr).toContain("git add vendor/resources");
    expect(result.stderr).toContain("resource status");
    expect(fake.checkRequests).toEqual([]);
  });

  test("allows a staged clean resources gitlink as an explicit pointer update", async () => {
    const fake = makeFakeRuntime({ resourcePolicy: true, stagedGitlink: true });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("resources: staged-gitlink");
    expect(fake.checkRequests.map((request) => request.runner)).toContain("habitat");
  });

  test("prefers dirty-submodule refusal over staged-gitlink allowance", async () => {
    const fake = makeFakeRuntime({
      resourcePolicy: true,
      stagedGitlink: true,
      submoduleStatus: " M resources.xml\n",
    });

    const decision = await Effect.runPromise(
      Effect.gen(function* () {
        const git = yield* GitProvider;
        return yield* classifyResourcePreCommitDecisionEffect(
          {
            git,
            platform: {
              ...makeTestHabitatServiceDeps().platform,
              pathExists: fake.pathExists,
              repoRoot,
            },
          },
          fake.resourcePolicy
        );
      }).pipe(Effect.provide(makeGitLayer(fake)))
    );

    expect(decision).toMatchObject({
      kind: "dirty-submodule",
      commit: "refused",
    });
    expect(fake.calls).not.toContain("git diff --cached --quiet -- vendor/resources");
  });

  test("treats missing resource policy as a pass", () => {
    const fake = makeFakeRuntime();

    const state = classifyResourcesState(fake.resourcePolicy);

    expect(state).toMatchObject({
      kind: "not-configured",
      allowPreCommit: true,
    });
    expect(fake.calls).toEqual([]);
  });

  test("renders resource remediation through the configured policy commands", async () => {
    const fake = makeFakeRuntime({ resourcePolicy: true, submoduleStatus: " M resources.xml\n" });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("resources: dirty-submodule");
    expect(result.stderr).toContain("- resource publish");
    expect(result.stderr).toContain("- resource status");
    expect(fake.checkRequests).toEqual([]);
  });
});

describe("Habitat pre-commit staged mutation policy", () => {
  test("propagates generated-zone file-layer failure before Biome, Grit, or publish commands", async () => {
    const fake = makeFakeRuntime({
      fileLayerStdout: fileLayerCheckReport({
        ok: false,
        status: "fail",
        diagnosticMessage: "generated zone",
      }),
      stagedPaths: ["mods/mod-swooper-maps/mod/maps/studio-current.js"],
    });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("[file-layer staged check]");
    expect(result.stdout).toContain("generated zone");
    expect(fake.biomeRequests).toEqual([]);
    expect(fake.calls.some((call) => call.startsWith("grit "))).toBe(false);
  });

  test("propagates package-manager file-layer failure before Biome, Grit, or publish commands", async () => {
    const fake = makeFakeRuntime({
      fileLayerStdout: fileLayerCheckReport({
        ok: false,
        status: "fail",
        diagnosticMessage: "package manager file",
      }),
      stagedPaths: ["pnpm-lock.yaml"],
    });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("[file-layer staged check]");
    expect(result.stdout).toContain("package manager file");
    expect(fake.biomeRequests).toEqual([]);
    expect(fake.calls.some((call) => call.startsWith("grit "))).toBe(false);
  });

  test("refuses partially staged Biome-supported files before formatting", async () => {
    const fake = makeFakeRuntime({
      stagedPaths: ["packages/example/src/index.ts"],
      unstagedPaths: ["packages/example/src/index.ts"],
    });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("refusing to format partially staged files");
    expect(result.stderr).toContain("- packages/example/src/index.ts");
    expect(fake.biomeRequests).toEqual([]);
    expect(fake.calls.some((call) => call.startsWith("git add --"))).toBe(false);
    expect(fake.calls.some((call) => call.startsWith("grit "))).toBe(false);
  });

  test("restages only formatter-touched Biome paths and leaves foreign staged paths untouched", async () => {
    const fake = makeFakeRuntime({
      sourceCheckHookEnabled: true,
      stagedPaths: [
        "packages/example/src/index.ts",
        "packages/example/src/unchanged.ts",
        "README.md",
      ],
      fileHashes: {
        "packages/example/src/index.ts": ["before", "after"],
        "packages/example/src/unchanged.ts": ["same", "same"],
        "README.md": ["foreign-before", "foreign-after"],
      },
    });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("formatter restage: 1 path(s)");
    expect(fake.calls).toContain("git add -- packages/example/src/index.ts");
    expect(fake.calls).not.toContain("git add -- packages/example/src/unchanged.ts");
    expect(fake.calls).not.toContain("git add -- README.md");
    expect(fake.biomeRequests).toEqual([
      expect.objectContaining({
        kind: "format",
        paths: ["packages/example/src/index.ts", "packages/example/src/unchanged.ts"],
      }),
      expect.objectContaining({
        kind: "check",
        paths: ["packages/example/src/index.ts", "packages/example/src/unchanged.ts"],
      }),
    ]);
    expect(fake.checkRequests.map((request) => request.runner)).toContain("grit");
  });

  test("fails closed when source checks report diagnostic-unavailable", async () => {
    const fake = makeFakeRuntime({
      sourceCheckHookEnabled: true,
      stagedPaths: ["packages/example/src/index.ts"],
      sourceCheckStdout: sourceCheckReport({
        ok: false,
        status: "fail",
        diagnosticMessage:
          "Grit rule failed.\n--- grit provider failure (GritMalformedJson) ---\nGrit output contains wrapper text around JSON.",
      }),
    });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("could not parse source check JSON output");
  });

  test("fails closed when source checks report findings", async () => {
    const fake = makeFakeRuntime({
      sourceCheckHookEnabled: true,
      stagedPaths: ["packages/example/src/index.ts"],
      sourceCheckStdout: sourceCheckReport({
        ok: false,
        status: "fail",
        diagnosticMessage: "finding",
      }),
    });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("[source check]");
  });

  test("does not run staged source checks for JavaScript files outside approved source-check roots", async () => {
    const fake = makeFakeRuntime({
      stagedPaths: ["tools/habitat/src/service/modules/hook/router.ts"],
    });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "source checks: no staged TypeScript/JavaScript files in approved source-check roots"
    );
    expect(fake.biomeRequests).toContainEqual(
      expect.objectContaining({
        kind: "check",
        paths: ["tools/habitat/src/service/modules/hook/router.ts"],
      })
    );
    expect(fake.checkRequests.map((request) => request.runner)).not.toContain("grit");
  });

  test("reports pre-commit output through an injected reporter service", async () => {
    const events: HabitatReportEvent[] = [];
    const fake = makeFakeRuntime({
      sourceCheckHookEnabled: true,
      stagedPaths: ["packages/example/src/index.ts"],
      sourceCheckStdout: sourceCheckReport({
        ok: false,
        status: "fail",
        diagnosticMessage:
          "Grit rule failed.\n--- grit provider failure (GritMalformedJson) ---\nGrit output contains wrapper text around JSON.",
      }),
    });

    const result = await runPreCommitInTest(fake, fake.resourcePolicy, events);

    expect(result.exitCode).toBe(1);
    expect(renderReported(events, "stdout")).toBe(result.stdout);
    expect(renderReported(events, "stderr")).toBe(result.stderr);
    expect(events).toContainEqual({
      kind: "stdout",
      text: "hook result: workstation check only; CI remains authoritative.\n",
    });
    expect(events).toContainEqual({
      kind: "stderr",
      text: "habitat hook pre-commit: could not parse source check JSON output.\n",
    });
  });
});

interface FakeRuntimeOptions {
  resourcePolicy?: boolean;
  resourcesRootExists?: boolean;
  indexLockExists?: boolean;
  submoduleStatus?: string;
  unstagedGitlink?: boolean;
  stagedGitlink?: boolean;
  resourcesTopLevel?: string;
  stagedPaths?: string[];
  unstagedPaths?: string[];
  fileLayerStdout?: string;
  fileHashes?: Record<string, string[]>;
  biomeFormatExitCode?: number;
  biomeCheckExitCode?: number;
  sourceCheckStdout?: string;
  sourceCheckStderr?: string;
  sourceCheckHookEnabled?: boolean;
  branch?: string;
  head?: string;
  allUnstagedPaths?: string[];
}

interface FakeHookHarness {
  readonly resourcePolicy?: HookResourcePolicy;
  readonly hashFile: (targetPath: string) => string | null;
  readonly pathExists: (targetPath: string) => boolean;
  readonly calls: string[];
  readonly checkRequests: CheckOptions[];
  readonly biomeRequests: BiomeCommandRequest[];
  readonly options: FakeRuntimeOptions;
}

async function runPreCommitInTest(
  fake: FakeHookHarness,
  resourcePolicy: HookResourcePolicy | undefined = fake.resourcePolicy,
  reporterEvents?: HabitatReportEvent[]
): Promise<SpawnResult> {
  installStructuralCheckPolicy(makeStructuralCheckPolicy(fake));
  const layer = Layer.mergeAll(
    makeGitLayer(fake),
    makeFakeGraphiteProviderLayer(() => null),
    makeFakeNxProviderLayer(),
    makeBiomeLayer(fake)
  );
  return Effect.runPromise(
    runHookProcedure({
      hashFile: fake.hashFile,
      pathExists: fake.pathExists,
      reporterEvents,
      resourcePolicy,
      sourceCheckHookEnabled: fake.options.sourceCheckHookEnabled,
    }).pipe(Effect.provide(layer))
  );
}

function runHookProcedure(options: {
  readonly hashFile?: (targetPath: string) => string | null;
  readonly pathExists?: (targetPath: string) => boolean;
  readonly reporterEvents?: HabitatReportEvent[];
  readonly resourcePolicy?: HookResourcePolicy;
  readonly sourceCheckHookEnabled?: boolean;
}) {
  return Effect.gen(function* () {
    const biome = yield* BiomeProvider;
    const git = yield* GitProvider;
    const graphite = yield* GraphiteProvider;
    const nx = yield* NxProvider;
    const preCommitHook = hookRouter.preCommit.callable({
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
            ...(options.sourceCheckHookEnabled
              ? { rules: makeSyntheticSourceCheckHookRules() }
              : {}),
          }),
        },
      },
    });
    return yield* withFiberContext(() =>
      preCommitHook({
        ...(options.resourcePolicy ? { resourcePolicy: options.resourcePolicy } : {}),
      })
    );
  });
}

function makeStructuralCheckPolicy(fake: FakeHookHarness): StructuralCheckPolicy {
  return {
    createReport: (options = {}) =>
      Effect.sync(() => {
        fake.checkRequests.push(options);
        if (options.runner === "habitat") {
          return parseCheckReport(
            fake.options.fileLayerStdout ?? fileLayerCheckReport({ ok: true, status: "pass" })
          );
        }
        if (options.runner === "grit") {
          return parseCheckReport(
            fake.options.sourceCheckStdout ?? sourceCheckReport({ ok: true, status: "pass" })
          );
        }
        return passingCheckReport(options.command?.serialized ?? "habitat check");
      }),
  };
}

function installStructuralCheckPolicy(policy: StructuralCheckPolicy) {
  mockCreateCheckReportEffect.mockImplementation(policy.createReport);
}

function makeSyntheticSourceCheckHookRules() {
  const rules = makeTestRuleFacts();
  return {
    ...rules,
    grit: [
      {
        id: "hook-source-check-probe",
        lane: "enforced" as const,
        message: "source-check hook check probe",
        runner: {
          name: "grit" as const,
          patternPath: ".habitat/fixtures/rules/hook-source-check-probe/pattern.md",
          patternName: "hook-source-check-probe",
        },
        patternName: "hook-source-check-probe",
        pathCoverage: [{ kind: "exact-path" as const, patterns: ["packages/example/src/**"] }],
        scanRoots: ["packages/example/src"],
      },
    ],
    hookCheck: [{ id: "hook-source-check-probe", hookCheck: true as const }],
  };
}

function makeBiomeLayer(fake: FakeHookHarness) {
  return makeFakeBiomeProviderLayer((request) => {
    fake.biomeRequests.push(request);
    const exitCode =
      request.kind === "format"
        ? (fake.options.biomeFormatExitCode ?? 0)
        : request.kind === "check"
          ? (fake.options.biomeCheckExitCode ?? 0)
          : 0;
    return commandResult(
      biomeArgv(request),
      repoRootForTestCommand(),
      exitCode === 0 ? `${request.kind} ok\n` : "",
      exitCode,
      exitCode === 0 ? "" : `${request.kind} failed\n`,
      "biome"
    );
  });
}

function makeFakeRuntime(options: FakeRuntimeOptions = {}): FakeHookHarness {
  const calls: string[] = [];
  const checkRequests: CheckOptions[] = [];
  const biomeRequests: BiomeCommandRequest[] = [];
  const hashReads = new Map<string, number>();
  const pathExists = (target: string) => {
    if (target.endsWith("vendor/resources")) {
      return options.resourcesRootExists ?? true;
    }
    if (target.endsWith("index.lock")) return options.indexLockExists ?? false;
    if ((options.stagedPaths ?? []).some((candidate) => target.endsWith(candidate))) {
      return true;
    }
    return false;
  };
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
    checkRequests,
    biomeRequests,
    hashFile,
    options,
    pathExists,
    resourcePolicy: options.resourcePolicy
      ? {
          path: "vendor/resources",
          commands: {
            publish: "resource publish",
            status: "resource status",
            init: "resource init",
            unlock: "resource unlock",
          },
        }
      : undefined,
  };
}

function toTestRepoRelative(targetPath: string): string {
  const prefix = `${repoRoot}/`;
  return targetPath.startsWith(prefix) ? targetPath.slice(prefix.length) : targetPath;
}

function makeGitLayer(fake: FakeHookHarness) {
  return makeFakeGitProviderLayer((argv, options) => {
    const call = ["git", ...argv].join(" ");
    fake.calls.push(call);
    if (call === "git branch --show-current") {
      return commandResult(argv, options.cwd, `${fake.options.branch ?? "agent-HR-test"}\n`);
    }
    if (call === "git rev-parse HEAD") {
      return commandResult(argv, options.cwd, `${fake.options.head ?? "abc123head"}\n`);
    }
    if (call === "git diff --cached --name-only -z") {
      return commandResult(argv, options.cwd, renderPathList(fake.options.stagedPaths ?? []));
    }
    if (call === "git diff --name-only -z") {
      return commandResult(argv, options.cwd, renderPathList(fake.options.allUnstagedPaths ?? []));
    }
    if (call.endsWith("rev-parse --is-inside-work-tree")) {
      return commandResult(argv, options.cwd, "true\n");
    }
    if (call.endsWith("rev-parse --show-toplevel")) {
      return commandResult(
        argv,
        options.cwd,
        `${fake.options.resourcesTopLevel ?? `${repoRoot}/vendor/resources`}\n`
      );
    }
    if (call.endsWith("rev-parse --git-dir")) {
      return commandResult(argv, options.cwd, ".git\n");
    }
    if (call.endsWith("status --porcelain")) {
      return commandResult(argv, options.cwd, fake.options.submoduleStatus ?? "");
    }
    if (call === "git diff --quiet -- vendor/resources") {
      return fake.options.unstagedGitlink
        ? commandResult(argv, options.cwd, "", 1)
        : commandResult(argv, options.cwd, "");
    }
    if (call === "git diff --cached --quiet -- vendor/resources") {
      return fake.options.stagedGitlink
        ? commandResult(argv, options.cwd, "", 1)
        : commandResult(argv, options.cwd, "");
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
    throw new Error(`Unexpected hook test command: ${call}`);
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

function sourceCheckReport(options: {
  ok: boolean;
  status: "pass" | "fail" | "advisory-findings";
  diagnosticMessage?: string;
}): string {
  return checkReport({
    ...options,
    command: "habitat check --staged --runner grit --json",
    ruleId: "hook-source-check-probe",
    runner: "grit",
    message: "source-check hook check probe",
  });
}

function fileLayerCheckReport(options: {
  ok: boolean;
  status: "pass" | "fail" | "advisory-findings";
  diagnosticMessage?: string;
}): string {
  return checkReport({
    ...options,
    command: "habitat check --staged --runner habitat --json",
    ruleId: "file-layer-hook-check-probe",
    runner: "habitat",
    message: "File-layer hook check probe",
  });
}

function checkReport(options: {
  ok: boolean;
  status: "pass" | "fail" | "advisory-findings";
  command: string;
  ruleId: string;
  runner: string;
  message: string;
  diagnosticMessage?: string;
}): string {
  return `${JSON.stringify(
    {
      schemaVersion: 1,
      command: options.command,
      startedAt: "2026-06-15T00:00:00.000Z",
      ok: options.ok,
      rules: [
        {
          ruleId: options.ruleId,
          runner: options.runner,
          lane: "enforced",
          status: options.status,
          locked: true,
          durationMs: 1,
          diagnostics: options.diagnosticMessage
            ? [
                {
                  ruleId: options.ruleId,
                  path: "packages/example/src/index.ts",
                  message: options.diagnosticMessage,
                  severity: "error",
                  baselined: false,
                },
              ]
            : [],
          message: options.message,
          remediate: null,
        },
      ],
    },
    null,
    2
  )}\n`;
}

function parseCheckReport(report: string): CheckReport {
  return JSON.parse(report) as CheckReport;
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

function repoRootForTestCommand(): string {
  return process.cwd().replace(/\/tools\/cli$/, "");
}
