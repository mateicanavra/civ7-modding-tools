import { Effect, Layer } from "effect";
import { describe, expect, test } from "vitest";
import {
  createHookTrace,
  type HookReportEvent,
  type HookRuntime,
} from "../../src/domains/hook-runtime/runtime.js";
import {
  type CheckOptions,
  type CheckReport,
  makeFakeStructuralCheckLayer,
} from "../../src/domains/structural-check/index.js";
import { repoRoot } from "../../src/lib/paths.js";
import { captureOutput, makeHabitatCommandResult } from "../../src/providers/command/index.js";
import type { HabitatCommandResult } from "../../src/providers/command/types.js";
import { makeFakeGitProviderLayer } from "../../src/providers/git/index.js";
import {
  affectedArgv,
  makeFakeNxProviderLayer,
  type NxAffectedRequest,
} from "../../src/providers/nx/index.js";
import { createHabitatServiceClient } from "../../src/service/client.js";
import { runHookService } from "../../src/service/modules/hook/router.js";

const prePushAffectedTargets = "check,validate:boundary-taxonomy,validate:grit-patterns";
const prePushArtifactTargets = "habitat:check,source:check";
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

  test("uses Habitat structural targets for rule artifact-only pre-push changes", async () => {
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
        targets: prePushArtifactTargets.split(","),
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
});

function runHookServiceInTest(
  input: Parameters<typeof runHookService>[0],
  options: Parameters<typeof runHookService>[1] = {},
  gitLayer = makeFakeGitProviderLayer((argv, options) => commandResult(argv, options.cwd, "")),
  nx = nxLayer(),
  structuralCheck?: ReturnType<typeof makeFakeStructuralCheckLayer>
) {
  const layer = structuralCheck
    ? Layer.mergeAll(gitLayer, nx, structuralCheck)
    : Layer.merge(gitLayer, nx);
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

function nxLayer(handler?: (request: NxAffectedRequest) => HabitatCommandResult) {
  return makeFakeNxProviderLayer({
    affected: (request) =>
      handler?.(request) ??
      commandResult(affectedArgv(request), repoRootForTestCommand(), "affected ok\n", 0, "", "nx"),
  });
}

function repoRootForTestCommand(): string {
  return process.cwd().replace(/\/tools\/habitat-harness$/, "");
}

function makePreCommitRuntime(): {
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
        if (call === "git diff --cached --name-status -z") {
          return { exitCode: 0, stdout: "", stderr: "" };
        }
        if (
          call === "bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json"
        ) {
          return { exitCode: 0, stdout: fileLayerCheckReport(), stderr: "" };
        }
        throw new Error(`Unexpected hook pre-commit service test command: ${call}`);
      },
      pathExists: () => false,
      nowMs: () => 1_000,
    },
  };
}

function fileLayerCheckReport(): string {
  return `${JSON.stringify({
    schemaVersion: 1,
    command: "habitat check --staged --tool file-layer --json",
    startedAt: "2026-06-20T00:00:00.000Z",
    ok: true,
    rules: [],
  })}\n`;
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
