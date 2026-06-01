## Why

The symbolic resource contracts now prove that every official resource remains
visible in planning records, but the runtime-facing placement planner can still
collapse actual numeric resource assignments into a small adjacent subset. The
current planner starts from an environmental signature offset and only shifts
when the current type reaches a high share cap, so maps with similar candidate
scores can repeatedly choose the same few resource ids.

This slice repairs that distribution bottleneck without changing placement
candidate scoring, adapter materialization, or runtime id proof.

## Target Authority Refs

- `openspec/changes/resource-distribution-root-cause`: only a minority of
  resources appear in generated maps.
- `openspec/changes/resource-group-plan-rollup`: symbolic group plans remain
  visible upstream of runtime-facing placement.
- `openspec/changes/resource-stage-architecture`: runtime behavior changes
  must preserve evidence boundaries and avoid overclaiming hard proof.

## What Changes

- Balance numeric resource type assignment across the adapter-owned candidate
  resource catalog.
- Keep existing tile candidate scoring and spacing behavior.
- Preserve deterministic ordering by preferring the nearest eligible offset when
  per-type counts tie.
- Add regression coverage showing uniform candidate pressure uses the full
  candidate catalog with near-even counts.

## Explicit Non-Goals

- No symbolic-to-runtime id verification.
- No placement materialization rewrite.
- No stats hard gate or game restart proof.
- No change to the expected-count research artifact.
- No external Graphite submission/PR delivery claim.

## Verification Gates

- `bun test mods/mod-swooper-maps/test/placement/plan-ops.test.ts`
- `bun run --cwd mods/mod-swooper-maps test -- test/resources/resource-group-rollup-op-contract.test.ts test/resources/resource-geological-op-contract.test.ts test/resources/resource-terrestrial-op-contract.test.ts test/resources/resource-cultivated-op-contract.test.ts test/resources/resource-aquatic-op-contract.test.ts test/resources/resource-earthlike-expectations-artifact.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate resource-placement-diversity --strict`
- `bun run openspec:validate`
- `git diff --check`
