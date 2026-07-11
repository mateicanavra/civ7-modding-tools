## ADDED Requirements

### Requirement: Generated Mod Is Composed Into Saved Setup State

MapGen Studio SHALL compose the request-local generated Studio-run mod into the
active Civ7 setup state before reading setup rows or starting the game.

#### Scenario: Saved Test of Time config is used

- **WHEN** Run in Game uses saved setup config `ToT_BasicModsEnabled.Civ7Cfg`
- **AND** the request generated `mod-swooper-studio-run`
- **THEN** Studio ensures the generated mod is active in the setup target
  before map-row readback
- **AND** targeted reconciliation confirms `mod-swooper-studio-run` is active
  in the setup target
- **AND** setup readback sees the stable generated map row
  `{mod-swooper-studio-run}/maps/studio-run.js`
- **AND** private evidence retains the request `runArtifactId` and deployment
  digest for the overwritten generated script content

#### Scenario: Setup values are read before Begin

- **WHEN** the generated row is visible after setup reconciliation
- **THEN** Studio applies and reads back the generated map row, seed, map size,
  and player count before Begin
- **AND** the readback values match the admitted request
- **AND** the rendered Run in Game click produces a browser-originated
  `runInGame.start` request with `worldSettings.resources: balanced`, and the
  same request's generation manifest retains that value
- **AND** Civ7 setup/readback does not establish a resulting resource
  distribution

#### Scenario: Start consumes the checked setup state

- **WHEN** Studio starts Civ7 after successful setup readback
- **THEN** the start path consumes the same reconciled setup state
- **AND** does not reload or mutate saved config in a way that removes the
  generated mod or changes the selected generated row

#### Scenario: Generated row cannot be made visible

- **WHEN** the generated row remains absent after setup reconciliation
- **THEN** Studio terminalizes the operation with the safe public runtime
  category
- **AND** private diagnostics use the setup failure reason from
  `studio-run-setup-failure-taxonomy`
