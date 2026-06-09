# Game UI Attention Service Adapter Slice

Status: implemented local package/bundle proof.
Date: 2026-06-05.

## Purpose

Add the first game-resident attention read adapter behind the
controller-supported `attention.current` service procedure.

This moves the game-scoped controller from mutation-only support toward the
product outcome where the in-process native control-oRPC service can observe
current attention from inside Civ7 game scope. The attention semantics stay in
`packages/civ7-control-orpc`; the game UI adapter supplies controller
dependency data from ambient game globals. It does not claim deployed Civ7
runtime proof.

## Write Set

- `packages/civ7-direct-control/package.json`
- `packages/civ7-control-orpc/src/game-ui-attention.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/modules/attention/contract.ts`
- `packages/civ7-control-orpc/src/modules/attention/procedures/current.ts`
- `packages/civ7-control-orpc/src/modules/readiness/procedures/current.ts`
- `packages/civ7-control-orpc/test/attention-current-procedure.test.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `packages/civ7-control-orpc/test/readiness-current-procedure.test.ts`
- generated `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

- Game UI attention source handling is service-owned in
  `packages/civ7-control-orpc`; direct-control does not publish a game-UI
  attention semantic subpath.
- `@civ7/control-orpc/game-ui` wires notification, turn, and official
  first-ready-unit attention reads from ambient game globals when controller
  proof plus ambient notification and first-ready-unit APIs are available.
- The game-UI context reports `attention.current` as an explicit supported read
  procedure; readiness may recommend `read-attention` from that fact while
  broad mutation capability remains conservative.
- `attention.current` reads notification, turn-completion, and
  first-ready-unit evidence in game UI context. Selected-unit ids are only
  hints and do not become ready-unit blockers.
- `attention.current` keeps ready-city source reads `skipped-unsupported` in
  game UI context until an official ready-city source exists. Selected-city ids
  and notification target ids are hints only and do not become ready-city
  blockers.
- `attention.current` does not recommend `end-turn` without ready actor source
  coverage.
- Notification reads use the existing `maxNotifications + 1` coverage pattern:
  truncated coverage is reported by the controller adapter and projects as
  incomplete attention evidence rather than an unqualified no-blocker
  conclusion.
- Normal bridge/service output remains semantic and omits host, port, state,
  command, rawCommand, session, tuner payloads, and direct-control socket
  details.

## Non-Goals

- no game-resident ready-city source support;
- no direct-control game-UI attention export or semantic runtime port;
- no new mutation runtime implementation;
- no custom dispatcher, router, middleware, transport, or procedure-core
  scaffolding;
- no deployed Civ7 runtime proof or play-thread action;
- no full `7.3` acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run --cwd packages/civ7-direct-control test`
- `bun run --cwd packages/civ7-control-orpc test test/game-ui-controller.test.ts test/readiness-current-procedure.test.ts test/attention-current-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd mods/mod-civ7-intelligence-bridge check`
- `bun run --cwd mods/mod-civ7-intelligence-bridge build`
- `bun run --cwd mods/mod-civ7-intelligence-bridge test`
- bundle scan over `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js` for Node built-ins, direct-control package-root/socket runtime code, raw command/session strings, RPC transport symbols, and retired approval tokens
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

## Residual Risk

The fake game runtime proves local source behavior only. Live Civ7 still must
prove that the shipped UIScript loads, finds the expected notification and turn
APIs, reads current attention without raw runtime leakage, and preserves honest
coverage when the real notification list is longer than the requested limit.
