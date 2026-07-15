## ADDED Requirements

### Requirement: Generated Studio Run Mod Is Visible To Setup

MapGen Studio SHALL prove that the exact generated and deployed Studio-run mod
is admitted by Civ7 setup before starting the requested game.

#### Scenario: Stable generated mod is fresh for the request

- **WHEN** Run in Game generates `mod-swooper-studio-run`
- **THEN** the generated mod contains its modinfo, config row, localized text,
  stable `maps/studio-run.js`, and complete request correlation
- **AND** the deployed file-tree digest equals the generated file-tree digest
- **AND** the generated mod uses unique module-specific action and criteria ids

#### Scenario: Generated mod and row are admitted

- **WHEN** the package-owned lifecycle prepares the request in Civ7 shell
- **THEN** it reconciles the exact target mod through direct-control
- **AND** it reads `{mod-swooper-studio-run}/maps/studio-run.js`
- **AND** a source-catalog row or provider-echoed value does not satisfy the
  observation
- **AND** setup evidence returns the exact target mod id and stable row

#### Scenario: Catalog observation needs refresh

- **WHEN** the target mod is admitted but the exact stable row is not yet
  observable
- **THEN** the lifecycle reloads setup UI and polls read-only row observations
- **AND** it does not repeat target-mod mutation
- **AND** it does not restart the Civilization VII process

#### Scenario: Generated row is unavailable

- **WHEN** exact target-mod or stable-row evidence cannot be established
- **THEN** the lifecycle fails closed with typed private diagnostics
- **AND** public status exposes only the safe failure category
- **AND** no setup/start mutation is inferred from incomplete evidence
