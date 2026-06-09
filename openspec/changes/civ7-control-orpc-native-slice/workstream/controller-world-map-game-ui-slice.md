# Controller World Map Game UI Slice

## Status

Local package and generated-bundle proof collected.

## Purpose

Move the existing service-owned `world.plot.read` and `world.grid.read`
procedures into the game-scoped controller path without creating a new
transport API, exporting procedure input/result schema constants, or moving
normal map-read semantics out of the `world` service procedures.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-map.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/controller-world-map-game-ui-slice.md`

## Boundary

- The game-UI map dependency is a low-level runtime/read dependency for the
  existing world procedures. It returns bounded plot/grid evidence shaped like
  the direct-control runtime port; the service procedure still owns normal
  projection, source-status wording, and raw-output omission.
- Controller bridge envelopes are derived from the aggregated
  `Civ7ControlOrpcContract`; no per-procedure input/result schema constants are
  exported for callers and no `Type.Unknown` bridge input/output is used.
- `world.plot.read` and `world.grid.read` are advertised as game-UI supported
  reads only when the required plot-level `GameplayMap` APIs exist.
- Normal bridge output omits host, port, state, session, command, rawCommand,
  Tuner payloads, direct-control runtime envelopes, raw game-UI function names,
  actor catalogs, and relationship labels.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/controller-bridge-ingress.test.ts test/game-ui-controller.test.ts test/world-map-read-procedure.test.ts test/readiness-current-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd mods/mod-civ7-intelligence-bridge build`
- `bun run --cwd mods/mod-civ7-intelligence-bridge check`
- `bun run --cwd mods/mod-civ7-intelligence-bridge test`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Private procedure-schema export scan; no exported world plot/grid
  input/result schema constants were found outside the contract.
- Active approval/caller-permission scan over changed surfaces; hits are only
  approval-removal proof-scan language in OpenSpec records.
- Generated bundle scan for direct-control root/socket/session runtime, raw
  command/session payload symbols, RPC transport symbols, and retired
  approval/caller-permission tokens; no hits in the rebuilt game UI bundle.
- `git diff --check`

## Residual Risk

No deployed Civ7 runtime proof is claimed. Broad world/actor catalogs,
relationship labels, transport expansion, play-thread action, and full parent
Task 5.x/6.x/7.x acceptance remain pending.
