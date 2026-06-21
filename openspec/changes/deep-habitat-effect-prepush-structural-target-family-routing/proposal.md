# Change: Deep Habitat Effect Pre-Push Structural Target Family Routing

## Why

Habitat pre-push routing still treats any Habitat harness implementation edit as
if it affects every structural target. That makes ordinary source edits run
Grit fixture validation even when no Grit pattern, fixture, or structural target
declaration changed.

Nx already owns target execution and caching. Habitat should feed Nx the target
families that match the changed path family instead of asking for unrelated
structural lanes.

## What Changes

- Keep `@internal/habitat-harness:check` as the package-local validation target
  for Habitat harness implementation changes.
- Route boundary taxonomy implementation changes to `validate:boundary-taxonomy`.
- Route structural target declaration changes to both structural targets.
- Skip the Nx affected step when the selected plan has no affected targets.

## Non-Goals

- Do not change default repo-wide pre-push routing for non-Habitat paths.
- Do not change target definitions or Nx cache inputs.
- Do not add topology tests for structural enforcement.
