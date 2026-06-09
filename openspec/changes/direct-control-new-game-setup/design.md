## Design

The setup surface is an App UI state role contract. Tuner is only used after
Begin/GameStarted for gameplay-read postconditions.

## Public Wrappers

- `getCiv7SetupSnapshot(options)`: read current setup phase, core setup
  parameters, selected map row, and map domain visibility.
- `getCiv7SetupMapRows(input, options)`: bounded App UI config database read
  for frontend map script rows, distinct from Tuner `GameInfo.Maps` map-size
  rows.
- `prepareCiv7SinglePlayerSetup(input, options)`: validate active
  setup domains, write bounded setup parameters through both `Configuration`
  and `GameSetup` parameter APIs where Civ exposes both surfaces, and read back
  exact values.
- `startPreparedCiv7SinglePlayerGame(input, options)`: verify expected
  setup, start through one package-owned primitive, wait for Begin/GameStarted,
  and optionally wait for Tuner readiness.
- `runCiv7SinglePlayerFromSetup(input, options)`: compose shell guard,
  setup, start, and post-start proof for Studio-facing callers.

## Setup Input Contract

Minimum input:

- `mapScript`: exact frontend map row file, for example
  `{swooper-maps}/maps/swooper-earthlike.js`.
- `mapSize`: setup `MapSize` value, for example `MAPSIZE_STANDARD`.
- `seed`: setup `MapRandomSeed`; this is the value verified by
  `GameplayMap.getRandomSeed()`.
- Optional `gameSeed` is explicitly separate and is not the map seed.
- Optional `options` are bounded setup parameter ids. This must not become a
  clone of the entire setup UI.

## Phase Guards

`prepareCiv7SinglePlayerSetup` requires shell by default. The orchestration
wrapper may accept `fromRunningGame: "exit-to-shell"` only with explicit
caller request and records the destructive phase transition in the result.

## Map Row Proof

Frontend map-script row proof uses App UI `Database`/setup domain rows, not the
current Tuner `GameInfo.Maps` wrapper. The result records row source,
domain/file/name/sortIndex, and whether the row was seen in setup domain,
config DB, or both.

## Mutation Failure Behavior

Setup/start commands are not automatically replayed after a socket close,
timeout, or unknown postcondition. The wrapper returns classified evidence and
requires a new user request for another mutation attempt.

## Error Taxonomy

New setup errors include `setup-api-unavailable`, `setup-phase-invalid`,
`setup-map-row-missing`, `setup-parameter-invalid`,
`setup-apply-timeout`, `setup-readback-mismatch`,
`setup-start-timeout`, `setup-seed-mismatch`,
`setup-map-size-mismatch`, and `setup-config-proof-missing`.

## Live Evidence Boundary

Live evidence on 2026-05-31 proves setup/start from a running game through
direct control after writing both `Configuration` and `GameSetup` values. A
`Configuration`-only write changed `Configuration.getMap()` but failed setup
readback because `GameSetup` still selected the default Continents row.

Disposable `studio-current` evidence on the same date proves newly deployed
setup rows can require a shell/main-menu transition before Civ setup sees them.
The setup-row visibility helper owns that reload sequence for callers.
