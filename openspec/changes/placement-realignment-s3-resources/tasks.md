# Tasks — Placement Realignment S3 (Resources Vertical Cutover)

## 0. Entry gate (D2)

- [x] 0.1 ADR-008 recorded in `docs/system/ADR.md`: `domain/resources` owns
  resource planning; Gameplay-absorption appendix updated to point at it.
- [x] 0.2 ADR-009 recorded: deterministic typed reconciliation; engine
  readbacks evidence-only.

## 1. Demand planning (pipeline step 1)

- [x] 1.1 New placement step `plan-resources` (contract + impl) between
  `prepare-placement-surface` and `place-resources`; runs
  plan-{aquatic,cultivated,terrestrial,geological}-resources +
  plan-resource-groups against `EARTHLIKE_RESOURCE_EXPECTATIONS`.
- [x] 1.2 Symbolic→runtime id proof (`lib/corpus/runtime-ids.ts`): corpus
  slot == V0 resourceTypes index == V1 resourceRows type; hard-fail on any
  unresolvable id; contract test `resource-runtime-id-proof.test.ts`.
- [x] 1.3 Demand rows carry official Weight, MinimumPerHemisphere,
  required-for-age, `MapResourceMinimumAmountModifier` (resolved from grid
  dimensions via the official size presets), and expectedCountRange gates;
  exclusions typed (planner-status / age-policy / no-policy-legal-tiles).
- [x] 1.4 `resourcesDomain` registered in the standard recipe compile ops.

## 2. Habitat-mask derivation (pipeline step 2)

- [x] 2.1 New op `resources/derive-habitat-fields` emitting all 59 lane masks
  the family planners declare + per-family intensity fields; marine/aquatic
  lanes included (E2.4).
- [x] 2.2 Aridity thresholds land-rank-relative with absolute floor
  (decision-logged); tectonic/elevation thresholds quantile-relative.
- [x] 2.3 Shared eligibility predicate `policy/habitat-eligibility.ts`
  (planner counting == demand masking); covered by op-contract test
  `resource-habitat-fields-op-contract.test.ts` (mask coverage, intensity
  bounds, marine-lane-on-water).

## 3. Site selection (pipeline step 3)

- [x] 3.1 New op `resources/select-resource-sites`: blue-noise site stream,
  intensity thinning (two-sweep), weight deficit rotation, per-type floors
  (`policy/spacing-floors.ts`), range floor/target passes, official
  region-minimum force pass, per-landmass equity ceiling, affinity/exclusion
  rules; typed intents + perType + regionMinimums + settings outputs.
- [x] 3.2 Per-resource policy legality before selection
  (`policy/resource-legality.ts`, mirrors mock `canHaveResource` emulation
  exactly); legality surface read from the prepared engine surface
  (declared, ADR-009).
- [x] 3.3 Contract tests `resource-select-sites-op-contract.test.ts`:
  1/Weight rotation monotonicity, per-type floors + maxCount, typed
  shortfalls when floors make minimums unreachable, region-minimum force
  pass, sparsity-max + exclusion expressiveness, determinism.

## 4. Thin materializer (pipeline step 4)

- [x] 4.1 `place-resources/materialize.ts` rewritten: stamp intents, typed
  reconcile (`reconciliation.shortfalls`), readback-mismatch hard-fail kept;
  `assignResourceIntents`/rebalance/dispersed-fallback deleted.
- [x] 4.2 RESOURCE_PLACEMENT_V1 telemetry: envelope preserved,
  `assignment` → `reconciliation` (decision-logged); size budget test kept
  (< 900 chars).
- [x] 4.3 Old `domain/placement/ops/plan-resources` deleted with all wiring
  (no dual path); `stages/resources` deleted, artifact contracts absorbed
  into `domain/resources/artifacts/*.artifact.ts`.

## 5. Knobs, artifacts, validators

- [x] 5.1 `placement.resources` public schema derived from the select op
  default strategy config (foundation pattern); density/sparsity/
  rarityFidelity/siteSpacingTiles/perTypeSpacingFloorScale/
  equityMaxDensityRatio/familyDensity/affinityRules, all with declared
  min/max + descriptions; compile routes to `plan-resources.selectSites`.
- [x] 5.2 Shipped map configs migrated (earthlike explicit defaults; others
  defaults); generated map entrypoints + compiled fixture + studio recipe
  artifacts regenerated via their scripts.
- [x] 5.3 Artifacts: `resourceDemandPlan` (new), `resourcePlan` (select op
  output), `resourcePlacementOutcomes` (reconciliation); validate hooks
  registered for all three (first validators in the placement stage).

## 6. Tests + metrics + evidence

- [x] 6.1 Old-algorithm tests updated without weakening invariants:
  `world-balance-stats` (uniformity-spread assertions → range/shortfall/
  fidelity/floor invariants), `terrain-relief-diagnostics`,
  `resource-placement-diagnostics` (rewritten for the thin materializer),
  `plan-ops` (old resource op tests removed),
  `placement-does-not-call-generate-snow` (oracle-rejects-everything now
  asserts typed rejections + no fallback instead of a throw),
  `maps-schema-valid` + fixtures, `shipped-map-identity`,
  diagnostics fixtures (plan-intent join replaces assignment-trace join).
- [x] 6.2 Metrics harness: E2.1 Spearman activated (co-eligible-pool probe
  through the live op + family observational + CV), E2.2 from
  regionMinimums, E2.3 habitat fidelity, E2.5 pair-correlation proxy at
  r > floor, E2.7 range satisfaction, E2.9 honest plan-vs-stamp
  reassignment join, E3.4 expressiveness probe (sparsity-max + exclusion).
- [x] 6.3 `bun --cwd mods/mod-swooper-maps test` — 472 pass / 0 fail.
- [x] 6.4 `bun run --cwd mods/mod-swooper-maps check` — clean.
- [x] 6.5 `bun run verify:placement-catalogs` — verified.
- [x] 6.6 `bun run verify:placement-metrics -- --seed 1337 --seeds 5 --size
  standard --json /tmp/pm-s3.json`; results + gate table in
  `docs/projects/placement-realignment/evidence/s3-results-2026-06-10.md`
  (E2.7 SILVER structural exception + E1.8 regression recorded there and in
  the proposal).
- [x] 6.7 `openspec validate placement-realignment-s3-resources --strict`.

## 7. Docs

- [x] 7.1 RDP ledger updated
  (`docs/projects/resource-distribution-policy/PROJECT-resource-distribution-policy.md`):
  steps 2–5 dispositioned with pointers to this change.
- [x] 7.2 Domain layout convention recorded in the architecture-authority
  skill (separate commit).
