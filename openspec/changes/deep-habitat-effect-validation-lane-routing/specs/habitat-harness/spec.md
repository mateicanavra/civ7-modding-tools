## MODIFIED Requirements

### Requirement: Validation Lane Ownership

Habitat SHALL define validation lane target policy in a Habitat-owned domain,
not inside vendor providers or hook-specific runtime modules.

#### Scenario: Provider helpers delegate validation target policy

- **WHEN** Nx helper functions expose affected check, verify, or pre-push target
  names
- **THEN** those helpers SHALL delegate lane membership to the validation
  routing domain
- **AND** the Nx provider surface SHALL remain responsible for materializing and
  running Nx commands.

#### Scenario: Hook pre-push planning uses validation routing

- **WHEN** pre-push planning selects direct Nx targets or affected target names
  from changed paths
- **THEN** the plan SHALL come from the validation routing domain
- **AND** hook runtime SHALL consume that plan without owning lane policy.
