## ADDED Requirements

### Requirement: Studio Launches Current Map Config In Civ7

Mapgen Studio SHALL provide a Run in Game action that launches Civ7 through
structured direct-control setup/start wrappers.

#### Scenario: Run in Game is separate from browser Run
- **WHEN** a developer clicks Run in Game
- **THEN** Studio sends a structured Run in Game request
- **AND** it does not invoke the browser preview runner
- **AND** it does not include raw setup JavaScript or raw socket commands

#### Scenario: Seed remains setup runtime input
- **WHEN** Studio launches a current config in Civ7
- **THEN** the Studio seed is sent as Civ setup `MapRandomSeed`
- **AND** the authored Swooper config envelope is not given a seed field

### Requirement: Studio Materializes Exact Config Identity

Mapgen Studio SHALL materialize the selected/current Swooper map config with
explicit durable or disposable semantics and hash proof.

#### Scenario: Durable run uses repo-backed config
- **WHEN** the selected config is repo-backed and not dirty
- **THEN** Studio may materialize through the durable config path
- **AND** the response records map script, source path, config hash, and
  envelope hash

#### Scenario: Disposable run avoids authored config drift
- **WHEN** the current config is dirty or not repo-backed
- **THEN** Studio materializes a disposable `studio-current` row
- **AND** it cleans repo source artifacts after deployment
- **AND** the response records that the deployed mod, not authored config, owns
  the disposable runtime row

### Requirement: Runtime Proof Binds Launch To Config

Studio SHALL require live row/setup/start/log proof before claiming exact
current-config launch success.

#### Scenario: Exact launch proof succeeds
- **WHEN** Run in Game succeeds
- **THEN** proof includes frontend map row visibility, setup readback,
  post-start runtime seed, and fresh Swooper `[mapgen-proof]` log markers with
  request id, config hash, and envelope hash

#### Scenario: Reload semantics are not hidden
- **WHEN** a newly materialized row is not visible to Civ setup
- **THEN** Studio reports the row visibility/reload boundary failure
- **AND** it does not silently fall back to restart-only behavior
