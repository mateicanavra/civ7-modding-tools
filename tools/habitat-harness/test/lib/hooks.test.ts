import {
  type CheckOptions,
  type CheckReport,
  makeFakeStructuralCheckLayer,
} from "@internal/habitat-harness/service/model/check/policy/structural/index";
import type { HookServiceModuleContext } from "@internal/habitat-harness/service/modules/hook/context";
import {
  classifyResourcePreCommitDecisionEffect,
  classifyResourcesState,
} from "@internal/habitat-harness/service/modules/hook/model/policy/resource-inspection.policy";
import {
  createHookTrace,
  type HookReportEvent,
  type HookRuntime,
} from "@internal/habitat-harness/service/modules/hook/model/policy/runtime.policy";
import { hookRouter } from "@internal/habitat-harness/service/modules/hook/router";
import {
  type BiomeCommandRequest,
  biomeArgv,
  makeFakeBiomeProviderLayer,
} from "@internal/habitat-harness/providers/biome/index";
import {
  captureOutput,
  makeHabitatCommandResult,
  type SpawnResult,
} from "@internal/habitat-harness/resources/command/index";
import type { HabitatCommandResult } from "@internal/habitat-harness/resources/command/types";
import {
  GitProvider,
  makeFakeGitProviderLayer,
} from "@internal/habitat-harness/providers/git/index";
import { makeFakeNxProviderLayer } from "@internal/habitat-harness/providers/nx/index";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import { Effect, Layer } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { describe, expect, test } from "vitest";

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
    expect(fake.checkRequests.map((request) => request.tool)).toContain("file-layer");
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
    expect(fake.checkRequests.map((request) => request.tool)).toContain("file-layer");
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
        return yield* classifyResourcePreCommitDecisionEffect({ git, repoRoot }, fake.runtime);
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

    const state = classifyResourcesState(fake.runtime);

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

  test("propagates package-manager artifact file-layer failure before Biome, Grit, or publish commands", async () => {
    const fake = makeFakeRuntime({
      fileLayerStdout: fileLayerCheckReport({
        ok: false,
        status: "fail",
        diagnosticMessage: "package manager artifact",
      }),
      stagedPaths: ["pnpm-lock.yaml"],
    });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("[file-layer staged check]");
    expect(result.stdout).toContain("package manager artifact");
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
    expect(fake.checkRequests.map((request) => request.tool)).toContain("source-check");
  });

  test("fails closed when source checks report diagnostic-unavailable", async () => {
    const fake = makeFakeRuntime({
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
      stagedPaths: ["tools/habitat-harness/src/service/modules/hook/router.ts"],
    });

    const result = await runPreCommitInTest(fake);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "source checks: no staged TypeScript/JavaScript files in approved source-check roots"
    );
    expect(fake.biomeRequests).toContainEqual(
      expect.objectContaining({
        kind: "check",
        paths: ["tools/habitat-harness/src/service/modules/hook/router.ts"],
      })
    );
    expect(fake.checkRequests.map((request) => request.tool)).not.toContain("source-check");
  });

  test("records typed pre-commit state and command provenance through fake services", async () => {
    const trace = createHookTrace();
    const fake = makeFakeRuntime({
      stagedPaths: ["packages/example/src/index.ts", "README.md"],
      fileHashes: {
        "packages/example/src/index.ts": ["before", "after"],
        "README.md": ["foreign-before", "foreign-after"],
      },
    });

    const result = await runPreCommitInTest(fake, { ...fake.runtime, trace });

    expect(result.exitCode).toBe(0);
    expect(trace.preCommit).toMatchObject({
      preState: {
        branch: "agent-HR-test",
        head: "abc123head",
        stagedPaths: ["packages/example/src/index.ts", "README.md"],
        unstagedPaths: [],
        resourceState: "not-configured",
      },
      postState: {
        branch: "agent-HR-test",
        head: "abc123head",
        stagedPaths: ["packages/example/src/index.ts", "README.md"],
        unstagedPaths: [],
        resourceState: "not-configured",
      },
      resourceState: "not-configured",
      stagedPaths: ["packages/example/src/index.ts", "README.md"],
      biomePaths: ["packages/example/src/index.ts"],
      sourceCheckPaths: ["packages/example/src/index.ts"],
      partialPaths: [],
      formatterTouchedPaths: ["packages/example/src/index.ts"],
      restagedPaths: ["packages/example/src/index.ts"],
      outcome: "pass",
      exitCode: 0,
    });
    expect(trace.preCommit?.durationMs).toBeGreaterThan(0);
    expect(trace.commands.every((command) => command.durationMs >= 0)).toBe(true);
    expect(trace.commands.map((command) => command.phase)).toEqual(
      expect.arrayContaining([
        "staged-paths",
        "file-layer",
        "partial-staging",
        "biome-format",
        "formatter-restage",
        "biome-check",
        "source-check",
      ])
    );
    expect(trace.commands.find((command) => command.phase === "source-check")).toMatchObject({
      argv: ["habitat", "check", "--staged", "--tool", "source-check", "--json"],
      cwd: repoRoot,
      env: undefined,
      exitCode: 0,
    });
  });

  test("records source-check diagnostic-unavailable as an explicit pre-commit outcome", async () => {
    const trace = createHookTrace();
    const fake = makeFakeRuntime({
      stagedPaths: ["packages/example/src/index.ts"],
      sourceCheckStdout: sourceCheckReport({
        ok: false,
        status: "fail",
        diagnosticMessage:
          "Grit rule failed.\n--- grit provider failure (GritMalformedJson) ---\nGrit output contains wrapper text around JSON.",
      }),
    });

    const result = await runPreCommitInTest(fake, { ...fake.runtime, trace });

    expect(result.exitCode).toBe(1);
    expect(trace.preCommit).toMatchObject({
      sourceCheckPaths: ["packages/example/src/index.ts"],
      outcome: "parse-failed",
      exitCode: 1,
      postState: {
        branch: "agent-HR-test",
        head: "abc123head",
        resourceState: "not-configured",
      },
    });
  });

  test("reports pre-commit output through an injected reporter service", async () => {
    const events: HookReportEvent[] = [];
    const fake = makeFakeRuntime({
      stagedPaths: ["packages/example/src/index.ts"],
      sourceCheckStdout: sourceCheckReport({
        ok: false,
        status: "fail",
        diagnosticMessage:
          "Grit rule failed.\n--- grit provider failure (GritMalformedJson) ---\nGrit output contains wrapper text around JSON.",
      }),
    });

    const result = await runPreCommitInTest(fake, {
      ...fake.runtime,
      reporter: { write: (event) => events.push(event) },
    });

    expect(result.exitCode).toBe(1);
    expect(renderReported(events, "stdout")).toBe(result.stdout);
    expect(renderReported(events, "stderr")).toBe(result.stderr);
    expect(events).toContainEqual({
      channel: "stdout",
      text: "hook result: workstation check only; CI remains authoritative.\n",
    });
    expect(events).toContainEqual({
      channel: "stderr",
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
  branch?: string;
  head?: string;
  allUnstagedPaths?: string[];
}

interface FakeHookRuntime {
  readonly runtime: HookRuntime;
  readonly calls: string[];
  readonly checkRequests: CheckOptions[];
  readonly biomeRequests: BiomeCommandRequest[];
  readonly options: FakeRuntimeOptions;
}

async function runPreCommitInTest(
  fake: FakeHookRuntime,
  runtime: HookRuntime = fake.runtime
): Promise<SpawnResult> {
  const layer = Layer.mergeAll(
    makeGitLayer(fake),
    makeFakeNxProviderLayer(),
    makeStructuralCheckLayer(fake),
    makeBiomeLayer(fake)
  );
  return Effect.runPromise(runHookProcedure({ runtime }).pipe(Effect.provide(layer)));
}

function runHookProcedure(context: HookServiceModuleContext) {
  return Effect.gen(function* () {
    const runHook = hookRouter.run.callable({ context: { hook: context } });
    return yield* withFiberContext(() => runHook({ name: "pre-commit" }));
  });
}

function makeStructuralCheckLayer(fake: FakeHookRuntime) {
  return makeFakeStructuralCheckLayer({
    createReport: (options = {}) =>
      Effect.sync(() => {
        fake.checkRequests.push(options);
        if (options.tool === "file-layer") {
          return parseCheckReport(
            fake.options.fileLayerStdout ?? fileLayerCheckReport({ ok: true, status: "pass" })
          );
        }
        if (options.tool === "source-check") {
          return parseCheckReport(
            fake.options.sourceCheckStdout ?? sourceCheckReport({ ok: true, status: "pass" })
          );
        }
        return passingCheckReport(options.command?.serialized ?? "habitat check");
      }),
    expandBaselines: () => Effect.succeed({ ok: true, messages: [] }),
  });
}

function makeBiomeLayer(fake: FakeHookRuntime) {
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

function makeFakeRuntime(options: FakeRuntimeOptions = {}): FakeHookRuntime {
  const calls: string[] = [];
  const checkRequests: CheckOptions[] = [];
  const biomeRequests: BiomeCommandRequest[] = [];
  const hashReads = new Map<string, number>();
  let nowMs = 1_000;

  return {
    calls,
    checkRequests,
    biomeRequests,
    options,
    runtime: {
      pathExists: (target) => {
        if (target.endsWith("vendor/resources")) {
          return options.resourcesRootExists ?? true;
        }
        if (target.endsWith("index.lock")) return options.indexLockExists ?? false;
        if ((options.stagedPaths ?? []).some((candidate) => target.endsWith(candidate))) {
          return true;
        }
        return false;
      },
      fileHash: (repoRelativePath) => {
        const sequence = options.fileHashes?.[repoRelativePath];
        if (!sequence) return `stable:${repoRelativePath}`;
        const readCount = hashReads.get(repoRelativePath) ?? 0;
        hashReads.set(repoRelativePath, readCount + 1);
        return sequence[Math.min(readCount, sequence.length - 1)] ?? null;
      },
      nowMs: () => nowMs++,
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
    },
  };
}

function makeGitLayer(fake: FakeHookRuntime) {
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

function renderReported(events: HookReportEvent[], channel: HookReportEvent["channel"]): string {
  return events
    .filter((event) => event.channel === channel)
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
    command: "habitat check --staged --tool source-check --json",
    ruleId: "hook-runtime-probe",
    ownerTool: "source-check",
    message: "source-check hook check probe",
    detect: ["habitat", "check", "--tool", "source-check"],
  });
}

function fileLayerCheckReport(options: {
  ok: boolean;
  status: "pass" | "fail" | "advisory-findings";
  diagnosticMessage?: string;
}): string {
  return checkReport({
    ...options,
    command: "habitat check --staged --tool file-layer --json",
    ruleId: "file-layer-hook-runtime-probe",
    ownerTool: "file-layer",
    message: "File-layer hook check probe",
    detect: ["habitat", "check", "--tool", "file-layer"],
  });
}

function checkReport(options: {
  ok: boolean;
  status: "pass" | "fail" | "advisory-findings";
  command: string;
  ruleId: string;
  ownerTool: string;
  message: string;
  detect: string[];
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
          ownerTool: options.ownerTool,
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
          detect: options.detect,
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
  return process.cwd().replace(/\/tools\/habitat-harness$/, "");
}
