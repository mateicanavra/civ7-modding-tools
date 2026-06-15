## ADDED Requirements

### Requirement: Domain Ops Boundary Imports Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-domain-ops-boundary-imports` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition or accepted adapter proof, injected
violations, explicit baseline behavior, retired parity, apply safety, and
downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter domain_ops_boundary_imports --json`
  exits 0
- **THEN** Habitat records native fixture proof for
  `domain_ops_boundary_imports`
- **AND** Habitat SHALL NOT claim raw acquisition, row-specific injected
  cleanup/path-control closure, baseline mutation, apply safety, retired parity,
  broader domain-refactor closure, or product/runtime proof from that command

#### Scenario: Domain parser inventory is recorded

- **WHEN** the row records parser inventory for Swooper domain source
- **THEN** the record SHALL name scan roots, exclusions, current-predicate path
  classes, counts, row id, live match list status, and non-claims
- **AND** stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be recorded as blocker or
  disposition inputs rather than clean closure

### Requirement: Domain Ops Avoid Adapter And Context Crossing Constructs

Swooper domain op implementation files SHALL avoid direct `@civ7/adapter`
import/re-export source forms, `ExtendedMapContext` identifiers, and
`.adapter` property access under the current
`grit-domain-ops-boundary-imports` predicate for
`mods/mod-swooper-maps/src/domain/**/ops/**/*.ts`.

#### Scenario: Domain op imports from the Civ7 adapter

- **WHEN** a Swooper domain-op `.ts` file imports from `@civ7/adapter/...`
- **THEN** `grit-domain-ops-boundary-imports` SHALL report the import

#### Scenario: Domain op re-exports from the Civ7 adapter

- **WHEN** a Swooper domain-op `.ts` file uses `export { ... } from` or
  `export * from` with `@civ7/adapter/...`
- **THEN** `grit-domain-ops-boundary-imports` SHALL report the re-export

#### Scenario: Domain op references map context or adapter property

- **WHEN** a Swooper domain-op `.ts` file contains `ExtendedMapContext` or a
  `.adapter` property access
- **THEN** `grit-domain-ops-boundary-imports` SHALL report the crossing

#### Scenario: Adapter-like source or non-op path appears

- **WHEN** a source specifier only starts with an adapter-like name such as
  `@civ7/adapterish/...`
- **OR** the same adapter/context text appears outside a Swooper domain-op
  `.ts` path
- **THEN** this row SHALL classify it as a current-predicate control, not a
  current-row violation

### Requirement: Domain Ops Boundary Import Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`grit-domain-ops-boundary-imports`.

#### Scenario: Shared proof is inherited but row-local proof is unrun

- **WHEN** current restacked shared wrapper selector, explicit baseline, and
  injected-probe API proof exist through accepted HGPR ids
- **THEN** row records MAY cite those shared ids as inherited current state
- **AND** row records SHALL keep raw direct Grit acquisition, row-specific
  injected cleanup/path-control closure, dynamic import closure, element-access
  closure, source remediation, retired parity, apply safety, and product proof
  as separate non-claims unless separately proven
