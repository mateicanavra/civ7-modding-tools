# Change: Deep Habitat Effect Runtime Config Errors

## Why

Habitat currently has multiple process runners, scattered config, direct clocks
and filesystem access, and uneven error semantics. The refactor needs a shared
Effect runtime substrate before vendor providers and domain services can be
migrated.

## What Changes

- Add `src/substrate/runtime/**` for substrate layer assembly and
  `src/service/runtime/**` for service implementer runtime composition.
- Add `src/substrate/config/**`, `src/substrate/errors/**`,
  `src/substrate/resources/**`, `src/substrate/providers/command/**`, and
  `src/substrate/providers/reporter/**` for config, typed errors, scoped
  resources, process execution, reporting, and test layers.
- Keep `Effect.run*` out of reusable source; service runtime, host/framework
  entrypoints, and tests are explicit execution edges.
- Convert expected failures to tagged errors or explicit refusal data.
- Preserve current public command behavior while internals move.

## What Does Not Change

- No vendor-specific command semantics are claimed in this packet.
- No CheckReport or command JSON shape changes.
- No hook behavior changes beyond using shared substrate in later packets.

## Affected Owners

- `tools/habitat-harness/src/lib/workspace-tools.ts`
- New `tools/habitat-harness/src/substrate/runtime/**`
- New `tools/habitat-harness/src/substrate/providers/command/**`
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
