# Design: Deep Habitat Effect Hook Service Module

## Domain Boundary

Owner: hook service module, with hook runtime internals still owning the current
local feedback workflow.

Hook owns staged-worktree policy, local-only feedback labels, hook trace, and
stage ordering. Providers own tool and Git execution once the next hook runtime
drain lands. This service-module slice creates the correct callable ownership
boundary first, without changing the user-facing hook behavior.

## Target Flow

```text
Husky -> habitat hook CLI -> Habitat service client -> hook service module -> hook runtime
```

## Write Set

```text
tools/habitat-harness/src/service/modules/hook/**
tools/habitat-harness/src/service/contract.ts
tools/habitat-harness/src/service/router.ts
tools/habitat-harness/src/commands/hook.ts
tools/habitat-harness/src/lib/hooks.ts
tools/habitat-harness/test/service/hook-service.test.ts
tools/habitat-harness/test/service/service-architecture.test.ts
tools/habitat-harness/test/commands/habitat-commands.test.ts
tools/habitat-harness/test/lib/hooks.test.ts
```

## Required Cutover In This Slice

- Define a contract for `hook.run`.
- Bind the procedure through `effect-orpc` in `src/service/modules/hook`.
- Route the CLI through `client.hook.run`.
- Keep unknown hook name, pre-commit, and pre-push stream/exit behavior stable.
- Add tests that fail if the CLI imports or calls `runHook` directly.

## Follow-On Hook Runtime Drain

- `HookRuntime.runCommand` becomes provider Layer substitution.
- `HookRuntime.nowMs` becomes `HabitatClock`.
- Staged path reads use `GitProvider`.
- File hashes and existence use `HabitatFileSystem`.
- Biome formatting/checking uses `BiomeProvider`.
- Pattern checking uses the owned check service or Grit provider according to
  the check/baseline packet outcome.

## Stop Conditions

- `src/commands/hook.ts` calls `src/lib/hooks.ts` directly.
- The service module changes hook output from local workstation feedback.
- Partial-staging refusal or formatter restage behavior changes.
- The packet presents this service-module slice as a complete hook provider
  drain.
