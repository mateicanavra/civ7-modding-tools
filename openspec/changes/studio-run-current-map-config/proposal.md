## Why

Developers need a Studio action that launches the exact current Swooper map
config in Civ7 with the Studio seed, without confusing it with browser preview
Run and without persisting runtime seed into authored config.

## Target Authority Refs

- User goal and acceptance criteria for Studio Run in Game.
- `docs/projects/civ7-direct-control/workstream/studio-run-in-game/agent-studio-materialization.md`
- `docs/projects/civ7-direct-control/workstream/studio-run-in-game/agent-proof-test.md`
- Current Studio save/deploy paths in `apps/mapgen-studio`.
- Swooper map artifact generator and SDK map entrypoint.

## What Changes

- Add separate Studio Run in Game endpoint and UI action.
- Add explicit durable Save/Run versus disposable current-config policy.
- Compute canonical config/envelope hashes server-side and return proof fields.
- Add Swooper runtime log markers for map config id/hash/request id/seed.
- Call only `@civ7/direct-control` setup/start wrappers from Studio.

## Requires

- `direct-control-new-game-setup`

## Enables Parallel Work

- Studio live sync can bind runtime observations to a proven Studio run id and
  config hash.

## Affected Owners

- `apps/mapgen-studio`
- `mods/mod-swooper-maps/scripts/generate-map-artifacts.ts`
- `packages/sdk/src/mapgen/createMap.ts`
- Workstream proof ledger and docs

## Forbidden Owners

- Authored Swooper config seed fields.
- Raw setup JavaScript in Studio endpoints.
- Hand edits under generated `mod/` or `dist/`.

## Stop Conditions

- Civ cannot see newly materialized map rows after the claimed reload boundary.
- Swooper runtime cannot emit fresh request/config hash proof.
- Direct-control setup/start cannot live-prove the selected row/seed.

## Consumer Impact

Run in Game becomes a deliberate Civ launch action. Developers can distinguish
browser preview, durable Save/Run, and disposable current-config launch.

## Verification Gates

- Studio endpoint rejects malformed payloads and raw command fields.
- Swooper generator/SDK tests prove hash metadata is generated and logged.
- Live proof includes map row visibility, setup seed, post-start runtime seed,
  dimensions, and Swooper hash markers.
