## ADDED Requirements

### Requirement: Empty Schema Default Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-empty-schema-default` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition or accepted adapter proof, injected
violations, explicit baseline behavior, retired-mechanism parity, neighboring
schema/default rows, apply safety, and downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter empty_schema_default --json` exits 0
- **THEN** Habitat records native fixture proof for `empty_schema_default`
- **AND** Habitat SHALL NOT claim Habitat wrapper behavior, raw acquisition,
  baseline behavior, injected cleanup, apply safety, neighboring row proof, or
  product proof from that command

#### Scenario: Empty schema parser inventory is recorded

- **WHEN** the row records parser inventory for empty schema defaults
- **THEN** the record SHALL name scan roots, exclusions, predicate path classes,
  counts, row id, and non-claims
- **AND** temporary stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be remediated, baselined with
  accepted debt proof, or recorded as blocker/disposition inputs rather than
  clean enforcement closure

### Requirement: Contract Schemas Avoid Empty Object Defaults

Contract schema files SHALL avoid object-level `default: {}` under the current
`grit-empty-schema-default` predicate.

#### Scenario: Current predicate contract schema uses an empty object default

- **WHEN** a matching `*.contract.ts` or ordinary `contract.ts` domain op or
  recipe step contract file contains object-level `default: {}`
- **THEN** `grit-empty-schema-default` SHALL report the default
- **AND** the proof record SHALL state whether the behavior is proven by native
  fixtures, parser inventory, or Habitat wrapper proof

#### Scenario: Ordinary contract files are inside the repaired predicate

- **WHEN** an ordinary `contract.ts` file contains object-level `default: {}`
- **THEN** the repaired predicate SHALL report the default
- **AND** fixture, inventory, and injected path-control records SHALL distinguish
  ordinary `contract.ts` from non-contract lookalike paths
- **AND** any live ordinary-contract candidates SHALL be remediated or accepted
  as explicit baseline debt before clean row closure

### Requirement: Empty Schema Default Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for `grit-empty-schema-default`.

#### Scenario: Dependency-bound proof is unavailable in the row stack

- **WHEN** wrapper selector truth, raw acquisition, baseline behavior, injected
  cleanup, Effect adapter behavior, or apply safety is not available in the
  current row stack/base
- **THEN** row records SHALL label those proof classes as blocked or non-claims
- **AND** the row SHALL NOT close those gates through native fixtures or parser
  inventory
