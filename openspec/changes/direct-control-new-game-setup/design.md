## Design

The setup surface is an App UI state role contract. Tuner is only used after
Begin/GameStarted for gameplay-read postconditions.

## Public Wrappers

- `getCiv7SetupSnapshot(options)`: read current setup phase, core setup
  parameters, selected map row, and map domain visibility.
- `getCiv7SetupMapRows(input, options)`: bounded App UI config database read
  for frontend map script rows, distinct from Tuner `GameInfo.Maps` map-size
  rows.
- `prepareCiv7SinglePlayerSetup(input, options, approval)`: validate active
  setup domains, write bounded setup parameters, and read back exact values.
- `startPreparedCiv7SinglePlayerGame(input, options, approval)`: verify expected
  setup, start through one package-owned primitive, wait for Begin/GameStarted,
  and optionally wait for Tuner readiness.
- `runCiv7SinglePlayerFromSetup(input, options, approval)`: compose shell guard,
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
approval and records the destructive phase transition in the result.

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

Source evidence supports the API shape. Studio dependence on mutating wrappers
requires fresh live evidence once the Civ socket responds to LSQ again.
