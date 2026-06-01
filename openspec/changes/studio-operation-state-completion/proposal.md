# Studio Operation State Completion

## Why

The first Run in Game robustness slice made the primary launch path work better,
but it left the Studio state model too implicit. Save/deploy, browser preview,
Run in Game, live Civ status, and current authored config state still appeared
as nearby controls without a durable relationship between them. That made it too
easy to overclaim completion, leave unchecked proof tasks, or show a previous
Run in Game result as if it still described the current Studio config.

## What Changes

- Separate Save/Deploy from Civ launch. Saving a repo-backed config no longer
  implicitly restarts or relaunches Civ; Run in Game is the launch action.
- Track whether a visible Run in Game operation still matches the current
  authored Studio state, seed, map size, player count, resources, and
  materialization mode.
- Attach duplicate Run in Game clicks to the active operation instead of
  enqueueing another mutating setup/start command.
- Extract Run in Game operation-state and request-validation logic into
  testable server helpers.
- Add focused tests for request validation, operation status/failure
  classification, stale/current client state, and footer recovery rendering.

## Non-Goals

- Persist operation records across Vite dev-server process restarts.
- Add a full modal operation inspector.
- Replace live Civ map sync or browser preview state management beyond the
  Run in Game and save/deploy boundaries.
