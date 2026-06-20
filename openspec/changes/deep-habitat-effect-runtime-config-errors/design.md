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
tools/habitat-harness/src/resources/filesystem.ts
tools/habitat-harness/src/resources/temp-dir.ts
tools/habitat-harness/src/resources/cache.ts
tools/habitat-harness/src/resources/time.ts
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
- Native Effect platform services: filesystem and clock capabilities come from
  `@effect/platform-node` and `effect/Clock`.
- `HabitatFileSystem` helpers: Habitat tagged-error translation plus sync
  import-time/classification edges over platform filesystem ownership.
- `HabitatReporter`: stdout/stderr/report events without direct process writes
  in domain code.
- Habitat resources: temp/cache/time helpers only where Habitat owns semantics
  beyond the native platform service.

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
material only. The live `CommandRunner` implementation SHALL return typed
command observations/errors, use scoped platform resources/finalizers, provide a
fake Layer, and avoid library-local `Effect.runSync`.

`deep-habitat-effect-native-platform-resource-drain` supersedes the earlier
local clock/filesystem/scope/write-set/lock shape: Habitat does not own duplicate
resource services where Effect already provides the capability.
