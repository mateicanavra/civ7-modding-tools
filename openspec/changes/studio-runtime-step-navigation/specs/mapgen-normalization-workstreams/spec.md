## ADDED Requirements

### Requirement: Stages Publish Separate SDK Authoring Layers

SDK-authored stages MUST publish separate authoring metadata for public config
schema and runtime step navigation.

#### Scenario: A stage has semantic public config

- **GIVEN** a stage declares executable steps
- **AND** it exposes a semantic public authoring schema
- **WHEN** consumers inspect the stage authoring model
- **THEN** the config layer identifies the semantic public schema
- **AND** the runtime layer lists declared executable step ids independently
- **AND** editor/config focus hints are not stored on runtime step entries.

### Requirement: Studio Runtime Step Navigation Is Independent Of Public Config Keys

Generated Studio recipe metadata MUST include declared runtime steps for stage
and step navigation independently of public authoring schema property names.

#### Scenario: Semantic public keys differ from runtime step ids

- **GIVEN** a stage declares runtime steps `islands`, `mountains`, `volcanoes`,
  and `landmasses`
- **AND** its public authoring schema exposes semantic keys such as
  `islandChains`, `mountainRanges`, and `volcanoes`
- **WHEN** Studio recipe artifacts are generated
- **THEN** `uiMeta.stages[].steps` includes all declared runtime steps
- **AND** public config defaults and schema do not expose raw internal step/op
  envelope keys.

### Requirement: Config Focus Paths Are Editor Hints Only

Generated Studio config-focus paths MUST NOT decide whether a runtime step is
available for navigation or visualization.

#### Scenario: A runtime step has no exact public authoring key

- **GIVEN** a runtime step whose id does not exactly match a public schema
  property
- **WHEN** Studio recipe artifacts are generated
- **THEN** the step remains present in `uiMeta.stages[].steps`
- **AND** its config-focus path may be the stage root
- **AND** default public config remains valid against the public authoring
  schema.

#### Scenario: A public authoring key has no runtime step

- **GIVEN** a public schema property that does not correspond to a declared
  executable step
- **WHEN** Studio recipe artifacts are generated
- **THEN** that public property does not create a Studio runtime step.

### Requirement: Manifest And Diagnostic Surfaces Do Not Derive From Authoring Keys

Studio layer navigation and world diagnostics MUST derive from runtime
manifest/events, artifacts, compiled config, or diagnostics outputs, not editor
schema property names or default config skeletons.

#### Scenario: Studio displays layers for a browser run

- **GIVEN** a browser run emits manifest step and layer events
- **WHEN** Studio builds layer navigation
- **THEN** available layers are derived from the runtime manifest/events
- **AND** public authoring config keys do not add, remove, or rename layers.

#### Scenario: world diagnostics inspect generated outcomes

- **GIVEN** diagnostics or balance gates inspect generated world products
- **WHEN** they evaluate morphology, projection, or ecology outcomes
- **THEN** they consume runtime artifacts, compiled config, manifest/events, or
  explicit diagnostic outputs
- **AND** they do not infer product truth from Studio editor schema/default
  skeletons.

### Requirement: Studio Recipe Preflight Refreshes Stale Generated Artifacts

Studio preflight MUST NOT treat existing generated recipe artifacts as current
when source inputs or SDK distribution files are newer than those artifacts.

#### Scenario: recipe source changes after artifacts were generated

- **GIVEN** Studio recipe artifacts already exist
- **AND** a recipe source, artifact generator, recipe package config, or consumed
  SDK distribution file is newer than at least one generated artifact
- **WHEN** Studio preflight runs
- **THEN** it rebuilds Studio recipe artifacts before Studio consumes them.

#### Scenario: consumed SDK source is newer than SDK distribution files

- **GIVEN** the local SDK source is newer than the local SDK distribution output
- **WHEN** Studio preflight runs
- **THEN** it fails with an actionable build instruction instead of consuming
  stale generated recipe artifacts.
