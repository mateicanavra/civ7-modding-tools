## ADDED Requirements

### Requirement: World Balance Stats Gate Numeric Resource Variety

World-balance stats SHALL detect regressions where generated maps place only a
minority of adapter numeric resource ids despite enough placements to cover the
catalog.

#### Scenario: Shipped maps have enough resource placements
- **WHEN** a shipped map identity produces at least as many placed resources as
  the adapter candidate resource catalog size
- **THEN** world-balance stats report every numeric resource id as placed
- **AND** per-id placed counts differ by no more than one

#### Scenario: Shipped maps have fewer placements than candidate ids
- **WHEN** a shipped map identity produces fewer placed resources than the
  adapter candidate resource catalog size
- **THEN** world-balance stats require every placed resource to use a distinct
  numeric resource id

### Requirement: Resource Diversity Stats Preserve Runtime Proof Boundary

The numeric resource diversity stats SHALL not claim symbolic resource runtime
id verification.

#### Scenario: Stats pass locally
- **WHEN** world-balance resource diversity stats pass
- **THEN** the evidence remains local numeric adapter-catalog evidence
- **AND** final symbolic `RESOURCE_*` runtime proof still requires bounded
  scripting-log evidence through the FireTuner socket/API restart boundary
