## ADDED Requirements

### Requirement: Domain Ops Projection Effects Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-domain-ops-projection-effects` as complete
until row-level proof records separate native fixture behavior, parser
inventory, Habitat wrapper behavior, raw acquisition or accepted adapter proof,
injected violations, explicit baseline behavior, retired parity, apply safety,
classify/generator behavior, and downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter domain_ops_projection_effects --json`
  exits 0
- **THEN** Habitat records native fixture proof for
  `domain_ops_projection_effects`
- **AND** Habitat SHALL NOT claim raw acquisition, row-specific injected
  cleanup/path-control closure, baseline mutation, classify/generator behavior,
  apply safety, retired parity, broader domain-refactor closure, or
  product/runtime proof from that command

#### Scenario: Domain parser inventory is recorded

- **WHEN** the row records parser inventory for Swooper domain source
- **THEN** the record SHALL name scan roots, exclusions, current-predicate path
  classes, counts, row id, live match list status, and non-claims
- **AND** stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be recorded as blocker or
  disposition inputs rather than clean closure

### Requirement: Domain Ops Avoid Map Projection And Effect Dependency Keys

Swooper domain op implementation files SHALL avoid `artifact:map.*` and
`effect:map.*` string-literal dependency keys under the current
`grit-domain-ops-projection-effects` predicate for
`mods/mod-swooper-maps/src/domain/**/ops/**/*.ts`.

#### Scenario: Domain op encodes a map artifact key

- **WHEN** a Swooper domain-op `.ts` file contains a string literal matching
  `artifact:map.<suffix>`
- **THEN** `grit-domain-ops-projection-effects` SHALL report the key

#### Scenario: Domain op encodes a map effect key

- **WHEN** a Swooper domain-op `.ts` file contains a string literal matching
  `effect:map.<suffix>`
- **THEN** `grit-domain-ops-projection-effects` SHALL report the key

#### Scenario: Domain-owned or lookalike key appears

- **WHEN** the same domain-op path contains a domain-owned key such as
  `artifact:ecology.<suffix>` or a lookalike such as `artifact:mapper.<suffix>`
- **THEN** this row SHALL classify it as a current-predicate control, not a
  current-row violation

#### Scenario: Map key appears outside the current path predicate

- **WHEN** the same map key appears outside a Swooper domain-op `.ts` path
- **THEN** this row SHALL classify it as a current-predicate control, not a
  current-row violation

### Requirement: Domain Ops Projection Effects Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`grit-domain-ops-projection-effects`.

#### Scenario: Shared proof is inherited but row-local proof is unrun

- **WHEN** current restacked shared wrapper selector, explicit baseline, and
  injected-probe API proof exist through accepted HGPR ids
- **THEN** row records MAY cite those shared ids as inherited current state
- **AND** row records SHALL keep raw direct Grit acquisition, row-specific
  injected cleanup/path-control closure, template-literal closure, source
  remediation, classify/generator behavior, retired parity, apply safety, and
  product proof as separate non-claims unless separately proven
