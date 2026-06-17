## ADDED Requirements

### Requirement: Type-Only Import Conversion Uses Semantic Ownership

Habitat SHALL NOT represent broad value-to-type import conversion as a Grit
apply row unless the row includes semantic TypeScript usage proof.

#### Scenario: Biome owns the broad type-only import fixer

- **WHEN** the candidate is evaluated for broad import conversion
- **THEN** records SHALL route it to Biome/TypeScript semantic tooling
- **AND** records SHALL cite `lint/style/useImportType` as the current safe-fix
  owner
- **AND** records SHALL NOT add an active Grit apply rule for the broad class

#### Scenario: Syntax-only Grit conversion is rejected

- **WHEN** a named value import is considered for conversion
- **THEN** the row SHALL require semantic usage evidence before converting it
- **AND** the row SHALL NOT treat named import syntax as proof that the import
  is type-only

#### Scenario: Future Grit slices stay narrow

- **WHEN** a future HG row reopens type-only import conversion
- **THEN** it SHALL identify a narrow syntax class, prove TypeScript usage for
  that class, and prove safe writes through package checks
- **AND** it SHALL keep Biome/decorator/compiler-policy closure separate unless
  that proof is included

### Requirement: Type-Only Import Disposition Preserves Non-Claims

Habitat SHALL keep owner disposition separate from executable rule closure.

#### Scenario: Disposition packet records proof

- **WHEN** this packet records Biome and parser evidence
- **THEN** it SHALL NOT claim source remediation, Grit fixture proof, Habitat
  wrapper proof, baseline ownership, injected proof, apply safety, or
  product/runtime proof
