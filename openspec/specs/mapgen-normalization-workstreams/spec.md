# MapGen Normalization Workstreams

## Purpose

Record the OpenSpec operating requirements for converting the accepted MapGen
architecture normalization packet into reviewable implementation workstreams.
## Requirements
### Requirement: Authority Freeze Precedes Migration Work

OpenSpec workstreams SHALL preserve the architecture normalization packet as
the current baseline before implementation slices modify source topology,
recipe config contracts, or stage ownership.

#### Scenario: First normalization workstream starts
- **WHEN** the first OpenSpec change for this normalization program is drafted
- **THEN** it treats Domino 0 as complete only if the packet is the single
  root-level architecture-normalization decision artifact
- **AND** source review, comparison, and debate documents remain labeled as
  source material rather than active authority

### Requirement: Product Surface And Import Policy Are Early Slices

OpenSpec workstreams SHALL sequence the flat stage-config surface and initial
scoped import policy before broad stage topology movement.

#### Scenario: D1 work starts
- **WHEN** a change touches recipe config schema, defaults, presets, Studio
  config export, or stage `public + compile` surfaces
- **THEN** the change follows the flat default shape
  `{ knobs?, [stepId]?: stepConfig }`
- **AND** it does not introduce a persisted SDK-native `advanced` wrapper

#### Scenario: Import guardrail work starts
- **WHEN** a change adds import enforcement for recipe/domain boundaries
- **THEN** it begins with the narrow recipe deep-import guard after public
  surface remediation
- **AND** it does not broad-ban legitimate internals before public surfaces
  exist

### Requirement: Ecology Topology Uses Real Stage Surfaces

OpenSpec workstreams SHALL model Ecology truth as recipe-level stages only
where the accepted packet names real input/handoff surfaces.

#### Scenario: Ecology topology change is drafted
- **WHEN** a change moves, merges, or creates Ecology stages
- **THEN** it uses `ecology-pedology`, `ecology-biomes`, and
  `ecology-features` as truth stages
- **AND** it treats `map-ecology` as projection/materialization only

#### Scenario: Feature-family wrappers are folded
- **WHEN** feature-family stage wrappers are merged into `ecology-features`
- **THEN** the change includes output-equivalence or golden artifact checks for
  feature plans, occupancy, and final projection inputs

### Requirement: Projection Truth Corrections Follow Capability

OpenSpec workstreams SHALL add projection/materialization capability before
fail-hard parity gates.

#### Scenario: Lake truth work is drafted
- **WHEN** a change claims Hydrology deterministic lake truth
- **THEN** it first provides or cites lake stamping/readback capability
- **AND** placement migration and parity gates wait until materialization can
  prove the planned mask

#### Scenario: map-* stage audit runs
- **WHEN** a change keeps a `map-*` stage
- **THEN** the stage owns projection/materialization, effects, adapter writes,
  map artifacts, projection knobs, or parity evidence
- **AND** Studio grouping or internal implementation seams alone are
  insufficient justification

### Requirement: Placement Splits At Product Or Effect Contracts

OpenSpec workstreams SHALL split placement at real product/effect boundaries
and SHALL NOT manufacture fake dependency chains that only encode ordering.

#### Scenario: Placement decomposition is drafted
- **WHEN** a change splits placement
- **THEN** each promoted step names its product/effect contract, artifact or
  effect surface, verification boundary, and consumer impact
- **AND** maintenance operations remain transactional unless they gain an
  independent contract or consumer

#### Scenario: Resource or discovery reconciliation is drafted
- **WHEN** a change gates resource or discovery placement
- **THEN** it uses typed placement outcomes and typed rejection reasons
- **AND** it does not gate on naive `placed === planned` equality

### Requirement: Guardrails Encode Achieved Structure

OpenSpec workstreams SHALL enable guardrails only after the corresponding
cleanup has landed or the proposal explicitly scopes the guard to currently
passing behavior.

