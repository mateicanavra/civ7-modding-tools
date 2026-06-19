# Design: Deep Habitat Effect Hook Runtime Cutover

## Domain Boundary

Owner: local-feedback domain.

Hook owns staged-worktree policy, local-only proof labels, hook trace, and stage
ordering. Providers own tool and Git execution.

## Write Set

```text
tools/habitat-harness/src/domains/local-feedback/**
tools/habitat-harness/src/lib/hooks.ts
tools/habitat-harness/src/lib/hook-runtime/**
tools/habitat-harness/src/commands/hook.ts
tools/habitat-harness/test/lib/hooks.test.ts
```

## Required Cutover

- `HookRuntime.runCommand` becomes provider Layer substitution.
- `HookRuntime.nowMs` becomes `HabitatClock`.
- Staged path reads use `GitProvider`.
- File hashes and existence use `HabitatFileSystem`.
- Biome formatting/checking uses `BiomeProvider`.
- Pattern checking uses `GritProvider` through `habitat check` or direct provider
  according to the check/baseline packet outcome.

## Stop Conditions

- Hook code calls `spawnSync`, `run`, or `Effect.run*` directly after closure.
- Hook output claims CI/product proof.
- Partial-staging refusal or formatter restage behavior changes without explicit
  D0/public contract update.
