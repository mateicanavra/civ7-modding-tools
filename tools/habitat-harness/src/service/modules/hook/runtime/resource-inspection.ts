import { existsSync } from "node:fs";
import path from "node:path";
import {
  GitProvider,
  type GitProviderRequirements,
} from "@internal/habitat-harness/service/runtime/git/index";
import { repoRoot, toRepoRelative } from "@internal/habitat-harness/service/runtime/paths";
import { Effect } from "effect";
import {
  allowedResourceDecision,
  refusedResourceDecision,
  resourceDecisionToFacade,
} from "./resource.js";
import type { HookRuntime } from "./runtime.js";
import type {
  ResourcePreCommitDecision,
  ResourceStateFacade,
  ResourceStateKind,
} from "./schema.js";

export function classifyResourcesState(runtime: HookRuntime = {}): ResourceStateFacade {
  if (!runtime.resourcePolicy) {
    return resourceDecisionToFacade(
      allowedResourceDecision("not-configured", "No hook resource policy is configured.")
    );
  }
  return resourceDecisionToFacade(
    allowedResourceDecision("clean", "Resource state is inspected by the hook service.")
  );
}

export function classifyResourcePreCommitDecisionEffect(
  runtime: HookRuntime = {}
): Effect.Effect<ResourcePreCommitDecision, never, GitProvider | GitProviderRequirements> {
  if (!runtime.resourcePolicy) {
    return Effect.succeed(
      allowedResourceDecision("not-configured", "No hook resource policy is configured.")
    );
  }
  const pathExists = runtime.pathExists ?? existsSync;
  const resourcePath = normalizeResourcePath(runtime.resourcePolicy.path);
  const resourceCommands = runtime.resourcePolicy.commands;
  if (!resourcePath || resourcePath === ".." || resourcePath.startsWith("../")) {
    return Effect.succeed(
      resourceFailure("inspection-failed", "Hook resource policy path is outside the repo.", [
        resourceCommands.status,
      ])
    );
  }
  const resourcesRoot = path.join(repoRoot, resourcePath);
  if (!pathExists(resourcesRoot)) {
    return Effect.succeed(
      resourceFailure(
        "uninitialized",
        `The configured resource worktree is absent: ${resourcePath}.`,
        [resourceCommands.init, resourceCommands.status]
      )
    );
  }

  return Effect.gen(function* () {
    const git = yield* GitProvider;
    const insideWorktree = yield* git
      .command(["-C", resourcesRoot, "rev-parse", "--is-inside-work-tree"], { cwd: repoRoot })
      .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
    if (!insideWorktree || insideWorktree.exit.code !== 0) {
      return resourceFailure(
        "uninitialized",
        `${resourcePath} is not an initialized Git worktree.`,
        [resourceCommands.init, resourceCommands.status]
      );
    }

    const submoduleTopLevel = yield* git
      .command(["-C", resourcesRoot, "rev-parse", "--show-toplevel"], { cwd: repoRoot })
      .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
    if (
      !submoduleTopLevel ||
      submoduleTopLevel.exit.code !== 0 ||
      path.resolve(submoduleTopLevel.stdout.text.trim()) !== path.resolve(resourcesRoot)
    ) {
      return resourceFailure(
        "uninitialized",
        `${resourcePath} exists but is not an initialized resource Git worktree.`,
        [resourceCommands.init, resourceCommands.status]
      );
    }

    const gitDir = yield* git
      .command(["-C", resourcesRoot, "rev-parse", "--git-dir"], { cwd: repoRoot })
      .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
    if (!gitDir || gitDir.exit.code !== 0) {
      return resourceFailure(
        "uninitialized",
        `Could not inspect the ${resourcePath} Git directory.`,
        [resourceCommands.init, resourceCommands.status]
      );
    }

    const gitDirPath = gitDir.stdout.text.trim();
    const gitDirAbsolute = path.isAbsolute(gitDirPath)
      ? gitDirPath
      : path.join(resourcesRoot, gitDirPath);
    if (pathExists(path.join(gitDirAbsolute, "index.lock"))) {
      return resourceFailure(
        "locked",
        `The resource Git index is locked: ${path.join(gitDirAbsolute, "index.lock")}.`,
        [resourceCommands.unlock, resourceCommands.status]
      );
    }

    const submoduleStatus = yield* git
      .command(["-C", resourcesRoot, "status", "--porcelain"], { cwd: repoRoot })
      .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
    if (!submoduleStatus || submoduleStatus.exit.code !== 0) {
      return resourceFailure("uninitialized", `Could not inspect ${resourcePath} status.`, [
        resourceCommands.init,
        resourceCommands.status,
      ]);
    }
    if (submoduleStatus.stdout.text.trim()) {
      return resourceFailure(
        "dirty-submodule",
        `${resourcePath} has uncommitted resource changes.`,
        [resourceCommands.publish, resourceCommands.status]
      );
    }

    const unstagedGitlink = yield* git
      .command(["diff", "--quiet", "--", resourcePath], { cwd: repoRoot })
      .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
    if (unstagedGitlink?.exit.code === 1) {
      return resourceFailure(
        "unstaged-gitlink",
        `The ${resourcePath} gitlink changed but is not staged.`,
        [`git add ${resourcePath}`, resourceCommands.status]
      );
    }
    if (!unstagedGitlink || unstagedGitlink.exit.code !== 0) {
      return resourceFailure(
        "uninitialized",
        `Could not inspect the unstaged ${resourcePath} gitlink state.`,
        [resourceCommands.init, resourceCommands.status]
      );
    }

    const stagedGitlink = yield* git
      .command(["diff", "--cached", "--quiet", "--", resourcePath], { cwd: repoRoot })
      .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
    if (stagedGitlink?.exit.code === 1) {
      return allowedResourceDecision(
        "staged-gitlink",
        `The ${resourcePath} gitlink is staged and the resource worktree is clean.`
      );
    }
    if (!stagedGitlink || stagedGitlink.exit.code !== 0) {
      return resourceFailure(
        "uninitialized",
        `Could not inspect the staged ${resourcePath} gitlink state.`,
        [resourceCommands.init, resourceCommands.status]
      );
    }

    return allowedResourceDecision(
      "clean",
      `${resourcePath} is initialized, clean, and has no gitlink delta.`
    );
  });
}

function normalizeResourcePath(resourcePath: string): string {
  const absolute = path.isAbsolute(resourcePath) ? resourcePath : path.join(repoRoot, resourcePath);
  return toRepoRelative(absolute);
}

function resourceFailure(
  kind: Exclude<ResourceStateKind, "clean" | "not-configured" | "staged-gitlink">,
  detail: string,
  remediation: string[]
): ResourcePreCommitDecision {
  const refusedKind = kind === "uninitialized" ? "uninitialized" : kind;
  return refusedResourceDecision(refusedKind, detail, remediation);
}
