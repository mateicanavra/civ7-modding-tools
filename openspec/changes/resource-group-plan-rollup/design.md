# Resource Group Plan Rollup Design

## Decision

Add a resource-domain operation:

```text
resources/plan-resource-groups
```

The op is a rollup boundary, not a strategy tuner. It consumes the four
symbolic group-planning outputs and publishes
`artifact:resources.groupPlans`.

## Consumed Inputs

- `aquaticPlan`: `resources/plan-aquatic-resources`
- `cultivatedPlan`: `resources/plan-cultivated-resources`
- `terrestrialPlan`: `resources/plan-terrestrial-resources`
- `geologicalPlan`: `resources/plan-geological-resources`

Each input must preserve warning-only proof and unverified runtime-id status.

## Published Output

The output artifact records:

- group count;
- stable group summaries for the four expected input boundaries;
- input group id observed for each boundary;
- per-resource plan rows for each group;
- total resource count;
- total planned, blocked, proxy-gap, and missing-expectation rows;
- total symbolic target intents and eligible tiles;
- duplicate resource ownership blockers;
- missing resource types across groups;
- one summary row per resource group.

## Invariants

- The required group set is strategy-owned and not caller-configurable.
- The op does not inspect group-local lane/proxy internals beyond status and
  counts, but it carries the per-resource rows forward so downstream merge
  slices do not reach back into individual group ops.
- Duplicate resource ownership is visible as a blocker instead of silently
  choosing a winner.
- Duplicate rows inside one group are visible as blockers.
- Miswired group inputs are visible as blockers while the output keeps one
  stable summary for each expected group boundary.
- The op emits no runtime numeric ids, no placement intents, and no adapter
  materialization calls.

## FireTuner Runtime-Proof Boundary

The `resource-runtime-proof` phase record owns final runtime proof. This
contract slice does not claim runtime proof and does not restart the game.

## Follow-Up Repair Boundary

This slice repairs stale geological closure metadata in a follow-up branch
because `codex/resource-geological-operation-contract` was already locally
committed clean at `7864f13bb` before this rollup branch was opened.

## Write Set

- `mods/mod-swooper-maps/src/domain/resources/ops/contracts.ts`
- `mods/mod-swooper-maps/src/domain/resources/ops/index.ts`
- `mods/mod-swooper-maps/src/domain/resources/ops/plan-resource-groups/**`
- `mods/mod-swooper-maps/test/resources/resource-group-rollup-op-contract.test.ts`
- `openspec/changes/resource-group-plan-rollup/**`
