## MODIFIED Requirements

### Requirement: Habitat check orchestration keeps routine feedback fast

Habitat SHALL keep local structural feedback fast by separating graph metadata,
staged checks, owner checks, affected project verification, and full workspace
verification into distinct lanes with one owner for each vendor invocation.

#### Scenario: Nx graph construction is metadata-only

- **WHEN** Nx constructs the project graph
- **THEN** Habitat inferred targets are created from cheap metadata and
  graph-local schema checks
- **AND** graph construction does not execute live Habitat domain, runtime, or
  provider logic.

#### Scenario: Rule target inputs are scoped

- **WHEN** Habitat creates an Nx target for a source or structural rule
- **THEN** the target inputs are derived from the rule's path coverage,
  manifests, policy artifacts, and required harness code
- **AND** workspace-wide inputs are reserved for rules declared as workspace
  gates.

#### Scenario: Verification lanes do not duplicate vendor work

- **WHEN** a hook, root script, or Habitat verify path schedules Biome, Nx,
  Grit, or Habitat checks
- **THEN** each vendor capability has one owning lane for that invocation
- **AND** the same work is not re-run through a second wrapper in the same
  routine feedback path.
