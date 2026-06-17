import { describe, expect, test } from "vitest";
import type { HookReportEvent, ResourcePublisher } from "../../src/lib/hooks.js";
import {
  classifyResourcesState,
  createHookTrace,
  createResourcePublisher,
  runPreCommit,
  runPrePush,
} from "../../src/lib/hooks.js";
import { repoRoot } from "../../src/lib/paths.js";
import type { SpawnResult } from "../../src/lib/spawn.js";

type HookRuntime = NonNullable<Parameters<typeof runPreCommit>[0]>;
type RunCommand = NonNullable<HookRuntime["runCommand"]>;

describe("Habitat hook resource policy", () => {
  test("passes clean resources without invoking the publish script", () => {
    const fake = makeFakeRuntime();

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("resources: clean");
    expect(result.stdout).toContain("hook proof: local feedback only; CI remains authoritative.");
    expect(result.stdout).toContain("habitat hook pre-commit: PASS");
    expect(fake.calls).toContain(
      "bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json"
    );
    expect(fake.calls).not.toContain("bash scripts/civ7-resources/publish-submodule.sh");
  });

  test("fails dirty resources before file-layer, Biome, Grit, or publish commands", () => {
    const fake = makeFakeRuntime({ submoduleStatus: " M resources.xml\n" });

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("resources: dirty-submodule");
    expect(result.stderr).toContain("bun run resources:publish");
    expect(result.stderr).toContain("bun run resources:status");
    expect(fake.calls).not.toContain("bash scripts/civ7-resources/publish-submodule.sh");
    expect(fake.calls).not.toContain(
      "bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json"
    );
    expect(fake.calls.some((call) => call.startsWith("biome "))).toBe(false);
    expect(fake.calls.some((call) => call.startsWith("grit "))).toBe(false);
  });

  test("fails uninitialized resources with init and status remediation", () => {
    const fake = makeFakeRuntime({ resourcesRootExists: false });

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("resources: uninitialized");
    expect(result.stderr).toContain("bun run resources:init");
    expect(result.stderr).toContain("bun run resources:status");
    expect(fake.calls).not.toContain("bash scripts/civ7-resources/publish-submodule.sh");
    expect(fake.calls).not.toContain(
      "bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json"
    );
  });

  test("fails a present resources directory that resolves to the monorepo Git root", () => {
    const fake = makeFakeRuntime({ resourcesTopLevel: "/repo" });

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("resources: uninitialized");
    expect(result.stderr).toContain("exists but is not an initialized submodule Git worktree");
    expect(fake.calls).not.toContain("bash scripts/civ7-resources/publish-submodule.sh");
    expect(fake.calls).not.toContain(
      "bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json"
    );
  });

  test("fails locked resources with unlock and status remediation", () => {
    const fake = makeFakeRuntime({ indexLockExists: true });

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("resources: locked");
    expect(result.stderr).toContain("bun run resources:unlock");
    expect(result.stderr).toContain("bun run resources:status");
    expect(fake.calls).not.toContain("bash scripts/civ7-resources/publish-submodule.sh");
    expect(fake.calls).not.toContain(
      "bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json"
    );
  });

  test("fails an unstaged resources gitlink before file-layer checks", () => {
    const fake = makeFakeRuntime({ unstagedGitlink: true });

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("resources: unstaged-gitlink");
    expect(result.stderr).toContain("git add .civ7/outputs/resources");
    expect(result.stderr).toContain("bun run resources:status");
    expect(fake.calls).not.toContain("bash scripts/civ7-resources/publish-submodule.sh");
    expect(fake.calls).not.toContain(
      "bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json"
    );
  });

  test("allows a staged clean resources gitlink as an explicit pointer update", () => {
    const fake = makeFakeRuntime({ stagedGitlink: true });

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("resources: staged-gitlink");
    expect(fake.calls).toContain(
      "bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json"
    );
    expect(fake.calls).not.toContain("bash scripts/civ7-resources/publish-submodule.sh");
  });

  test("prefers dirty-submodule refusal over staged-gitlink allowance", () => {
    const fake = makeFakeRuntime({
      stagedGitlink: true,
      submoduleStatus: " M resources.xml\n",
    });

    const state = classifyResourcesState(fake.runtime);

    expect(state.kind).toBe("dirty-submodule");
    expect(state.allowPreCommit).toBe(false);
    expect(fake.calls).not.toContain("git diff --cached --quiet -- .civ7/outputs/resources");
  });

  test("treats missing resources configuration as a non-claiming pass", () => {
    const fake = makeFakeRuntime({ gitmodulesExists: false });

    const state = classifyResourcesState(fake.runtime);

    expect(state).toMatchObject({
      kind: "not-configured",
      allowPreCommit: true,
    });
    expect(fake.calls).toEqual([]);
  });

  test("renders resource remediation through an injected publisher service without publishing", () => {
    let publishCalls = 0;
    const publisher: ResourcePublisher = {
      commands: () => ({
        publish: "custom resources publish",
        status: "custom resources status",
        init: "custom resources init",
        unlock: "custom resources unlock",
      }),
      publish: () => {
        publishCalls += 1;
        return ok("published\n");
      },
    };
    const fake = makeFakeRuntime({ submoduleStatus: " M resources.xml\n" });

    const result = runPreCommit({ ...fake.runtime, resourcePublisher: publisher });

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("resources: dirty-submodule");
    expect(result.stderr).toContain("- custom resources publish");
    expect(result.stderr).toContain("- custom resources status");
    expect(publishCalls).toBe(0);
    expect(fake.calls).not.toContain("bun run resources:publish");
    expect(fake.calls).not.toContain("bash scripts/civ7-resources/publish-submodule.sh");
    expect(fake.calls).not.toContain(
      "bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json"
    );
  });

  test("records explicit resource publisher command provenance only when directly invoked", () => {
    const trace = createHookTrace();
    const fake = makeFakeRuntime();
    const publisher = createResourcePublisher({ ...fake.runtime, trace });

    expect(publisher.commands()).toEqual({
      publish: "bun run resources:publish",
      status: "bun run resources:status",
      init: "bun run resources:init",
      unlock: "bun run resources:unlock",
    });

    const result = publisher.publish();

    expect(result.exitCode).toBe(0);
    expect(fake.calls).toContain("bun run resources:publish");
    expect(trace.commands.find((command) => command.phase === "resource-publish")).toMatchObject({
      argv: ["bun", "run", "resources:publish"],
      cwd: repoRoot,
      exitCode: 0,
    });
  });
});

