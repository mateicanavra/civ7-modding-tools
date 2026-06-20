## Why

Generated maps badly distribute starts: roughly **half of all civs are always
crowded into one small land area**, near-deterministically. A four-lane
systematic investigation (recorded in
`docs/projects/start-distribution-homeland-rebalance/diagnosis.md`) proves the
cause is the **region model**, not the scorer:

- **RC1** the West/East partition is purely geometric — each landmass is bucketed
  by `bbox-center < width/2` with no land-area balancing
  (`plot-landmass-regions/index.ts:42-45`);
- **RC2** player counts are a fixed, capacity-blind `4/4` from `MapInfo`, mapped
  positionally onto the two slots (`runtime.ts:31-32`, `seat-identity.ts:35`);
- **RC3** the only reconciliation valve fires at *zero* candidates, never for an
  under-supplied region (`default.ts:702-719`);
- **RC4** selection is greedy quality-first with only a relaxable pairwise floor —
  no objective spreading seats across landmasses (`selection-ladder.ts`).

The current spacing gate (E1.5) measures only the pairwise minimum, so eight
starts can clump inside one small landmass and still pass — the bug is invisible
to the gate set. This change keeps Civ7's correct **two-homeland** model and
makes the partition + allocation **capacity-aware** with an explicit
**dispersion** objective.

## Target Authority Refs

- `docs/projects/start-distribution-homeland-rebalance/diagnosis.md` (root cause, file:line)
- `docs/projects/start-distribution-homeland-rebalance/design.md` (algorithm + dominoes + sequencing)
- `docs/projects/start-distribution-homeland-rebalance/expectations.md` (predeclared ER1–ER4 + preserved E1.x)
- `docs/projects/placement-realignment/expectations.md` (E1.x ledger this preserves)
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md` (controlling baseline)

## What Changes

Five dominoes (full algorithm in the project `design.md`; slice→branch map in
this change's `design.md`):

- **D0 — Region-balance metric.** New placement diagnostics: starts-per-region
  vs capacity, `maxSingleLandmassStartShare`, and a normalized spatial-spread
  index. Lands first to baseline the bug and prove before/after. No behavior
  change.
- **Policy primitives.** New `@civ7/map-policy` module `src/starts/`:
  `CIV7_START_PLACEMENT_POLICY_V0` (official 6/12 buffers, homeland model,
  `balanceBias`, `tilesPerStart`), `balancedHemisphereSplit`,
  `feasibleStartCeiling`, `apportionStartsByCapacity`, `dispersionScore` — pure,
  zero-dep, unit-tested. Exports the needed `policy-grid` hex helpers (odd-R).
- **D1 — Land-aware partition.** `plot-landmass-regions` replaces
  `centerX < width/2` with `balancedHemisphereSplit` (area-balanced meridian over
  settleable land; landmasses kept whole). Output slot space unchanged.
- **D2 — Capacity allocation.** `plan-starts` replaces the fixed positional split
  with `apportionStartsByCapacity` over per-region capacity + feasibility
  ceilings; total players `N` sourced from `getAliveMajorIds()`. `seat-identity`
  binds seats to the computed allocation.
- **D3 — Dispersion.** Per-landmass quotas + farthest-point (max-min) seeding in
  the selection ladder, with adaptive spread weight under capacity pressure.
- **D4 — Reconciliation + verification.** Zero-only valve becomes a true
  capacity rebalance (recorded loudly); ER1–ER4 measured; in-game proof; closure.

## Decision Log (recorded, not decided silently)

- **Keep 2 regions.** Civ7's homeland model is two hemispheres (`WEST`/`EAST`
  `LandmassRegionId`). The published `plan-starts` output stays 2-region — no
  schema break, no Studio/engine region-id churn. N-region is a documented
  non-goal.
- **West/East is a rotation, not a fixed seam.** The map wraps in X, so the
  balanced split chooses the meridian pair that halves settleable land; the
  `WEST`/`EAST` labels remain valid region ids.
- **Landmasses kept whole** in the partition (homeland = continent); residual
  imbalance when one landmass exceeds half the capacity is absorbed by D2
  allocation, not by splitting a continent.
- **Feasibility beats balance.** `balanceBias` nudges toward equal hemispheres,
  but a region is never allocated more starts than its `feasibleStartCeiling`.
- **Primitives are pure policy.** Algorithmic-but-pure helpers (apportionment,
  balanced split, dispersion, official buffers) fit `@civ7/map-policy`'s
  "deterministic compliance helpers" charter; start-specific orchestration stays
  in the mod.
- **Odd-R distance.** This branch is above the odd-R migration; all new
  distance/footprint math uses engine odd-R — verify the live helper name before
  use (historical names may still read `OddQ`).

## Requires

- Natural-wonders + odd-R stack (this change branches on
  `agent-A-natural-wonders-full-set-parity-suitability`).

## Enables Parallel Work

- The D0 metric slice and the policy-primitives slice are independent and can be
  developed in parallel worktrees before the D1 partition slice.
- After primitives land, the D1→D2→D3 spine is sequential (each consumes the
  prior region/allocation state) but each is independently measurable against the
  D0 metric.

## Affected Owners

- `packages/civ7-map-policy/**` (new `src/starts/` module + tests).
- `mods/mod-swooper-maps/**` placement: `plot-landmass-regions`,
  `domain/placement/ops/plan-starts/**`, `recipes/standard/runtime.ts`,
  `derive-placement-inputs`, `dev/diagnostics/placement-metrics.ts`.
- `docs/projects/start-distribution-homeland-rebalance/**` (evidence).

## Forbidden Owners

- No edits to generated files (`*.gen.ts`, `dist/**`, `mod/**`,
  `.civ7/outputs/**`, `src/maps/generated/**`).
- No scorer/screening redesign, no morphology change, no engine-positioner
  revival, no `plan-starts` output schema change (region space stays `{1,2}`).

## Consumer Impact

- `plan-starts` **input/output schemas unchanged** for the region surface
  (`playersLandmass1/2`, `regionSlot ∈ {1,2}`); allocation semantics change
  (counts derived from land, not `MapInfo`).
- `@civ7/map-policy` gains an additive `src/starts/` export surface.
- New diagnostics metric ids (additive) in `placement-metrics.ts`.
- Visible behavior change: starts spread across homelands instead of clustering.

## Stop Conditions

- Any domino turning out to require a `plan-starts` output schema change or a
  morphology change — stop, record why, keep the slice shippable or re-scope.
- ER2 still failing after D1–D2 where a feasible alternative region had spare
  capacity (the design `falsifier`) — re-frame, do not tune weights.

## Verification Gates

- `bun run --cwd packages/civ7-map-policy test` (primitive unit tests).
- `bun --cwd mods/mod-swooper-maps test test/placement` (planner tests).
- `bun run --cwd mods/mod-swooper-maps check` (Biome + types).
- `nx run mod-swooper-maps:build` (schema-compile gate).
- Region-balance metric (D0) over the fixed seed set: ER1–ER4 pass, E1.x no
  regression — results recorded under
  `docs/projects/start-distribution-homeland-rebalance/evidence/`.
- In-game live verification (closure test) per
  `.agents/skills/civ7-mapgen-workstream/assets/live-verification-runbook.md`.
- `bun run openspec -- validate start-distribution-homeland-rebalance --strict`.
