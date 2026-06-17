## ADDED Requirements

### Requirement: Domain Deep Import Tests Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-domain-deep-import-tests` as complete until
row-level proof records separate native fixture behavior, parser inventory,
source remediation, Habitat wrapper behavior, raw acquisition or accepted
adapter proof, injected violations, explicit baseline behavior, apply safety,
classify/generator behavior, and downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter domain_deep_import_tests --json` exits 0
- **THEN** Habitat records native fixture proof for
  `domain_deep_import_tests`
- **AND** Habitat SHALL NOT claim raw acquisition, dynamic import closure,
  source-string closure, package export-map closure, apply safety,
  classify/generator behavior, broader domain-refactor closure, or
  product/runtime proof from that command

#### Scenario: Test import parser inventory is recorded

- **WHEN** the row records parser inventory for mod and package test roots
- **THEN** the record SHALL name scan roots, exclusions, current-predicate path
  classes, import/export/dynamic/source-string counts, row id, live match list
  status, and non-claims
- **AND** stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be remediated, baselined with
  explicit debt proof, or recorded as blockers rather than clean closure

### Requirement: Domain Deep Import Tests Use Public Domain Surfaces

Mod and package tests SHALL avoid static imports and re-exports from non-public
`@mapgen/domain/<domain>/...` subpaths under the current
`grit-domain-deep-import-tests` predicate.

#### Scenario: Test import uses a deep domain internal

- **WHEN** a mod or package test file uses a static import declaration or
  static re-export declaration from a deep domain subpath other than `/ops`,
  `/ops/index.js`, or `/config.js`
- **THEN** `grit-domain-deep-import-tests` SHALL report the declaration

#### Scenario: Public or out-of-scope source appears

- **WHEN** test code imports the domain root, `/ops`, `/ops/index.js`, or
  `/config.js`
- **THEN** this row SHALL classify the declaration as an allowed public surface
- **WHEN** recipe source paths, harness test paths, source strings, or dynamic
  imports appear
- **THEN** this row SHALL classify them as controls or non-claims, not as
  current-row violations

### Requirement: Domain Deep Import Tests Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`grit-domain-deep-import-tests`.

#### Scenario: Shared and row-specific proof classes stay separated

- **WHEN** current wrapper selector, explicit baseline, and injected proof exist
  for the registered row
- **THEN** row records SHALL cite the DDIT-specific wrapper selector, baseline
  inventory, and injected-probe evidence before treating those proof classes as
  satisfied for this registered row
- **AND** row records SHALL keep raw direct Grit acquisition, dynamic import
  closure, source-string closure, package export-map closure, classify/generator
  behavior, retired parity, apply safety, broader domain-refactor closure, and
  product proof as separate non-claims unless separately proven

#### Scenario: Wrapper scan activation is proven

- **WHEN** the Habitat wrapper selects `grit-domain-deep-import-tests` after the
  accepted adapter projection repair
- **THEN** row records SHALL cite current per-rule wrapper proof, aggregate
  `grit-check` proof, explicit baseline proof, and clean-start injected
  violation/path-control proof before treating DDIT as closed
- **AND** records SHALL NOT broaden global test scan policy from this row or
  claim raw acquisition, dynamic/source-string closure, apply safety, or
  product/runtime behavior
