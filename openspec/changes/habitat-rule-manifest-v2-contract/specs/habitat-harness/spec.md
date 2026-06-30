## ADDED Requirements

### Requirement: Current Rule Manifests Use Schema V2

Habitat SHALL parse current rule manifests only as schema version 2.

#### Scenario: V1 manifest is present

- **WHEN** a current `.habitat/**/rule.json` declares `schemaVersion: 1`
- **THEN** Habitat rejects the manifest
- **AND** it does not accept the v1 shape through a compatibility branch

### Requirement: Rule Category Output Replaces Artifact

Habitat SHALL use `placement.category: "output"` for rule-category output
authority and SHALL reject `placement.category: "artifact"`.

#### Scenario: Old artifact category is present

- **WHEN** a rule manifest declares `placement.category: "artifact"`
- **THEN** manifest validation fails

### Requirement: Rule Operation Is Top-Level Manifest Metadata

Habitat SHALL represent rule operation mode as top-level `operation.kind`.

#### Scenario: Check operation is declared

- **WHEN** a rule manifest declares `operation.kind: "check"`
- **THEN** Habitat accepts the operation
- **AND** consumers do not read `placement.artifactKind`

#### Scenario: Triage operation is declared

- **WHEN** a rule manifest declares `operation.kind: "triage"`
- **THEN** manifest validation fails

### Requirement: Rule Support Files Replace Rule Artifacts

Habitat SHALL represent non-runner rule-owned files under `supportFiles`.

#### Scenario: Baseline support file is declared

- **WHEN** a rule manifest declares `supportFiles.baseline`
- **THEN** registry validation checks the referenced file
- **AND** baseline facts expose that path to baseline consumers

#### Scenario: Old artifacts field is present

- **WHEN** a rule manifest declares top-level `artifacts`
- **THEN** manifest validation fails
