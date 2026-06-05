# Controller Population Placement Ingress Slice

Status: implemented local package source seed.
Date: 2026-06-05.

## Purpose

Allowlist the existing service-owned `city.population.place.request` mutation
through the package-local controller ingress without turning the bridge into a
generic mutation dispatcher or exposing raw player-operation/city-command
authority.

The serialized bridge envelope stays closed. Procedure input reuses the
existing population-placement procedure input schema, approval is
controller-runtime metadata, and mutation dispatch requires controller proof
metadata before context construction and native router dispatch.

## Write Set

- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

The controller ingress now:

- accepts `city.population.place.request` as an additional allowlisted
  mutation procedure key;
- validates the existing semantic population-placement input shape:
  `assign-worker` or `expand-city`;
- requires closed controller-runtime approval metadata with a non-empty reason;
- requires closed controller proof metadata for game-controller-ready lifecycle,
  `GameContext.localPlayerID` local-player evidence, and
  single-local-player/hotseat status;
- rejects missing or invalid approval/proof metadata before context
  construction, native router dispatch, readiness reads, or direct-control
  mutation ports;
- maps accepted approval metadata into native oRPC context and lets the
  existing mutation approval/readiness/proof procedure path remain
  authoritative;
- delegates to
  `createCiv7ControlOrpcServerClient(context).city.population.place.request(...)`;
- returns the existing semantic population placement procedure output;
- rejects raw host, port, session, state, command, rawCommand, generic
  `operationType`, raw operation `args`, and raw direct-control
  player-operation/city-command internals from the serialized bridge
  request/response surface;
- keeps controller approval reason as request metadata and does not echo it in
  bridge success or failure output.

The controller proof metadata is a local package boundary for serialized
ingress. It is not live-game proof that a Civ7 UIScript has collected those
facts in a running game.

## Non-Goals

- no generic mutation allowlist or bridge-local dispatcher;
- no additional procedure implementation;
- no generic operation catalog, raw `operationType`, raw `args`, or raw
  player-operation/city-command ingress;
- no Civ7 modinfo or UIScript bundle;
- no ambient `globalThis` selection by this package;
- no local-player/hotseat runtime implementation beyond the serialized proof
  gate;
- no raw command/session/tuner payload ingress;
- no HTTP/RPCLink/OpenAPI transport;
- no custom router, procedure runner, middleware, context bus, or error bus;
- no runtime/live-game proof, play-thread action, or full `7.3` acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/controller-bridge-ingress.test.ts test/city-population-placement-procedure.test.ts`
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
procedure has an explicit approval/proof/lifecycle boundary and local tests for
pre-dispatch rejection.
