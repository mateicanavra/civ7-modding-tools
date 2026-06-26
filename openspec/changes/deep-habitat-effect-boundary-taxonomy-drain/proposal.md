# Change: Deep Habitat Effect Boundary Taxonomy Drain

## Why

`@internal/habitat-harness:test` currently runs a live Nx project-graph audit in
`boundary-taxonomy.test.ts`. That makes the package unit suite pay for current
workspace topology and repeats the exact structural-enforcement smell this
refactor is removing: repository topology belongs to graph/structural tooling,
not ordinary tests.

Habitat should make repository structure executable through named tools. Unit
tests should keep the pure parser and audit model honest. Current workspace
taxonomy validation should be an explicit cacheable Nx/Habitat validation target
with the right inputs.

## What Changes

- Move the current-workspace boundary taxonomy audit into a dedicated
  `validate:boundary-taxonomy` script and Nx target.
- Include the target in root `bun run check` and Habitat verify/pre-push target
  planning so the audit stays on the normal validation path.
- Keep `boundary-taxonomy.test.ts` focused on pure parsing and audit behavior
  using bounded fixtures.
- Preserve the existing `boundaries` target as the import-edge enforcement
  owner.
- Document the validation target as the place to run taxonomy/config/manifest
  drift checks.

## Non-Goals

- Do not weaken the boundary taxonomy audit.
- Do not make tests enforce current workspace topology.
- Do not add another graph legality engine.
- Do not hide the audit behind a compatibility script or silent skip.

## Validation

- `bun run --cwd tools/habitat-harness test` should no longer spend most of its
  time in a live graph audit.
- `nx run @internal/habitat-harness:validate:boundary-taxonomy` must pass.
- Existing Habitat checks and OpenSpec validation must stay green.
