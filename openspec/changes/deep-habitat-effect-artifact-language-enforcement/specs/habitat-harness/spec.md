## ADDED Requirements

### Requirement: Authored Habitat Artifacts Remain Data

Habitat SHALL enforce `.habitat` as a checked-in authored-data root, not a home
for managing TypeScript or executable rule code.

#### Scenario: `.habitat` contains an executable source file

- **WHEN** Habitat checks authored authority data
- **THEN** executable TypeScript or JavaScript under `.habitat` is refused
- **AND** the diagnostic points to the managing-code boundary under
  `tools/habitat-harness`

### Requirement: Generic Habitat Runtime Language Remains Neutral

Generic Habitat runtime modules SHALL avoid process/workstream and host/product
language except in explicit allowlisted receipt, workstream, host declaration,
or example scopes.

#### Scenario: Generic runtime source is scanned

- **WHEN** a generic Habitat runtime/provider/domain module is scanned
- **THEN** process vocabulary and host/product authoring vocabulary outside
  allowlisted scopes are reported
- **AND** accepted host policy declaration data remains allowed

### Requirement: Public Exports Are Explicit Contracts

Habitat SHALL expose public package surfaces through explicit public contract
modules rather than broad internal barrels.

#### Scenario: A root package export is inspected

- **WHEN** the package root export is inspected
- **THEN** it exports public contracts only
- **AND** internal runtime/provider/domain modules are not exposed through
  broad `export *` barrels
