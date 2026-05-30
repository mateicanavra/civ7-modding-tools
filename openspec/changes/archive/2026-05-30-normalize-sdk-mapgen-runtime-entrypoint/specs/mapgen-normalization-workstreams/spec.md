## ADDED Requirements

### Requirement: SDK Root Does Not Load Civ7 Map Runtime

The SDK root SHALL remain safe for Node/Bun build-tool consumers and SHALL NOT
load Civ7 map runtime adapter modules as a side effect of importing general SDK
mod-authoring APIs.

#### Scenario: A build-tool consumer imports SDK root
- **WHEN** a package imports builders, nodes, constants, files, or `Mod` from
  `@mateicanavra/civ7-sdk`
- **THEN** that import does not transitively load `@civ7/adapter/civ7`
- **AND** it does not require Civ7 `/base-standard/...` modules to resolve

#### Scenario: A map entrypoint uses createMap
- **WHEN** a Civ7 map file uses the SDK map authoring helper
- **THEN** it imports `createMap` from `@mateicanavra/civ7-sdk/mapgen`
- **AND** the explicit mapgen subpath owns the opt-in to Civ7 map runtime
  adapter binding

#### Scenario: A guardrail protects the boundary
- **WHEN** normalization guardrails run
- **THEN** they reject SDK root exports/imports that reintroduce the mapgen
  runtime into `@mateicanavra/civ7-sdk`
- **AND** they continue allowing Civ7 runtime imports inside the explicit SDK
  mapgen subpath and adapter implementation

### Requirement: Studio Preset Wrappers Keep Stage Config Under Config

Built-in Studio preset wrapper files SHALL keep recipe stage configuration
under the wrapper `config` object and SHALL reject stale stage keys at the
wrapper root.

#### Scenario: A topology migration changes stage ids
- **WHEN** a built-in preset is migrated to new stage ids
- **THEN** the migrated stage keys appear under `config`
- **AND** wrapper metadata remains limited to `$schema`, `id`, `label`,
  `description`, and `config`

#### Scenario: Preset wrapper tests run
- **WHEN** tests validate a built-in Studio preset wrapper
- **THEN** the reusable preset wrapper helper rejects unknown root keys
- **AND** schema validation runs only after the wrapper boundary is valid
