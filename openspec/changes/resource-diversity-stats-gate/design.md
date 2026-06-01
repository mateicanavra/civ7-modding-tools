# Resource Diversity Stats Gate Design

## Decision

Promote numeric resource-id variety into the existing world-balance stats helper
and shipped-map test gate.

The gate remains numeric because runtime symbolic id proof has not landed. It
uses the adapter materialization outcome summary's numeric `resourceType`
values.

## Added Stats

- `resourceUniquePlannedTypes`
- `resourceUniquePlacedTypes`
- `resourcePlacedCountMinByType`
- `resourcePlacedCountMaxByType`

## Gate

For each shipped map identity in the world-balance stats test:

- planned unique type count must be at least `min(55, resourcePlannedCount)`;
- placed unique type count must be at least `min(55, resourcePlacedCount)`;
- placed-count spread across numeric ids must be at most one.

The current adapter candidate catalog contains 55 usable numeric ids in these
tests, so this gate catches a return to the previous minority-resource collapse
without claiming symbolic coverage.

## Follow-Up Repair Boundary

This slice repairs stale placement-diversity closure metadata in a follow-up
branch because `codex/resource-placement-diversity` was already locally
committed clean at `bc6c328c1edb` before this branch was opened.

## FireTuner Runtime-Proof Boundary

The `resource-runtime-proof` phase record owns final runtime proof. This stats
slice does not claim runtime proof and does not restart the game.

## Write Set

- `mods/mod-swooper-maps/test/support/world-balance-stats.ts`
- `mods/mod-swooper-maps/test/pipeline/world-balance-stats.test.ts`
- `openspec/changes/resource-placement-diversity/**`
- `openspec/changes/resource-diversity-stats-gate/**`
- `openspec/changes/resource-runtime-proof/**`
