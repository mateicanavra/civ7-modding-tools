<toc>
  <item id="purpose" title="Purpose"/>
  <item id="stages" title="Stage shape (standard recipe)"/>
  <item id="ownership" title="Ownership (decision logic lives in domain ops)"/>
  <item id="contract" title="Contract (requires/provides)"/>
  <item id="artifacts" title="Key artifacts"/>
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
- plan and place natural wonders and resources, and invoke Civ7-owned
  discovery generation,
- guarantee the resource↔start support relationship,
- and project completed product evidence through metrics, traces, and visualization.

Placement is **plan-authoritative where Swooper owns the product and
engine-facing throughout**: natural-wonder, resource, and start plans are
computed from pipeline artifacts, dependency-free static policy, and declared
invocation-local adapter observations, then materialized through typed adapter
intent APIs. Civ7 remains authoritative for narrative-coupled discovery
generation. Current engine surfaces are never published as cross-step
artifacts; readbacks and generator counts are evidence-only (see
[`docs/system/ADR.md`](/system/ADR.md) ADR-009).

Naming note: a future Gameplay domain consolidation may absorb starts/discoveries/wonders orchestration, but `domain/resources` owns resource planning and is not re-owned by that absorption (ADR-008). See [`docs/system/libs/mapgen/reference/domains/GAMEPLAY.md`](/system/libs/mapgen/reference/domains/GAMEPLAY.md).

## Stage shape (standard recipe)

One stage, `placement`, with 12 steps split at real product/effect contracts (engine-refactor-v1 D3 posture; maintenance transactional). Step order:

1. `plan-natural-wonders` — admits final physical and engine surfaces plus active Civ7 map-size demand, then publishes natural-wonder intent.
2. `place-natural-wonders` — ordered primary/fallback wonder materialization
   with typed adapter reconciliation and terminal recipe measurement; current
   feature occupancy remains engine state.
3. `prepare-placement-surface` — transactional engine-surface maintenance (terrain validation, coast restoration, area recalc, and water cache); gates the legality surface read by planning and the stamps without claiming final product state.
4. `plot-landmass-regions` — projects landmass-region slots after engine maintenance, then publishes the immutable regional product used by resource and start planning. The official `chooseStartSectors` sector grid is intentionally not used (ADR-008 amendment).
5. `plan-resource-demands` — derives habitat lanes and resolves the exact canonical expectation corpus into one complete admitted/excluded demand ledger against current Civ7 legality; publishes `resourceDemandPlan`.
6. `select-resource-sites` — deterministic blue-noise selection over admitted demand and regional topology; publishes typed per-plot `resourcePlan` intent.
7. `assign-starts` — op-owned start selection over PLANNED resource sites; publishes `startAssignment` (per-player `StartRecord[]` + `fairnessReport`).
8. `adjust-resources` — bounded resource↔start support pass over the plan (floor + equity), count-preserving moves with typed provenance; publishes `resourcePlanAdjusted`.
9. `place-resources` — thin stamp of the ADJUSTED intents + typed reconcile;
   emits one terminal resource-placement measurement and completes
   `effect:placement.resourcesPlaced`.
10. `place-discoveries` — delegates discovery placement to Civ7 and emits observed runtime evidence.
11. `assign-advanced-starts` — engine advanced-start regions + fertility recalculation (engine effects only; no per-plot readback surface exists).
12. `observe-placement-parity` — the single terminal Civ7
    terrain/elevation/water/lake observation after advanced-start assignment.
    Its `placement.parity` metric and `PLACEMENT_PARITY_V1` exact-log evidence
    derive whole-surface water drift plus accepted-lake
    water/classification drift from that same snapshot. Accepted Hydrology
    lakes are part of the expected water surface, not drift from raw
    Morphology land.

The plan→starts→support-adjust→stamp ordering is a deliberate contract: resource *planning* happens before starts (starts score planned sites), resource *stamping* happens after the support pass, so the support guarantee is enforced on the plan rather than by post-stamp mutation (which would need an engine resource-removal capability that does not exist).

See: [`docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`](/system/libs/mapgen/reference/STANDARD-RECIPE.md).

## Ownership (decision logic lives in domain ops)

All placement *decision* logic lives in domain ops (plan → select → reconcile);
recipe materializers are thin sequencing and reconciliation shells over typed
adapter-owned mutation/readback boundaries:

- `domain/resources` owns resource planning end-to-end (ADR-008): demand/eligibility planning, habitat-lane derivation, site selection, and the support-adjustment pass.
- `domain/placement` owns natural-wonder planning, landmass-region
  classification, and start selection (four-rung fallback ladder, fairness
  balancing, seat identity, StartBias scoring inside `plan-starts`). Discovery
  placement is delegated to Civ7 as a recipe effect rather than modeled as a
  Placement operation.
