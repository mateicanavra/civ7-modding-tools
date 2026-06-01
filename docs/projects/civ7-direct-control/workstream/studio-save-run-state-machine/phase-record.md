# Studio Save/Run State Machine Phase Record

## Framed Objective

Harden Mapgen Studio's save, deploy, browser generation, and Run in Game
workflow so a developer can safely move from authored config to browser preview
to deployed Civ runtime without overlapping filesystem writes, stale deployed
rows, implicit save-triggered Civ restarts, or lost operation state.

## Hard Core

- Direct control remains the only Civ lifecycle path.
- Save/Deploy prepares files only; Run in Game owns Civ setup/start/restart.
- Browser Run is preview/runtime-in-browser only; it does not deploy or mutate
  Civ.
- Operation state must distinguish authored config, browser preview,
  Save/Deploy, Run in Game, and live Civ runtime.
- Deploy proof is not load proof; Civ log/load evidence must be labeled
  separately.

## Current Evidence

- Civ logs contained stale but relevant load failures for
  `fs://game/swooper-maps/maps/studio-current.js`, indicating a deployed/load
  boundary problem when Civ tried to load a row whose map file was not available
  in the current deployed mod state.
- Studio's prior save endpoint still contained a restart path even though Run in
  Game is now the dedicated lifecycle action.
- Dependency-aware Swooper deploys can touch workspace `dist` outputs, and Vite
  must ignore those writes so operation state survives deploy.

## Implementation Direction

- Add a dedicated Save/Deploy status model.
- Remove save-side restart support and reject restart requests on the save
  endpoint.
- Use one Studio deploy command for Save/Deploy and Run in Game.
- Use a serial server queue for filesystem/deploy operations.
- Block conflicting UI and handler paths for browser run, reroll, auto-run,
  save, and Run in Game.
- Surface process-restart recovery as an explicit Run in Game action.

## Stop Conditions

- Save/Deploy still restarts Civ.
- Vite reloads the active Studio tab due to deploy build outputs.
- Run in Game silently replays a mutating operation after uncertainty.
- Civ load proof is claimed from deploy success alone.
