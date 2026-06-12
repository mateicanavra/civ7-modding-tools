# Placement Realignment S5 — Resource↔Start Support Pass

## Why

The resource↔start relationship was one-directional (diagnosis RC7;
audit-register resources lane): starts scored placed resources via
`resourceSupportWeight`/`resourceSupportRadiusTiles`, but resources were
planned and stamped completely blind to starts. The E3 expectation family
was red at S4: minimum support per start 1.8 within radius 4 (E3.1 floor 2),
cross-player support gap 7.0 (E3.2 tolerance 2), and no order in the
pipeline at which a support guarantee COULD hold (E3.3) because resources
stamped before starts existed.

## Target Authority Refs

- `docs/projects/placement-realignment/refactor-plan.md` (S5 scope; the D3
  ordering decision is pre-made there: planning before starts, stamping
  after the support pass; post-stamp mutation explicitly rejected)
- `docs/projects/placement-realignment/expectations.md` (E3.1–E3.3 gates;
  E1/E2 non-regression)
- `docs/projects/placement-realignment/diagnosis.md` (RC7)
- `docs/system/ADR.md` ADR-008 (domain/resources owns resource planning),
  ADR-009 (deterministic plan authority)
- `.agents/skills/civ7-architecture-authority/references/ownership-boundaries.md`
  (domain module layout)

## What Changes

1. **Step reorder (D3 contract change).** The placement effect chain is
   rewired from `surfacePrepared → resourcesPlaced → startsAssigned → ...`
   to `surfacePrepared → resourcesPlanned → startsAssigned →
   resourcesAdjusted → resourcesPlaced → discoveriesPlaced → ...`. New stage
   order: plan-resources → assign-starts → adjust-resources →
   place-resources. Resource PLANNING stays before starts (it still reads
   the prepared engine surface for policy legality); resource STAMPING moves
   after the support pass. Post-stamp mutation is rejected: the engine has
   no resource-removal adapter capability and a stamped surface would need
   its own typed outcome surface. `prepare-placement-surface` keeps its
   position — it gates the legality surface read by planning AND the engine
   stamping, both of which still run after it.
2. **assign-starts consumes the PLAN (D3 input change).** The step requires
   `resourcesPlanned` + the `resourcePlan` artifact instead of
   `resourcesPlaced` + stamped outcomes; the `plan-starts` op input is
   renamed `placedResourcePlotIndices → plannedResourcePlotIndices` with the
   resource-support scoring term unchanged in mechanics (counts within
   `resourceSupportRadiusTiles`, rank-normalized) but fed from planned site
   intents.
3. **New op `resources/adjust-resource-support` (domain/resources).** Takes
   the site-selection plan + eligibility fields + seated StartRecord seats
   and produces an adjusted intent set as a bounded move/add pass:
   - Phase 1 (E3.1): per-start support floor within radius — prefer MOVING a
     site that serves no start (count-preserving: ranges, rarity counts, and
     region minimums hold exactly), fall back to ADDING within maxCount
     headroom.
   - Phase 2 (E3.2): cross-player equity — move sites out of the richest
     start's radius into the poorest's (or to a neutral in-habitat plot)
     with removal/gain safety so no seat drops below floor or current min.
   - ALL S3 invariants enforced at destinations: policy-table legality
     (hard), per-type same-type spacing floors, cross-type adjacency
     clearance (the official force-pass convention), affinity/exclusion
     rules (echoed through the plan settings), per-landmass equity ceiling,
     [min,max] ranges, region-minimum guard on cross-region moves.
   - Typed provenance per adjusted site (`support: {action, reason,
     seatIndex, fromPlotIndex?}`); unsatisfiable units recorded as typed
     shortfalls (never forced).
4. **Knobs (derived schema, foundation pattern).** `placement.support`
   public section derived from the op default-strategy config: `enabled`
   (default true), `supportFloor` (default 2, range 0..6),
   `supportRadiusTiles` (default 4, range 1..8), `equityTolerance` (default
   2, range 0..8), `strength` (default 1, range 0..1 — scales the
   adjustment budget). Earth-like defaults reproduce the E3 gates with no
   shipped-config change.
5. **Artifacts + outcomes provenance.** `resourceEligibility` (per-type
   habitat/legal/intensity fields, published once by plan-resources so the
   adjuster works inside the same constraints) and `resourcePlanAdjusted`
   (the adjusted plan; validate hook enforces count/provenance coherence,
   unique plots, move bookkeeping). `place-resources` stamps the ADJUSTED
   intents; `resourcePlacementOutcomes.reconciliation` gains
   `byPhase.support` and `supportAdjustedPlacedCount` (additive provenance
   in outcomes).
6. **Metrics harness extended.** E3.1 gains supportMoves/supportAdds/
   shortfall counts + per-start planned-vs-placed distribution + adjustment
   provenance detail; E3.2 gains plannedGapBefore/After; E3.3 now asserts
   floor AND equity per seed (trueCount aggregate = N/N guarantee). All
   per-plot stamped joins (E2.3 habitat fidelity, E2.5 aggregation, E2.9
   reassignment/legality/drift) switch to the adjusted intents; E2.5 gains a
   `basePlanGeologicalPairCorrelation` counterfactual that attributes
   aggregation movement to the pass vs seed geography.

