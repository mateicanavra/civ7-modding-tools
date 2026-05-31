## ADDED Requirements

### Requirement: Direct Control Refreshes Deployed Setup Rows

The Civ7 direct-control boundary SHALL expose a package-owned setup-row
visibility helper for deployed map rows that are not yet visible to Civ setup.

#### Scenario: Visible row returns without mutation
- **WHEN** a caller asks direct-control to ensure a setup map row is visible
- **AND** the row already exists in App UI setup rows
- **THEN** direct-control returns the row proof without exiting the current game
- **AND** it reports `verified: true`

#### Scenario: Disposable row becomes visible after shell reload
- **WHEN** a deployed row is missing from App UI setup rows
- **AND** the caller explicitly approves `reloadIfMissing: "exit-to-shell"`
- **THEN** direct-control exits the current game to shell/main-menu through App UI
- **AND** it runs App UI reload
- **AND** it polls setup rows until the requested map script is visible or the
  wait budget expires

### Requirement: Studio Uses Reload Proof For Disposable Run In Game

Mapgen Studio SHALL use the direct-control setup-row visibility helper before
starting disposable `studio-current` games.

#### Scenario: Disposable launch no longer fails on first invisible row
- **WHEN** Studio deploys a disposable current config row
- **AND** the row is not visible before returning to shell
- **THEN** Studio asks direct-control to refresh setup-row visibility
- **AND** only starts setup after the refreshed row proof is visible

#### Scenario: Shell reload failure remains explicit
- **WHEN** setup-row visibility remains missing after the refresh wait budget
- **THEN** Studio reports a reload-required row visibility failure
- **AND** it does not silently fall back to FireTuner, Windows bridge, or raw
  Studio setup JavaScript
