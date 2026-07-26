## ADDED Requirements

### Requirement: Placement Planning Consumes Pipeline Artifacts And Declared Inputs Only

Placement planning SHALL source every planning input from a pipeline
artifact, a declared field dependency, or an explicitly DECLARED
engine-surface read in the step contract (ADR-009). The natural-wonder
planning surface SHALL take its biome surface from the ecology
`biomeBindings` projection artifact and its feature surface from the
declared `field:featureType` dependency; the per-tile TERRAIN read SHALL be
declared in the `derive-placement-inputs` contract with its ADR-009
rationale (engine-only `validateAndFixTerrain` side effects make offline
terrain reconstruction unsound). Elevation SHALL come from the morphology
topography artifact, never from an undeclared `context.buffers` edge. The
recipe layer SHALL NOT read engine globals (`globalThis.GameInfo`)
directly; runtime catalogs come from adapter methods (live: GameInfo behind
the adapter; mock: policy tables). Engine readbacks used as evidence
(parity snapshots, plan-input telemetry digests, the terminal
physics-vs-engine waterDrift comparison) remain and SHALL be labeled as
evidence reads.

#### Scenario: No silent engine-surface planning input
- **WHEN** `derive-placement-inputs` builds the natural-wonder plan input
- **THEN** biome comes from `artifact:ecology.biomeBindings`, feature from
  `field:featureType`, elevation from `artifact:morphology.topography`, and
  the only engine-surface read is the terrain read declared in the step
  contract

#### Scenario: Resource catalog stays behind the adapter
- **WHEN** resource placement telemetry resolves symbolic resource names
- **THEN** it calls `adapter.getResourceCatalog()` and no code under
  `src/recipes/**` reads `globalThis.GameInfo`

### Requirement: Placement Artifacts Are Single-Published, Validated, And Never Ordering Tokens

Each placement artifact SHALL be published exactly once by its owning step
and consumed by reading that artifact — never by importing another step's
modules (no cross-step helper imports) and never by embedding the same plan
in a second artifact. Steps SHALL NOT declare artifact requirements whose
values they discard: ordering between placement products is carried by the
effect-tag chain alone. Every placement-stage artifact SHALL register an
`implementArtifacts` validate hook covering its cheap cross-field
invariants (count reconciliation, coordinate-proof/row agreement, grid
partitions, full-grid buffer lengths). Artifact contracts SHALL live one
`defineArtifact` per file under the stage's `artifacts/contract/`
directory. The terminal `placementOutputs` artifact SHALL contain only
measured fields.

#### Scenario: One publish per plan
- **WHEN** the derivation step publishes the natural-wonder and discovery
  plans
- **THEN** each plan exists as exactly one artifact and `placementInputs`
  does not embed either plan

#### Scenario: Ordering-only reads are gone
- **WHEN** place-discoveries, assign-advanced-starts, assign-starts,
  place-resources, and prepare-placement-surface declare their artifact
  requirements
- **THEN** every declared artifact requirement is read AND used, and the
  product ordering (wonders → surface prep → plan → starts → adjust →
  stamp → discoveries → advanced starts) is enforced by effect tags

#### Scenario: Publish-time validation everywhere
- **WHEN** any placement-stage artifact is published with incoherent counts
  or wrong-sized buffers
- **THEN** the engine fails fast at the publish site via the artifact's
  validate hook

#### Scenario: No fake output fields
- **WHEN** the terminal placement step publishes `placementOutputs`
- **THEN** the artifact carries only measured counts (wonders, resources,
  starts, discoveries) and the `engine.placementApplied` gate checks only
  those
