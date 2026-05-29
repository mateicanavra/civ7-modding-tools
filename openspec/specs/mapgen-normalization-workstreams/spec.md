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
