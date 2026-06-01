# Resource Placement Diversity Design

## Decision

Change `placement/plan-resources` resource type selection from first-under-cap
offset shifting to balanced offset selection.

Tile candidate scoring remains unchanged. For each selected tile candidate, the
planner still starts from the environmental signature's preferred resource
offset, but it chooses the least-used candidate resource type, breaking ties by
forward circular offset from the preferred type.

## Root Cause Addressed

The old algorithm used:

```text
preferred offset -> first type under per-type cap -> next type only after cap
```

On maps where many high-priority tiles share similar fertility, moisture,
temperature, and aridity signatures, that fills a few adjacent resource ids
before considering the rest of the adapter catalog. The per-type share cap
limits a single id but does not guarantee broad catalog coverage.

The new algorithm uses:

```text
preferred offset -> least-used type under cap -> nearest offset tie-break
```

That preserves environmental determinism while ensuring a map with enough
placements spreads assignments across all available candidate resource ids.

## Boundaries

- This is a runtime-facing diversity repair for the transitional placement
  planner.
- It does not claim symbolic resource types are verified against runtime numeric
  ids.
- It does not use the symbolic group plans as materialization inputs yet.
- It does not claim earthlike expected ranges are satisfied in-game.

## Follow-Up Repair Boundary

This slice repairs stale rollup closure metadata in a follow-up branch because
`codex/resource-group-plan-rollup` was already locally committed clean at
`d4150abe8106` before this branch was opened.

## Write Set

- `mods/mod-swooper-maps/src/domain/placement/ops/plan-resources/strategies/default.ts`
- `mods/mod-swooper-maps/test/placement/plan-ops.test.ts`
- `openspec/changes/resource-group-plan-rollup/**`
- `openspec/changes/resource-placement-diversity/**`
- `openspec/changes/resource-runtime-proof/**`