#### Scenario: Guardrail change is drafted
- **WHEN** a change adds G1-G9 style enforcement from the normalization packet
- **THEN** it cites the cleanup slice that makes the guard pass
- **AND** it records what the guard proves and what remains outside its proof

### Requirement: Authority Routing Change Closes Domino 0

The normalization train SHALL include an explicit authority-routing change that
proves active work enters through the accepted packet and not through source
review artifacts.

#### Scenario: Authority routing is verified
- **WHEN** implementation work for later normalization changes begins
- **THEN** the authority-routing change has verified that the packet is the
  only active root-level architecture-normalization decision artifact
- **AND** source review, comparison, and debate artifacts are labeled as
  provenance rather than normative authority

### Requirement: Source Materials Remain Audit Evidence

Authority routing SHALL preserve review and debate materials as audit evidence
while preventing them from competing with the accepted packet.

#### Scenario: A stale source artifact disagrees with the packet
- **WHEN** a source artifact under `architecture-normalization-sources/`
  disagrees with the packet
- **THEN** later OpenSpec changes follow the packet
- **AND** they cite the source artifact only as evidence or provenance

### Requirement: Flat Config Migration Owns All Persisted Consumers

The D1 config-surface change SHALL migrate all first-party persisted config
consumers to `{ knobs?, [stepId]?: stepConfig }` in the same change that
removes wrapper-only stage compiles.

#### Scenario: Wrapper-only compile is removed
- **WHEN** a standard stage deletes a `public.advanced` wrapper that only
  unwraps step config
- **THEN** first-party map configs, presets, tests, Studio config readers, and
  examples that targeted that wrapper are migrated to top-level step IDs
- **AND** no dual persisted config shape is introduced

### Requirement: Genuine Public Transforms Remain Explicit

The D1 migration SHALL preserve explicit `public + compile` stages only when
the public surface is a genuine transform rather than an `advanced` passthrough.

#### Scenario: A stage keeps public compile
- **WHEN** a standard stage keeps `public + compile`
- **THEN** the design records the public keys, internal step keys, and reason
  the transform is product-visible
- **AND** the stage is excluded from G9 wrapper-only enforcement

### Requirement: Flat Schema Feasibility Is Dispositioned

The D1 migration SHALL disposition every flat step-key schema that cannot be
derived from declared stage steps in the same slice.

#### Scenario: A flat step key remains late-validated
- **WHEN** a flat stage config key cannot be schema-derived during D1
- **THEN** the implementation records the reason and the remaining runtime
  validation gate
- **AND** tests still prove the flat persisted config behavior

### Requirement: Import Guard Follows Public Surface Remediation

The import-boundary change SHALL create or repair required public surfaces
before enabling the first recipe deep-import guard.

#### Scenario: Recipe deep-import guard is enabled
- **WHEN** the guard for `src/recipes/**` imports is enabled
- **THEN** every blocked import has a named public owner surface or an explicit
  accepted exception
- **AND** sanctioned domain surfaces are not broad-banned

### Requirement: Scoped Matrix Separates Policy From Enforcement

The import policy SHALL distinguish documented target policy from guardrails
that are actually enforceable in the current slice.

#### Scenario: Broader import policy is documented
- **WHEN** the policy names future cross-domain or internal import restrictions
- **THEN** the proposal records which restrictions are not yet enforced
- **AND** later guardrail work cites the cleanup slice that makes each
  restriction pass

### Requirement: Core Purity And Studio Contracts Are Separate From D1

Consumer/package-boundary repairs SHALL be specified separately from the D1
config-shape migration unless the only changes are direct config callsite
fallout.

#### Scenario: Pure core owns a Civ7-bound helper
- **WHEN** a helper under pure MapGen core imports adapter values or runtime
  globals
- **THEN** the consumer-boundary change moves it to an explicit runtime owner
- **AND** pure core retains only pure authoring, typing, or recipe contracts

