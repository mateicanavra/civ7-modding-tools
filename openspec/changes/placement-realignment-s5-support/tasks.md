# Tasks — Placement Realignment S5 (Resource↔Start Support Pass)

## 1. Step reorder (D3 contract change)

- [x] 1.1 New effect tags `resourcesPlanned` (plan-resources) and
  `resourcesAdjusted` (adjust-resources) with owners; chain rewired
  resourcesPlanned → startsAssigned → resourcesAdjusted → resourcesPlaced →
  discoveriesPlaced.
- [x] 1.2 Stage order: plan-resources → assign-starts → adjust-resources →
  place-resources; prepare-placement-surface position verified unchanged
  (it gates the planning legality read AND the stamp).
- [x] 1.3 assign-starts: requires resourcesPlanned + resourcePlan artifact;
  plan-starts op input renamed placedResourcePlotIndices →
  plannedResourcePlotIndices (D3 input change, scoring mechanics unchanged).
- [x] 1.4 place-resources: requires resourcesAdjusted + resourcePlanAdjusted;
  stamps the adjusted intents; place-discoveries chains off resourcesPlaced.

## 2. Support-adjust op (domain/resources)

- [x] 2.1 `resources/adjust-resource-support` contract: plan + eligibility +
  StartRecord seats in; adjusted intents + adjustments + shortfalls +
  perStart + equity out; knobs enabled/supportFloor/supportRadiusTiles/
  equityTolerance/strength with declared min/max + descriptions.
- [x] 2.2 Default strategy: floor phase (move-preferred, add fallback) +
  equity phase (removal/gain safety predicates, bounded budget, hard cap);
  deterministic hash ordering; invariant checks (legality, type floors,
  cross-type clearance, exclusion/affinity, landmass ceiling, region-minimum
  guard, [min,max] ranges); E2.3/E2.5 protection (habitat-first
  destinations, out-of-lane source preference, aggregation-pair penalty).
- [x] 2.3 select-resource-sites output echoes `settings.affinityRules`
  (additive) so the adjuster honors the same rules without dual config.
- [x] 2.4 Registered in domain contracts/implementations.

## 3. Artifacts + validators + provenance

- [x] 3.1 `resourceEligibility` published once by plan-resources (validated).
- [x] 3.2 `resourcePlanAdjusted` published once by adjust-resources with
  validate hook (counts, unique plots, provenance coherence); shortfalls
  warned + traced.
- [x] 3.3 Outcomes provenance additive: reconciliation.byPhase.support +
  supportAdjustedPlacedCount; materializer typed against the adjusted plan.
- [x] 3.4 Evidence readers (live-parity, surface-delta-context,
  world-balance stats) prefer the adjusted plan for stamped joins; base plan
  kept for selection settings.

## 4. Knobs

- [x] 4.1 `placement.support` public schema derived from op config
  (foundation pattern); compile maps to adjust-resources.support envelope;
  generated studio recipe schema/defaults + map artifacts regenerated.

## 5. Verification

- [x] 5.1 Metrics harness: stamped joins use adjusted intents (E2.3/E2.5/
  E2.9); E3.1 += supportMoves/supportAdds/shortfalls + provenance detail;
  E3.2 += plannedGapBefore/After; E3.3 = floor AND equity per seed; E2.5 +=
  basePlanGeologicalPairCorrelation counterfactual.
- [x] 5.2 Op-contract tests (8): floor fill with provenance, invariant
  preservation, equity gap, typed shortfalls (no forcing), add-with-headroom,
  exclusion + legality at destinations, determinism, disabled pass-through.
- [x] 5.3 Order-encoding tests updated: placement-contracts (new chain +
  step order), landmass-region-id-projection (starts before resources),
  resource-placement-diagnostics (adjusted-plan shape + byPhase.support),
  maps-schema-valid (+support key, +adjust-resources internal key, fixture),
  standard-authoring-surface-guards (+support).
- [x] 5.4 `bun --cwd mods/mod-swooper-maps test` — 506 pass / 0 fail;
  `bun run --cwd mods/mod-swooper-maps check` clean.
- [x] 5.5 `bun run verify:placement-metrics -- --seed 1337 --seeds 20 --size
  standard --json /tmp/pm-s5.json`: E3.1 min 2.8 [2..4], belowFloor 0/160;
  E3.2 gap 2.0 [2..2]; E3.3 20/20; E1.* bit-identical to S4; E2.* hold
  (E2.5 worst seed pre-existing, delta 0.000 vs counterfactual).
- [x] 5.6 `openspec validate placement-realignment-s5-support` passes.

## 6. Docs

- [x] 6.1 Evidence doc
  `docs/projects/placement-realignment/evidence/s5-results-2026-06-10.md`
  (gate table before/after per E-ID, raw aggregates, counterfactual note).
