# Studio Setup Config Sync Workstream

## Frame

Objective: make Mapgen Studio a reliable launch surface for Civ7 setup choices
by carrying exact live/readback setup state into a bounded Studio model, editable
top-bar controls, validated launch payloads, direct-control setup mutation, and
runtime proof.

Hard core: Studio must retain authoring authority over mapgen configuration
while `@civ7/direct-control` owns Civ7 setup mechanics. No raw setup commands
belong in Studio.

Falsifier: if leader/civ/difficulty can still reset during Run in Game because
they are not represented in Studio state or not verified after direct-control
setup preparation, the slice is incomplete.

## Evidence

- Official SetupParameters defines `Difficulty`, custom difficulty parameters,
  `PlayerCivilization`, `PlayerLeader`, and `PlayerDifficulty`.
- Official Civ7 shell UI writes leader/civ with
  `GameSetup.setPlayerParameterValue`.
- Existing Studio request validation dropped all setup fields except map size,
  seed, and player count.

## Proof Classes

- Tests: direct-control fake socket; Studio setup model/request/persistence/run
  state tests.
- Checks/build: `bun run --cwd packages/civ7-direct-control check`,
  `bun run --cwd packages/civ7-direct-control build`,
  `bun run --cwd apps/mapgen-studio check`, and
  `bun run --cwd apps/mapgen-studio build` pass on 2026-06-04. The first Studio
  build attempt overlapped with direct-control declaration generation and failed
  on transient missing package declarations; rerun after the package build passed.
- OpenSpec: `bun run openspec -- validate studio-setup-config-sync --strict`
  passes.
- Runtime proof: Studio restarted on `http://127.0.0.1:5174/` in tmux session
  `mapgen-studio-codex`. `/api/civ7/setup-config` read back
  `{swooper-maps}/maps/swooper-earthlike.js`, `DIFFICULTY_PRINCE`,
  `GAMESPEED_STANDARD`, local player `LEADER_HARRIET_TUBMAN`,
  `CIVILIZATION_AMERICA`, and `PlayerDifficulty=DIFFICULTY_PRINCE`.
  Studio Run in Game request `studio-run-in-game-mpz6whm1-1v2f` completed and
  direct-control applied `Player:0:PlayerLeader`,
  `Player:0:PlayerCivilization`, and `Player:0:PlayerDifficulty` with exact
  readback. Fresh Scripting.log proof matched `[mapgen-proof]`, request id,
  config hash, and envelope hash.
