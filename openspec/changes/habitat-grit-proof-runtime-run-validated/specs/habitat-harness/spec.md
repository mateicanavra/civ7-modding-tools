## ADDED Requirements

### Requirement: Runtime Run Validated Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-runtime-run-validated` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition or accepted adapter proof, injected
violations, explicit baseline behavior, retired-mechanism parity, neighboring
runtime-purity rows, and downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter runtime_run_validated --json` exits 0
- **THEN** Habitat records native fixture proof for `runtime_run_validated`
- **AND** Habitat SHALL NOT claim Habitat wrapper behavior, raw acquisition,
  baseline behavior, injected cleanup, apply safety, neighboring
  runtime-purity row proof, or product proof from that command

#### Scenario: Runtime runValidated parser inventory is recorded

- **WHEN** the row records parser inventory for runtime `runValidated` calls
- **THEN** the record SHALL name scan roots, exclusions, call classes, counts,
  row id, and non-claims
- **AND** temporary stdout or scratch files SHALL NOT be cited as durable proof

### Requirement: Runtime Layers Avoid runValidated Calls

Runtime recipe steps and domain strategies SHALL avoid direct or member
`runValidated` calls under the current `grit-runtime-run-validated` predicate.

#### Scenario: Runtime layer calls runValidated

- **WHEN** a matching runtime recipe step or domain strategy file calls
  `runValidated`
- **THEN** `grit-runtime-run-validated` SHALL report the call
- **AND** the proof record SHALL state whether the behavior is proven by native
  fixtures, parser inventory, or Habitat wrapper proof

#### Scenario: Non-runtime path calls runValidated

- **WHEN** a contract, config, test, package, map, or non-runtime source calls
  `runValidated`
- **THEN** this row SHALL NOT claim a violation under the current predicate
- **AND** any future predicate expansion SHALL require separate path-control
  proof and downstream record updates

### Requirement: Runtime Run Validated Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for `grit-runtime-run-validated`.

#### Scenario: Dependency-bound proof is unavailable in the row stack

- **WHEN** wrapper selector truth, raw acquisition, baseline behavior, injected
  cleanup, Effect adapter behavior, or apply safety is not available in the
  current row stack/base
- **THEN** row records SHALL label those proof classes as blocked or non-claims
- **AND** the row SHALL NOT close those gates through native fixtures or parser
  inventory