describe("Habitat pre-commit staged mutation policy", () => {
  test("propagates generated-zone file-layer failure before Biome, Grit, or publish commands", () => {
    const fake = makeFakeRuntime({
      fileLayerExitCode: 1,
      fileLayerStdout: '{"ok":false,"diagnostics":[{"message":"generated zone"}]}\n',
      stagedPaths: ["mods/mod-swooper-maps/mod/maps/studio-current.js"],
    });

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("[file-layer staged check]");
    expect(result.stdout).toContain("generated zone");
    expect(fake.calls).not.toContain("bash scripts/civ7-resources/publish-submodule.sh");
    expect(fake.calls.some((call) => call.startsWith("biome "))).toBe(false);
    expect(fake.calls.some((call) => call.startsWith("grit "))).toBe(false);
  });

  test("propagates package-manager artifact file-layer failure before Biome, Grit, or publish commands", () => {
    const fake = makeFakeRuntime({
      fileLayerExitCode: 1,
      fileLayerStdout: '{"ok":false,"diagnostics":[{"message":"package manager artifact"}]}\n',
      stagedPaths: ["pnpm-lock.yaml"],
    });

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("[file-layer staged check]");
    expect(result.stdout).toContain("package manager artifact");
    expect(fake.calls).not.toContain("bash scripts/civ7-resources/publish-submodule.sh");
    expect(fake.calls.some((call) => call.startsWith("biome "))).toBe(false);
    expect(fake.calls.some((call) => call.startsWith("grit "))).toBe(false);
  });

  test("refuses partially staged Biome-supported files before formatting", () => {
    const fake = makeFakeRuntime({
      stagedPaths: ["packages/example/src/index.ts"],
      unstagedPaths: ["packages/example/src/index.ts"],
    });

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("refusing to format partially staged files");
    expect(result.stderr).toContain("- packages/example/src/index.ts");
    expect(fake.calls.some((call) => call.startsWith("biome format"))).toBe(false);
    expect(fake.calls.some((call) => call.startsWith("git add --"))).toBe(false);
    expect(fake.calls.some((call) => call.startsWith("grit "))).toBe(false);
  });

  test("restages only formatter-touched Biome paths and leaves foreign staged paths untouched", () => {
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

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("formatter restage: 1 path(s)");
    expect(fake.calls).toContain("git add -- packages/example/src/index.ts");
    expect(fake.calls).not.toContain("git add -- packages/example/src/unchanged.ts");
    expect(fake.calls).not.toContain("git add -- README.md");
    expect(fake.calls).toContain(
      "biome check --no-errors-on-unmatched packages/example/src/index.ts packages/example/src/unchanged.ts"
    );
    expect(fake.calls).toContain(
      "bun tools/habitat-harness/bin/dev.ts check --staged --tool grit-check --json"
    );
  });

  test("fails closed when Grit emits malformed JSON", () => {
    const fake = makeFakeRuntime({
      stagedPaths: ["packages/example/src/index.ts"],
      gritExitCode: 1,
      gritStdout: gritCheckReport({
        ok: false,
        status: "fail",
        diagnosticMessage:
          "Grit rule failed.\n--- grit adapter failure (GritMalformedJson) ---\nGrit output contains wrapper text around JSON.",
      }),
    });

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("could not parse Grit JSON output");
  });

  test("fails closed when Grit reports findings", () => {
    const fake = makeFakeRuntime({
      stagedPaths: ["packages/example/src/index.ts"],
      gritExitCode: 1,
      gritStdout: gritCheckReport({
        ok: false,
        status: "fail",
        diagnosticMessage: "finding",
      }),
    });

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("[grit check]");
  });

  test("does not run staged Grit for JavaScript files outside approved Grit scan roots", () => {
    const fake = makeFakeRuntime({
      stagedPaths: ["tools/habitat-harness/src/lib/hooks.ts"],
    });

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "grit: no staged TypeScript/JavaScript files in approved scan roots"
    );
    expect(fake.calls).toContain(
      "biome check --no-errors-on-unmatched tools/habitat-harness/src/lib/hooks.ts"
    );
    expect(fake.calls).not.toContain(
      "bun tools/habitat-harness/bin/dev.ts check --staged --tool grit-check --json"
    );
  });

  test("records typed pre-commit state and command provenance through fake services", () => {
    const trace = createHookTrace();
    const fake = makeFakeRuntime({
      stagedPaths: ["packages/example/src/index.ts", "README.md"],
      fileHashes: {
        "packages/example/src/index.ts": ["before", "after"],
        "README.md": ["foreign-before", "foreign-after"],
      },
    });

    const result = runPreCommit({ ...fake.runtime, trace });

    expect(result.exitCode).toBe(0);
    expect(trace.preCommit).toMatchObject({
      preState: {
        branch: "agent-HR-test",
        head: "abc123head",
        stagedPaths: ["packages/example/src/index.ts", "README.md"],
        unstagedPaths: [],
        resourceState: "clean",
      },
      postState: {
        branch: "agent-HR-test",
        head: "abc123head",
        stagedPaths: ["packages/example/src/index.ts", "README.md"],
        unstagedPaths: [],
        resourceState: "clean",
      },
      resourceState: "clean",
      stagedPaths: ["packages/example/src/index.ts", "README.md"],
      biomePaths: ["packages/example/src/index.ts"],
      gritPaths: ["packages/example/src/index.ts"],
      partialPaths: [],
      formatterTouchedPaths: ["packages/example/src/index.ts"],
      restagedPaths: ["packages/example/src/index.ts"],
      outcome: "pass",
      exitCode: 0,
    });
    expect(trace.preCommit?.durationMs).toBeGreaterThan(0);
    expect(trace.commands.every((command) => command.durationMs >= 0)).toBe(true);
    expect(trace.commands.map((command) => command.phase)).toContain("repo-state");
    expect(trace.commands.map((command) => command.phase)).toEqual(
      expect.arrayContaining([
        "resource-state",
        "staged-paths",
        "file-layer",
        "partial-staging",
        "biome-format",
        "formatter-restage",
        "biome-check",
        "grit-check",
      ])
    );
    expect(trace.commands.find((command) => command.phase === "grit-check")).toMatchObject({
      argv: [
        "bun",
        "tools/habitat-harness/bin/dev.ts",
        "check",
        "--staged",
        "--tool",
        "grit-check",
        "--json",
      ],
      cwd: repoRoot,
      env: undefined,
      exitCode: 0,
    });
  });

  test("records Grit parse failure as an explicit pre-commit outcome", () => {
    const trace = createHookTrace();
    const fake = makeFakeRuntime({
      stagedPaths: ["packages/example/src/index.ts"],
      gritExitCode: 1,
      gritStdout: gritCheckReport({
        ok: false,
        status: "fail",
        diagnosticMessage:
          "Grit rule failed.\n--- grit adapter failure (GritMalformedJson) ---\nGrit output contains wrapper text around JSON.",
      }),
    });

    const result = runPreCommit({ ...fake.runtime, trace });

    expect(result.exitCode).toBe(1);
    expect(trace.preCommit).toMatchObject({
      gritPaths: ["packages/example/src/index.ts"],
      outcome: "grit-parse-failed",
      exitCode: 1,
      postState: {
        branch: "agent-HR-test",
        head: "abc123head",
        resourceState: "clean",
      },
    });
  });

  test("reports pre-commit output through an injected reporter service", () => {
    const events: HookReportEvent[] = [];
    const fake = makeFakeRuntime({
      stagedPaths: ["packages/example/src/index.ts"],
      gritExitCode: 1,
      gritStdout: gritCheckReport({
        ok: false,
        status: "fail",
        diagnosticMessage:
          "Grit rule failed.\n--- grit adapter failure (GritMalformedJson) ---\nGrit output contains wrapper text around JSON.",
      }),
    });

    const result = runPreCommit({
      ...fake.runtime,
      reporter: { write: (event) => events.push(event) },
    });

    expect(result.exitCode).toBe(1);
    expect(renderReported(events, "stdout")).toBe(result.stdout);
    expect(renderReported(events, "stderr")).toBe(result.stderr);
    expect(events).toContainEqual({
      channel: "stdout",
      text: "hook proof: local feedback only; CI remains authoritative.\n",
    });
    expect(events).toContainEqual({
      channel: "stderr",
      text: "habitat hook pre-commit: could not parse Grit JSON output.\n",
    });
  });
});

