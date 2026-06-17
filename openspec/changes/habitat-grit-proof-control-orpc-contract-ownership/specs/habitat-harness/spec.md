## ADDED Requirements

### Requirement: Control oRPC Contract Ownership Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-control-orpc-contract-ownership` as complete
until row-level proof records separate native fixture behavior, parser
inventory, Habitat wrapper behavior, raw acquisition or accepted adapter proof,
injected violations, explicit baseline behavior, retired-mechanism parity,
broader control-oRPC architecture closure, apply safety, and downstream record
truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter control_orpc_contract_ownership --json`
  exits 0
- **THEN** Habitat records native fixture proof for
  `control_orpc_contract_ownership`
- **AND** Habitat SHALL NOT claim Habitat wrapper behavior, raw acquisition,
  baseline behavior, injected cleanup, apply safety, generator/migration,
  broader control-oRPC architecture proof, neighboring row proof, or product
  proof from that command

#### Scenario: Control-oRPC parser inventory is recorded

- **WHEN** the row records parser inventory for control-oRPC source
- **THEN** the record SHALL name scan roots, exclusions, predicate path classes,
  counts, row id, and non-claims
- **AND** stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be recorded as blocker or
  disposition inputs rather than clean enforcement closure

### Requirement: Control oRPC Contracts Stay Transport-Pure

Control-oRPC module contract files SHALL avoid direct `@civ7/direct-control`
import declarations under the current
`grit-control-orpc-contract-ownership` predicate.

#### Scenario: Module contract imports direct-control

- **WHEN** matching `packages/civ7-control-orpc/src/modules/**/contract.ts`
  source imports from `@civ7/direct-control`
- **THEN** `grit-control-orpc-contract-ownership` SHALL report the import
- **AND** the proof record SHALL state whether the behavior is proven by native
  fixtures, parser inventory, or Habitat wrapper proof

#### Scenario: Procedure or context source imports direct-control

- **WHEN** control-oRPC procedure, context, or dependency source imports from
  `@civ7/direct-control`
- **THEN** this row SHALL classify that usage as outside the current contract
  predicate, not a current-row violation

### Requirement: Contract-Local Schemas Stay Private From The Root

Control-oRPC SHALL NOT export module contract schema constants that match the
current row's private input/result/output/standard schema class from module
contracts or re-export them from the package root.

#### Scenario: Module contract exports a private schema const

- **WHEN** matching module contract source exports a const named
  `Civ7*InputSchema`, `Civ7*ResultSchema`, `Civ7*OutputSchema`, or
  `Civ7*StandardSchema`
- **THEN** `grit-control-orpc-contract-ownership` SHALL report the export
- **AND** the proof record SHALL state whether the behavior is proven by native
  fixtures, parser inventory, or Habitat wrapper proof

#### Scenario: Root index re-exports a module contract schema

- **WHEN** `packages/civ7-control-orpc/src/index.ts` exports schema specifiers
  from `./modules/<module>/contract`
- **THEN** `grit-control-orpc-contract-ownership` SHALL report the re-export
- **AND** if the current native predicate does not report this fixture class,
  row records SHALL preserve it as a predicate-gap blocker rather than clean
  closure

#### Scenario: Root index exports non-module-contract schemas

- **WHEN** the root index exports bridge, error, or model schema specifiers from
  non-module-contract source files
- **THEN** this row SHALL classify them separately from module-contract schema
  leaks

### Requirement: Control oRPC Contract Ownership Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`grit-control-orpc-contract-ownership`.

#### Scenario: Dependency-bound proof is unavailable in the row stack

- **WHEN** wrapper selector truth, raw acquisition, baseline behavior, injected
  cleanup, Effect adapter behavior, apply safety, generator/migration proof, or
  retired parity is not available in the current row stack/base
- **THEN** row records SHALL label those proof classes as blocked or non-claims
- **AND** the row SHALL NOT close those gates through native fixtures or parser
  inventory
