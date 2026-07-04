# Placement Realignment S3 — Resources Vertical Cutover

## Why

Resource placement was structurally misaligned (diagnosis RC2/RC3;
audit-register resources lane, both findings adversarially confirmed): the
live path scored land tiles with one resource-identity-blind scalar
(`domain/placement/ops/plan-resources`), then a 1134-line recipe materializer
(`assignResourceIntents` + rebalance + whole-map dispersed fallback) discarded
the plan's types and force-equalized per-type counts over engine-legal plots —
erasing official rarity (per-type CV 0.080), stranding marine resources,
ignoring the official corpus (Weight, MinimumPerHemisphere,
expectedCountRange), and re-deciding type-at-plot at stamp time
(reassignmentRate 0.979, preferredLegalityRate 0.174). Meanwhile the intended
model — the `domain/resources` family demand planners with per-type
`expectedCountRange` and habitat lanes — was wired only into tests.

S3 executes the refactor-plan's 4-step cutover so resource planning happens
WITHIN policy (S2's regenerated tables) and the materializer becomes a thin
typed-reconcile shell (D4 plan authority), absorbing
resource-distribution-policy steps 2–5.

## Target Authority Refs

- `docs/projects/placement-realignment/refactor-plan.md` (S3 scope, D2, D4,
  S5 reorder constraint)
- `docs/projects/placement-realignment/expectations.md` (E2.1–E2.9, E3.4)
- `docs/projects/placement-realignment/diagnosis.md` (RC2, RC3)
- `docs/system/ADR.md` ADR-008 (domain/resources owns resource planning; D2
  entry gate, committed before wiring) and ADR-009 (deterministic typed
  reconciliation; readbacks evidence-only)
- `docs/projects/resource-distribution-policy/PROJECT-resource-distribution-policy.md`
  (steps 2–5 absorbed; ledger updated in this change)

## What Changes

The cutover is a pipeline, not a swap (the dormant family planners are
demand/eligibility planners, not site planners):

1. **Demand planning wired.** New `plan-resources` placement step (between
   `prepare-placement-surface` and `place-resources`) runs the four
   `domain/resources` family planners + `plan-resource-groups` against the
   earthlike expectation corpus. Symbolic→runtime ids are PROVEN against the
   policy tables (`lib/corpus/runtime-ids.ts`: corpus slot ==
   `CIV7_BROWSER_TABLES_V0.resourceTypes` index == V1 `resourceRows[i].type`;
   hard-fail on any disagreement — no degraded mode). Demand rows carry
   official Weight, MinimumPerHemisphere, `isResourceRequiredForAge`, the
   map-size `MapResourceMinimumAmountModifier`, and `expectedCountRange`
   gates; age-ineligible/blocked/no-legal-tile types are excluded with typed
   reasons.
2. **Habitat-mask derivation.** New `resources/derive-habitat-fields` op
   (op/strategy authoring model) derives all 59 lane masks the planners
   declare — including the marine/aquatic lanes (E2.4) — plus per-family
   intensity fields, from pipeline artifacts only (topography,
   coastlineMetrics, mountains, beltDrivers, hydrography, lakePlan,
   climateIndices, cryosphere, biomeClassification, pedology).
3. **Site selection.** New `resources/select-resource-sites` op emits typed
   per-plot intents (D4 shape: plotIndex, proven resourceTypeId, family,
   laneId, laneKind, phase, inHabitat): deterministic hash-ordered blue-noise
   site stream with a cross-type spacing floor (official Poisson avg 3),
   habitat-intensity thinning (E2.5 aggregation above the floor, never below
   it), official weight DEFICIT rotation at co-eligible sites (pick max
   runningWeight, subtract effectiveWeight → frequency ∝ 1/Weight), per-type
   spacing floors (E2.6), per-landmass equity ceiling (E2.8),
   affinity/exclusion rules (E3.4), a range-floor/target pass (corpus-range
   count authority, in-lane preferred, policy-legal always), and an official
   region-minimum force pass (per landmass-region, required-for-age gated,
   no-adjacent-resource spacing). Per-resource POLICY legality
   (`Resource_ValidPlacements` rows, mirroring the mock `canHaveResource`
   emulation exactly) gates selection BEFORE the engine oracle ever runs.
4. **Thin materializer.** `place-resources/materialize.ts` shrinks 1055→~430
   lines: stamp intents verbatim, typed reconcile on `canHaveResource`
   rejections (per-type `reconciliation.shortfalls`), readback-mismatch
   hard-fail preserved. `assignResourceIntents`, the rebalance pass, the
   dispersed whole-map plot order, and the least-used-type machinery are
   DELETED. No type re-decision, no relocation.

Plus:

- **Old op deleted.** `domain/placement/ops/plan-resources` and all wiring
  (derive-placement-inputs envelope, placementInputs.resources field,
  PlacementConfigSchema key) removed; no dual path.
- **Knob surface.** `placement.resources` public schema is now DERIVED from
  the select op's default strategy config (foundation pattern): `density`,
  `sparsity`, `rarityFidelity`, `siteSpacingTiles`,
  `perTypeSpacingFloorScale`, `equityMaxDensityRatio`, `familyDensity.{4}`,
  `affinityRules[]` — all with declared min/max; Earth-like defaults
  reproduce the E2 baselines. Shipped configs migrated.
- **Artifacts + validators.** New `placement.resourceDemandPlan` artifact;
  `placement.resourcePlan` re-keyed to the select op output (typed intents);
  `resourcePlacementOutcomes` carries `reconciliation` instead of the old
  `assignment`/`assignmentTrace`. All three now register validate hooks —
  the first artifact validators in the placement stage.
- **Telemetry.** RESOURCE_PLACEMENT_V1 keeps its envelope (version, counts,
  per-type extremes, coordinate proof, rejection rows, byReason); the
  `assignment` subblock is replaced by `reconciliation` (planned/placed/
  rejected/byPhase/shortfalls) because there is no assignment pass to report.
- **Metrics harness activated.** E2.1 (Weight Spearman via co-eligible-pool
  probe + family observational), E2.2, E2.3, E2.5 (pair-correlation proxy),
  E2.7, and the E3.4 expressiveness probe move from `pending-s2/s3` to
  computed.

## Decision Log

- **Where masks derive:** a dedicated `resources/derive-habitat-fields` op
  invoked from the new `plan-resources` step — not step-local helpers — so
  lane policy stays in the owning domain and the step remains a thin
  op-caller. The per-type eligibility predicate is shared
  (`policy/habitat-eligibility.ts`) between family planners (counting) and
  demand building (masking) so the two readings cannot drift.
- **Step split (derive-placement-inputs):** resource planning moved OUT of
  `derive-placement-inputs` into the new `plan-resources` step. Rationale:
  resource legality must be evaluated on the PREPARED engine surface (after
  `prepare-placement-surface` maintenance), and the stamp step must stay a
  separate shell so S5 can reorder stamping after starts without touching
  planning. `placementInputs` no longer embeds a resource plan
  (single-publish hygiene for the surfaces this slice touches).
- **Declared engine-surface read (not a readback bypass):** the legality
  masks read per-tile biome/terrain/feature/water from the adapter because
  they must see exactly what the reconcile-time `canHaveResource` oracle
  sees. This is declared in the step contract doc (ADR-009 posture);
  reconstructing the surface from artifacts is S6 scope.
- **Symbolic→runtime id resolution:** three-way agreement proof (corpus
  static slot == V0 table index == V1 row type), cached, hard-fail listing
  every divergent type. Planner contracts keep their honest
  `runtimeIdStatus: "unverified"` literals (they are symbolic by design);
  the demand plan records `runtimeIdResolution: verified` at the boundary
  where ids become numeric.
- **Count authority vs rotation (E2.1×E2.7 tension):** corpus
  `expectedCountRange` is the per-type COUNT authority (E2.7 gates 100%
  in-range); the weight deficit rotation governs ALLOCATION among co-eligible
  sites and dominates where ranges leave slack. E2.1's gate is therefore
  computed on a synthetic fully co-eligible pool through the live op
  (Spearman −1.0); real-map family Spearmans are reported observationally
  (confounded by range clamps and habitat breadth).
- **Aridity lanes are land-rank-relative.** The pipeline's `aridityIndex` is
  an uncalibrated P/PET proxy (observed land max 0.417 on the flagship map),
  so absolute desert thresholds (≥0.6) produced EMPTY lanes. Lane predicates
  now use the land-percentile rank with a small absolute floor (0.05) so
  uniformly wet maps still produce no deserts.
- **Region-minimum force pass semantics:** official (no adjacent resource,
  cross-type relaxed) BUT the per-type spacing floor still binds — E2.6
  ("never decays") dominates; unreachable minimums become typed shortfalls,
  which is E2.2's recorded-shortfall arm.
- **Range-floor pass may leave the lane, never the law:** candidates are
  policy-LEGAL tiles with a dominant in-lane bonus, so out-of-lane placement
  happens only when a lane is exhausted and stays within E2.3's 10% budget
  (observed fidelity 0.972 on earthlike; archipelago/desert identity maps
  budgeted at 0.85 in the world-balance suite with rationale).
- **stages/resources disposition: deleted.** Its orphan `artifacts.ts`
  content (corpus + earthlikeExpectations artifact contracts) is absorbed
  into `domain/resources/artifacts/<artifact>.artifact.ts` (one artifact per
  file, per the repo layout convention recorded in the architecture-authority
  skill); consumers are the corpus contract-guard tests.
- **Domain layout normalization (user-directed mid-slice):**
  `domain/resources` reorganized to `lib/` (corpus, expectations,
  runtime-ids), `policy/` (habitat-eligibility, resource-legality,
  initial-map-authoring), `artifacts/`, and per-op `policy/` files;
  convention recorded in
  `.agents/skills/civ7-architecture-authority/references/ownership-boundaries.md`.
- **Telemetry compatibility:** envelope-preserving replacement, not strictly
  additive — the `assignment` subblock could not survive because the
  assignment pass no longer exists; `reconciliation` replaces it and all
  other keys are unchanged. Version stays 1; consumers
  (live-parity/surface-delta diagnostics) updated in the same change.
- **Prior in-flight work adopted:** an interrupted earlier S3 attempt left
  uncommitted, high-quality drafts of the two new ops, the legality/runtime-id
  helpers, and the step contract; reviewed critically and built upon (rotation
  two-sweep, range-target fill, rank-relative lanes, force-pass floors, and
  all wiring/tests/metrics added on top) rather than reset.

## Known Regressions / Open Items (recorded, not faked)

- **E2.7 SILVER:** 16-tile policy capacity vs [16,18,20] range on the mock
  standard map — typed shortfall recorded; remediation is upstream biome
  coverage, corpus amendment, or live-legality divergence (Milestone A
  measures, E4.4). Gate result: 33/34 types in range + recorded shortfall.
- **E1.8 climate-extreme starts regressed 10%→27.5% mean:** start scoring is
  untouched; its `resourceSupport` term now sees real habitat-driven resource
  hotspots (arid/orogenic/tropical) instead of uniform scatter and pulls
  starts toward them. The correcting lever (climate screening / support
  weight rebalance) is start-side and belongs to S4's write set. Explicitly
  handed to S4.
- **Milestone A (live)** is NOT claimed: full-grid
  `verify:final-surface-parity`, the 106/6996 resource-mismatch corpus
  disposition, and `civ7 game` probes for E2.2/E2.4 live counts and E4.4
  mock-vs-live legality agreement happen at the milestone boundary.
