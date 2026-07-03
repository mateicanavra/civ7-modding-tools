## MODIFIED Requirements

### Requirement: Pre-Push Target Planning

Habitat pre-push target planning SHALL assign each routine local validation
lane one owner and SHALL NOT schedule overlapping Habitat rule execution in the
same hook path.

#### Scenario: Habitat tooling source changes avoid duplicate Habitat rule execution

- **WHEN** pre-push changed paths are all under `tools/habitat-harness/`
- **THEN** Habitat SHALL run `@internal/habitat-harness:check` as an
  owner-local Nx target
- **AND** Habitat SHALL run changed-path source checks inside the hook service
  when changed paths are in hook source-check roots
- **AND** Habitat SHALL NOT request affected `habitat:check` or `source:check`
  for that path class
- **AND** Habitat MAY request distinct affected structural targets that do not
  re-enter Habitat rule execution.

#### Scenario: Rule authority-only changes keep artifact validation

- **WHEN** pre-push changed paths are all Habitat rule or pattern artifacts
- **THEN** Habitat SHALL continue selecting artifact-specific affected Habitat
  targets.

#### Scenario: Ordinary repo changes keep broad affected verification

- **WHEN** pre-push changed paths are not Habitat authority-only or Habitat
  tooling-only changes
- **THEN** Habitat SHALL preserve the existing generic affected target plan.
