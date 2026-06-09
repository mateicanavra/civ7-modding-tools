# CLI Game Status Edge Adapter Slice

Status: implemented local source slice.
Date: 2026-06-05.

## Purpose

Route the first existing CLI caller through the native in-process
`packages/civ7-control-orpc` server-side procedure client after the core router
shape gained service-owned reads, mutation leaves, approval middleware, safe
errors, correlation, and readiness guards.

This advances the edge-adapter lane without adding transport. The CLI remains
the caller/runtime adapter that constructs endpoint context from flags, while
`readiness.current` remains the service-owned readiness projection.

## Write Set

- `packages/cli/src/commands/game/status.ts`
- `packages/cli/test/commands/game.control.test.ts`
- `packages/cli/package.json`
- `packages/civ7-control-orpc/package.json`
- `packages/civ7-control-orpc/tsconfig.json`
- `packages/civ7-control-orpc/tsup.config.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- this workstream note

## Behavior Boundary

`civ7 game status` now:

- constructs `Civ7ControlOrpcContext` with
  `liveCiv7ControlOrpcDirectControlFacade` and endpoint defaults from CLI
  flags;
- calls `createCiv7ControlOrpcServerClient(...).readiness.current({})`
  in-process;
- preserves the same underlying direct-control playable-status runtime reads;
- emits the semantic readiness output owned by `readiness.current`;
- keeps host, port, state, App UI/Tuner raw names, snapshot globals, and raw
  runtime errors out of normal JSON status output.

`@civ7/control-orpc` also bundles `effect-orpc` into its built output. The
published `effect-orpc` package exports runtime entrypoints to TypeScript source
files, which is valid for the package's own Bun/Vitest source workflow but
breaks oclif manifest generation when the CommonJS CLI loads built command
modules. Bundling it at the service package boundary keeps downstream CLI
callers on the public `@civ7/control-orpc` entrypoint without importing private
dist paths or adding a custom client wrapper.

## Non-Goals

- no direct-control procedure-core, facade-only read wrapper, or custom oRPC
  client wrapper;
- no Studio `RPCHandler`/`RPCLink`, global bridge, in-game controller ingress,
  OpenAPI, or external transport;
- no mutation CLI routing, runtime/live-game proof claim, or play-thread action;
- no Task 5.x/6.x parent acceptance or broader CLI migration by implication.

## Proof

Focused CLI proof covers:

- `game status --json` still drives the same local fake Tuner socket reads
  needed by the playable-status runtime port;
- the emitted status shape is the bounded `readiness.current` semantic
  projection;
- raw endpoint/state/snapshot fields are absent from normal status JSON.

Closure gates run:

- `bun run --cwd packages/cli test game.control.test.ts`
- `bun run test:cli`
- `bun run test:cli:play`
- `bun run check:cli`
- `bun run build:cli`
- `bun run --cwd packages/civ7-control-orpc test readiness-current-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

## Residual Risk

This is local CLI/package proof only. It proves in-process caller composition
and public projection for one status command, not live Civ7 runtime readiness,
Studio/browser transport, in-game bridge ingress, OpenAPI, or mutation caller
migration.
