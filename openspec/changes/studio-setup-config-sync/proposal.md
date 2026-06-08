## Why

Mapgen Studio Run in Game preserved only map script, map size, map seed, and
player count. Civ7 leader, civilization, difficulty, custom difficulty, and
other setup choices could reset because Studio did not model them and
`@civ7/direct-control` did not read or write player-scoped setup parameters.

## What Changes

- Add a bounded Studio setup-config model for map row override, main game setup
  options, custom difficulty options, and local player leader/civ/difficulty.
- Extend direct-control setup snapshots and setup preparation to read/write
  player-scoped parameters through Civ7 `GameSetup.findPlayerParameter` and
  `GameSetup.setPlayerParameterValue`.
- Include setup config in Studio persistence, Run in Game fingerprints, source
  snapshots, request validation, and launch payloads.
- Expose a compact top-bar setup strip for map, leader, civilization,
  difficulty, and game speed.
- Add a live setup read endpoint so Studio can re-sync from exact Civ7 setup
  state instead of relying only on the last Studio run source.

## Non-Goals

- Full clone of Civ7 advanced setup UI.
- Raw Civ setup commands in Studio.
- Making non-Swooper official map rows produce Swooper proof markers.

## Verification Gates

- Direct-control fake socket tests for player-scoped setup read/write/readback.
- Studio request, persistence, fingerprint, and setup model tests.
- Package checks/builds.
- Live Studio restart and setup readback/launch proof when Civ7 is available.
