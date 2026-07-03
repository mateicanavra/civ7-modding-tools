# Design: Command Runner Test Drain

## Frame

Habitat is moving toward an Effect-first substrate where process execution,
timeouts, errors, and resources are modeled as provider capabilities. Unit tests
should validate owned policy with deterministic Effect tools; current-tree and
host behavior should be explicit validation targets.

The command provider already applies timeout policy with `Effect.timeoutFail`,
captures git state through `GitStateProvider`, and projects provider failures
into tagged errors. The previous tests forced those policies through live host
commands, which made them slower and less precise than the behavior under test.

## Ownership

- `tools/habitat-harness/src/providers/command/runner.ts` owns git-state
  capture, unavailable-error projection, and timeout transformation for command
  execution.
- `tools/habitat-harness/test/lib/command-runner.test.ts` owns fixture-level
  behavioral coverage for the command provider result/error contract.
- Live process spawning remains under the command provider and its integration
  consumers.

## Implementation

Export `captureCommandGitStateAround`, `commandUnavailableFromCause`, and
`interruptCommandOnTimeout` from the command provider runner module and reuse
the same helpers in live command execution. These helpers are not compatibility
surfaces; they are the named provider policies already used by the live path.

The git-state test wraps a fake command result in the provider capture helper,
then asserts before/after reads and result projection. The unavailable-command
test calls the provider failure projection directly with a fake host error.

The test builds a never-completing command effect, wraps it through the provider
timeout helper, forks it, advances `TestClock`, and joins the fiber. This proves
the exact timeout error contract without starting a host process or waiting on
wall-clock time.

## Risks

- The helper exports must not become a second public API model. They are
  internal provider-level functions for testing provider-owned policy.
- Real host spawn and missing-binary behavior are no longer covered by ordinary
  unit tests. If they need direct proof, that belongs to a provider smoke target.
