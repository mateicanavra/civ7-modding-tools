# Change: Deep Habitat Effect Runtime Config Errors

## Why

Habitat currently has multiple process runners, scattered config, direct clocks
and filesystem access, and uneven error semantics. The refactor needs a shared
Effect runtime substrate before vendor providers and domain services can be
migrated.

## What Changes

- Add `src/runtime/**` for Effect program execution, layer assembly, and
  host-edge run functions.
- Add `src/config/**`, `src/errors/**`, `src/resources/**`,
  `src/providers/command/**`, and `src/providers/reporter/**` for config,
  typed errors, scoped resources, process execution, reporting, and test
  layers.
- Keep `Effect.run*` at host adapters and the named runtime bridge only.
- Convert expected failures to tagged errors or explicit refusal data.
- Preserve current public command behavior while internals move.

## What Does Not Change

- No vendor-specific command semantics are claimed in this packet.
- No CheckReport or command JSON shape changes.
- No hook behavior changes beyond using shared substrate in later packets.

## Affected Owners

- `tools/habitat-harness/src/lib/effect-runtime.ts`
- `tools/habitat-harness/src/lib/habitat-process.ts`
- `tools/habitat-harness/src/lib/workspace-tools.ts`
- `tools/habitat-harness/src/lib/spawn.ts`
- New `tools/habitat-harness/src/runtime/**`
- Habitat tests for runtime/fake layers.

## Stop Conditions

- A runtime resource can outlive command completion.
- A domain module calls `Effect.run*`.
- A command failure loses stdout/stderr/exit fidelity.
- A config source can only be read through ambient process state.

## Verification

- Static runtime-edge scan.
- Fake layer unit tests.
- Command parity smoke tests.
- `bun run --cwd tools/habitat-harness check`
- `bun run --cwd tools/habitat-harness test`
