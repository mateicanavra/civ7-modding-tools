import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { devNull, tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, test } from "vitest";

const initScript = fileURLToPath(
  new URL("../../scripts/resources-submodule/init-submodule.sh", import.meta.url)
);
const resourceAlias = "fixture-resource://official-resources";
const submodulePath = ".civ7/outputs/resources";
const tempRoots: string[] = [];
const gitEnvironmentVariablesToClear = [
  "GIT_ALTERNATE_OBJECT_DIRECTORIES",
  "GIT_ALLOW_PROTOCOL",
  "GIT_CEILING_DIRECTORIES",
  "GIT_COMMON_DIR",
  "GIT_CONFIG",
  "GIT_CONFIG_GLOBAL",
  "GIT_CONFIG_NOSYSTEM",
  "GIT_CONFIG_PARAMETERS",
  "GIT_CONFIG_SYSTEM",
  "GIT_DIR",
  "GIT_DISCOVERY_ACROSS_FILESYSTEM",
  "GIT_GRAFT_FILE",
  "GIT_IMPLICIT_WORK_TREE",
  "GIT_INDEX_FILE",
  "GIT_INTERNAL_SUPER_PREFIX",
  "GIT_NAMESPACE",
  "GIT_NO_REPLACE_OBJECTS",
  "GIT_OBJECT_DIRECTORY",
  "GIT_PREFIX",
  "GIT_QUARANTINE_PATH",
  "GIT_REPLACE_REF_BASE",
  "GIT_SHALLOW_FILE",
  "GIT_SUPER_PREFIX",
  "GIT_TEMPLATE_DIR",
  "GIT_WORK_TREE",
] as const;

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

describe("resources submodule initialization", () => {
  test("initializes an empty configured resource gitlink from a linked worktree", () => {
    const fixture = createSubmoduleFixture();
    prepareEmptyConfiguredGitlink(fixture);

    const result = runInitScript(fixture, createNormalHelperInvocationEnvironment());

    expect(result.status).toBe(0);
    expect(readFileSync(join(fixture.checkoutPath, "resource.txt"), "utf8")).toBe(
      "fixture resource\n"
    );
    expect(
      git(
        fixture.checkoutPath,
        ["rev-parse", "--show-toplevel"],
        fixture.constructionEnv
      ).stdout.trim()
    ).toBe(realpathSync(fixture.checkoutPath));
  });

  test("leaves a nonempty non-submodule directory untouched and fails clearly", () => {
    const fixture = createSubmoduleFixture();
    prepareEmptyConfiguredGitlink(fixture);
    const sentinelPath = join(fixture.checkoutPath, "do-not-delete.txt");
    writeFileSync(sentinelPath, "local data\n");
    const entriesBefore = readdirSync(fixture.checkoutPath);

    const result = runInitScript(fixture, createNormalHelperInvocationEnvironment());

    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain(
      `Submodule '${submodulePath}' exists but is not a git checkout.`
    );
    expect(result.stdout + result.stderr).toContain(
      "Move it aside or delete it, then re-run: bun run resources:init"
    );
    expect(readdirSync(fixture.checkoutPath)).toEqual(entriesBefore);
    expect(readFileSync(sentinelPath, "utf8")).toBe("local data\n");
  });

  test("preserves required global config without running a hostile post-checkout hook", () => {
    const fixture = createSubmoduleFixture({ useResourceAlias: true });
    prepareEmptyConfiguredGitlink(fixture);
    const hostileInvocation = createHostileHelperInvocation(fixture.root, fixture.source);

    const result = runInitScript(fixture, hostileInvocation.env);

    expect(result.status).toBe(0);
    expect(readFileSync(join(fixture.checkoutPath, "resource.txt"), "utf8")).toBe(
      "fixture resource\n"
    );
    expect(existsSync(hostileInvocation.hookMarkerPath)).toBe(false);
    expect(result.stdout + result.stderr).not.toContain("HOST_HOOK_RAN");
  });
});

interface SubmoduleFixture {
  checkoutPath: string;
  constructionEnv: NodeJS.ProcessEnv;
  root: string;
  source: string;
  worktree: string;
}

function createSubmoduleFixture({
  useResourceAlias = false,
}: {
  useResourceAlias?: boolean;
} = {}): SubmoduleFixture {
  const root = createTempRoot("civ7-resources-init-");
  const constructionEnv = createFixtureConstructionEnvironment(root);

  const source = join(root, "resources-source");
  const superproject = join(root, "superproject");
  mkdirSync(source);
  mkdirSync(superproject);

  git(source, ["init", "--initial-branch=main"], constructionEnv);
  configureGitIdentity(source, constructionEnv);
  writeFileSync(join(source, "resource.txt"), "fixture resource\n");
  git(source, ["add", "resource.txt"], constructionEnv);
  git(source, ["commit", "-m", "Add fixture resource"], constructionEnv);

  git(superproject, ["init", "--initial-branch=main"], constructionEnv);
  configureGitIdentity(superproject, constructionEnv);
  git(superproject, ["submodule", "add", "--", source, submodulePath], constructionEnv);
  git(superproject, ["commit", "-m", "Add resources submodule"], constructionEnv);
  if (useResourceAlias) {
    git(
      superproject,
      ["config", "-f", ".gitmodules", `submodule.${submodulePath}.url`, resourceAlias],
      constructionEnv
    );
    git(superproject, ["add", ".gitmodules"], constructionEnv);
    git(superproject, ["commit", "-m", "Use fixture resource alias"], constructionEnv);
  }
  git(superproject, ["submodule", "deinit", "--force", "--", submodulePath], constructionEnv);

  const primaryCheckoutPath = join(superproject, submodulePath);
  rmSync(primaryCheckoutPath, { force: true, recursive: true });
  rmSync(join(superproject, ".git", "modules", submodulePath), {
    force: true,
    recursive: true,
  });

  const worktree = join(root, "linked-checkout");
  git(superproject, ["worktree", "add", "--detach", worktree, "HEAD"], constructionEnv);

  return {
    checkoutPath: join(worktree, submodulePath),
    constructionEnv,
    root,
    source,
    worktree,
  };
}

