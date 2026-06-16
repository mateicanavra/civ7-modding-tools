## ADDED Requirements

### Requirement: Core Purity Uses Its Executable Owner Layer

Habitat SHALL enforce the MapGen core static runtime-purity source-scan
boundary through the wrapped-test owner layer selected by
`arch-test-core-purity`.

#### Scenario: Core purity runs through Habitat

- **WHEN** `habitat check --rule arch-test-core-purity` runs
- **THEN** Habitat SHALL run the MapGen core package target
- **AND** the target SHALL check production MapGen core source for Civ7 runtime
  value references
- **AND** the rule SHALL pass when current production core source has no such
  findings

#### Scenario: Core purity is not duplicated as Grit

- **WHEN** this row records core purity proof
- **THEN** the row SHALL NOT register an active Grit rule, Grit baseline, or
  injected Grit probe
- **AND** records SHALL state that core purity remains wrapped-test-owned under
  the current Habitat rule catalog

#### Scenario: Type-only adapter imports stay a separate proof class

- **WHEN** this row records current source inventory
- **THEN** type-only `@civ7/adapter` imports SHALL NOT be presented as runtime
  value coupling
- **AND** records SHALL keep adapter type-import policy and Grit import-predicate
  repair outside this row's accepted outcome

### Requirement: Core Purity Non-Claims Stay Explicit

Habitat SHALL keep core-purity proof separate from unrelated generated-output,
Grit, and runtime proof classes.

#### Scenario: Aggregate wrapped-test health is inherited

- **WHEN** current aggregate `wrapped-test` evidence is green after the accepted
  map-bundle/downstack freshness repair
- **THEN** records SHALL keep that inherited aggregate health separate from core
  purity
- **AND** records SHALL NOT claim generated-output freshness ownership from the
  core purity per-rule proof
