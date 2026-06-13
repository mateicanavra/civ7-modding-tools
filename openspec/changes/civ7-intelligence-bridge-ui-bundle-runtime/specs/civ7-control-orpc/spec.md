## ADDED Requirements

### Requirement: Game UI Bridge Bundle Excludes Node Direct-Control Runtime

The control-oRPC game UI entrypoint SHALL remain safe for Civ7 game UI
bundling. The generated intelligence-bridge UIScript bundle SHALL NOT include
Node socket/filesystem/path runtime imports or direct-control root runtime code.

#### Scenario: Intelligence bridge UI bundle is regenerated
- **WHEN** `mod-civ7-intelligence-bridge` rebuilds its `scope="game"` UI bundle
- **THEN** the generated `mod/ui/civ7-intelligence-bridge.js` contains no
  `net`, `os`, or `path` module imports
- **AND** it contains no direct-control package root runtime symbols such as
  `encodeCiv7TunerRequest`, `withCiv7DirectControlSession`,
  `executeCiv7Command`, or `DEFAULT_CIV7_TUNER_HOST`
- **AND** it continues to import the narrow `@civ7/control-orpc/game-ui`
  source from the mod bootstrap

#### Scenario: Control-oRPC needs direct-control error classification
- **WHEN** control-oRPC projects a failure detail for a
  `Civ7DirectControlError`
- **THEN** it preserves the bounded `direct-control/<code>` detail without
  importing the direct-control package root as a runtime value in
  game-UI-reachable modules
