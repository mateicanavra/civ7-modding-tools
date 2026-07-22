import path from "node:path";
import { Effect, Match } from "effect";
import type {
  ResourcePreCommitDecision,
  ResourceStateFacade,
  ResourceStateKind,
} from "../dto/hook.schema.js";
import type { HookProcedureContext } from "./procedure-context.policy.js";
import {
  allowedResourceDecision,
  refusedResourceDecision,
  resourceDecisionToFacade,
} from "./resource-decision.policy.js";
import type { HookResourcePolicy } from "./runtime.policy.js";

type ResourceInspectionContext = Pick<HookProcedureContext, "git" | "platform">;

export function classifyResourcesState(resourcePolicy?: HookResourcePolicy): ResourceStateFacade {
  return Match.value(resourcePolicy).pipe(
    Match.when(Match.undefined, () =>
      resourceDecisionToFacade(
        allowedResourceDecision("not-configured", "No hook resource policy is configured.")
      )
    ),
    Match.orElse(() =>
      resourceDecisionToFacade(
        allowedResourceDecision("clean", "Resource state is inspected by the hook service.")
      )
    )
  );
}

export function classifyResourcePreCommitDecisionEffect(
  context: ResourceInspectionContext,
  resourcePolicy?: HookResourcePolicy
) {
  return Match.value(resourcePolicy).pipe(
    Match.when(Match.undefined, () =>
      Effect.succeed(
        allowedResourceDecision("not-configured", "No hook resource policy is configured.")
      )
    ),
    Match.orElse((policy) => inspectConfiguredResourceEffect(context, policy))
  );
}

