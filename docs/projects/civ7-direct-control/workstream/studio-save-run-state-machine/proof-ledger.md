# Proof Ledger

## Observed Failure

- **Evidence type:** Civ log observation.
- **Observation:** Civ logged failures opening and loading
  `fs://game/swooper-maps/maps/studio-current.js`.
- **Interpretation:** This proves a load boundary failure for a map file, not a
  standalone algorithm failure.
- **Disposition:** Fix deploy/load state coherence by preventing overlapping
  operations and keeping Studio deploy dependency-aware.

## Implemented Proof Targets

- Save/Deploy endpoint no longer performs Civ restart/start behavior.
- Run in Game process-restart recovery is explicit and request-scoped.
- Save/Deploy status is represented separately from Browser Run and Run in Game
  and is server-authoritative while the Vite dev server is alive.
- Browser Run, reroll, auto-run, Save/Deploy, and Run in Game are guarded against
  unsafe overlap.
- Save/Deploy and Run in Game reject cross-operation API conflicts before
  queueing a filesystem or Civ mutation.
- Studio deploy rebuilds required workspace dependencies while Vite ignores
  dependency output changes.

## Verification

- `bun run --cwd apps/mapgen-studio check` passed.
- `bun run --cwd apps/mapgen-studio test -- mapConfigSave runInGame` passed:
  9 files, 31 tests after adding Save/Deploy request validation and operation
  store coverage.
- `bun run --cwd apps/mapgen-studio test -- standardLayerVisibility` passed
  after aligning the test timeout with its 30s worker deadline; the standard
  recipe completed and emitted `run.finished`.
- `bun run verify:studio-run-in-game` passed after the state-machine changes.
  This covered direct-control/sdk/studio/mod builds, package tests,
  `mod-swooper-maps` Run-in-Game tests, and strict OpenSpec validation for the
  full direct-control Studio change train including
  `studio-save-run-state-machine`.
- Restarted the Studio dev server with `bun run dev:mapgen-studio`; live server
  identity was `studio-server-mputtrq2-1zhv` at `http://localhost:5173/`.
- Browser proof via Chrome on `http://localhost:5173/`: clicking footer `Run`
  transitioned to `Running`, disabled seed, reroll, auto-run, Run in Game, and
  Save/Deploy controls, rendered the map, and returned to `Ready` without a tab
  refresh.
- Live API probe: POST `/api/map-configs` with `restart: true` returned `400`
  and `Map config save/deploy does not restart Civ; use Run in Game for Civ
  lifecycle control.`
- Live API probe: GET `/api/map-configs/status?requestId=missing-test` returned
  `404` with a structured missing-request error.
