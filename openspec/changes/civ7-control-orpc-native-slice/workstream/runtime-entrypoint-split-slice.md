# Runtime Entrypoint Split Slice

Status: implemented local package/API hygiene slice.
Date: 2026-06-05.

## Purpose

Keep the `@civ7/control-orpc` root entrypoint focused on native service
contracts, routers, clients, bridge ingress/bindings, typed errors, and
semantic procedure schemas/results while preserving a supported import path for
edge adapters that need the live direct-control runtime facade to construct
context.

This is not a new runtime abstraction. It is an explicit package boundary:
`@civ7/control-orpc/runtime` exposes the live direct-control facade and facade
type for caller/runtime adapter construction; normal service callers use the
root service API.

## Write Set

- `packages/civ7-control-orpc/package.json`
- `packages/civ7-control-orpc/tsup.config.ts`
- `packages/civ7-control-orpc/src/runtime.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/cli/src/commands/game/status.ts`
- `apps/mapgen-studio/src/server/civ7ControlOrpc.ts`
- this OpenSpec record, `tasks.md`, `specs/civ7-control-orpc/spec.md`, and the
  prior root-export burn-down note

## Behavior Boundary

The new `@civ7/control-orpc/runtime` subpath exports:

- `liveCiv7ControlOrpcDirectControlFacade`;
- `Civ7ControlOrpcDirectControlFacade`.

The root `@civ7/control-orpc` entrypoint no longer exports those runtime
context-construction dependencies. CLI `game status` and the Studio RPCHandler
middleware now import service/router/client types from the root entrypoint and
the live direct-control facade from the runtime subpath.

## Non-Goals

- no change to procedure behavior, router shape, or normal output;
- no change to direct-control runtime/proof authority;
- no raw result envelope export from the root or runtime entrypoint;
- no transport expansion, OpenAPI work, controller mutation ingress, runtime
  proof, play-thread action, or parent Task 5.x/6.x/7.x acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun test apps/mapgen-studio/test/runInGame/civ7ControlOrpcClient.test.ts`
- `bun run --cwd apps/mapgen-studio check`
- `bun run --cwd packages/cli check`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- root facade-export scan for `liveCiv7ControlOrpcDirectControlFacade` and
  `Civ7ControlOrpcDirectControlFacade`
- `git diff --check`

These are local package/API, CLI/Studio type, and OpenSpec proofs only.

## Residual Risk

The runtime subpath is still Node/direct-control-facing and should not be used
from browser or Civ7 game-scope code unless a later adapter proves the bundle
boundary. Browser clients should keep importing typed RPC clients/contracts from
the service root, not the runtime subpath.