### Requirement: Studio Contract Source Is Explicit

Studio SHALL consume recipe config schema/default contracts from an intentional
source-visible or generated-contract owner.

#### Scenario: Studio reads recipe config contracts
- **WHEN** Studio imports schema or default config for a recipe
- **THEN** the owning source or generated-contract path is documented
- **AND** generated artifacts are not treated as editable product policy

### Requirement: Catalog Cleanup Distinguishes Shared Surfaces From Drift

The morphology/catalog owner change SHALL classify broad catalogs before
moving or deleting them.

#### Scenario: A domain or recipe catalog is retained
- **WHEN** a broad catalog remains after owner cleanup
- **THEN** it is a thin barrel or an explicit shared surface
- **AND** its invariant and concrete consumers are documented

### Requirement: Milestone Tags Are Retired Before G1

Milestone-prefixed tag identifiers SHALL be renamed, retired, or explicitly
excluded before the G1 guardrail is enabled.

#### Scenario: G1 is proposed
- **WHEN** the milestone-tag guard is enabled
- **THEN** active source no longer uses milestone-prefixed tag identifiers
- **AND** any remaining occurrence is historical, archived, or explicitly
excluded

### Requirement: Lake Truth Waits For Adapter Materialization

The lake projection change SHALL provide or cite adapter lake stamping/readback
before enabling fail-hard parity for Hydrology lake intent.

#### Scenario: Lake parity is enforced
- **WHEN** a lake parity gate fails the pipeline on drift
- **THEN** adapter materialization and readback for the planned lake mask are
  already implemented and tested
- **AND** the gate compares planned truth to observed projection evidence

### Requirement: Engine Lake Generation Is Replaced By Stamping

The lake projection change SHALL stamp Hydrology lake intent through an
adapter capability instead of calling Civ7 engine lake generation from the
standard recipe.

#### Scenario: map-hydrology projects lake intent
- **WHEN** `map-hydrology/lakes` materializes lakes
- **THEN** it calls `stampLakes(...)` with `artifact:hydrology.lakePlan`
- **AND** it does not call `generateLakes(...)`
- **AND** rejected/stamped lake masks are recorded as projection evidence

### Requirement: Placement Lake Inputs Move After Lake Readback

Placement SHALL consume Hydrology lake truth only after lake intent can be
materialized and read back.

#### Scenario: Placement lake inputs are migrated
- **WHEN** placement input derivation stops consuming projection lake
  diagnostics
- **THEN** Hydrology lake intent has an adapter materialization/readback path
- **AND** the change does not split unrelated placement products

### Requirement: Ecology Topology Fold Preserves Observable Feature Products

The ecology topology change SHALL prove that folded feature-family wrappers
preserve feature plans, occupancy, and projection inputs unless the proposal
records an intentional product change.

#### Scenario: Feature-family wrappers are folded
- **WHEN** `ecology-ice`, `ecology-reefs`, `ecology-wetlands`, or
  `ecology-vegetation` logic is folded into `ecology-features`
- **THEN** output-equivalence or golden checks cover feature planning,
  occupancy cascade, and final projection inputs
- **AND** any output drift is explicitly classified as intentional or blocking

### Requirement: map-ecology Does Not Own Truth

The ecology topology change SHALL keep `map-ecology` limited to projection,
materialization, effects, diagnostics, and parity evidence.

#### Scenario: map-ecology retains a step
- **WHEN** a `map-ecology` step remains after topology normalization
- **THEN** its contract consumes upstream ecology truth artifacts
- **AND** it writes only engine-facing fields, effects, diagnostics, or
  projection evidence

### Requirement: Placement Step Promotion Requires Product Evidence

The placement contract change SHALL promote placement work into separate steps
only when each promoted step has a product or effect boundary.

