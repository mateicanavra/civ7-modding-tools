# Change: Deep Habitat Effect Command Runner Test Drain

## Why

`command-runner.test.ts` used live host commands to prove provider behavior:
spawning Node to assert git-state wrapping, probing the host `PATH` to assert
unavailable-command errors, and starting a never-ending process to assert
timeout policy. That made the unit suite pay for host process management,
wall-clock timing, and OS behavior to test policy owned by the Effect command
provider.

Habitat should keep command provider policy testable through Effect services,
fakes, and test clocks. Live process behavior belongs to provider integration
and smoke surfaces, not ordinary unit tests.

## What Changes

- Expose provider-owned command helper seams for git-state capture,
  unavailable-error projection, and timeout interruption.
- Replace live git-state command execution with a fake command result wrapped by
  the provider git-state capture helper.
- Replace live missing-binary probing with direct unavailable-error projection
  coverage.
- Replace the live never-ending Node command timeout test with a deterministic
  `Effect.never` + `TestClock` unit test.
- Preserve the existing `CommandInterrupted` contract: command id, timeout, cwd,
  signal, and cause remain unchanged.

## Non-Goals

- Do not change command materialization.
- Do not remove live command execution from the command provider.
- Do not add structural/topology enforcement tests.
- Do not add compatibility shims, fallback paths, or duplicate timeout models.

## Validation

- `bun run --cwd tools/habitat-harness test -- command-runner.test.ts` must pass
  without spawning command fixtures.
- Package check/build and OpenSpec validation must stay green before closure.
