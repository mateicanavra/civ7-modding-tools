## ADDED Requirements

### Requirement: Swooper Run Generation Is Manifest-Only

Swooper Maps SHALL generate Run in Game request artifacts from one generation
manifest.

#### Scenario: Valid manifest is generated

- **WHEN** the Swooper run generator receives a valid manifest path
- **THEN** it writes a complete generated mod under the request workspace
- **AND** the generated mod contains the required file classes from the target
  vocabulary
- **AND** generated runtime assets embed the run correlation tuple
- **AND** the generated map row id and script path derive from `RunArtifactId`

#### Scenario: Manifest input is invalid

- **WHEN** the generator receives no manifest, multiple manifests, or an invalid
  manifest
- **THEN** generation fails before writing a generated mod tree
