## ADDED Requirements

### Requirement: Placement Outcome Boundary Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-placement-outcome-boundary` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition or accepted adapter proof, injected
violations, explicit baseline behavior, retired-mechanism parity, broader
placement product coverage, generator/migration behavior, apply safety, and
downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter placement_outcome_boundary --json`
  exits 0
- **THEN** Habitat records native fixture proof for
  `placement_outcome_boundary`
- **AND** Habitat SHALL NOT claim Habitat wrapper behavior, raw acquisition,
  baseline behavior, injected cleanup, apply safety, generator/migration,
  broader placement product proof, neighboring row proof, or product proof from
  that command

#### Scenario: Placement apply parser inventory is recorded

- **WHEN** the row records parser inventory for terminal placement apply source
- **THEN** the record SHALL name scan roots, exclusions, predicate path classes,
  counts, row id, and non-claims
- **AND** temporary stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be recorded as blocker or
  disposition inputs rather than clean enforcement closure

### Requirement: Terminal Placement Apply Does Not Call Official Generators

Swooper terminal placement apply source SHALL avoid direct official
resource/discovery generator calls under the current
`grit-placement-outcome-boundary` predicate.

#### Scenario: Terminal placement apply calls official resource generation

- **WHEN** matching terminal placement `apply.ts` source directly calls
  `generateOfficialResources(...)`
- **THEN** `grit-placement-outcome-boundary` SHALL report the call
- **AND** the proof record SHALL state whether the behavior is proven by native
  fixtures, parser inventory, or Habitat wrapper proof

#### Scenario: Terminal placement apply calls official discovery generation

- **WHEN** matching terminal placement `apply.ts` source directly calls
  `generateOfficialDiscoveries(...)`
- **THEN** `grit-placement-outcome-boundary` SHALL report the call
- **AND** live findings SHALL require supervisor/source-owner/generator
  disposition before clean row closure

#### Scenario: Terminal placement consumes typed outcomes

- **WHEN** terminal placement apply source consumes `resourcePlacement`,
  `discoveryPlacement`, or typed outcome artifact fields
- **THEN** this row SHALL classify that usage as an approved current-predicate
  control, not an official-generator call
- **AND** product placement proof SHALL remain a separate proof class

### Requirement: Placement Outcome Boundary Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`grit-placement-outcome-boundary`.

#### Scenario: Dependency-bound proof is unavailable in the row stack

- **WHEN** wrapper selector truth, raw acquisition, baseline behavior, injected
  cleanup, Effect adapter behavior, apply safety, or generator/migration proof
  is not available in the current row stack/base
- **THEN** row records SHALL label those proof classes as blocked or non-claims
- **AND** the row SHALL NOT close those gates through native fixtures or parser
  inventory
