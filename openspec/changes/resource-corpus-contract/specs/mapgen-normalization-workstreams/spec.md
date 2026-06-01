## ADDED Requirements

### Requirement: Resource Corpus Publishes Static Official Resource Identity

The resource distribution workstream SHALL publish a resource-owned official
corpus before resource strategies claim per-resource coverage.

#### Scenario: Static corpus is derived
- **WHEN** official base-standard resources are cataloged
- **THEN** the corpus records every `Resources` row from
  `data/resources.xml` and `data/resources-v2.xml` in
  `base-standard.modinfo` load order
- **AND** each row records its static source file, source table, row slot,
  resource symbol, base class, valid ages, class overrides, placement constraint
  coverage, distribution facts, placeability disposition, and
  strategy-required disposition

#### Scenario: Static row order is guarded
- **WHEN** tests verify the corpus order
- **THEN** they assert `Resources` row order rather than `<Types>` declaration
  order
- **AND** they prove `<Types>` order differs so static order cannot be treated
  as runtime id proof by accident

### Requirement: Resource Corpus Keeps Runtime Numeric IDs Unverified

The resource corpus SHALL separate static official resource identity from
runtime `GameInfo.Resources` numeric ids.

#### Scenario: Runtime ids are not yet proven
- **WHEN** the corpus is published before runtime proof exists
- **THEN** every resource row records runtime id status as `unverified`
- **AND** runtime numeric id value is null
- **AND** adapter numeric placement diagnostics are not labeled with symbolic
  resource names through this corpus

#### Scenario: Resource corpus artifact is declared
- **WHEN** the corpus artifact is introduced
- **THEN** its id is `artifact:resources.corpus`
- **AND** it does not introduce a resource stage shell, move placement resource
  planning, or change placement behavior
