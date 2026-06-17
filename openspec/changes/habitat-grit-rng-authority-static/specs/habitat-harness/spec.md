## ADDED Requirements

### Requirement: RNG Authority Uses Its Executable Owner Layer

Habitat SHALL enforce the static authored-generation RNG authority source-scan
boundary through the wrapped-test owner layer selected by
`arch-test-rng-authority`.

#### Scenario: RNG authority runs through Habitat

- **WHEN** `habitat check --rule arch-test-rng-authority` runs
- **THEN** Habitat SHALL run the Swooper Maps RNG authority package target
- **AND** the target SHALL check standard recipe/domain authored generation for
  engine RNG, ambient random, official generator calls, and internal RNG imports
- **AND** the rule SHALL pass when current authored generation has no such
  findings

#### Scenario: Runtime RNG proof remains adjacent context

- **WHEN** this row records the package's adjacent runtime RNG-consumption test
  as authority context
- **THEN** records SHALL NOT present that adjacent runtime test as the selected
  Habitat rule proof for `arch-test-rng-authority`
- **AND** records SHALL keep product/runtime proof outside this row's accepted
  outcome

#### Scenario: RNG authority is not duplicated as Grit

- **WHEN** this row records RNG authority proof
- **THEN** the row SHALL NOT register an active Grit rule, Grit baseline, or
  injected Grit probe
- **AND** records SHALL state that RNG authority remains test-owned under the
  current invariant corpus

### Requirement: RNG Authority Non-Claims Stay Explicit

Habitat SHALL keep RNG authority proof separate from unrelated generated-output,
Grit, and runtime proof classes.

#### Scenario: Aggregate wrapped-test health is inherited

- **WHEN** current aggregate `wrapped-test` evidence is green after the accepted
  map-bundle/downstack freshness repair
- **THEN** records SHALL keep that inherited aggregate health separate from RNG
  authority
- **AND** records SHALL NOT claim generated-output freshness ownership from the
  RNG per-rule proof
