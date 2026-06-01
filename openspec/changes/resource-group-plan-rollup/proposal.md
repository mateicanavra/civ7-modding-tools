## Why

All four official resource expectation groups now have symbolic planning ops.
The next architecture boundary is a group-plan rollup artifact that downstream
merge, stats, and runtime-proof slices can consume without reaching into
individual group strategy internals.

This slice introduces that rollup without changing placement behavior.

## Target Authority Refs

- `openspec/changes/resource-stage-architecture`: `plan-resource-groups`
  consumes group plans and publishes `artifact:resources.groupPlans`.
- `openspec/changes/resource-aquatic-operation-contract`
- `openspec/changes/resource-cultivated-operation-contract`
- `openspec/changes/resource-terrestrial-operation-contract`
- `openspec/changes/resource-geological-operation-contract`

## What Changes

- Add `resources/plan-resource-groups`.
- Consume the four reviewed symbolic group-plan outputs.
- Publish `artifact:resources.groupPlans` with deterministic group summaries,
  total row/status counts, missing-resource rollup, and duplicate ownership
  blockers.
- Keep `runtimeIdStatus = "unverified"` and `proofStatus = "warning-only"`.

## Explicit Non-Goals

- No resource placement behavior change.
- No resource input derivation, scoring, intent merge, or materialization.
- No runtime numeric id verification.
- No stats hard gate or game restart proof.
- No external Graphite submission/PR delivery claim.

## Verification Gates

- `bun run --cwd mods/mod-swooper-maps test -- test/resources/resource-group-rollup-op-contract.test.ts test/resources/resource-geological-op-contract.test.ts test/resources/resource-terrestrial-op-contract.test.ts test/resources/resource-cultivated-op-contract.test.ts test/resources/resource-aquatic-op-contract.test.ts test/resources/resource-earthlike-expectations-artifact.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate resource-group-plan-rollup --strict`
- `bun run openspec:validate`
- `git diff --check`
