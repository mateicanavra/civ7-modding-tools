## ADDED Requirements

### Requirement: Adapter Base Standard Import Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-adapter-base-standard-import` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition or accepted adapter proof, injected
violations, explicit baseline behavior, retired-mechanism parity, wrapped-script
parity, broader adapter policy closure, apply safety, and downstream record
truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter adapter_base_standard_import --json`
  exits 0
- **THEN** Habitat records native fixture proof for
  `adapter_base_standard_import`
- **AND** Habitat SHALL NOT claim Habitat wrapper behavior, raw acquisition,
  baseline behavior, injected cleanup, apply safety, generator/migration,
  wrapped-script parity, broader adapter policy proof, neighboring row proof, or
  product proof from that command

#### Scenario: Package parser inventory is recorded

- **WHEN** the row records parser inventory for package source
- **THEN** the record SHALL name scan roots, exclusions, predicate path classes,
  counts, row id, and non-claims
- **AND** stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be recorded as blocker or
  disposition inputs rather than clean enforcement closure

### Requirement: Non-Adapter Packages Do Not Import Base Standard Runtime Modules

Package source outside `packages/civ7-adapter` SHALL avoid direct
`/base-standard/` import declarations under the current
`grit-adapter-base-standard-import` predicate.

#### Scenario: Non-adapter package imports a base-standard runtime module

- **WHEN** matching package `.ts` source outside `packages/civ7-adapter`
  imports from `/base-standard/...`
- **THEN** `grit-adapter-base-standard-import` SHALL report the import
- **AND** the proof record SHALL state whether the behavior is proven by native
  fixtures, parser inventory, or Habitat wrapper proof

#### Scenario: Adapter package imports a base-standard runtime module

- **WHEN** `packages/civ7-adapter` source imports from `/base-standard/...`
- **THEN** this row SHALL classify that usage as adapter-owned control context,
  not a current-row violation

#### Scenario: Non-import base-standard strings appear outside the adapter

- **WHEN** package source contains broad provenance or test harness strings that
  mention `/base-standard/`
- **THEN** this row SHALL classify them separately from direct import
  candidates
- **AND** wrapped-script allowlist or baseline parity SHALL remain a separate
  proof class

#### Scenario: Current wrapper and baseline proof pass

- **WHEN** Habitat checks `grit-adapter-base-standard-import` through the
  per-rule wrapper selector
- **THEN** it SHALL select that rule plus `baseline-integrity`
- **AND** the explicit empty row baseline SHALL remain distinct from source
  remediation, adapter migration, and product/runtime proof

#### Scenario: Injected base-standard import is isolated

- **WHEN** the injected-probe runner inserts a `/base-standard/` import into a
  non-adapter package path
- **THEN** `grit-adapter-base-standard-import` SHALL report that path
- **AND** an adapter-owned control path SHALL stay clean
- **AND** aggregate injected-corpus closure SHALL remain separate if unrelated
  rows still fail

### Requirement: Adapter Base Standard Import Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`grit-adapter-base-standard-import`.

#### Scenario: Independent proof classes remain unavailable

- **WHEN** raw acquisition, Effect adapter behavior, apply safety,
  generator/migration proof, wrapped-script parity, broader adapter policy
  closure, or product/runtime proof is not available in the current row
- **THEN** row records SHALL label those proof classes as blocked or non-claims
- **AND** the row SHALL NOT close those gates through native fixtures, parser
  inventory, wrapper proof, baseline proof, or row-specific injected proof
