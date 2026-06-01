## ADDED Requirements

### Requirement: CLI Consumes The Canonical Direct-Control Surface

The CLI SHALL expose structured Civ7 direct-control reads, actions, validators,
and catalog generation by calling `@civ7/direct-control`.

#### Scenario: CLI reads game state
- **WHEN** a developer runs a structured `civ7 game` read command
- **THEN** the command calls a package read wrapper
- **AND** it does not build raw tuner-socket commands locally

#### Scenario: CLI requests gameplay action
- **WHEN** a developer runs a structured `civ7 game` action command
- **THEN** the command calls a package action wrapper
- **AND** it reports validation and postcondition evidence returned by the
  package

#### Scenario: CLI generates catalog output
- **WHEN** a developer runs the catalog command
- **THEN** the command calls the package catalog generator
- **AND** it returns machine-readable output or writes generated artifacts using
  package-owned schemas

### Requirement: Studio Consumes Package Read Wrappers

Studio SHALL call `@civ7/direct-control` for runtime status, map summary, and
bounded runtime comparison reads that are covered by the package.

#### Scenario: Studio needs runtime map facts
- **WHEN** Studio server code needs Civ7 runtime map facts
- **THEN** it calls package read wrappers
- **AND** it does not duplicate direct-control protocol or JavaScript command
  builder logic

### Requirement: Covered Legacy Guidance Is Removed Or Reclassified

Active docs, scripts, and tests SHALL NOT instruct repo tooling to use
FireTuner/Windows bridge transport for behaviors covered by direct control.

#### Scenario: Active guidance mentions FireTuner
- **WHEN** active docs mention FireTuner for a covered direct-control behavior
- **THEN** they classify it as reference-client or historical evidence
- **AND** they do not present it as the maintained runtime path