- `@civ7/map-policy` owns static resource facts (`Weight`, `MinimumPerHemisphere`, age validity, and roster-independent `Staple`/`UnlocksCiv` basis). `EngineAdapter` owns the exact active-roster `isResourceRequiredForAge` query used by planning.
- Selection strategies never throw on degraded inputs: every degradation is recorded as typed data (seat `status`/`rung`/`imputedFlags`, per-type shortfalls) instead of being silently rescued. The only hard-fail is zero settleable land with seats requested.
- Player identity: the adapter exposes an alive-majors READ surface (`getAliveMajorIds()`); the `plan-starts` op's `seat-identity.ts` policy is the single point mapping seats→playerIds, recorded per seat as `playerIdSource`.

## Contract (requires/provides)

Placement requires (dependency tags):

- `effect:map.riversPlotted` (from `map-rivers`)
- `effect:engine.featuresApplied` (from `map-ecology`)
- topography/morphology/hydrology artifacts for authored planning surfaces (including elevation, mountains, volcanoes, hydrography, pedology, and climate inputs)
- current Civ7 terrain, biome, and feature classifications through the step's
  declared engine capabilities; those mutable surfaces are invocation-local
  adapter observations rather than placement artifacts

Placement provides (product/effect chain, in pipeline order):

- `effect:placement.naturalWondersPlaced`
- `effect:placement.surfacePrepared`
- `effect:placement.startsAssigned`
- `effect:placement.resourcesPlaced`
- `effect:placement.discoveriesPlaced`
- `effect:placement.advancedStartsAssigned`

Immutable plan and adjustment artifacts carry their own causal edges. Effect
tags remain only for engine or lifecycle transitions with no immutable data
product, except `startsAssigned`: its artifact deliberately admits typed
degraded assignments, while the effect predicate is the stricter continuation
gate requiring every admitted seat to be assigned. There are no parallel
`resourcesPlanned` or `resourcesAdjusted` ordering authorities and no
read-and-discard artifact requirements. Terminal parity evidence is the
successful observer result plus its trace and visualization projections, not
another effect tag.

Runtime semantics (ADR-009 regime):

- Swooper-authored deterministic plans are the authority for typed intent;
  resource materialization stamps those intents through the adapter and
  reconciles engine feasibility with per-tile typed rejection reasons, never
  re-deciding types or falling back to Civ7's resource generator. The adapter
  owns its admitted map dimensions, coordinate resolution, bounds, mutation,
  and exact readback; the recipe consumes that typed outcome without a second
  validator.
- Discovery is the explicit exception to Swooper plan authority: the ordered
  placement step supplies seated-major exclusions and the polar margin to
  Civ7's official generator, then projects attempted/placed/rejected counts
  through typed metrics and the live log. It publishes no discovery plan,
  per-tile reconciliation rows, or causal artifact.
- Shortfalls are recorded (typed, per-type, per-reason), never forced: no whole-map fallback, no least-used-type rebalance, no spacing decay below authored floors.
- Current-engine observations are exact detached bulk-layer capabilities on
  the step that needs them: terrain/biome/feature classifications feed natural-wonder
  planning in `plan-natural-wonders`; maintenance-boundary readbacks remain
  invocation-local in `prepare-placement-surface`; the prepared legality
  surface feeds `plan-resource-demands`; the post-maintenance region projection
  publishes the immutable slot product used by resource and start planning;
  and terminal `observe-placement-parity`, after every placement transition,
  owns the one final terrain, elevation, water, and lake snapshot used by
  metrics, trace, visualization, exact logs, and replay parity. It compares
  Morphology topography plus accepted Hydrology lakes with the engine surface.
  Materializers may also read the
  engine surface they immediately mutate or reconcile. The
  roster-dependent resource requirement query is a separate declared adapter
  policy input.
- `plan-natural-wonders` consumes the immutable biome-classification product
  for physical suitability and observes current terrain, biome, and feature
  classifications once through declared adapter capabilities. It does not
  publish a current-engine snapshot or depend on mutable context fields.
- If the live requirement policy is unavailable, planning admits a regional minimum only for an age-valid resource with roster-independent `Staple`/`UnlocksCiv` basis. Every other unavailable decision is typed `unresolved`, never collapsed to `false`.
- Natural-wonder planning is deterministic; materialization preserves the
  planner's ordered primary/fallback policy while the adapter owns footprint
  resolution, legality, mutation, and strict readback. Exhausted candidates are
  recorded as degraded terminal evidence. The terminal measurement retains the
  final rejection in each exhausted chain; the established
  `NATURAL_WONDER_PLACEMENT_V1` wire separately retains the first rejection as
  an explicit compatibility projection. `assign-starts` classifies official
  wonder occupancy from a fresh engine feature-layer read after surface
  preparation, rather than consuming an earlier placement snapshot. Resource
  readback mismatches remain fail-hard.
