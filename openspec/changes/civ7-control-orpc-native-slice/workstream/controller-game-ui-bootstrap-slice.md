# Controller Game UI Bootstrap Slice

Status: implemented local source/bundle seed.
Date: 2026-06-05.

## Purpose

Create the first repo-owned Civ7 game-scoped controller bootstrap artifact
without turning `Civ7IntelligenceBridge.invoke(...)` into a product API or
adding a second routing/middleware system.

This slice moves the controller bridge from package-local source proof toward a
deployable Civ7 UI mod shape. It does not claim the mod has been deployed or
observed in a live game.

## Write Set

- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/package.json`
- `packages/civ7-control-orpc/tsup.config.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `packages/civ7-control-orpc/src/modules/*/procedures/*.ts` proof-helper
  import retargets
- `packages/civ7-direct-control/package.json`
- `mods/mod-civ7-intelligence-bridge/**`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

The control-oRPC `game-ui` entrypoint:

- installs the existing `Civ7IntelligenceBridge` on a game UI target;
- delegates to the existing controller ingress and native in-process router;
- provides a minimal game-UI runtime context that can answer
  `readiness.current` from ambient `UI`, `GameContext`, `Game`, `Players`,
  `GameplayMap`, and related UI globals;
- reports the visible game UI as `app-ui-game`, not as mutation-capable runtime
  control, while mutation runtime ports remain unsupported;
- keeps endpoint defaults as adapter-owned context, not request input;
- leaves non-readiness runtime ports explicitly unsupported in this source
  seed, so mutation invocations fail through existing bounded oRPC/bridge error
  projection instead of leaking raw command/session/App UI details.

The new mod package:

- owns `src/ui/civ7-intelligence-bridge.ts` as the game-facing entry source;
- generates `mod/civ7-intelligence-bridge.modinfo` through
  `scripts/generate-mod-artifacts.ts`;
- declares one `scope="game"` action group with a `<UIScripts>` item for the
  controller bootstrap;
- imports `@civ7/control-orpc/game-ui`, not the broad package root,
  RPCLink/RPCHandler, CLI, Studio, or OpenAPI transports.

The direct-control package now publishes proof/postcondition helper subpaths for
control-oRPC value imports. This keeps the generated game UI bundle from
pulling the direct-control package root and its Node/socket session runtime into
the Civ7 `scope="game"` UIScript artifact.

## Non-Goals

- no new oRPC procedure, router, dispatcher, middleware, or transport;
- no direct-control procedure-core scaffolding;
- no runtime/live-game proof or play-thread action;
- no mutation runtime port implementation in the game UI adapter;
- no mutation capability claim from the game UI readiness bootstrap;
- no controller lifecycle/hotseat certification beyond the existing serialized
  proof envelope shape;
- no full `7.3` acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run --cwd packages/civ7-control-orpc test test/game-ui-controller.test.ts test/intelligence-bridge.test.ts test/controller-bridge-ingress.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd mods/mod-civ7-intelligence-bridge test`
- `bun run --cwd mods/mod-civ7-intelligence-bridge check`
- `bun run --cwd mods/mod-civ7-intelligence-bridge build`
- bundle scan over `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js` for Node built-ins, direct-control package-root/socket runtime code, raw command/session strings, and RPC transport symbols
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

## Residual Risk

The generated mod has not been deployed into Civ7 in this slice. Runtime proof
still needs a support-owned deployment/readback path that observes the
`scope="game"` UIScript loading, bridge installation, readiness invocation, and
eventual controller lifecycle/hotseat proof collection inside the game process.
