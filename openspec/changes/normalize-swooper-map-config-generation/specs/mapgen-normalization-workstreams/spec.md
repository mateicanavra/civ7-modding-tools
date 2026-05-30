## ADDED Requirements

### Requirement: Shipped Maps Use Canonical JSON Config Source

Swooper Maps shipped map variants SHALL use
`mods/mod-swooper-maps/src/maps/configs/*.config.json` as the only authored
source for map identity, display metadata, recipe selection, ordering metadata,
latitude overrides, and recipe config payload.

#### Scenario: A shipped map variant is added
- **WHEN** a developer adds a shipped Swooper Maps map variant
- **THEN** the authored source change is a canonical `.config.json` file under
  `mods/mod-swooper-maps/src/maps/configs/`
- **AND** the map id, display name, description, recipe id, sort order,
  optional latitude bounds, and recipe config payload are read from that file
- **AND** no hand-written per-map TS wrapper, shipped `.config.ts` map config,
  hardcoded `tsup` entry, XML row, modinfo import, localization row, or Studio
  preset payload becomes a second source of truth

### Requirement: Shipped Map Configs Are Full Source Configs

Canonical shipped map config files SHALL contain full recipe config payloads
with concrete stage, step, op strategy, and config values required to generate
the shipped map.

#### Scenario: Generator consumes a shipped map config
- **WHEN** the Swooper Maps generator reads a canonical shipped map config
- **THEN** validation proves the file is schema-valid for its recipe
- **AND** validation proves required strategy envelopes and config values are
  concrete before generated Civ7 or Studio artifacts are emitted
- **AND** missing shipped-map values are reported as source errors rather than
  silently filled by hidden preset composition

### Requirement: Swooper Map Artifacts Are Generated From The Config Registry

Swooper Maps SHALL generate Civ7 map entry bundles, map registration XML,
modinfo map imports, map localization rows, and Studio built-in config catalog
data from the canonical config registry.

#### Scenario: Swooper Maps build runs
- **WHEN** the Swooper Maps build prepares map artifacts
- **THEN** it enumerates canonical config files into a deterministic registry
- **AND** one Civ7-loadable JS map bundle is produced per registry entry
- **AND** `config.xml`, `.modinfo` map imports, map localization rows, and
  Studio built-in config catalog data are generated from the same registry
- **AND** checked-in generated `mod/` artifacts, if updated, are produced by
  generation scripts rather than hand edits

### Requirement: Studio Saves Repo-Backed Configs

MapGen Studio SHALL distinguish repo-backed shipped map configs from
browser-local scratch state and SHALL NOT present browser-local preset storage
as durable shipped-map authoring.

#### Scenario: Author saves an existing map config in Studio
- **WHEN** a repo-backed canonical map config is selected and edited in Studio
- **THEN** `Save` writes the selected config file through an explicit local
  write authority surface
- **AND** the saved file remains in
  `mods/mod-swooper-maps/src/maps/configs/`
- **AND** subsequent generation uses that saved file without an additional
  preset import/export step

#### Scenario: Author saves a modified config as a new map variant
- **WHEN** an author uses `Save As` for a repo-backed map config
- **THEN** Studio creates a sibling canonical `.config.json` file in
  `mods/mod-swooper-maps/src/maps/configs/`
- **AND** the new file receives a unique id/file stem and required metadata
- **AND** browser-local storage, if present, is labeled and treated only as
  scratch state
