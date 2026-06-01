## Why

The placement-diversity repair makes numeric resource assignments spread across
the adapter candidate catalog, but the existing world-balance stats only checked
resource accounting totals. They did not fail when only a small minority of
resource ids appeared.

This slice turns that repaired behavior into a local stats gate for shipped map
identities.

## Target Authority Refs

- `openspec/changes/resource-placement-diversity`: balanced numeric candidate
  resource assignment.
- `openspec/changes/resource-distribution-root-cause`: only a minority of
  resources appeared on generated maps.
- `openspec/changes/resource-stage-architecture`: local stats must preserve
  runtime proof boundaries and not overclaim symbolic id verification.

## What Changes

- Extend world-balance stats with unique planned/placed numeric resource type
  counts.
- Track min/max placed count per numeric resource id.
- Assert shipped map identities use every numeric candidate id they have enough
  placements to cover.
- Assert per-id placed counts remain near-even after the diversity repair.

## Explicit Non-Goals

- No symbolic `RESOURCE_*` to runtime numeric id verification.
- No FireTuner or game restart proof.
- No hard earthlike expected-range closure.
- No external Graphite submission/PR delivery claim.

## Verification Gates

- `bun test mods/mod-swooper-maps/test/pipeline/world-balance-stats.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate resource-diversity-stats-gate --strict`
- `bun run openspec:validate`
- `git diff --check`
