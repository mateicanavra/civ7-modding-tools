# Controller Attention Ingress Slice

Status: implemented local package source seed.
Date: 2026-06-05.

## Purpose

Expand the package-local controller ingress from readiness proof to useful
support-agent attention reads without introducing a new bridge API, mutation
surface, or controller-local dispatcher.

This slice allowlists the existing service-owned `attention.current` procedure
beside `readiness.current`. The serialized envelope remains closed, procedure
inputs reuse the existing procedure schemas, and invocation still delegates to
`createCiv7ControlOrpcServerClient(context)`.

## Write Set

- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

The controller ingress now:

- accepts `readiness.current` and `attention.current` as read-only allowlisted
  procedure keys;
- validates each request against that procedure's existing input schema;
- calls the existing in-process router client for both procedures;
- returns the existing semantic procedure outputs;
- rejects raw host, port, session, state, command, rawCommand,
  fields from the serialized bridge envelope;
- rejects mutation procedure keys before context construction.

`attention.current` remains the service-owned composition boundary over
playable status, notifications, turn completion, ready-unit, and ready-city
runtime ports. This slice does not add a bridge-local attention read wrapper.

## Non-Goals

- no Civ7 modinfo or UIScript bundle;
- no ambient `globalThis` selection by this package;
- no mutation procedure allowlist;
- no local-player/hotseat proof, controller-proof implementation, or evidence
  sink;
- no raw command/session/tuner payload ingress;
- no HTTP/RPCLink/OpenAPI transport;
- no custom router, procedure runner, middleware, context bus, or error bus;
- no runtime/live-game proof, play-thread action, or full `7.3` acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/controller-bridge-ingress.test.ts test/intelligence-bridge.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

These are local package/OpenSpec proofs only.

## Residual Risk

The actual game-scope adapter still needs a Civ7 UIScript/mod package and
runtime-owned context factory before the bridge can be loaded in a running
game. Mutation ingress remains blocked on local-player/hotseat identity,
explicit lifecycle certification, and proof/evidence sinks.
