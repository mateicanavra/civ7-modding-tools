## ADDED Requirements

### Requirement: Selected Saved Configuration Survives Launch Admission

MapGen Studio SHALL retain the selected saved configuration as the exact file
identity consumed by Run in Game.

#### Scenario: Enriched saved configuration is selected

- **WHEN** the rendered selector chooses an enumerated `.Civ7Cfg` record
- **THEN** launch state retains exactly its `id`, `displayName`, `fileName`, and
  `path`
- **AND** discovery metadata does not enter the closed identity
- **AND** parsed game and player values remain in their sibling option maps
- **AND** strict normalization does not replace the valid selection with a
  default or custom setup

#### Scenario: Authored values drift after selection

- **WHEN** a user changes an option after selecting a saved configuration
- **THEN** Studio truthfully presents the setup as custom
- **AND** reselecting the saved configuration reapplies its parsed values
  exactly

### Requirement: Saved Configuration Precedes Generated Mod Setup

The package-owned control-oRPC single-player lifecycle SHALL load the selected
saved configuration before reconciling and applying the generated map setup.

#### Scenario: Saved configuration starts generated content

- **WHEN** Run in Game receives a selected saved configuration
- **THEN** the lifecycle loads it exactly once
- **AND** reconciles `mod-swooper-studio-run` after the load
- **AND** reads `{mod-swooper-studio-run}/maps/studio-run.js`
- **AND** applies and reads back the admitted setup values
- **AND** hosts and begins exactly once
- **AND** returns runtime evidence correlated to the same request

#### Scenario: Saved configuration evidence is incomplete

- **WHEN** selection, load, target-mod, stable-row, setup, or runtime evidence
  cannot be established
- **THEN** the operation fails closed with typed private diagnostics
- **AND** public status exposes only the safe failure category
- **AND** no mutation is inferred, replayed, or retried
- **AND** Civilization VII is not restarted
