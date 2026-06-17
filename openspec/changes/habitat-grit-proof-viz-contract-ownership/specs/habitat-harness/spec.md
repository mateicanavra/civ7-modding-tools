## ADDED Requirements

### Requirement: Viz Contract Ownership Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-viz-contract-ownership` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition or accepted adapter proof, injected
violations, explicit baseline behavior, retired-mechanism parity, broader
visualization architecture closure, apply safety, and downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter viz_contract_ownership --json` exits 0
- **THEN** Habitat records native fixture proof for `viz_contract_ownership`
- **AND** Habitat SHALL NOT claim Habitat wrapper behavior, raw acquisition,
  baseline behavior, injected cleanup, apply safety, generator/migration,
  broader visualization architecture proof, neighboring row proof, or product
  proof from that command

#### Scenario: Stage visualization parser inventory is recorded

- **WHEN** the row records parser inventory for standard recipe stage source
- **THEN** the record SHALL name scan roots, exclusions, predicate path classes,
  counts, row id, and non-claims
- **AND** stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live intended candidates SHALL be recorded as blocker or disposition
  inputs rather than clean enforcement closure

### Requirement: Shared Visualization Contracts Use Stage Surfaces

Standard recipe visualization contracts SHALL use stage-level owner surfaces
for helpers shared across steps.

#### Scenario: Step hub viz file exists

- **WHEN** matching standard recipe source contains
  `stages/<stage>/steps/viz.ts`
- **THEN** `grit-viz-contract-ownership` SHALL report the file-hub surface
- **AND** the proof record SHALL state whether the behavior is proven by native
  fixtures, parser inventory, or Habitat wrapper proof

#### Scenario: Stage-level viz surface exists

- **WHEN** matching standard recipe source contains `stages/<stage>/viz.ts`
- **THEN** this row SHALL classify that file as the owner-stage control surface,
  not a current-row violation

### Requirement: Cross-Step Private Viz Imports Stay Blocked Or Dispositioned

Habitat SHALL record cross-step private visualization imports as blockers or
accepted dispositions when current source contains them.

#### Scenario: Current native predicate does not report a private-viz import class

- **WHEN** a fixture or parser inventory identifies a private step-viz import
  shape that the current native predicate does not report
- **THEN** row records SHALL preserve it as a predicate-gap blocker
- **AND** the row SHALL NOT claim exact import-form closure from native fixture
  proof

#### Scenario: Same-step private viz import exists

- **WHEN** a step imports `./viz.js` from its own step directory
- **THEN** this row SHALL classify the import as same-step private control
  context, not a cross-step private import candidate

### Requirement: Viz Contract Ownership Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for `grit-viz-contract-ownership`.

#### Scenario: Dependency-bound proof is unavailable in the row stack

- **WHEN** wrapper selector truth, raw acquisition, baseline behavior, injected
  cleanup, Effect adapter behavior, apply safety, generator/migration proof, or
  retired parity is not available in the current row stack/base
- **THEN** row records SHALL label those proof classes as blocked or non-claims
- **AND** the row SHALL NOT close those gates through native fixtures or parser
  inventory
