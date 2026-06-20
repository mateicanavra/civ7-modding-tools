# Design: Deep Habitat Effect Hook Service Ownership

## Domain Boundary

Owner: hook service module and hook runtime domain. Provider/resource drainage
for Git, Biome, Grit, filesystem, clock, and command execution remains a later
step.

Hook owns staged-worktree policy, local-only feedback labels, hook trace, and
stage ordering. This slice moves hook runtime material out of generic `lib`
ownership and keeps command-level hook orchestration behind the Effect-oRPC
module without changing user-facing hook behavior.

## Target Flow

```text
Husky -> habitat hook CLI -> Habitat service client -> hook service module -> hook runtime domain
```

## Write Set

```text
tools/habitat-harness/src/service/modules/hook/**
tools/habitat-harness/src/domains/hook-runtime/**
tools/habitat-harness/src/service/contract.ts
tools/habitat-harness/src/service/router.ts
tools/habitat-harness/src/commands/hook.ts
tools/habitat-harness/test/service/hook-service.test.ts
tools/habitat-harness/test/service/service-architecture.test.ts
tools/habitat-harness/test/commands/habitat-commands.test.ts
tools/habitat-harness/test/lib/hooks.test.ts
```

Deleted path:

```text
tools/habitat-harness/src/lib/hooks.ts
tools/habitat-harness/src/lib/hook-runtime/**
```

## Required Cutover In This Slice

- Define a contract for `hook.run`.
- Bind the procedure through `effect-orpc` in `src/service/modules/hook`.
- Own hook name dispatch, pre-commit stage orchestration, pre-push base/affected
  orchestration, and stream rendering in the hook service module.
- Refuse `D0-package-export-symbol-runhook`; this slice does not add a
  replacement package helper export or a compatibility wrapper.
- Refuse `D0-package-export-source-hooks-internal`; this slice does not add an
  aggregate compatibility wrapper for old `runPreCommit`, `runPrePush`,
  `createHookTrace`, resource-state helper, reporter/runtime type, or trace type
  exports.
- Route the CLI through `client.hook.run`.
- Move hook runtime contracts, staged worktree helpers, resource decisions,
  pre-push base resolution, lifecycle capture, and command tracing into
  `src/domains/hook-runtime/**`.
- Keep unknown hook name, pre-commit, and pre-push stream/exit behavior stable.
- Add tests that fail if the CLI or hook service imports a `lib/hooks` path
  directly.
  Add tests that fail if active hook runtime feature logic remains under
  `src/lib/hook-runtime/**`.

## Follow-On Provider Drain

- `HookRuntime.runCommand` becomes provider Layer substitution.
- `HookRuntime.nowMs` becomes `HabitatClock`.
- Staged path reads use `GitProvider`.
- File hashes and existence use `HabitatFileSystem`.
- Biome formatting/checking uses `BiomeProvider`.
- Pattern checking uses the owned check service or Grit provider according to
  the check/baseline packet outcome.

## Stop Conditions

- `src/commands/hook.ts` calls a `src/lib/hooks.ts` wrapper directly.
- `src/service/modules/hook/run.ts` delegates command orchestration to a
  `lib/hooks` wrapper.
- The service module changes hook output from local workstation feedback.
- Partial-staging refusal or formatter restage behavior changes.
- The packet presents this service-module slice as a complete hook provider
  drain.
