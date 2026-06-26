## MODIFIED Requirements

### Requirement: Habitat Provider-Owned Vendor Access

Habitat SHALL not preserve unused raw vendor helper modules once the owned
provider/service path exists.

#### Scenario: Graph command uses provider path only

- **WHEN** the Habitat graph command is implemented through the graph service
- **THEN** stale raw graph helper modules SHALL be removed
- **AND** the public-surface guard SHALL reject their return.
