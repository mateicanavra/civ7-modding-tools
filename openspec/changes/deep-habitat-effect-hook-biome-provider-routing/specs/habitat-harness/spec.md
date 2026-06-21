## MODIFIED Requirements

### Requirement: Habitat hooks compose vendor execution through providers

Habitat hook service execution SHALL use owned provider services for vendor
tool execution instead of hook-local command escape hatches.

#### Scenario: Pre-commit service formats and checks through BiomeProvider

- **WHEN** the Habitat hook service runs `pre-commit`
- **AND** staged paths include Biome-supported files
- **THEN** Biome format and check execution SHALL be issued through
  `BiomeProvider`
- **AND** the hook SHALL preserve existing staged path selection, partial-staging
  refusal, restage behavior, output sections, and trace phase names.
