## ADDED Requirements

### Requirement: Domain Engine Imports Check Has Truthful Proof

Habitat SHALL register `grit-domain-engine-imports` only when row-level records
prove a safe predicate for domain-op engine static import declarations.

#### Scenario: Static value-bearing engine imports report

- **WHEN** a Swooper domain-op `.ts` file statically imports
  `@swooper/mapgen-core/engine` or `@mapgen/engine` through a value/default,
  namespace, side-effect, or value-first mixed value/type import declaration
- **THEN** `grit-domain-engine-imports` SHALL report the import
- **AND** proven pure `import type` and single-line inline type-only import
  declarations SHALL remain controls

#### Scenario: Parser inventory is recorded for current source

- **WHEN** the row records parser inventory for domain-op engine imports
- **THEN** the record SHALL name scan roots, exclusions, current predicate,
  candidate buckets, counts, row id, and non-claims
- **AND** temporary stdout or scratch files SHALL NOT be cited as durable proof
- **AND** zero current candidates SHALL remain separate from native fixture,
  wrapper, baseline, injected, apply, or product proof

### Requirement: Domain Engine Import Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`habitat-grit-domain-engine-imports`.

#### Scenario: Active row remains bounded

- **WHEN** the row is registered as an active Grit check
- **THEN** row records SHALL keep export-from closure, dynamic import closure,
  source-string closure, raw Grit acquisition, apply safety,
  classify/generator behavior, retired parity, broader domain-refactor closure,
  multiline/alternate-whitespace inline type-only closure, and product/runtime
  proof as non-claims unless separately proven
