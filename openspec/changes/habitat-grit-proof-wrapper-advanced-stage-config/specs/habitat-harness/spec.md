## ADDED Requirements

### Requirement: Wrapper Advanced Stage Config Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-wrapper-advanced-stage-config` as complete
until row-level proof records separate native fixture behavior, parser
inventory, Habitat wrapper behavior, raw acquisition or accepted adapter proof,
injected violations, explicit baseline behavior, retired-mechanism parity,
broader config-surface coverage, generator/migration behavior, apply safety,
and downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter wrapper_advanced_stage_config --json`
  exits 0
- **THEN** Habitat records native fixture proof for
  `wrapper_advanced_stage_config`
- **AND** Habitat SHALL NOT claim Habitat wrapper behavior, raw acquisition,
  baseline behavior, injected cleanup, apply safety, generator/migration,
  broader config-surface coverage, neighboring row proof, or product proof from
  that command

#### Scenario: Wrapper config parser inventory is recorded

- **WHEN** the row records parser inventory for standard recipe and map config
  source
- **THEN** the record SHALL name scan roots, exclusions, predicate path classes,
  counts, row id, and non-claims
- **AND** temporary stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be recorded as blocker or
  disposition inputs rather than clean enforcement closure

### Requirement: Wrapper Advanced Stage Config Stays Retired

Swooper standard recipe and map config source SHALL avoid exact `advanced`
config-key surfaces under the current `grit-wrapper-advanced-stage-config`
predicate.

#### Scenario: Current predicate map source defines wrapper advanced config

- **WHEN** a matching `mods/mod-swooper-maps/src/maps/**` `.ts` or `.json`
  file defines an exact `advanced` config key
- **THEN** `grit-wrapper-advanced-stage-config` SHALL report the key
- **AND** the proof record SHALL state whether the behavior is proven by native
  fixtures, parser inventory, or Habitat wrapper proof

#### Scenario: Current predicate standard recipe source defines wrapper advanced config

- **WHEN** a matching `mods/mod-swooper-maps/src/recipes/standard/**` `.ts` or
  `.json` file defines an exact `advanced` config key
- **THEN** `grit-wrapper-advanced-stage-config` SHALL report the key
- **AND** live findings SHALL require supervisor/source-owner/generator
  disposition before clean row closure

#### Scenario: Supported config or ordinary advanced words appear

- **WHEN** supported step-id config, domain config, ordinary `advanced` words,
  non-standard recipe source, generated-output-shaped paths, packages, domain
  source, `.tsx` files, `.test.tsx` files, or other-mod paths appear
- **THEN** this row SHALL classify that surface as outside the current exact
  wrapper-advanced config-key candidate class
- **AND** any future predicate expansion SHALL require separate path-control
  proof and downstream record updates

#### Scenario: In-scope test source defines wrapper advanced config

- **WHEN** a `.test.ts` file under
  `mods/mod-swooper-maps/src/maps/**` or
  `mods/mod-swooper-maps/src/recipes/standard/**` defines an exact `advanced`
  config key
- **THEN** `grit-wrapper-advanced-stage-config` SHALL report the key as a
  current-predicate fact
- **AND** any semantic desire to exclude test files SHALL require future
  predicate or owner-disposition work rather than being claimed by this
  checkpoint

### Requirement: Wrapper Advanced Config Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`grit-wrapper-advanced-stage-config`.

#### Scenario: Dependency-bound proof is unavailable in the row stack

- **WHEN** wrapper selector truth, raw acquisition, baseline behavior, injected
  cleanup, Effect adapter behavior, apply safety, or generator/migration proof
  is not available in the current row stack/base
- **THEN** row records SHALL label those proof classes as blocked or non-claims
- **AND** the row SHALL NOT close those gates through native fixtures or parser
  inventory