function inspectConfiguredResourceEffect(
  context: ResourceInspectionContext,
  resourcePolicy: HookResourcePolicy
) {
  const { git, platform } = context;
  const { pathExists, repoRoot } = platform;
  const resourcePath = normalizeResourcePath(repoRoot, resourcePolicy.path);
  const resourceCommands = resourcePolicy.commands;

  return Effect.gen(function* () {
    const admittedResourcePath = yield* Effect.succeed(resourcePath).pipe(
      Effect.filterOrFail(
        (candidate) => candidate.length > 0 && candidate !== ".." && !candidate.startsWith("../"),
        () =>
          resourceFailure("inspection-failed", "Hook resource policy path is outside the repo.", [
            resourceCommands.status,
          ])
      )
    );
    const resourcesRoot = path.join(repoRoot, admittedResourcePath);
    yield* Effect.succeed(resourcesRoot).pipe(
      Effect.filterOrFail(pathExists, () =>
        resourceFailure(
          "uninitialized",
          `The configured resource worktree is absent: ${admittedResourcePath}.`,
          [resourceCommands.init, resourceCommands.status]
        )
      ),
      Effect.asVoid
    );

    yield* git
      .command(["-C", resourcesRoot, "rev-parse", "--is-inside-work-tree"], { cwd: repoRoot })
      .pipe(
        Effect.mapError(() =>
          resourceFailure(
            "uninitialized",
            `${admittedResourcePath} is not an initialized Git worktree.`,
            [resourceCommands.init, resourceCommands.status]
          )
        ),
        Effect.filterOrFail(
          (result) => result.exit.code === 0,
          () =>
            resourceFailure(
              "uninitialized",
              `${admittedResourcePath} is not an initialized Git worktree.`,
              [resourceCommands.init, resourceCommands.status]
            )
        ),
        Effect.asVoid
      );

    const submoduleTopLevel = yield* git
      .command(["-C", resourcesRoot, "rev-parse", "--show-toplevel"], { cwd: repoRoot })
      .pipe(
        Effect.mapError(() =>
          resourceFailure(
            "uninitialized",
            `${admittedResourcePath} exists but is not an initialized resource Git worktree.`,
            [resourceCommands.init, resourceCommands.status]
          )
        ),
        Effect.filterOrFail(
          (result) =>
            result.exit.code === 0 &&
            path.resolve(result.stdout.text.trim()) === path.resolve(resourcesRoot),
          () =>
            resourceFailure(
              "uninitialized",
              `${admittedResourcePath} exists but is not an initialized resource Git worktree.`,
              [resourceCommands.init, resourceCommands.status]
            )
        )
      );
    void submoduleTopLevel;

    const gitDir = yield* git
      .command(["-C", resourcesRoot, "rev-parse", "--git-dir"], { cwd: repoRoot })
      .pipe(
        Effect.mapError(() =>
          resourceFailure(
            "uninitialized",
            `Could not inspect the ${admittedResourcePath} Git directory.`,
            [resourceCommands.init, resourceCommands.status]
          )
        ),
        Effect.filterOrFail(
          (result) => result.exit.code === 0,
          () =>
            resourceFailure(
              "uninitialized",
              `Could not inspect the ${admittedResourcePath} Git directory.`,
              [resourceCommands.init, resourceCommands.status]
            )
        )
      );

    const gitDirPath = gitDir.stdout.text.trim();
    const gitDirAbsolute = Match.value(path.isAbsolute(gitDirPath)).pipe(
      Match.when(true, () => gitDirPath),
      Match.orElse(() => path.join(resourcesRoot, gitDirPath))
    );
    const indexLockPath = path.join(gitDirAbsolute, "index.lock");
    yield* Effect.succeed(indexLockPath).pipe(
      Effect.filterOrFail(
        (candidate) => !pathExists(candidate),
        () =>
          resourceFailure("locked", `The resource Git index is locked: ${indexLockPath}.`, [
            resourceCommands.unlock,
            resourceCommands.status,
          ])
      ),
      Effect.asVoid
    );

    const submoduleStatus = yield* git
      .command(["-C", resourcesRoot, "status", "--porcelain"], { cwd: repoRoot })
      .pipe(
        Effect.mapError(() =>
          resourceFailure("uninitialized", `Could not inspect ${admittedResourcePath} status.`, [
            resourceCommands.init,
            resourceCommands.status,
          ])
        ),
        Effect.filterOrFail(
          (result) => result.exit.code === 0,
          () =>
            resourceFailure("uninitialized", `Could not inspect ${admittedResourcePath} status.`, [
              resourceCommands.init,
              resourceCommands.status,
            ])
        ),
        Effect.filterOrFail(
          (result) => result.stdout.text.trim().length === 0,
          () =>
            resourceFailure(
              "dirty-submodule",
              `${admittedResourcePath} has uncommitted resource changes.`,
              [resourceCommands.publish, resourceCommands.status]
            )
        )
      );
    void submoduleStatus;

    const unstagedGitlink = yield* git
      .command(["diff", "--quiet", "--", admittedResourcePath], { cwd: repoRoot })
      .pipe(
        Effect.mapError(() =>
          resourceFailure(
            "uninitialized",
            `Could not inspect the unstaged ${admittedResourcePath} gitlink state.`,
            [resourceCommands.init, resourceCommands.status]
          )
        )
      );
    yield* Match.value(unstagedGitlink.exit.code).pipe(
      Match.when(0, () => Effect.void),
      Match.when(1, () =>
        Effect.fail(
          resourceFailure(
            "unstaged-gitlink",
            `The ${admittedResourcePath} gitlink changed but is not staged.`,
            [`git add ${admittedResourcePath}`, resourceCommands.status]
          )
        )
      ),
      Match.orElse(() =>
        Effect.fail(
          resourceFailure(
            "uninitialized",
            `Could not inspect the unstaged ${admittedResourcePath} gitlink state.`,
            [resourceCommands.init, resourceCommands.status]
          )
        )
      )
    );

    const stagedGitlink = yield* git
      .command(["diff", "--cached", "--quiet", "--", admittedResourcePath], { cwd: repoRoot })
      .pipe(
        Effect.mapError(() =>
          resourceFailure(
            "uninitialized",
            `Could not inspect the staged ${admittedResourcePath} gitlink state.`,
            [resourceCommands.init, resourceCommands.status]
          )
        )
      );

    return yield* Match.value(stagedGitlink.exit.code).pipe(
      Match.when(0, () =>
        Effect.succeed(
          allowedResourceDecision(
            "clean",
            `${admittedResourcePath} is initialized, clean, and has no gitlink delta.`
          )
        )
      ),
      Match.when(1, () =>
        Effect.succeed(
          allowedResourceDecision(
            "staged-gitlink",
            `The ${admittedResourcePath} gitlink is staged and the resource worktree is clean.`
          )
        )
      ),
      Match.orElse(() =>
        Effect.fail(
          resourceFailure(
            "uninitialized",
            `Could not inspect the staged ${admittedResourcePath} gitlink state.`,
            [resourceCommands.init, resourceCommands.status]
          )
        )
      )
    );
  }).pipe(Effect.catchAll((decision) => Effect.succeed(decision)));
}

function normalizeResourcePath(repoRoot: string, resourcePath: string): string {
  const absolute = Match.value(path.isAbsolute(resourcePath)).pipe(
    Match.when(true, () => resourcePath),
    Match.orElse(() => path.join(repoRoot, resourcePath))
  );
  return path.relative(repoRoot, path.resolve(absolute)).split(path.sep).join("/");
}

function resourceFailure(
  kind: Exclude<ResourceStateKind, "clean" | "not-configured" | "staged-gitlink">,
  detail: string,
  remediation: string[]
): ResourcePreCommitDecision {
  return refusedResourceDecision(kind, detail, remediation);
}