#### Scenario: Placement work becomes a step
- **WHEN** a placement concern is promoted to a step
- **THEN** the step names its artifact or effect surface, verification
  boundary, and consumer impact
- **AND** the step is not justified only by helper function boundaries or
  internal ordering

### Requirement: Maintenance Work Remains Transactional Without Consumers

Maintenance placement operations SHALL remain transactional unless they gain
independent artifacts, effects, or consumers.

#### Scenario: Maintenance operation is considered for promotion
- **WHEN** terrain validation, area recalculation, restamping, water cache
  storage, or fertility recalculation is considered for a new step
- **THEN** the proposal names the independent contract or leaves the operation
  transactional

### Requirement: Resource And Discovery Reconciliation Uses Typed Outcomes

Resource and discovery placement SHALL reconcile planned intent against typed
projection outcomes instead of comparing total planned and placed counts.

#### Scenario: Engine rejects a planned resource or discovery
- **WHEN** the engine does not place a planned resource or discovery
- **THEN** the reconciliation records a typed rejection reason
- **AND** the pipeline fails only if the rejection is untyped, unexplained, or
  contradicts the planned type/location contract

### Requirement: Official Generator Output Is Not Silent Truth

The reconciliation change SHALL update authority records when official
generator output is no longer accepted as silent placement truth.

#### Scenario: Docs still call official generator output authoritative
- **WHEN** implementation owns typed placement intent and reconciliation
- **THEN** docs, ADRs, or deferrals that describe best-effort official
  generator output as accepted truth are updated or superseded

### Requirement: Guard Enablement Cites Completed Cleanup

Each normalization guard SHALL cite the cleanup change that makes the guarded
structure true before the guard is enabled.

#### Scenario: A G1-G9 guard is added
- **WHEN** a guardrail from the normalization packet is enabled
- **THEN** the guard cites the completed cleanup slice it encodes
- **AND** the guard either passes current intended source or explicitly scopes
  itself to already-passing behavior

### Requirement: Promotion Follows Evidence

OpenSpec archives and evergreen spec promotions SHALL follow implemented and
verified behavior rather than proposal-only target shape.

#### Scenario: A normalization change is archived
- **WHEN** an OpenSpec normalization change is archived
- **THEN** implementation tasks are complete
- **AND** source gates, downstream realignment, and proof records support the
  promoted requirements

### Requirement: Authority Promotion Names Superseding Records

Authority promotion SHALL identify which evergreen doc, ADR, or OpenSpec spec
supersedes each promoted packet section.

#### Scenario: A packet decision is promoted
- **WHEN** a packet decision becomes long-lived authority outside the packet
- **THEN** the promotion records the superseding file and decision scope
- **AND** the packet is updated or cross-referenced so later agents do not
  treat both records as competing authority

### Requirement: Visualization Contracts Use Owner Surfaces

Standard recipe visualization contracts SHALL live at the nearest real owner:
stage/phase-level contracts at the stage surface, and step-private helpers in
the owning step only.

#### Scenario: A visualization helper has multiple consumers
- **WHEN** a visualization category, geometry converter, or palette is consumed
  by multiple steps or by a different stage
- **THEN** the helper is exported from `stages/<stage>/viz.ts` for the owner
  stage
- **AND** consumers do not import from another stage's private `steps/**`
  paths

#### Scenario: A visualization helper is step-private
- **WHEN** a visualization helper is imported only by files in its owning step
- **THEN** it may remain under `stages/<stage>/steps/<step>/viz.ts`
- **AND** any new external consumer must first promote the helper to the owner
  stage surface

#### Scenario: A stage-level visualization surface exists
- **WHEN** a stage-level visualization contract has replaced an old private
  path
- **THEN** wrapper-only re-exports at the old step path are removed
- **AND** guardrails reject private-step visualization hubs or cross-step
  imports

### Requirement: SDK Root Does Not Load Civ7 Map Runtime

