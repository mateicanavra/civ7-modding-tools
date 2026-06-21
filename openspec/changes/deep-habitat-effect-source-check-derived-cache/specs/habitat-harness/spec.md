## MODIFIED Requirements

### Requirement: Source Check Derived Facts

Habitat source-check SHALL reuse per-file derived facts across rules instead of
re-walking the same AST/text helpers for each rule.

#### Scenario: Common AST facts are cached per file

- **WHEN** multiple source-check rules evaluate the same source file
- **THEN** common derived facts such as imports, calls, identifiers, property
  accesses, string literals, object properties, and exported const names SHALL be
  cached on the file record
- **AND** later rules SHALL reuse those cached facts.

#### Scenario: Rule behavior remains unchanged

- **WHEN** source-check evaluates selected rules
- **THEN** selected rule ids, diagnostics, and advisory/enforced behavior SHALL
  remain equivalent to the uncached helper implementation.
