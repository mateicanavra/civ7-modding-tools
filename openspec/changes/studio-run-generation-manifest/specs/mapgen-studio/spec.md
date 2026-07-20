## ADDED Requirements

### Requirement: Run In Game Writes One Generation Manifest

MapGen Studio SHALL create a request workspace and write exactly one generation
manifest before request artifact generation.

#### Scenario: Run in Game reaches generation

- **WHEN** a Run in Game request is admitted and source resolution succeeds
- **THEN** Studio creates `.mapgen-studio/run-in-game/<requestId>/`
- **AND** writes one `StudioRunGenerationManifest`
- **AND** records its digest and path privately
- **AND** does not expose the manifest through public status

#### Scenario: Manifest digest is computed

- **WHEN** Studio computes the generation manifest digest
- **THEN** it uses canonical sorted JSON of
  `StudioRunGenerationManifestPayload`
- **AND** the resulting digest participates in `RunCorrelation`
