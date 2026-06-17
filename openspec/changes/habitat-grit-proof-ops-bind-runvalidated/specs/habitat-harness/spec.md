## ADDED Requirements

### Requirement: Ops Bind RunValidated Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-ops-bind-runvalidated` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition, injected violations, explicit
baseline behavior, retired parity, apply safety, classify/generator behavior,
and product proof.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter ops_bind_runvalidated --json` exits 0
- **THEN** Habitat records native fixture proof for
  `ops_bind_runvalidated`
- **AND** Habitat SHALL NOT claim raw acquisition, apply safety, retired
  parity, broader domain-refactor closure, classify/generator behavior, or
  product proof from that command

#### Scenario: Parser inventory is recorded

- **WHEN** the row records parser inventory for Swooper domain and recipe roots
- **THEN** the record SHALL name scan roots, exclusions, current-predicate
  path classes, call counts, live match status, adjacent-row overlap, and
  non-claims
- **AND** stdout or scratch files SHALL NOT be cited as durable proof

### Requirement: Domain Op Entrypoints Avoid Runtime Orchestration Calls

Swooper domain op runtime `index.ts` files SHALL avoid `ops.bind(...)` and
direct `runValidated(...)` calls.

#### Scenario: Runtime entrypoint calls ops.bind

- **WHEN** a Swooper domain op runtime `index.ts` file calls `ops.bind(...)`
- **THEN** `grit-ops-bind-runvalidated` SHALL report the call

#### Scenario: Runtime entrypoint calls runValidated

- **WHEN** a Swooper domain op runtime `index.ts` file calls
  `runValidated(...)`
- **THEN** `grit-ops-bind-runvalidated` SHALL report the call

#### Scenario: Adjacent paths use similar syntax

- **WHEN** similar syntax appears in domain strategy files, recipe steps,
  tests, `.tsx` files, other mods, member `runValidated` calls, property
  references, or source strings
- **THEN** this row SHALL classify those cases as controls or neighboring-row
  non-claims rather than current-row violations
