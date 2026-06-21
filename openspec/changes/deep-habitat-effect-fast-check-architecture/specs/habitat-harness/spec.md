## MODIFIED Requirements

### Requirement: Habitat Hook Target Planning

Habitat SHALL keep Git hook target planning at the Habitat/Nx boundary instead
of duplicating vendor-backed structural lanes as top-level hook concerns.

#### Scenario: Pre-push runs one Habitat structural harness target

- **WHEN** Habitat builds the pre-push Nx affected target list
- **THEN** the list SHALL include `habitat:check`
- **AND** the list SHALL NOT separately include `biome:ci`, `boundaries`, or
  `grit:check`.

#### Scenario: Pre-push preserves non-Habitat project gates

- **WHEN** Habitat builds the pre-push Nx affected target list
- **THEN** the list SHALL preserve project tests and existing validation targets
  that are not owned by Habitat's structural harness.

#### Scenario: Pre-push service execution uses the Nx provider

- **WHEN** the Habitat service runs the pre-push hook
- **THEN** affected execution SHALL be delegated to `NxProvider`
- **AND** the hook service SHALL NOT assemble a raw Nx process through the hook
  runtime command runner.