function prepareEmptyConfiguredGitlink(fixture: SubmoduleFixture): void {
  expect(readFileSync(join(fixture.worktree, ".git"), "utf8")).toContain("gitdir: ");
  expect(
    git(fixture.worktree, ["ls-files", "--stage", "--", submodulePath], fixture.constructionEnv)
      .stdout
  ).toMatch(new RegExp(`^160000 [0-9a-f]{40} 0\\t${submodulePath}$`, "m"));

  mkdirSync(fixture.checkoutPath, { recursive: true });
  expect(readdirSync(fixture.checkoutPath)).toEqual([]);
}

function createTempRoot(prefix: string): string {
  const root = mkdtempSync(join(tmpdir(), prefix));
  tempRoots.push(root);
  return root;
}

function withoutInheritedGitEnvironment(inheritedEnv: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const env = { ...inheritedEnv };
  for (const variable of gitEnvironmentVariablesToClear) delete env[variable];
  for (const variable of Object.keys(env)) {
    if (/^GIT_CONFIG_(?:COUNT|KEY_\d+|VALUE_\d+)$/.test(variable)) delete env[variable];
  }

  return env;
}

function createFixtureConstructionEnvironment(root: string): NodeJS.ProcessEnv {
  const env = withoutInheritedGitEnvironment(process.env);

  const templateDirectory = join(root, "git-templates");
  mkdirSync(templateDirectory);

  return {
    ...env,
    GIT_ALLOW_PROTOCOL: "file",
    GIT_CONFIG_GLOBAL: devNull,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_SYSTEM: devNull,
    GIT_TEMPLATE_DIR: templateDirectory,
  };
}

function createNormalHelperInvocationEnvironment(): NodeJS.ProcessEnv {
  return {
    ...withoutInheritedGitEnvironment(process.env),
    GIT_ALLOW_PROTOCOL: "file",
    GIT_CONFIG_GLOBAL: devNull,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_SYSTEM: devNull,
  };
}

interface HostileHelperInvocation {
  env: NodeJS.ProcessEnv;
  hookMarkerPath: string;
}

function createHostileHelperInvocation(root: string, source: string): HostileHelperInvocation {
  const env = withoutInheritedGitEnvironment(process.env);
  const hooksPath = join(root, "hostile-helper-hooks");
  const hostileConfig = join(root, "hostile-helper.gitconfig");
  const hookMarkerPath = join(root, "HOST_HOOK_RAN");
  const postCheckoutHook = join(hooksPath, "post-checkout");
  mkdirSync(hooksPath);
  writeFileSync(
    postCheckoutHook,
    `#!/usr/bin/env bash\nprintf 'HOST_HOOK_RAN\\n' > '${hookMarkerPath}'\nprintf 'HOST_HOOK_RAN\\n' >&2\nexit 1\n`
  );
  chmodSync(postCheckoutHook, 0o755);
  writeFileSync(
    hostileConfig,
    `[core]\n\thooksPath = ${hooksPath}\n[url \"${source}\"]\n\tinsteadOf = ${resourceAlias}\n`
  );

  return {
    env: {
      ...env,
      GIT_ALLOW_PROTOCOL: "file",
      GIT_CONFIG_GLOBAL: hostileConfig,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_SYSTEM: devNull,
      GIT_DIR: join(root, "poisoned-git-dir"),
      GIT_INDEX_FILE: join(root, "poisoned-git-index"),
      GIT_PREFIX: "poisoned-prefix/",
      GIT_WORK_TREE: join(root, "poisoned-work-tree"),
    },
    hookMarkerPath,
  };
}

function configureGitIdentity(cwd: string, env: NodeJS.ProcessEnv): void {
  git(cwd, ["config", "user.name", "Civ7 CLI Test"], env);
  git(cwd, ["config", "user.email", "civ7-cli-test@example.invalid"], env);
}

function runInitScript(fixture: SubmoduleFixture, env: NodeJS.ProcessEnv): CommandResult {
  return run("bash", [initScript], fixture.worktree, env);
}

function git(cwd: string, args: string[], env: NodeJS.ProcessEnv): CommandResult {
  const result = run("git", args, cwd, env);
  if (result.status !== 0) {
    throw new Error(
      `git ${args.join(" ")} failed with status ${result.status}:\n${result.stdout}${result.stderr}`
    );
  }
  return result;
}

interface CommandResult {
  status: number | null;
  stderr: string;
  stdout: string;
}

function run(command: string, args: string[], cwd: string, env: NodeJS.ProcessEnv): CommandResult {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env,
  });
  if (result.error) throw result.error;
  return {
    status: result.status,
    stderr: result.stderr,
    stdout: result.stdout,
  };
}