The SDK root SHALL remain safe for Node/Bun build-tool consumers and SHALL NOT
load Civ7 map runtime adapter modules as a side effect of importing general SDK
mod-authoring APIs.

#### Scenario: A build-tool consumer imports SDK root
- **WHEN** a package imports builders, nodes, constants, files, or `Mod` from
  `@mateicanavra/civ7-sdk`
- **THEN** that import does not transitively load `@civ7/adapter/civ7`
- **AND** it does not require Civ7 `/base-standard/...` modules to resolve

#### Scenario: A map entrypoint uses createMap
- **WHEN** a Civ7 map file uses the SDK map authoring helper
- **THEN** it imports `createMap` from `@mateicanavra/civ7-sdk/mapgen`
- **AND** the explicit mapgen subpath owns the opt-in to Civ7 map runtime
  adapter binding

#### Scenario: A guardrail protects the boundary
- **WHEN** normalization guardrails run
- **THEN** they reject SDK root exports/imports that reintroduce the mapgen
  runtime into `@mateicanavra/civ7-sdk`
- **AND** they continue allowing Civ7 runtime imports inside the explicit SDK
  mapgen subpath and adapter implementation

### Requirement: Studio Preset Wrappers Keep Stage Config Under Config

Built-in Studio preset wrapper files SHALL keep recipe stage configuration
under the wrapper `config` object and SHALL reject stale stage keys at the
wrapper root.

#### Scenario: A topology migration changes stage ids
- **WHEN** a built-in preset is migrated to new stage ids
- **THEN** the migrated stage keys appear under `config`
- **AND** wrapper metadata remains limited to `$schema`, `id`, `label`,
  `description`, and `config`

#### Scenario: Preset wrapper tests run
- **WHEN** tests validate a built-in Studio preset wrapper
- **THEN** the reusable preset wrapper helper rejects unknown root keys
- **AND** schema validation runs only after the wrapper boundary is valid

### Requirement: Residual Standardization Removes Compensation Paths

Follow-on normalization work SHALL remove old owner paths after the rightful
owner exists, rather than preserving aliases, fallbacks, dual ids, or
compatibility wrappers.

#### Scenario: A config or artifact owner moves
- **WHEN** a persisted config key, artifact id, or helper path moves to the
  normalized owner
- **THEN** active first-party callers, configs, docs, and tests use the new
  owner
- **AND** the old owner is not kept as an alias or fallback

### Requirement: Projection Evidence Is Projection-Owned

Projection/readback artifacts SHALL be owned by the stage or product boundary
that materializes or observes engine state, not by the upstream truth domain.

#### Scenario: map projection stages record engine readback
- **WHEN** map-hydrology stamps lakes or map-rivers models rivers and records
  observed engine state
- **THEN** the projection artifact ids use the owning map projection namespace
  (`artifact:map.hydrology.*` for lake readback and `artifact:map.rivers.*`
  for river readback)
- **AND** Hydrology hydrography artifacts remain truth-only

### Requirement: map-* Stages Do Not Plan Domain Truth

`map-*` stages SHALL consume upstream truth artifacts and project them into
engine state, effects, map artifacts, and readback evidence.

#### Scenario: A projection step needs ridge or foothill masks
- **WHEN** map-morphology stamps mountains, ridges, or foothills
- **THEN** Morphology truth stages produce the ridge/foothill intent first
- **AND** map-morphology only materializes that intent into engine terrain and
  projection evidence

### Requirement: Placement Product Effects Have Step Owners

Placement product/effect contracts SHALL be represented as explicit steps when
they own a distinct gameplay product or engine effect.

#### Scenario: Placement applies resources, starts, discoveries, or advanced starts
- **WHEN** a placement product writes engine state or publishes typed outcomes
- **THEN** the product has a named step contract with its own provides/effects
- **AND** the final placement summary consumes those product results instead of
  re-running the product logic through a broad monolith

### Requirement: Strategy Config Schemas Stay With Real Owners

