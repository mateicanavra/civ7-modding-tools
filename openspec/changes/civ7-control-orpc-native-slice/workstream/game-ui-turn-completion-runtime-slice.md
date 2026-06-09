# Game UI Turn Completion Runtime Slice

Status: implemented local package/bundle proof.
Date: 2026-06-05.

## Purpose

Add a game-resident turn-completion runtime port behind the
controller-supported `turn.complete.request` service procedure.

This moves the game-scoped controller beyond notification dismissal and
attention reads toward the product outcome where the native in-process
control-oRPC service can execute meaningful player-support actions inside Civ7
game scope. It does not claim deployed Civ7 runtime proof.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-attention.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `packages/civ7-direct-control/package.json`
- `packages/civ7-direct-control/README.md`
- active direct-control control-surface workstream docs that still described
  caller-provided approval or CLI reason flags as current guidance
- generated `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- this OpenSpec record, `tasks.md`, and
  `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

- `@civ7/control-orpc/game-ui` lists `turn.complete.request` as a supported
  mutation only when controller proof exists and ambient `GameContext`,
  `canEndTurn`, `hasSentTurnComplete`, and `sendTurnComplete` APIs are present.
- The game-UI dependency path reads turn-completion evidence from ambient game
  globals and lets the existing service-owned `turn.complete.request` procedure
  project semantic output and proof/no-repeat next steps.
- The adapter requires an actual `GameContext.sendTurnComplete` function before
  any path can report `sent: true`.
- Blocked, already-sent, or missing-send-capability paths remain semantic
  `not-sent` results with inspect and `do-not-repeat` next steps.
- Normal bridge/service output remains semantic and omits host, port, state,
  command, rawCommand, session, tuner payloads, raw game-UI function names, and
  direct-control socket details.
- Caller-provided approval and CLI reason flags remain retired. This closure
  removes remaining active package-doc examples, marks old review records as
  superseded/historical, fixes clean direct-control declaration generation so
  stale approval declarations cannot survive in `dist`, and regenerates the
  shipped game UI bundle from approval-free sources.

## Non-Goals

- no game-resident runtime implementation for other mutation ports;
- no direct-control game-UI semantic subpath;
- no custom dispatcher, router, middleware, transport, or procedure-core
  scaffolding;
- no deployed Civ7 runtime proof or play-thread action;
- no full `7.3` acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/game-ui-controller.test.ts test/turn-completion-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd mods/mod-civ7-intelligence-bridge test`
- `bun run --cwd mods/mod-civ7-intelligence-bridge check`
- `bun run --cwd mods/mod-civ7-intelligence-bridge build`
- bundle scan over `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js` for Node built-ins, direct-control package-root/socket runtime code, raw command/session strings, RPC transport symbols, and retired approval tokens
- generated-artifact scan over `packages/civ7-direct-control/dist` and
  `packages/civ7-control-orpc/dist` for retired approval tokens before the mod
  bundle is rebuilt
- active-doc scan over direct-control README/workstream guidance for retired
  caller approval, approved-send, CLI reason flag, and explicit-force wording
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

## Residual Risk

The fake game runtime proves local source behavior only. Live Civ7 still must
prove that the shipped UIScript loads, finds the expected turn-completion APIs,
requests turn completion through the game UI, and observes the postcondition
without repeating suspect sends.
