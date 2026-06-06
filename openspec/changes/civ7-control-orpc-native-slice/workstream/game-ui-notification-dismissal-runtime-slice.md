# Game UI Notification Dismissal Access Path Slice

Status: implemented local package/bundle proof.
Date: 2026-06-05.

## Purpose

Add the first game-resident mutation access path behind the serialized
controller ingress: `notifications.dismiss.request`.

This moves the game-scoped controller from bootstrap-only proof toward the
product outcome where accepted actions execute inside the native in-process
control-oRPC service. It does not claim deployed Civ7 runtime proof.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-notification-dismissal.ts`
- `packages/civ7-control-orpc/test/game-ui-notification-dismissal.test.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-direct-control/package.json`
- deleted `packages/civ7-direct-control/src/play/notifications/game-ui-dismissal.ts`
- deleted `packages/civ7-direct-control/test/game-ui-notification-dismissal.test.ts`
- generated `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

- The game UI notification-dismissal adapter is service-owned in
  `packages/civ7-control-orpc` and does not import tuner socket, session
  execution, command serialization, or private direct-control subpaths.
- `@civ7/direct-control` remains the low-level notification dismissal result,
  component validation, postcondition classifier, and proof-policy authority.
- `@civ7/control-orpc/game-ui` wires only
  `requestCiv7NotificationDismissal` to the service-owned game UI adapter.
- The game-UI context reports only an explicit supported mutation procedure list;
  broad `readiness.current` observe/mutate capability remains conservative
  while game UI read/attention and other mutation ports are unsupported.
- Native mutation readiness admits the context-listed
  `notifications.dismiss.request` procedure and keeps other game UI mutation
  ports bounded by the existing readiness error projection.
- Normal bridge output remains the semantic notification dismissal result and
  omits route internals, context-owned proof, host, port, state, command,
  rawCommand, session, and tuner payloads.

## Non-Goals

- no runtime implementation for other mutation ports;
- no custom dispatcher, router, middleware, transport, or procedure-core
  scaffolding;
- no deployed Civ7 runtime proof or play-thread action;
- no full `7.3` acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run --cwd packages/civ7-direct-control test`
- `bun run --cwd packages/civ7-control-orpc test test/game-ui-notification-dismissal.test.ts`
- `bun run --cwd packages/civ7-control-orpc test test/game-ui-controller.test.ts test/controller-bridge-ingress.test.ts test/notification-dismissal-procedure.test.ts`
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
prove that the shipped UIScript loads, finds the expected notification APIs,
collects controller proof, dismisses a reviewed notification, and observes the
postcondition without repeating suspect sends.
