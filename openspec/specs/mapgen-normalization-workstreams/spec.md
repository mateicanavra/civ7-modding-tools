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
