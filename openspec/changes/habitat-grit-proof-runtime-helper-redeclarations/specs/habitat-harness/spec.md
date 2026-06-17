## ADDED Requirements

### Requirement: Runtime Helper Redeclarations Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-runtime-helper-redeclarations` as complete
until row-level proof records separate native fixture behavior, parser
inventory, Habitat wrapper behavior, raw acquisition or accepted adapter proof,
injected violations, explicit baseline behavior, retired-mechanism parity,
neighboring runtime-purity rows, apply safety, and downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter runtime_helper_redeclarations --json`
  exits 0
- **THEN** Habitat records native fixture proof for
  `runtime_helper_redeclarations`
- **AND** Habitat SHALL NOT claim Habitat wrapper behavior, raw acquisition,
  baseline behavior, injected cleanup, apply safety, neighboring
  runtime-purity row proof, or product proof from that command

#### Scenario: Runtime helper parser inventory is recorded

- **WHEN** the row records parser inventory for runtime helper redeclarations
- **THEN** the record SHALL name scan roots, exclusions, declaration classes,
  counts, row id, and non-claims
- **AND** temporary stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be recorded as blocker or
  disposition inputs rather than clean enforcement closure

### Requirement: Runtime Layers Avoid Helper Redeclarations

Runtime recipe steps and domain strategies SHALL avoid exact redeclarations of
`clamp01`, `clampChance`, `normalizeRange`, and `rollPercent` under the current
`grit-runtime-helper-redeclarations` predicate.

#### Scenario: Runtime layer redeclares a canonical helper

- **WHEN** a matching runtime recipe step or domain strategy file redeclares a
  canonical helper through exact `const`, `let`, `var`, or function declaration
  syntax
- **THEN** `grit-runtime-helper-redeclarations` SHALL report the declaration
- **AND** the proof record SHALL state whether the behavior is proven by native
  fixtures, parser inventory, or Habitat wrapper proof

#### Scenario: Non-runtime path redeclares a canonical helper

- **WHEN** a domain op contract, config, test, package, map, or non-runtime
  source redeclares a canonical helper
- **THEN** this row SHALL NOT claim a violation under the current predicate
- **AND** any future predicate expansion SHALL require separate path-control
  proof and downstream record updates

#### Scenario: Current predicate includes a step-local contract path

- **WHEN** a runtime recipe step `contract.ts` path redeclares a canonical
  helper
- **THEN** this row MAY record the native fixture result as a current-predicate
  fact
- **AND** it SHALL NOT claim exact runtime-policy closure from that fact alone

### Requirement: Runtime Helper Redeclaration Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`grit-runtime-helper-redeclarations`.

#### Scenario: Dependency-bound proof is unavailable in the row stack

- **WHEN** wrapper selector truth, raw acquisition, baseline behavior, injected
  cleanup, Effect adapter behavior, or apply safety is not available in the
  current row stack/base
- **THEN** row records SHALL label those proof classes as blocked or non-claims
- **AND** the row SHALL NOT close those gates through native fixtures or parser
  inventory
