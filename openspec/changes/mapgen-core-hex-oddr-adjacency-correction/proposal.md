## Why

`@swooper/mapgen-core` models the Civ7 plot grid as **odd-Q** (column-offset,
neighbor parity keyed on `x & 1`). The live Civ7 engine grid is **odd-R**
(pointy-top, row-offset, odd rows shifted east; neighbor parity keyed on
`y & 1`). Nothing at the engine boundary compensates — the adapter writes model
index `i = y*width + x` straight through to engine plot `(x, y)`.

This is a documented mislabel (`docs/projects/mapgen-studio-redesign/research/03-hex-convention-audit.md`,
2026-06-11). The two adjacency graphs share the four orthogonal-ish neighbors
but disagree on the diagonal pair: the mod's odd-Q neighbor set differs from the
engine's odd-R neighbor set by **exactly one neighbor on every tile** (one
phantom neighbor the mod believes is adjacent, one true engine-neighbor it
misses). Everything authored from adjacency — coast classification, connected
components / landmass labeling, distance fields, flow/drainage routing, climate
vector fields (divergence/curl), resource and start spacing — is computed against
a graph that is off by one neighbor everywhere relative to what the engine
applies in play.

The first gameplay-visible symptom was the floating-island "coast notch":
isolated islands rendered with one deep-ocean tile touching land (a cliff wedge)
because a one-tile odd-Q coast ring missed the single engine-adjacent diagonal.
`agent-A-fix-island-coast-ring` (PR #1811) worked around it with a
convention-agnostic Moore-8 superset ring — correct for an OR-reduction
(promote-if-any-neighbor-is-land) but a band-aid that does not fix the model and
is silently wrong for exact-set consumers (flow routing picks one steepest
receiver; a phantom neighbor can become the outlet → river flows the wrong way).

The MockAdapter shares the odd-Q model, so neither the mock nor the diagnostics
dump can detect the mismatch; only the live engine render / `getAdjacentPlotLocation`
reveals it.

This change corrects the model at the root: migrate mapgen-core (and the
`@civ7/map-policy` duplicate) to the engine's odd-R convention, prove the exact
table against the live engine, and reconcile the coast ring back to the
canonical adjacency — superseding the Moore-8 workaround.

## Target Authority Refs

- Direct current user decision (this session): correct the adjacency model at the
  root, consolidate, and remove superseded patches.
- `docs/projects/mapgen-studio-redesign/research/03-hex-convention-audit.md`
  (engine-convention audit and disposition: studio renderer already migrated to
  odd-R; engine-side mapgen migration is the open workstream).
- `openspec/specs/mapgen-normalization-workstreams/spec.md`
- `mods/mod-swooper-maps/.../map-morphology/steps/plotCoasts.ts` and PR #1811
  `agent-A-fix-island-coast-ring` (the patch consolidated/superseded here).

## What Changes

- Make mapgen-core's grid adjacency canonical and **odd-R**: neighbor parity
  keyed on `y & 1`, with the west/east diagonal pairs of the engine grid.
- Pin the exact offset table with a **live `getAdjacentPlotLocation` probe**
  before committing the behavioral change (static evidence predicts the table;
  the probe confirms odd-R vs even-r and the diagonal signs).
- Correct the four independent odd-Q definitions consistently: the neighbor
  table (`hex-oddq.ts`), the hex-space projection + cube + distance
  (`hex-space.ts`), the duplicated vector-field offsets + direction vectors
  (`vector-field.ts`), and the `@civ7/map-policy` neighbor re-implementation
  (`policy-grid.ts`).
- Establish a **single canonical adjacency model**: the vector-field and
  map-policy duplicates derive from or match the canonical table.
- Rename the `OddQ` symbols to `OddR` so the names stop perpetuating the
  mislabel (mechanical, sequenced so the rename and the math correction are
  separable commits).
- Consolidate the coast-ring safety net (PR #1811): keep the guarantee that no
  land borders deep ocean, but compute the ring with the corrected odd-R
  adjacency and **remove the Moore-8 superset widening**. Supersede PR #1811.
- Update golden/stat expectations that shift because the adjacency graph changed,
  and prove the correction on the live engine.

## Requires

- Morphology land/water/topography truth as adjacency input (unchanged).
- A runnable live Civ7 adjacency probe path (`mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts`
  and the `civ7-live-map-launch-and-capture` runbook).

## Enables Parallel Work

- Flow/drainage routing, coastline metrics, and distance fields can assert
  engine-aligned adjacency invariants instead of working around the mislabel.
- Studio renderer (already odd-R) and the engine-side model become consistent,
  closing the open half of the hex-convention audit.
- Future adjacency-driven features (rivers, resources, climate) no longer need
  per-consumer convention-agnostic supersets.

## Affected Owners

- `packages/mapgen-core/src/lib/grid/neighborhood/hex-oddq.ts`
- `packages/mapgen-core/src/lib/grid/hex-space.ts`
- `packages/mapgen-core/src/lib/grid/vector-field.ts`
- `packages/mapgen-core/src/lib/grid/components.ts` and `flow-routing.ts`
  (consumers; verify they follow the corrected primitives)
- `packages/civ7-map-policy/src/policy-grid.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotCoasts.ts`
  (coast ring consolidation)
- `mods/mod-swooper-maps/src/domain/**` and `**/dev/diagnostics/**` call sites
  (no logic change; outputs shift, goldens/stat baselines update)
- mapgen-core, map-policy, and mod tests plus any golden/identity baselines that
  encode adjacency-derived output.

## Forbidden Owners

- No MockAdapter-only or dump-only proof of adjacency correctness — the mock
  shares the model and cannot reveal the mismatch.
- No two live adjacency conventions remaining in the codebase after this change.
- No per-consumer superset (Moore-8 or wider) left in place as the permanent fix
  for exact-set consumers once the canonical model is correct.
- No change to per-tile land/water *truth* ownership; only adjacency-derived
  classification and topology may shift.
- No re-opening of the coast-policy seeding redesign (islands injected after
  coastline metrics) — that root cause is handled by the coast-ring safety net
  and is out of this slice's scope.
- No product/in-game closure claimed from generated arrays, terrain readback, or
  Studio display alone.

## Stop Conditions

- The live probe shows the engine convention is not the predicted odd-R table:
  stop and re-derive the offset table from the probed truth before migrating.
- The migration changes per-tile land/water truth (it must only change
  adjacency-derived classification/topology).
- A renamed `OddR` primitive still computes odd-Q math, or a duplicate table is
  left keyed on `x & 1`.
- Generated maps still produce a coastless land tile on deep ocean under the
  corrected 6-neighbor ring, or the live engine still renders a notch.

## Verification Gates

- Live `getAdjacentPlotLocation` probe confirming the exact odd-R neighbor table
  for both row parities.
- mapgen-core unit tests (neighborhood, hex-space distance, vector-field
  divergence/curl), map-policy tests, and mod fixture tests green.
- Standard-pipeline diagnostics dump: zero land tiles bordering deep ocean with
  no coast ring under the **engine (odd-R) adjacency**, with the corrected
  6-neighbor ring and the Moore-8 widening removed.
- Pre-declared adjacency-delta expectations (coast/components/rivers/resources)
  vs observed, over a stable seed/config matrix.
- `bun run --cwd mods/mod-swooper-maps check`, biome, and OpenSpec strict
  validation.
- Live in-game render proof (closure gate): a generated map shows natural island
  coastlines with no notch and no floating plateaus on the live engine.
