## MODIFIED Requirements

### Requirement: Source Check Service Provision

Habitat SHALL keep source-check domain logic separate from live Effect layer
assembly.

#### Scenario: Runtime owns SourceCheck live layer assembly

- **WHEN** Habitat assembles the live runtime layer
- **THEN** the runtime boundary SHALL provide the `SourceCheck` service
- **AND** the source-check domain service file SHALL define the service contract
  without constructing the live layer
- **AND** source-rule execution behavior SHALL remain unchanged.
