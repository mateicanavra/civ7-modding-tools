## ADDED Requirements

### Requirement: Sibling Stage Step Imports Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-sibling-stage-step-imports` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition or accepted adapter proof, injected
violations, explicit baseline behavior, retired-mechanism parity, neighboring
stage/viz/import rows, apply safety, and downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter sibling_stage_step_imports --json`
  exits 0
- **THEN** Habitat records native fixture proof for
  `sibling_stage_step_imports`
- **AND** Habitat SHALL NOT claim Habitat wrapper behavior, raw acquisition,
  baseline behavior, injected cleanup, apply safety, neighboring row proof, or
  product proof from that command

#### Scenario: Sibling stage parser inventory is recorded

- **WHEN** the row records parser inventory for sibling-stage step imports
- **THEN** the record SHALL name scan roots, exclusions, predicate path classes,
  counts, row id, and non-claims
- **AND** temporary stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be recorded as blocker or
  disposition inputs rather than clean enforcement closure

### Requirement: Stage Code Avoids Sibling Stage Step Imports

Standard recipe stage source SHALL avoid imports from another stage's private
`steps/` implementation under the current `grit-sibling-stage-step-imports`
predicate.

#### Scenario: Current predicate stage file imports a sibling stage step

- **WHEN** a matching
  `mods/mod-swooper-maps/src/recipes/standard/stages/**/*.ts` file imports a
  source containing `../<stage>/steps/`
- **THEN** `grit-sibling-stage-step-imports` SHALL report the import
- **AND** the proof record SHALL state whether the behavior is proven by native
  fixtures, parser inventory, or Habitat wrapper proof

#### Scenario: Current predicate stage file imports its own stage step

- **WHEN** a matching file imports `./steps/...` from the same stage
- **THEN** this row SHALL classify that syntax as a current-predicate control
- **AND** any future predicate expansion SHALL require separate path-control
  proof and downstream record updates

### Requirement: Sibling Stage Step Import Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`grit-sibling-stage-step-imports`.

#### Scenario: Dependency-bound proof is unavailable in the row stack

- **WHEN** wrapper selector truth, raw acquisition, baseline behavior, injected
  cleanup, Effect adapter behavior, or apply safety is not available in the
  current row stack/base
- **THEN** row records SHALL label those proof classes as blocked or non-claims
- **AND** the row SHALL NOT close those gates through native fixtures or parser
  inventory
