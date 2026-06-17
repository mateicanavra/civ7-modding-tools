## ADDED Requirements

### Requirement: Domain Ops Root Config Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-domain-ops-root-config` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition or accepted adapter proof, injected
violations, explicit baseline behavior, retired parity, apply safety,
classify/generator behavior, and downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter domain_ops_root_config --json` exits 0
- **THEN** Habitat records native fixture proof for
  `domain_ops_root_config`
- **AND** Habitat SHALL NOT claim raw acquisition, baseline mutation,
  classify/generator behavior, apply safety, retired parity,
  broader domain-refactor closure, non-string dynamic import closure, or
  product/runtime proof from that command

#### Scenario: Domain parser inventory is recorded

- **WHEN** the row records parser inventory for Swooper domain source
- **THEN** the record SHALL name scan roots, exclusions, current-predicate path
  classes, counts, row id, live match list status, and non-claims
- **AND** stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be recorded as blocker or
  disposition inputs rather than clean closure

### Requirement: Domain Ops Avoid Root Config Facade Imports

Swooper domain op implementation files SHALL avoid parent-traversal imports of
domain-root `config.js` facades under the current
`grit-domain-ops-root-config` predicate for
`mods/mod-swooper-maps/src/domain/**/ops/**/*.ts`.

#### Scenario: Domain op statically imports a supported root config facade path

- **WHEN** a Swooper domain-op `.ts` file imports from `config.js` through
  two-or-more parent traversal
- **THEN** `grit-domain-ops-root-config` SHALL report the import

#### Scenario: Domain op re-exports or dynamically imports a supported root config facade path

- **WHEN** a Swooper domain-op `.ts` file re-exports from `config.js` through
  two-or-more parent traversal
- **OR** dynamically imports a string-literal `config.js` source through
  two-or-more parent traversal
- **THEN** `grit-domain-ops-root-config` SHALL report the module edge

#### Scenario: Domain op imports local config

- **WHEN** the same domain-op path imports from `./config.js` or
  `../config.js`
- **THEN** this row SHALL classify it as a current-predicate control, not a
  current-row violation

#### Scenario: Root config source appears outside current import predicate

- **WHEN** the same root config source appears outside a supported Swooper
  domain-op `.ts` import, re-export, or dynamic string-literal import
- **THEN** this row SHALL classify it as a current predicate gap or control,
  not as a proven clean closure class

### Requirement: Domain Ops Root Config Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`grit-domain-ops-root-config`.

#### Scenario: Row proof classes stay separated

- **WHEN** row-specific wrapper, explicit baseline, and injected-probe proof
  exist for `grit-domain-ops-root-config`
- **THEN** row records MAY cite those proof ids for the supported current
  predicate classes
- **AND** row records SHALL keep raw direct Grit acquisition, row-specific
  source remediation, classify/generator behavior, retired parity, apply
  safety, non-string dynamic import closure, and product proof as separate
  non-claims unless separately proven
