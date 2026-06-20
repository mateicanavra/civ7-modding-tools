## ADDED Requirements

### Requirement: Habitat Reuses Native Effect Platform Resources

Habitat SHALL use native Effect platform services for filesystem, clock, and
scoped resource acquisition when those services express the needed capability.
Habitat-specific resource modules SHALL only add Habitat-owned error
translation, cache/temp semantics, or containment for still-synchronous host
edges.

#### Scenario: Runtime layers are composed

- **WHEN** Habitat builds its live runtime layer
- **THEN** platform filesystem and clock capabilities come from the Effect node
  context
- **AND** Habitat does not provide duplicate filesystem, clock, scope, lock, or
  write-set services.

#### Scenario: Migrated domain code needs filesystem or time access

- **WHEN** migrated Habitat domain code needs filesystem or time access
- **THEN** Effect code uses native platform services or Habitat resource helpers
- **AND** direct `node:fs`, `Date.now`, and `new Date` primitives remain outside
  migrated domain implementation
- **AND** native Effect `Clock` imports and sync filesystem helper imports are
  ratcheted by the Habitat public-surface guard.

#### Scenario: Tests fake filesystem behavior

- **WHEN** tests need deterministic filesystem behavior
- **THEN** they provide the official platform filesystem service
- **AND** they do not reintroduce Habitat-specific fake filesystem or fake clock
  services.
