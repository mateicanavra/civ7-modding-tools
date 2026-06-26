## MODIFIED Requirements

### Requirement: Pre-Push Local Feedback Planning

Habitat SHALL plan pre-push as local workstation feedback instead of reusing the
root graph-validation aggregate.

#### Scenario: Changed source paths run hook source checks

- **WHEN** pre-push resolves a comparison base
- **AND** changed paths overlap registered source-check rules marked
  `hookCheck: true`
- **THEN** Habitat SHALL run those changed paths through the in-process
  `StructuralCheck` service
- **AND** the check SHALL use the hook-only source-rule selection.

#### Scenario: No hook source paths avoids source-check catalog work

- **WHEN** pre-push changed paths do not overlap hook source-check roots
- **THEN** Habitat SHALL skip the source-check catalog lane
- **AND** continue to the affected Nx workstation lane.

#### Scenario: Changed-path discovery is required

- **WHEN** Habitat cannot read changed paths for the resolved pre-push base
- **THEN** pre-push SHALL fail
- **AND** SHALL NOT silently skip hook source checks.

#### Scenario: Graph validation remains explicit

- **WHEN** a user runs root `check:graph`
- **THEN** Habitat SHALL preserve the broad affected graph-validation target set
- **AND** pre-push SHALL use its own narrower target plan.