describe("Habitat pre-push base policy", () => {
  test("uses the explicit base override without probing Graphite or merge-base", () => {
    const fake = makeFakeRuntime();

    const result = runPrePush({ base: "HEAD~1" }, fake.runtime);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("habitat hook pre-push: repo Nx affected base=HEAD~1");
    expect(result.stdout).toContain("hook proof: local feedback only; CI remains authoritative.");
    expect(fake.calls).toContain(
      "nx affected -t biome:ci,boundaries,grit:check,habitat:check,test --base HEAD~1 --head HEAD --outputStyle=static"
    );
    expect(fake.calls).not.toContain("gt branch info --no-interactive");
    expect(fake.calls.some((call) => call.startsWith("git merge-base"))).toBe(false);
  });

  test("uses the Graphite parent as the default affected base when available", () => {
    const fake = makeFakeRuntime({ graphiteParent: "agent-HR-parent" });

    const result = runPrePush({}, fake.runtime);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("habitat hook pre-push: repo Nx affected base=agent-HR-parent");
    expect(fake.calls).toContain("gt branch info --no-interactive");
    expect(fake.calls).toContain(
      "nx affected -t biome:ci,boundaries,grit:check,habitat:check,test --base agent-HR-parent --head HEAD --outputStyle=static"
    );
    expect(fake.calls.some((call) => call.startsWith("git merge-base"))).toBe(false);
  });

  test("falls back to the main merge-base when Graphite parent is unavailable", () => {
    const fake = makeFakeRuntime({ mergeBase: "abc123mergebase" });

    const result = runPrePush({}, fake.runtime);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("habitat hook pre-push: repo Nx affected base=abc123mergebase");
    expect(fake.calls).toContain("gt branch info --no-interactive");
    expect(fake.calls).toContain("git merge-base HEAD main");
    expect(fake.calls).toContain(
      "nx affected -t biome:ci,boundaries,grit:check,habitat:check,test --base abc123mergebase --head HEAD --outputStyle=static"
    );
  });

  test("falls back to literal main when Graphite and merge-base probes fail", () => {
    const fake = makeFakeRuntime({ mergeBaseExitCode: 1, originMergeBaseExitCode: 1 });

    const result = runPrePush({}, fake.runtime);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("habitat hook pre-push: repo Nx affected base=main");
    expect(fake.calls).toContain("git merge-base HEAD main");
    expect(fake.calls).toContain("git merge-base HEAD origin/main");
    expect(fake.calls).toContain(
      "nx affected -t biome:ci,boundaries,grit:check,habitat:check,test --base main --head HEAD --outputStyle=static"
    );
  });

  test("propagates Nx affected failures with base provenance", () => {
    const fake = makeFakeRuntime({
      graphiteParent: "agent-HR-parent",
      nxAffectedExitCode: 1,
      nxAffectedStdout: "affected failed\n",
      nxAffectedStderr: "target failed\n",
    });

    const result = runPrePush({}, fake.runtime);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("habitat hook pre-push: repo Nx affected base=agent-HR-parent");
    expect(result.stdout).toContain("affected failed");
    expect(result.stderr).toContain("target failed");
  });

  test("records pre-push base and affected command provenance through fake services", () => {
    const trace = createHookTrace();
    const fake = makeFakeRuntime({ graphiteParent: "agent-HR-parent" });

    const result = runPrePush({}, { ...fake.runtime, trace });

    expect(result.exitCode).toBe(0);
    expect(trace.prePush).toMatchObject({
      base: "agent-HR-parent",
      outcome: "pass",
      exitCode: 0,
      preState: {
        branch: "agent-HR-test",
        head: "abc123head",
        resourceState: "clean",
      },
      postState: {
        branch: "agent-HR-test",
        head: "abc123head",
        resourceState: "clean",
      },
    });
    expect(trace.prePush?.durationMs).toBeGreaterThan(0);
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
        "biome:ci,boundaries,grit:check,habitat:check,test",
        "--base",
        "agent-HR-parent",
        "--head",
        "HEAD",
        "--outputStyle=static",
      ],
      cwd: repoRoot,
      env: undefined,
      exitCode: 0,
    });
  });

  test("reports pre-push output through an injected reporter service", () => {
    const events: HookReportEvent[] = [];
    const fake = makeFakeRuntime({
      graphiteParent: "agent-HR-parent",
      nxAffectedExitCode: 1,
      nxAffectedStdout: "affected failed\n",
      nxAffectedStderr: "target failed\n",
    });

    const result = runPrePush(
      {},
      {
        ...fake.runtime,
        reporter: { write: (event) => events.push(event) },
      }
    );

    expect(result.exitCode).toBe(1);
    expect(renderReported(events, "stdout")).toBe(result.stdout);
    expect(renderReported(events, "stderr")).toBe(result.stderr);
    expect(events).toContainEqual({
      channel: "stdout",
      text: "hook proof: local feedback only; CI remains authoritative.\n",
    });
    expect(events).toContainEqual({
      channel: "stderr",
      text: "target failed\n",
    });
  });
});

