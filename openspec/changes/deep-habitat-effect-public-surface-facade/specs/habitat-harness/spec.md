## ADDED Requirements

### Requirement: Habitat Exposes Explicit Public Facades

Habitat SHALL expose package-facing types and functions through explicit public
facade modules rather than broad internal barrels.

#### Scenario: An internal module is moved

- **WHEN** implementation moves from `src/lib/**`, `src/base/**`, or
  `src/adapters/**`
- **THEN** any retained public import is re-exported through `src/public/**`
- **AND** provider/runtime internals are not exported as public API
- **AND** public adapters name their closure action
