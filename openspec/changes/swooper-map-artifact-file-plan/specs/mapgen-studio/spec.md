## ADDED Requirements

### Requirement: Swooper Artifact Rendering Produces A File Plan

Swooper Maps SHALL render map artifacts through a pure file-plan boundary before
writing files.

#### Scenario: Artifact renderer receives a map source

- **WHEN** Swooper renders map artifacts for a valid source
- **THEN** it returns a file plan containing every intended output path, content
  payload, artifact kind, and marker metadata
- **AND** SA-06 enforces renderer/write ownership through the authority plane

#### Scenario: Writer receives a file plan

- **WHEN** a Swooper artifact writer receives a file plan and output root
- **THEN** it writes the planned files under that output root
- **AND** rendered content remains equivalent to the prior generated artifacts
  for existing catalog inputs
