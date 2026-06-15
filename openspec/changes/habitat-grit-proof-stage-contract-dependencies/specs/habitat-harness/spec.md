## ADDED Requirements

### Requirement: Stage Contract Dependencies Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-stage-contract-dependencies` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition or accepted adapter proof, injected
violations, explicit baseline behavior, apply safety, classify/generator
behavior, and downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter stage_contract_dependencies --json` exits 0
- **THEN** Habitat records native fixture proof for
  `stage_contract_dependencies`
- **AND** Habitat SHALL NOT claim raw acquisition, artifact dependency
  enforcement, generated artifact parity, semantic DAG validation,
  classify/generator behavior, apply safety, broader recipe architecture
  closure, or product/runtime proof from that command

#### Scenario: Stage contract parser inventory is recorded

- **WHEN** the row records parser inventory for standard recipe stage contracts
- **THEN** the record SHALL name scan roots, exclusions, current-predicate path
  classes, dependency array counts, row id, live match list status, and
  non-claims
- **AND** stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be recorded as blockers or
  disposition inputs rather than clean closure

### Requirement: Stage Contract Dependencies Avoid Literal Keys

Standard recipe step contracts SHALL avoid string literal dependency keys in
top-level `defineStep` dependency arrays under the current
`grit-stage-contract-dependencies` predicate.

#### Scenario: Step dependency array contains a literal

- **WHEN** a standard stage step contract `defineStep` body contains a string
  literal in `requires` or `provides`
- **THEN** `grit-stage-contract-dependencies` SHALL report the literal

#### Scenario: Typed or out-of-scope source appears

- **WHEN** typed dependency constants, typed artifact contract references,
  artifact literals under `artifacts.*`, helper objects outside `defineStep`,
  source strings, non-contract files, `.tsx`, or other-mod paths appear
- **THEN** this row SHALL classify them as controls or non-claims, not as
  current-row violations

### Requirement: Stage Contract Dependencies Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`grit-stage-contract-dependencies`.

#### Scenario: Shared and row-specific proof classes stay separated

- **WHEN** current wrapper selector, explicit baseline, and injected proof exist
  for the registered row
- **THEN** row records SHALL cite the STCD-specific wrapper selector, baseline
  inventory, and injected-probe evidence before treating those proof classes as
  satisfied for this registered row
- **AND** row records SHALL keep raw direct Grit acquisition, artifact
  dependency enforcement, generated artifact parity, semantic DAG validation,
  source remediation, classify/generator behavior, retired parity, apply
  safety, broader recipe architecture closure, and product proof as separate
  non-claims unless separately proven
