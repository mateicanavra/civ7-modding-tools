import type { HabitatCommandResult } from "@internal/habitat-harness/resources/command/index";
import type {
  GitProviderRequirements,
  GitProviderService,
} from "@internal/habitat-harness/providers/git/index";
import { toRepoRelative } from "@internal/habitat-harness/resources/paths";
import { Effect } from "effect";
import { classifyResourcesState } from "./resource-inspection.js";
import type { HookRuntime } from "./runtime.js";
import type { HookRepoSnapshot, ResourceStateKind } from "./schema.js";

export function captureRepoSnapshotEffect(
  context: { readonly git: GitProviderService; readonly repoRoot: string },
  runtime: HookRuntime,
  resourceState?: ResourceStateKind
): Effect.Effect<HookRepoSnapshot, never, GitProviderRequirements> {
  return Effect.gen(function* () {
    const { git, repoRoot } = context;
    const branch = yield* git.currentBranch({ cwd: repoRoot });
    const head = yield* git.head({ cwd: repoRoot });
    const staged = yield* git
      .diffNameOnly({ cached: true, cwd: repoRoot })
      .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
    const unstaged = yield* git
      .diffNameOnly({ cwd: repoRoot })
      .pipe(Effect.catchAll(() => Effect.succeed(undefined)));

    return {
      branch,
      head,
      stagedPaths: parsePathList(staged),
      unstagedPaths: parsePathList(unstaged),
      resourceState: resourceState ?? classifyResourcesState(runtime).kind,
    };
  });
}

function parsePathList(result: HabitatCommandResult | undefined): string[] {
  if (!result || result.exit.code !== 0 || !result.stdout.text) return [];
  return result.stdout.text.split("\0").filter(Boolean).map(toRepoRelative);
}
