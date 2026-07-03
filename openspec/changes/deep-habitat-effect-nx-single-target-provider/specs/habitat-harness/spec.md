## MODIFIED Requirements

### Requirement: Nx provider exposes single-target and batch execution separately

Habitat SHALL represent one-target Nx execution and multi-target Nx execution
as distinct provider capabilities.

#### Scenario: Single graph target uses direct Nx target execution

- **WHEN** a selected graph-backed Habitat rule resolves to exactly one unique
  Nx project/target pair
- **THEN** Habitat executes that pair through `NxProvider.runTarget`
- **AND** the provider vector represents
  `target-check run <project>:<target> --outputStyle=static`, which
  materializes through the repo-pinned Nx workspace tool policy.

#### Scenario: Multiple graph targets remain batched

- **WHEN** selected graph-backed Habitat rules resolve to more than one unique
  Nx project/target pair
- **THEN** Habitat executes them through `NxProvider.runMany`
- **AND** the command vector remains `nx run-many` with sorted unique projects
  and targets.

#### Scenario: Diagnostics remain rule-shaped

- **WHEN** a single target result is used for one or more selected Habitat rules
- **THEN** each selected rule still receives its own rule execution record and
  diagnostics projection.