interface FakeRuntimeOptions {
  gitmodulesExists?: boolean;
  resourcesRootExists?: boolean;
  indexLockExists?: boolean;
  submoduleStatus?: string;
  unstagedGitlink?: boolean;
  stagedGitlink?: boolean;
  resourcesTopLevel?: string;
  stagedPaths?: string[];
  unstagedPaths?: string[];
  fileLayerExitCode?: number;
  fileLayerStdout?: string;
  fileHashes?: Record<string, string[]>;
  biomeFormatExitCode?: number;
  biomeCheckExitCode?: number;
  gritExitCode?: number;
  gritStdout?: string;
  gritStderr?: string;
  graphiteParent?: string;
  mergeBase?: string;
  mergeBaseExitCode?: number;
  originMergeBaseExitCode?: number;
  nxAffectedExitCode?: number;
  nxAffectedStdout?: string;
  nxAffectedStderr?: string;
  branch?: string;
  head?: string;
  allUnstagedPaths?: string[];
}

function makeFakeRuntime(options: FakeRuntimeOptions = {}): {
  runtime: HookRuntime;
  calls: string[];
} {
  const calls: string[] = [];
  const hashReads = new Map<string, number>();
  let nowMs = 1_000;
  const runCommand: RunCommand = (argv, _opts) => {
    const call = argv.join(" ");
    calls.push(call);
    if (call === "git branch --show-current") {
      return ok(`${options.branch ?? "agent-HR-test"}\n`);
    }
    if (call === "git rev-parse HEAD") {
      return ok(`${options.head ?? "abc123head"}\n`);
    }
    if (call === "git diff --cached --name-only -z") {
      return ok(renderPathList(options.stagedPaths ?? []));
    }
    if (call === "git diff --name-only -z") {
      return ok(renderPathList(options.allUnstagedPaths ?? []));
    }
    if (call === "git config -f .gitmodules --get submodule..civ7/outputs/resources.path") {
      return ok(".civ7/outputs/resources\n");
    }
    if (call.endsWith("rev-parse --is-inside-work-tree")) {
      return ok("true\n");
    }
    if (call.endsWith("rev-parse --show-toplevel")) {
      return ok(`${options.resourcesTopLevel ?? `${repoRoot}/.civ7/outputs/resources`}\n`);
    }
    if (call.endsWith("rev-parse --git-dir")) {
      return ok(".git\n");
    }
    if (call.endsWith("status --porcelain")) {
      return ok(options.submoduleStatus ?? "");
    }
    if (call === "git diff --quiet -- .civ7/outputs/resources") {
      return options.unstagedGitlink ? failure(1) : ok();
    }
    if (call === "git diff --cached --quiet -- .civ7/outputs/resources") {
      return options.stagedGitlink ? failure(1) : ok();
    }
    if (call === "git diff --cached --name-status -z") {
      return ok(renderNameStatus(options.stagedPaths ?? []));
    }
    if (call === "bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json") {
      return {
        exitCode: options.fileLayerExitCode ?? 0,
        stdout: options.fileLayerStdout ?? '{"ok":true}\n',
        stderr: "",
      };
    }
    if (call === "bun run resources:publish") {
      return ok("resources published\n");
    }
    if (call.startsWith("git diff --name-only -z --")) {
      return ok(renderPathList(options.unstagedPaths ?? []));
    }
    if (call.startsWith("biome format --write --no-errors-on-unmatched")) {
      return options.biomeFormatExitCode ? failure(options.biomeFormatExitCode) : ok();
    }
    if (call.startsWith("git add --")) {
      return ok();
    }
    if (call.startsWith("biome check --no-errors-on-unmatched")) {
      return options.biomeCheckExitCode ? failure(options.biomeCheckExitCode) : ok();
    }
    if (call === "bun tools/habitat-harness/bin/dev.ts check --staged --tool grit-check --json") {
      return {
        exitCode: options.gritExitCode ?? 0,
        stdout: options.gritStdout ?? gritCheckReport({ ok: true, status: "pass" }),
        stderr: options.gritStderr ?? "",
      };
    }
    if (call === "gt branch info --no-interactive") {
      return options.graphiteParent
        ? ok(`Parent: ${options.graphiteParent}\n`)
        : failure(1, "", "no graphite parent\n");
    }
    if (call === "git merge-base HEAD main") {
      return options.mergeBaseExitCode
        ? failure(options.mergeBaseExitCode)
        : ok(`${options.mergeBase ?? "mainmergebase"}\n`);
    }
    if (call === "git merge-base HEAD origin/main") {
      return options.originMergeBaseExitCode
        ? failure(options.originMergeBaseExitCode)
        : ok(`${options.mergeBase ?? "originmainmergebase"}\n`);
    }
    if (call.startsWith("nx affected ")) {
      return {
        exitCode: options.nxAffectedExitCode ?? 0,
        stdout: options.nxAffectedStdout ?? "affected ok\n",
        stderr: options.nxAffectedStderr ?? "",
      };
    }
    throw new Error(`Unexpected hook test command: ${call}`);
  };

  return {
    calls,
    runtime: {
      runCommand,
      pathExists: (target) => {
        if (target.endsWith(".gitmodules")) return options.gitmodulesExists ?? true;
        if (target.endsWith(".civ7/outputs/resources")) {
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

function gritCheckReport(options: {
  ok: boolean;
  status: "pass" | "fail" | "advisory-findings";
  diagnosticMessage?: string;
}): string {
  return `${JSON.stringify(
    {
      schemaVersion: 1,
      command: "habitat check --staged --tool grit-check --json",
      startedAt: "2026-06-15T00:00:00.000Z",
      ok: options.ok,
      rules: [
        {
          ruleId: "grit-hook-scope-probe",
          ownerTool: "grit-check",
          lane: "enforced",
          status: options.status,
          locked: true,
          durationMs: 1,
          diagnostics: options.diagnosticMessage
            ? [
                {
                  ruleId: "grit-hook-scope-probe",
                  path: "packages/example/src/index.ts",
                  message: options.diagnosticMessage,
                  severity: "error",
                  baselined: false,
                },
              ]
            : [],
          detect: ["habitat", "check", "--tool", "grit-check"],
          message: "Grit hook scope probe",
          remediate: null,
        },
      ],
    },
    null,
    2
  )}\n`;
}

function ok(stdout = ""): SpawnResult {
  return { exitCode: 0, stdout, stderr: "" };
}

function failure(exitCode: number, stdout = "", stderr = ""): SpawnResult {
  return { exitCode, stdout, stderr };
}