- Surface preparation owns terrain validation, coast restoration, area
  recalculation, and water-cache storage as one maintenance transaction.
  It does not own final readback or product proof because later placement
  transitions still run. Landmass-region projection follows that transaction exactly
  once, so area maintenance cannot erase an earlier write and no consumer must
  restamp it. Pedology's immutable fertility field remains the input to
  authored start/resource planning; Civ7 fertility recalculation belongs only
  to the later `assign-advanced-starts` engine-effect step.

## Key artifacts

Artifacts are immutable domain products, not recipe-stage state. Placement and
Resources module catalogs own their artifacts beside the operations that
produce them; the Standard recipe imports those exact catalogs. Every artifact
owns the complete structural and semantic validator used by publication and
validated reads. Inventory:

| Artifact | Published by | Substance |
| --- | --- | --- |
| `naturalWonderPlan` | plan-natural-wonders | deterministic scored wonder intent owned by `placement/modules/wonders` |
| `landmassRegionSlotByTile` | plot-landmass-regions | deterministic region classification owned by `placement/modules/regions` |
| `resourceDemandPlan` | plan-resource-demands | one closed candidate ledger partitioned into admitted demand rows with habitat/legal/intensity evidence and excluded rows with typed terminal reasons |
| `resourcePlan` | select-resource-sites | typed per-plot site intents (type, family, lane, phase, inHabitat) + per-type shortfalls + region minimums |
| `startAssignment` | assign-starts | per-player `StartRecord[]` (components, tier, score, rung, status, imputedFlags, playerIdSource) + `fairnessReport` (worstPairGap, swaps, relaxations) + `inputCoverage` |
| `resourcePlanAdjusted` | adjust-resources | adjusted intents with typed support provenance (action, reason, seatIndex) |
Natural-wonder, resource, and discovery materialization, advanced-start
assignment, and surface maintenance are effects or observations rather than
immutable domain products. Natural-wonder materialization emits one typed
terminal measurement whose admitted final outcomes feed metrics and
visualization. Its exact-log emitter instead receives an explicit compatibility
view derived from the same admitted attempt sequence, retaining the first
rejection for exhausted fallback chains without presenting that view as
terminal evidence. Replay retains the deterministic plan and final feature
surface instead. Resource materialization likewise emits one typed terminal
measurement whose enriched outcome rows and derived summaries feed benchmarks,
deterministic replay, and the exact log; no later recipe step consumes either
terminal measurement.
Discovery and resource counts flow through typed metric facets and live logs.
Terminal parity remains a terminal observation without a redundant effect tag.
Other observation evidence uses the capability appropriate to its consumer. No
ordering-only, current-engine-snapshot, or aggregate-output pseudo artifact is
published.

## Ops surface

`domain/placement` exposes three semantic modules in causal order:

- `wonders.ops.planNaturalWonders` — deterministic natural-wonder site planning
  from pipeline artifacts and the requested count admitted from active Civ7
  map-size metadata at the `plan-natural-wonders` recipe boundary.
- `regions.ops.projectLandmassRegions` — seam-safe whole-landmass assignment to balanced west/east gameplay regions; Civ7 region-id mutation remains a recipe effect.
- `starts.ops.planStarts` — candidate admission against wonder and region
  evidence (plus impassability and volcano screens), scoring
  (fertility/freshwater/climate-comfort/resource-support/roughness/StartBias),
  tiering, four-rung selection ladder, fairness balancing, and seat identity.

`domain/resources` composes four modules with level-local model authority:
`demand` owns the one canonical expectation-and-habitat demand resolver and its
closed admitted/excluded ledger, `habitat` owns habitat fields, `sites` owns
selected intents, and `support` owns start-aware adjustment. The Standard recipe
owns terminal resource-materialization evidence because it describes an
engine-facing product observation rather than a reusable domain product. Shared
atoms and policy remain under the narrowest module or domain `model/` owner that
has multiple consumers.

- `resolveResourceDemands` — binds every canonical Earthlike expectation to its single habitat family/lane, derives habitat capacity once, and applies official identity, initial-age, regional-minimum, river, and current Civ7 legality policy before publishing the admitted/excluded ledger consumed by site selection.
- `deriveHabitatFields` — habitat-lane masks + per-family intensity fields from pipeline artifacts only (including marine/aquatic lanes).
- `selectResourceSites` — blue-noise site selection with per-type spacing floors, habitat-intensity thinning, per-landmass equity, affinity/exclusion rules, region-minimum force pass; policy legality gates selection before the engine oracle ever runs.
- `adjustResourceSupport` — bounded resource↔start floor/equity adjustment with all selection invariants enforced at destinations.

