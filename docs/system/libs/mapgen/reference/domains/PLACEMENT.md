<toc>
  <item id="purpose" title="Purpose"/>
  <item id="stages" title="Stage shape (standard recipe)"/>
  <item id="ownership" title="Ownership (decision logic lives in domain ops)"/>
  <item id="contract" title="Contract (requires/provides)"/>
  <item id="artifacts" title="Key artifacts + validators"/>
  <item id="ops" title="Ops surface"/>
  <item id="config" title="Config posture (knob groups)"/>
  <item id="viz" title="Studio visualization coverage"/>
  <item id="verification" title="Verification surfaces"/>
  <item id="anchors" title="Ground truth anchors"/>
  <item id="open-questions" title="Open questions"/>
</toc>

# Placement domain

## Purpose

Placement is the standard recipe's gameplay-product vertical: the pipeline boundary where "map content" becomes "gameplay outcomes":

- plan and assign player starts,
- plan and place natural wonders, resources, and discoveries,
- guarantee the resource↔start support relationship,
- and publish placement outputs for verification and debugging.

Placement is **plan-authoritative and engine-facing**: deterministic plans are computed from pipeline artifacts and official policy tables, then materialized through typed adapter intent APIs with typed reconciliation of engine feasibility. Engine readbacks are evidence-only (see [`docs/system/ADR.md`](/system/ADR.md) ADR-009).

Naming note: a future Gameplay domain consolidation may absorb starts/discoveries/wonders orchestration, but `domain/resources` owns resource planning and is not re-owned by that absorption (ADR-008). See [`docs/system/libs/mapgen/reference/domains/GAMEPLAY.md`](/system/libs/mapgen/reference/domains/GAMEPLAY.md).

## Stage shape (standard recipe)

One stage, `placement`, with 11 steps split at real product/effect contracts (engine-refactor-v1 D3 posture; maintenance transactional). Step order:

1. `derive-placement-inputs` — builds `placementInputs` (mapInfo/starts/wonders/config) and publishes the natural-wonder and discovery plans.
2. `plot-landmass-regions` — landmass-region slots (the regional mechanism driving seat assignment; the official `chooseStartSectors` sector grid is intentionally not used — ADR-008 amendment).
3. `place-natural-wonders` — deterministic full-stamp-or-fail wonder materialization (first promoted product boundary).
4. `prepare-placement-surface` — transactional engine-surface preparation (terrain validation, area recalc, water cache, landmass-region restamping); gates the legality surface read by planning AND the stamps.
5. `plan-resources` — demand planning (family planners + group rollup), habitat-lane derivation, blue-noise site selection emitting typed per-plot intents; publishes `resourceDemandPlan`, `resourcePlan`, `resourceEligibility`.
6. `assign-starts` — op-owned start selection over PLANNED resource sites; publishes `startAssignment` (per-player `StartRecord[]` + `fairnessReport`).
7. `adjust-resources` — bounded resource↔start support pass over the plan (floor + equity), count-preserving moves with typed provenance; publishes `resourcePlanAdjusted`.
8. `place-resources` — thin stamp of the ADJUSTED intents + typed reconcile; publishes `resourcePlacementOutcomes`.
9. `place-discoveries` — discovery stamp + typed outcomes.
10. `assign-advanced-starts` — engine advanced-start regions + fertility recalculation (engine effects only; no per-plot readback surface exists).
11. `placement` (terminal) — verified engine effect (`effect:engine.placementApplied`), physics-vs-engine parity evidence (waterDrift), `placementOutputs`.

The plan→starts→support-adjust→stamp ordering is a deliberate contract: resource *planning* happens before starts (starts score planned sites), resource *stamping* happens after the support pass, so the support guarantee is enforced on the plan rather than by post-stamp mutation (which would need an engine resource-removal capability that does not exist).

See: [`docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`](/system/libs/mapgen/reference/STANDARD-RECIPE.md).

## Ownership (decision logic lives in domain ops)

All placement *decision* logic lives in domain ops (plan → select → reconcile); recipe materializers are thin stamp+verify shells (foundation/morphology pattern):

- `domain/resources` owns resource planning end-to-end (ADR-008): demand/eligibility planning, habitat-lane derivation, site selection, and the support-adjustment pass.
- `domain/placement` owns start selection (four-rung fallback ladder, fairness balancing, seat identity, StartBias scoring inside `plan-starts`), wonder/discovery planning.
- Selection strategies never throw on degraded inputs: every degradation is recorded as typed data (seat `status`/`rung`/`imputedFlags`, per-type shortfalls) instead of being silently rescued. The only hard-fail is zero settleable land with seats requested.
- Player identity: the adapter exposes an alive-majors READ surface (`getAliveMajorIds()`); the `plan-starts` op's `seat-identity.ts` policy is the single point mapping seats→playerIds, recorded per seat as `playerIdSource`.

## Contract (requires/provides)