## Decision Log

- **No interrupted prior S5 attempt existed:** the worktree was clean at
  dd6ffd091 (S0–S4); this change is a fresh implementation (decision-logged
  per the slice brief's adopt-or-reset gate).
- **assign-starts resource-support input (planned vs placed):** the scoring
  term now reads PLANNED site intents. On the mock-adapter harness this is
  observed value-identical (E2.9 has planned == placed == stamped since S3:
  zero engine rejections), and the E1.* 20-seed numbers are bit-identical to
  S4. On live engines the planned set is a superset of placed (engine
  rejections become typed shortfalls), so start scoring sees slightly more
  optimistic support — acceptable: the support pass runs after starts and
  guarantees the floor on the same planned frame, and Milestone B re-proves
  live.
- **Adjustment algorithm bounds:** floor phase applies `ceil(strength ×
  deficit)` units per seat; equity phase budget is `ceil(strength × seats ×
  supportFloor × 2)` hard-capped at 64 iterations; each iteration either
  applies one move/add or records a typed shortfall and stops — termination
  is structural. Moves are preferred over adds everywhere because they
  preserve per-type counts exactly (E2.1/E2.7 untouched by construction).
- **Equity safety predicates:** a source site may leave the richest zone
  only if every seat covering it stays ≥ floor and ≥ the current minimum; a
  destination may not push any covering seat back to the old maximum. This
  makes per-iteration progress monotone (max strictly shrinks or min
  strictly grows) and prevents oscillation without global search.
- **E2.3/E2.5 protection inside the adjuster:** destinations hard-require
  policy legality and rank habitat first (in-lane +10 dominates intensity);
  free-map (neutral) destinations REQUIRE habitat; out-of-lane sources get a
  move bonus (relocating them is fidelity-neutral-or-positive); sources
  participating in a same-family aggregation pair in the (floor, floor+2]
  annulus are penalized so isolated sites move first. Measured: E2.3 holds
  (0.974 mean over 20 seeds), E2.5 is aggregation-neutral (mean 1.1538
  adjusted vs 1.1539 base-plan counterfactual).
- **Tag-chain subtleties found:** `prepare-placement-surface` gates BOTH the
  planning step's engine legality surface read (ADR-009 declared read) and
  the stamp — the reorder keeps both downstream of it, so its position is
  unchanged. `place-discoveries` previously chained only off
  `startsAssigned`; it now also requires `resourcesPlaced` so the serialized
  product chain stays explicit (discoveries were always after the resource
  stamp in stage order; the tag now says so). The placement-final
  maintenance step needed no change (it requires `advancedStartsAssigned`
  and reads `resourcePlacementOutcomes`, both still upstream).
- **Eligibility published, not re-derived:** the adjuster needs the per-type
  habitat/legal/intensity fields the plan was selected under. Re-running
  habitat derivation + legality reads in the adjust step would duplicate
  compute and risk divergence with the planning surface; the planning step
  publishes them once as `resourceEligibility` (single-publish, validated).
  The select op output additionally echoes its `affinityRules` in
  `settings` so the adjuster honors the same exclusion/affinity config
  without a second config path.
- **Stage artifacts.ts growth:** the two new artifact contracts were added
  to the existing placement stage `artifacts.ts` (S3/S4 precedent for stage
  surfaces); the per-file `artifacts/contract/` normalization for this
  collection is S6 scope (artifact hygiene slice), not grown here ad hoc.
- **Proof-surface preservation:** live-parity and surface-delta evidence
  readers prefer `resourcePlanAdjusted` for per-plot stamped joins (its
  intents ARE what was stamped) and keep the base `resourcePlan` as
  authority for selection settings (siteSpacingTiles) and fallback; the
  world-balance stats support joins the same way. Without this, moved sites
  read as habitat-mismatches against the stale base plan (observed: an
  artificial E2.3 dip to 0.897 that vanished once the join used the stamped
  plan).

## Known Limits / Open Items (recorded, not faked)

- **E2.5 20-seed window:** seed 1353 sits at 0.974 (< CSR 1.0) both BEFORE
  and AFTER the support pass (delta 0.000) — pre-existing seed geography,
  first observed because S5 widened E2.5 measurement to 20 seeds (S3/S4
  measured the 5-seed canonical run, which holds: 1.123 [1.012..1.195]).
  The counterfactual summary field makes this attribution permanent.
- **Tiny-map equity shortfalls:** on small test grids (240 plots, 2–4 seats
  with heavily overlapping radius-4 zones) the equity pass can be
  structurally unresolvable; it records `equity-unresolvable` shortfalls
  loudly. The standard-size gates are unaffected (20/20 seeds green).
- **Live half:** mock-adapter legality matches policy masks, so plan ==
  placed here; live engine rejections could drop a start below the floor
  post-stamp. Milestone B measures this; the typed shortfall surface is the
  hook for any live-only repair decision.
