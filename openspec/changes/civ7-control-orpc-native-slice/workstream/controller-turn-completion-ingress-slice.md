# Controller Turn Completion Ingress Slice

Status: implemented local package source seed.
Date: 2026-06-05.

## Purpose

Allowlist the existing service-owned `turn.complete.request` mutation through
the package-local controller ingress without turning the bridge into a generic
mutation dispatcher.

This slice reuses the closed controller-runtime proof envelope already
accepted for mutation ingress. The bridge validates the empty turn-completion
procedure input, requires controller lifecycle proof before context construction
and native router dispatch, and delegates to the existing in-process
control-oRPC router/client.

## Write Set

- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

The controller ingress now:

- accepts `turn.complete.request` as the second explicit mutation procedure
  key after notification dismissal;
- requires closed controller-runtime context metadata with a non-empty reason;
- requires closed controller lifecycle proof for game-controller-ready lifecycle,
  `GameContext.localPlayerID` local-player evidence, and
  single-local-player/hotseat status;
- rejects missing or invalid lifecycle proof before context
  construction, native router dispatch, readiness reads, or direct-control
  mutation ports;
- maps the readiness context metadata into native oRPC context and lets the
  existing mutation readiness middleware remain authoritative;
- delegates to
  `createCiv7ControlOrpcServerClient(context).turn.complete.request({})`;
- returns the existing semantic turn-completion procedure output;
- rejects raw host, port, session, state, command, rawCommand, and raw
  direct-control turn-completion internals from the serialized bridge envelope.

The controller lifecycle proof is a local package boundary for serialized
ingress. It is not live-game proof that a Civ7 UIScript has collected those
facts in a running game.

## Non-Goals

- no generic mutation allowlist or bridge-local dispatcher;
- no additional mutation procedures beyond `turn.complete.request`;
- no Civ7 modinfo or UIScript bundle;
- no ambient `globalThis` selection by this package;
- no local-player/hotseat runtime implementation beyond the serialized proof
  gate;
- no raw command/session/tuner payload ingress;
- no HTTP/RPCLink/OpenAPI transport;
- no custom router, procedure runner, middleware, context bus, or error bus;
- no runtime/live-game proof, play-thread action, or full `7.3` acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/controller-bridge-ingress.test.ts test/turn-completion-procedure.test.ts test/intelligence-bridge.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

These are local package proofs only.

## Residual Risk

The actual game-scope adapter still needs a Civ7 UIScript/mod package and a
runtime-owned context/proof factory before this mutation ingress can be loaded
in a running game. Further mutation allowlists remain blocked until each
procedure has an explicit proof/lifecycle boundary and local tests for
pre-dispatch rejection.