Operation, strategy, or family-specific config schemas SHALL live with the
owning op/strategy contract or a named family invariant, while domain-root
config surfaces remain thin facades unless a shared invariant is documented.

#### Scenario: A domain-root config file contains strategy schemas
- **WHEN** the schemas are specific to separate narrative, morphology, ecology,
  hydrology, or placement concerns
- **THEN** the schemas move to the owning concern or named family owner
- **AND** the domain-root config file only aggregates or documents a concrete
  shared invariant with concrete consumers

### Requirement: Ecology Feature Scores Become Sparse Intents

Ecology feature-family planners SHALL convert continuous per-tile suitability
scores into sparse feature intents through a documented planner admission
policy while preserving feature-family-specific habitat rules.

#### Scenario: A tile has only weak positive suitability
- **WHEN** a feature score is positive but does not satisfy the owning
  feature-family admission policy
- **THEN** the planner does not emit a feature placement for that tile
- **AND** the tile remains available for later feature families according to
  the current occupancy chain

#### Scenario: Feature families share the score-to-intent category
- **WHEN** reef, wetland, vegetation, or ice planning consumes continuous
  suitability scores and occupancy snapshots
- **THEN** tests cover the shared weak-positive category rather than only one
  named feature
- **AND** each family owns a local policy instead of routing through generic
  feature-planner shared machinery
- **AND** those policies do not replace reef, wetland, vegetation, or ice
  habitat physics

#### Scenario: A planner evaluates a tile
- **WHEN** a feature-family planner evaluates a candidate tile
- **THEN** feature-family habitat eligibility is evaluated before the
  family-local admission policy
- **AND** occupancy/reservation claim and artifact publish happen after the
  admitted feature intent is selected

### Requirement: Reef Intent Planning Uses Reef-Specific Habitat Eligibility

Reef-family feature planning SHALL apply reef-specific habitat eligibility
rather than treating every shallow or temperature-suitable water tile as reef
intent.

#### Scenario: Broad water has weak reef structure
- **WHEN** water tiles have broad positive temperature/depth suitability but no
  reef-family habitat structure
- **THEN** reef planning does not emit blanket reef placements

#### Scenario: Reef-family features differ physically
- **WHEN** warm reefs, cold reefs, atolls, or lotus features are planned
- **THEN** each feature follows its named physical habitat rule
- **AND** reef-family planner admission does not erase those distinctions

#### Scenario: Atolls are evaluated
- **WHEN** `FEATURE_ATOLL` is considered for a water tile
- **THEN** the tile must satisfy isolated shallow-bank habitat rather than
  generic reef or near-coast water habitat
- **AND** atoll density is bounded by the same sparse-intent proof as other
  reef-family features

### Requirement: Wetland Intent Planning Uses Wetland-Specific Habitat Partitions

Wetland-family feature planning SHALL distinguish hydromorphic, intertidal,
cold-bog, and arid water-point habitats instead of treating broad near-river
moisture as generic wetland intent.

#### Scenario: Humid highland is near a river
- **WHEN** a land tile is moist and river-adjacent but lacks wetland habitat
  eligibility such as lowland, floodplain, waterlogged, or intertidal context
- **THEN** marsh planning does not emit a marsh intent for that tile

#### Scenario: Wetland-family features differ physically
- **WHEN** marsh, tundra bog, mangrove, oasis, or watering-hole features are
  planned
- **THEN** each feature follows its named habitat partition
- **AND** wetland-family planner admission does not erase those distinctions

#### Scenario: Wetland substrate is shared
- **WHEN** feature substrate publishes hydromorphic or well-drained eligibility
- **THEN** the field names represent physical invariants with concrete wetland
  and vegetation consumers
- **AND** feature-specific wetland rules remain in owning wet feature ops

### Requirement: Shipped Map World Balance Is Measured

