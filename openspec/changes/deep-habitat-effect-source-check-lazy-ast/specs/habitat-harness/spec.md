## MODIFIED Requirements

### Requirement: Source-check file records avoid unnecessary parse work

Habitat source-check execution SHALL expose text, path, and TypeScript syntax
to source-check policy rules without forcing syntax construction for files or
rules that do not inspect it.

#### Scenario: Text-only checks do not force TypeScript parsing

- **WHEN** source-check collects a TypeScript-like file
- **THEN** the file record exposes its path and text immediately
- **AND** the TypeScript source file is not constructed until policy code reads
  `sourceFile`.

#### Scenario: AST-backed checks preserve their contract

- **WHEN** source-check policy code reads `sourceFile` for a TypeScript-like
  file
- **THEN** Habitat constructs and returns a TypeScript `SourceFile`
- **AND** repeated reads reuse the same parsed source file for that record.