Placement requires (dependency tags):

- `effect:map.riversPlotted` (from `map-rivers`)
- `effect:engine.featuresApplied` (from `map-ecology`)
- ecology/topography/morphology/hydrology artifacts for planning surfaces (biome via `ecology.biomeBindings`, feature via declared `field:featureType`, elevation via `topography.elevation`, plus mountains/volcanoes/hydrography/pedology/climate inputs)

Placement provides (product/effect chain, in pipeline order):

- `effect:placement.naturalWondersPlaced`
- `effect:placement.surfacePrepared`
- `effect:placement.resourcesPlanned`
- `effect:placement.startsAssigned`
- `effect:placement.resourcesAdjusted`
- `effect:placement.resourcesPlaced`
- `effect:placement.discoveriesPlaced`
- `effect:placement.advancedStartsAssigned`
- `effect:engine.placementApplied` (verified terminal effect)

Ordering between steps is carried by this effect-tag chain alone; there are no ordering-only artifact reads (read-and-discard requires are forbidden).

Runtime semantics (ADR-009 regime):

- The deterministic plan is the authority for typed intent; materializers stamp intents through the adapter and reconcile engine feasibility with per-tile typed rejection reasons — never re-deciding types, never falling back to official generators as truth.
- Shortfalls are recorded (typed, per-type, per-reason), never forced: no whole-map fallback, no least-used-type rebalance, no spacing decay below authored floors.
- Engine readbacks are evidence-only. Exactly three declared engine-surface reads exist, each documented in its step contract: the wonder-planning post-maintenance terrain surface (`derive-placement-inputs`), the resource legality surface (`plan-resources`), and the terminal physics-buffer landMask parity read (`placement`).
- Placement apply is fail-hard; natural wonders use deterministic full-stamp-or-fail semantics; resource readback mismatches are fail-hard.
- Surface preparation (terrain validation, area recalculation, water cache storage, landmass-region restamping, fertility recalculation) remains transactional because no independent consumer exists.

## Key artifacts + validators

Artifact contracts are one-per-file under
`mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts/contract/*.contract.ts`
(`artifacts.ts` is assembly-only). Every placement artifact registers a validate hook (cheap cross-field invariants: count reconciliation, digest↔row agreement, grid partitions, buffer lengths). Inventory:

| Artifact | Published by | Substance |
| --- | --- | --- |
| `placementInputs` | derive-placement-inputs | mapInfo/starts/wonders/config (single-publish; no embedded plans) |
| `naturalWonderPlan`, `discoveryPlan` | derive-placement-inputs | deterministic plans |
| `naturalWonderPlacement` | place-natural-wonders | placed/relocated/rejected coordinateRows |
| `resourceDemandPlan` | plan-resources | per-type target counts with official Weight/minimums/required-for-age provenance |
| `resourcePlan` | plan-resources | typed per-plot site intents (type, family, lane, phase, inHabitat) + per-type shortfalls + region minimums |
| `resourceEligibility` | plan-resources | per-type habitat/legal/intensity fields (the constraint surface the adjuster works inside) |
| `startAssignment` | assign-starts | per-player `StartRecord[]` (components, tier, score, rung, status, imputedFlags, playerIdSource) + `fairnessReport` (worstPairGap, swaps, relaxations) + `inputCoverage` |
| `resourcePlanAdjusted` | adjust-resources | adjusted intents with typed support provenance (action, reason, seatIndex) |
| `resourcePlacementOutcomes` | place-resources | typed reconciliation (planned/placed/rejected/byPhase/shortfalls) |
| `discoveryPlacementOutcomes` | place-discoveries | typed outcomes |
| `advancedStartAssignment` | assign-advanced-starts | engine-effect booleans |
| `placementSurfacePreparation` | prepare-placement-surface | maintenance/drift counters |
| `placementOutputs`, `engineState` | placement (terminal) | verification/debug surface (only measured fields; no hardcoded-zero placeholders) |

Placement also depends on gameplay-owned projection artifacts (`landmassRegionSlotByTile`, `placementSurfaceValidationBoundary`, `projectionMeta`, `placementEngineTerrainSnapshot`) authored in `mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts` — these also carry validate hooks.

## Ops surface

`domain/placement` ops:

- `planStarts` — candidate admission (impassability/wonder/volcano screens), scoring (fertility/freshwater/climate-comfort/resource-support/roughness/StartBias), tiering, four-rung selection ladder, fairness balancing, seat identity.
- `planNaturalWonders`, `planDiscoveries`, `planWonders` — deterministic plans from pipeline artifacts.

`domain/resources` ops (layout: `lib/` corpus + runtime-ids, `policy/` shared predicates, per-op `policy/` modules):