The MapGen normalization workstream SHALL verify shipped map identities through
full standard-recipe world-balance stats that measure product-visible geography
rather than isolated implementation details.

#### Scenario: A shipped map config is generated

- **WHEN** a shipped map identity is run through the public standard recipe and runtime
- **THEN** the resulting stats include pre-lake land, projected water, planned
  lake tiles, wetland tiles, reef-family tiles, and feature counts
- **AND** tests assert ratios or presence properties appropriate to the map
  identity instead of exact tile counts

#### Scenario: Lakes are planned

- **WHEN** Hydrology converts routing sinks into lake intent
- **THEN** sink tiles are admitted by accumulated discharge and an explicit
  lakeiness budget
- **AND** `map-hydrology` only projects the Hydrology lake plan and records
  engine acceptance or drift

#### Scenario: Ecology feature scores become visible features

- **WHEN** reef, wetland, vegetation, or ice planners convert score layers into
  feature intents
- **THEN** the score-to-intent policy is owned by the feature-family planner
- **AND** configs may tune family-local admission policy for shipped map identity
- **AND** feature-specific habitat physics remain in the owning score op or
  strategy rather than a generic shared planner bucket

#### Scenario: Hydrology artifacts are validated

- **WHEN** Hydrology publishes climate or hydrography artifacts
- **THEN** runtime typed-array/size validation is owned by the producing step
  publication boundary or by generic MapGen-core artifact machinery
- **AND** stage artifact registries remain schema/contract surfaces unless a
  categorical artifact-module architecture is introduced for all in-kind stages
- **AND** broad domain helper buckets do not become the default owner for
  unrelated artifact payload validation

#### Scenario: Engine sea-level behavior is investigated

- **WHEN** official resources expose only schema/UI sea-level artifacts without
  active map-script usage or adapter API
- **THEN** MapGen does not add a compatibility layer or dedicated sea-level
  OpenSpec change
- **AND** MapGen `seaLevel` remains morphology truth while water-fill mismatch
  remains projection/readback evidence

### Requirement: Shipped Maps Reject Visual Lake Scatter

The MapGen normalization workstream SHALL test player-visible lake shape and
projection state for shipped map identities, not only aggregate lake area.

#### Scenario: Lake area is split into isolated dots

- **WHEN** a shipped map identity is run through the public standard recipe and runtime
- **THEN** world-balance stats measure engine lake connected components,
  one-tile lake share, largest lake component size, projection mismatch, and
  water-fill drift
- **AND** the proof rejects maps where acceptable lake area is mostly isolated
  one-tile basins

#### Scenario: Lake projection is accepted by the engine

- **WHEN** Hydrology lake truth is projected by map-hydrology
- **THEN** engine-accepted lake tiles remain water in adapter readback
- **AND** rejected lake tiles stay within the shipped-map mismatch budget

#### Scenario: Current strategy selections are available

- **WHEN** a shipped map config has a named current strategy that better matches
  the map identity than an older/simple selection
- **THEN** the config selects the named strategy
- **AND** broad replacement of every `default` selection is not required because
  current advanced implementations may be registered as `default`

### Requirement: Engine Terrain Materialization Order Is Explicit

The MapGen normalization workstream SHALL encode Civ7 engine terrain materialization order in the standard recipe rather than hiding it in repair helpers or local compensation paths.

#### Scenario: Static water exists before elevation shaping

- **WHEN** the standard recipe projects gameplay terrain into the Civ7 engine
- **THEN** static morphology terrain projection runs before lake projection
- **AND** Hydrology lake projection runs before `TerrainBuilder.buildElevation()`
- **AND** engine river modeling runs after `TerrainBuilder.buildElevation()`

#### Scenario: Materialization order is guarded categorically

- **WHEN** map projection tests inspect the standard recipe
- **THEN** they assert the relative order of lake projection, elevation building, and river modeling
- **AND** the guard is not tailored to one map config or one seed
