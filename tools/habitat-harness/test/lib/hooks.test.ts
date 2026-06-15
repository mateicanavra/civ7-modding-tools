import { describe, expect, test } from "vitest";
import { classifyResourcesState, runPreCommit } from "../../src/lib/hooks.js";
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
    expect(result.stdout).toContain("habitat hook pre-commit: PASS");
    expect(fake.calls).toContain("bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json");
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
    expect(fake.calls).not.toContain("bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json");
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
    expect(fake.calls).not.toContain("bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json");
  });

  test("fails a present resources directory that resolves to the monorepo Git root", () => {
    const fake = makeFakeRuntime({ resourcesTopLevel: "/repo" });

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("resources: uninitialized");
    expect(result.stderr).toContain("exists but is not an initialized submodule Git worktree");
    expect(fake.calls).not.toContain("bash scripts/civ7-resources/publish-submodule.sh");
    expect(fake.calls).not.toContain("bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json");
  });

  test("fails locked resources with unlock and status remediation", () => {
    const fake = makeFakeRuntime({ indexLockExists: true });

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("resources: locked");
    expect(result.stderr).toContain("bun run resources:unlock");
    expect(result.stderr).toContain("bun run resources:status");
    expect(fake.calls).not.toContain("bash scripts/civ7-resources/publish-submodule.sh");
    expect(fake.calls).not.toContain("bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json");
  });

  test("fails an unstaged resources gitlink before file-layer checks", () => {
    const fake = makeFakeRuntime({ unstagedGitlink: true });

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("resources: unstaged-gitlink");
    expect(result.stderr).toContain("git add .civ7/outputs/resources");
    expect(result.stderr).toContain("bun run resources:status");
    expect(fake.calls).not.toContain("bash scripts/civ7-resources/publish-submodule.sh");
    expect(fake.calls).not.toContain("bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json");
  });

  test("allows a staged clean resources gitlink as an explicit pointer update", () => {
    const fake = makeFakeRuntime({ stagedGitlink: true });

    const result = runPreCommit(fake.runtime);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("resources: staged-gitlink");
    expect(fake.calls).toContain("bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json");
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
});

interface FakeRuntimeOptions {
  gitmodulesExists?: boolean;
  resourcesRootExists?: boolean;
  indexLockExists?: boolean;
  submoduleStatus?: string;
  unstagedGitlink?: boolean;
  stagedGitlink?: boolean;
  resourcesTopLevel?: string;
}

function makeFakeRuntime(options: FakeRuntimeOptions = {}): {
  runtime: HookRuntime;
  calls: string[];
} {
  const calls: string[] = [];
  const runCommand: RunCommand = (argv, _opts) => {
    const call = argv.join(" ");
    calls.push(call);
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
      return ok();
    }
    if (call === "bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json") {
      return ok('{"ok":true}\n');
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
        return false;
      },
    },
  };
}

function ok(stdout = ""): SpawnResult {
  return { exitCode: 0, stdout, stderr: "" };
}

function failure(exitCode: number): SpawnResult {
  return { exitCode, stdout: "", stderr: "" };
}
