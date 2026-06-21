## MODIFIED Requirements

### Requirement: Pre-Push Target Planning

Habitat pre-push target planning SHALL choose the narrowest local lane that
still covers the changed path class.

#### Scenario: Habitat tooling changes avoid generic affected package checks

- **WHEN** pre-push changed paths are all under `tools/habitat-harness/`
- **THEN** Habitat SHALL run `@internal/habitat-harness:check` as an owner-local
  Nx target
- **AND** Habitat SHALL run affected structural targets that do not re-enter
  duplicate Habitat rule execution
- **AND** Habitat SHALL NOT request generic affected `check` for that path
  class.

#### Scenario: Ordinary repo changes keep broad affected verification

- **WHEN** pre-push changed paths are not Habitat artifact-only or Habitat
  tooling-only changes
- **THEN** Habitat SHALL preserve the existing generic affected target plan.
