import type { HabitatCommandResult } from "@internal/habitat-harness/service/runtime/command/index";
import {
  GitProvider,
  type GitProviderRequirements,
} from "@internal/habitat-harness/service/runtime/git/index";
import { repoRoot, toRepoRelative } from "@internal/habitat-harness/service/runtime/paths";
import { Effect } from "effect";
import { classifyResourcesState } from "./resource-inspection.js";
import type { HookRuntime } from "./runtime.js";
import type { HookRepoSnapshot, ResourceStateKind } from "./schema.js";

export function captureRepoSnapshotEffect(
  runtime: HookRuntime,
  resourceState?: ResourceStateKind
): Effect.Effect<HookRepoSnapshot, never, GitProvider | GitProviderRequirements> {
  return Effect.gen(function* () {
    const git = yield* GitProvider;
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