- `planTerrestrialResources`, `planAquaticResources`, `planCultivatedResources`, `planGeologicalResources`, `planResourceGroups` — demand/eligibility planning against the earthlike corpus + official policy tables (Weight deficit rotation, MinimumPerHemisphere, `isResourceRequiredForAge`, `expectedCountRange`).
- `deriveHabitatFields` — habitat-lane masks + per-family intensity fields from pipeline artifacts only (including marine/aquatic lanes).
- `selectResourceSites` — blue-noise site selection with per-type spacing floors, habitat-intensity thinning, per-landmass equity, affinity/exclusion rules, region-minimum force pass; policy legality gates selection before the engine oracle ever runs.
- `adjustResourceSupport` — bounded resource↔start floor/equity adjustment with all selection invariants enforced at destinations.

Symbolic→runtime resource ids are proven by a three-way agreement check (corpus slot == policy V0 table index == V1 row type), hard-failing on any divergence.

## Config posture (knob groups)

The `placement` stage public surface has six groups: `knobs`, `naturalWonders`, `discoveries`, `resources`, `starts`, `support`. The `resources`, `starts`, and `support` groups are **derived from the owning op's default strategy config schema** (foundation pattern) — there is no hand-shadowed schema, and the studio panel reads the generated recipe artifacts (`build:studio-recipes`). Knob taxonomy (semantic groups, density+sparsity+relationship controls, Earth-like defaults with declared min/max): ADR-010.

- `resources`: density, sparsity, rarityFidelity, siteSpacingTiles, perTypeSpacingFloorScale, equityMaxDensityRatio, per-family density, affinity/exclusion rules.
- `starts`: spacing floor/desired (official 6/12 buffers), scoring weights (fertility, freshwater, climate comfort + extreme penalty, resource support, roughness divisor), tier bias, ranking blend, fairness tolerance, coastal/river preference, StartBias weight, per-hemisphere player-count overrides.
- `support`: enabled, supportFloor, supportRadiusTiles, equityTolerance, strength.

Policy data comes from `@civ7/map-policy` generated tables (`CIV7_BROWSER_TABLES_V0` byte-stable + `CIV7_POLICY_TABLES_V1`: resource catalog rows, valid ages, required leaders, minimum-amount modifiers, StartBias tables, start globals), regenerated only via `nx run civ7-map-policy:verify -- --write` from the `.civ7/outputs/resources` submodule. Adapter manual catalogs are verified through `nx run mod-swooper-maps:verify -- --mode placement-catalogs`. There are no `globalThis.GameInfo` reads in the recipe layer; the resource catalog flows through `EngineAdapter.getResourceCatalog()`.

## Studio visualization coverage

10 of 11 steps emit decision-substance viz layers (29 layers, group "Gameplay / Placement", single-sourced from `stages/placement/viz.ts`); `assign-advanced-starts` is a recorded no-content exception (no per-plot readback exists). Plan-side scoring layers emit from the PLAN output before materialization, so they survive degraded selection. Score layers carry explicit unit-domain valueSpecs; zero-means-none categorical layers declare transparent zero categories. Coverage is pinned by `mods/mod-swooper-maps/test/placement/viz-coverage.test.ts` (per-step expected dataTypeKeys + overlay-suggestion key existence).

## Verification surfaces

- Expectation ledger (predeclared Earth-like gates E1/E2/E3/E4): `docs/projects/placement-realignment/expectations.md`.
- Stats harness: `nx run mod-swooper-maps:verify -- --mode placement-metrics --seed <s> --seeds <n> --size <size>` (headless standard recipe + mock adapter; computes every E1/E2/E3 metric from placement artifacts).
- Catalog guard: `nx run mod-swooper-maps:verify`.
- Live full-grid parity: `nx run mod-swooper-maps:verify -- --mode final-surface-parity` (milestone-boundary proof class; see `docs/projects/placement-realignment/MILESTONE-PROOFS.md`).

## Ground truth anchors

- Realignment project (diagnosis, expectations, refactor plan, per-slice evidence): `docs/projects/placement-realignment/`
- ADR-008 (domain/resources owns resource planning; landmass-region divergence), ADR-009 (deterministic typed reconciliation; readbacks evidence-only), ADR-010 (knob taxonomy): `docs/system/ADR.md`
- Stage definition: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/index.ts`
- Stage public config surface: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/index.ts`
- Artifact contracts: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts/contract/`
- Domain ops: `mods/mod-swooper-maps/src/domain/placement/ops/`, `mods/mod-swooper-maps/src/domain/resources/ops/`
- Policy tables: `packages/civ7-map-policy/src/civ7-tables.gen.ts` (generator-only writes)
- Tag registry: `mods/mod-swooper-maps/src/recipes/standard/tags.ts`

## Open questions

- Which placement outputs should be considered part of a stable contract surface vs ad-hoc debugging counters?
- Live-engine semantics pending Milestone A/B probes (alive-major id ordering, per-civ StartBias resolution, live legality agreement): `docs/projects/placement-realignment/MILESTONE-PROOFS.md`.
