## ADDED Requirements

### Requirement: Transformation Transactions Own Apply Safety

Habitat SHALL move apply write-set, protected-zone, rollback, and cleanup
decisions into transformation transaction and protected-zone authority domains.

#### Scenario: A write-capable transform is considered

- **WHEN** Habitat considers an apply or fix operation that can write files
- **THEN** the transformation transaction domain owns dry-run evidence,
  admitted write set, protected-zone checks, rollback data, and cleanup
- **AND** provider command success alone is not sufficient to authorize writes

#### Scenario: Cleanup is required

- **WHEN** a transform creates temp resources, probes, or snapshots
- **THEN** resource finalizers are scoped and execute on success, failure, or
  interruption