Symbolic→runtime resource ids are proven by a three-way agreement check (corpus slot == policy V0 table index == V1 row type), hard-failing on any divergence.

## Config posture (operation-derived)

The `placement` stage has no parallel public-config assembly and no
stage-level knob surface. Its authoring shape is composed from the twelve
causal step contracts and their bound operation envelopes, so advanced
placement capability remains available without a hand-shadowed schema. The
Studio panel consumes the same generated recipe authority
(`build:studio-recipes`).

The operation-owned surfaces include resource density, spacing, family
affinity and exclusions; start viability, scoring, spacing and fairness; and
resource-to-start support adjustment. Their defaults, ranges, and semantic
descriptions live with the strategy configs that execute those decisions.
ADR-010 remains the product taxonomy rather than a second configuration owner.

Policy data comes from `@civ7/map-policy` generated tables and corpus (`CIV7_BROWSER_TABLES_V0` byte-stable + `CIV7_POLICY_TABLES_V1`: resource catalog rows, valid ages, required leaders, minimum-amount modifiers, StartBias tables, start globals), regenerated only via `nx run civ7-map-policy:generate` from the `.civ7/outputs/resources` submodule. That package owns `Weight`, `MinimumPerHemisphere`, age validity, and the static `Staple`/`UnlocksCiv` fallback basis; it does not approximate the roster-dependent live requirement decision. Natural-wonder membership is derived directly from those tables and proved by owner-local map-policy tests. There are no `globalThis.GameInfo` reads in the recipe layer; the resource catalog and exact live requirement query flow through `EngineAdapter`.

## Studio visualization coverage

Visualization-bearing steps emit decision-substance layers in the shared
`Gameplay / Placement` group. Resource habitat, legality, and selected intent
remain one selection-owned evidence set; the preceding demand step publishes
the complete artifact without a duplicate visualization result.
`assign-advanced-starts` and `place-discoveries` are recorded no-content
exceptions because neither has a meaningful per-plot readback. Plan-side
scoring layers emit before materialization, so they survive degraded selection.
Score layers carry explicit unit-domain value specs; zero-means-none
categorical layers declare transparent zero categories. Coverage is pinned by
`mods/mod-swooper-maps/test/recipes/swooper-physics-standard/viz/placement.test.ts`.

## Verification surfaces

- The generic benchmark subsystem and proof boundary are defined in
  [`docs/system/libs/mapgen/benchmarks/BENCHMARKS.md`](/system/libs/mapgen/benchmarks/BENCHMARKS.md).
  The Standard recipe's executable twenty-seed placement/resource study, exact
  targets, dimensions, expectations, and measurement-family links live in its
  [Earthlike placement study sheet](../../../../../../mods/mod-swooper-maps/src/recipes/standard/metrics/studies/benchmarks/earthlike-placement.md).
  Run it through `nx run mod-swooper-maps:metrics:report`; the ordinary mod test
  target is the behavioral gate. This is completed headless evidence, not a
  live-engine claim.
- The old live legality and required-for-age scripts were milestone-scoped
  characterization, not reusable policy gates, and are retired. Their recorded
  evidence remains historical. Static facts and fallback admission belong to
`@civ7/map-policy`; roster-dependent policy flows through `EngineAdapter`, and
  resulting placement behavior is proved through bounded product verification.
- Live full-grid parity: `nx run mod-swooper-maps:verify:operational -- --mode final-surface-parity` (milestone-boundary proof class; see `docs/projects/placement-realignment/MILESTONE-PROOFS.md`).

## Ground truth anchors

- Realignment project (diagnosis, expectations, refactor plan, per-slice evidence): `docs/projects/placement-realignment/`
- ADR-008 (domain/resources owns resource planning; landmass-region divergence), ADR-009 (deterministic typed reconciliation; readbacks evidence-only), ADR-010 (knob taxonomy): `docs/system/ADR.md`
- Stage definition: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/index.ts`
- Stage composition and operation-derived surface: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/index.ts` plus the configuration module owned by each child step
- Placement artifact catalogs: `mods/mod-swooper-maps/src/domain/placement/modules/{regions,starts,wonders}/artifacts/`
- Resource artifact catalogs: `mods/mod-swooper-maps/src/domain/resources/modules/{demand,sites,support}/artifacts/`
- Domain ops: `mods/mod-swooper-maps/src/domain/placement/modules/starts/ops/`, `mods/mod-swooper-maps/src/domain/placement/modules/wonders/ops/`, `mods/mod-swooper-maps/src/domain/resources/modules/*/ops/`
- Policy tables: `packages/civ7-map-policy/src/civ7-tables.gen.ts` (generator-only writes)
- Tag registry: `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
