# Design: Runtime Config Errors

## Target Modules

```text
tools/habitat-harness/src/runtime/index.ts
tools/habitat-harness/src/runtime/habitat-runtime.ts
tools/habitat-harness/src/runtime/layers.ts
tools/habitat-harness/src/runtime/run.ts
tools/habitat-harness/src/runtime/test-layers.ts
tools/habitat-harness/src/config/index.ts
tools/habitat-harness/src/config/habitat-config.ts
tools/habitat-harness/src/config/schema.ts
tools/habitat-harness/src/config/sources.ts
tools/habitat-harness/src/config/paths.ts
tools/habitat-harness/src/errors/index.ts
tools/habitat-harness/src/errors/habitat-error.ts
tools/habitat-harness/src/errors/domain-errors.ts
tools/habitat-harness/src/errors/provider-errors.ts
tools/habitat-harness/src/errors/render.ts
tools/habitat-harness/src/resources/index.ts
tools/habitat-harness/src/resources/scope.ts
tools/habitat-harness/src/resources/clock.ts
tools/habitat-harness/src/resources/filesystem.ts
tools/habitat-harness/src/resources/temp-dir.ts
tools/habitat-harness/src/resources/cache.ts
tools/habitat-harness/src/resources/write-set.ts
tools/habitat-harness/src/resources/workspace-lock.ts
tools/habitat-harness/src/providers/command/**
tools/habitat-harness/src/providers/reporter/**
```

## Services

- `HabitatConfig`: repo root, harness root, cache roots, tool command policy,
  telemetry toggles, hook policy, local/CI mode, timeout policy, host policy
  source.
- `CommandRunner`: argument-array command execution with argv, cwd, env delta,
  stdout/stderr capture, exit code, signal/interruption, duration, output
  digest, and typed failure.
- `HabitatFileSystem`: read/write/stat/list/temp operations and finalizers.
- `HabitatClock`: time and duration through Effect Clock/TestClock.
- `HabitatReporter`: stdout/stderr/report events without direct process writes
  in domain code.
- `ResourceScope`: temp dirs, caches, locks, snapshots, subprocesses, and
  cleanup finalizers.

## Error Taxonomy

Expected failures SHALL use tagged errors or refusal data:

- `ConfigUnavailable`
- `CommandUnavailable`
- `CommandFailed`
- `CommandInterrupted`
- `FileReadFailed`
- `FileWriteFailed`
- `JsonParseFailed`
- `SchemaValidationFailed`
- `WorkspaceGraphUnavailable`
- `BaselineRefused`
- `ProtectedZoneRefused`
- `UnsafeStagedState`

Defects can still throw, but only after an impossible internal invariant is
violated.

## Transition

Existing `HabitatProcess` code is parity evidence and deleted migration
material only. The first live `CommandRunner` implementation SHALL live in
`src/providers/command/live.ts`, return typed command observations/errors, use
scoped resources/finalizers, provide a fake Layer, and remove library-local
`Effect.runSync` in the same packet.
