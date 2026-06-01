## Why

The resource stack now has local numeric diversity gates, but final closure needs
live Civ7 evidence from the deployed mod and the current FireTuner socket/API
restart path. Before this slice, the runtime log only proved the placement step
completed; it did not emit enough resource-specific telemetry to prove the
repaired diversity held in game.

## Target Authority Refs

- `openspec/changes/resource-distribution-planning`: runtime proof requires
  deploy, the downstack FireTuner restart boundary, bounded logs, and resource
  telemetry.
- `openspec/changes/resource-diversity-stats-gate`: local numeric diversity
  stats pass but do not by themselves prove runtime behavior.
- `openspec/changes/resource-runtime-proof/workstream/phase-record.md`: final
  runtime proof must verify the downstack restart branch, integrate/restack
  successor restart work if needed, and use the FireTuner socket/API restart
  path.

## What Changes

- Emit one bounded runtime telemetry line during the `place-resources` product
  step: `[SWOOPER_MOD] RESOURCE_PLACEMENT_V1 ...`.
- Assign planned resource ids to engine-legal tiles during product
  materialization by checking Civ7 `canHaveResource` before placement, so local
  numeric diversity does not collapse at runtime legality.
- Include compact GameInfo resource id telemetry: planned/placed/rejected id
  sets, assignment counts, unique placed type count, min/max placed count
  spread, runtime catalog size, and unmapped placed ids.
- Record the verified downstack restart branch/commit and exact restart
  command/path used for runtime proof.
- Repair the stale stats-gate closure record in this follow-up slice.

## Explicit Non-Goals

- No hand edits to generated `dist/`, `mod/`, or deployed generated artifacts.
- No claim that external Graphite submission/PR delivery has occurred.
- No sidecar control note is required after final restacked runtime-proof
  evidence is recorded in the phase record.

## Verification Gates

- `bun test mods/mod-swooper-maps/test/placement/resource-placement-diagnostics.test.ts`
- `bun test mods/mod-swooper-maps/test/pipeline/world-balance-stats.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `POST http://127.0.0.1:5175/api/map-configs` from the source resource
  worktree Studio pair, which deployed with
  `bun run --cwd mods/mod-swooper-maps deploy` and restarted through the
  FireTuner socket/API path.
- bounded inspection of
  `~/Library/Application Support/Civilization VII/Logs/Scripting.log`
- bounded inspection of
  `~/Library/Application Support/Civilization VII/Logs/Modding.log`
- `bun run openspec -- validate resource-runtime-proof --strict`
- `bun run openspec:validate`
- `git diff --check`
