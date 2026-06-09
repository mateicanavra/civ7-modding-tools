# Controller Diplomacy Response Ingress Slice

Status: implemented local package source seed.
Date: 2026-06-05.

## Purpose

Allowlist the existing service-owned `diplomacy.response.request` mutation
through the package-local controller ingress without turning the bridge into a
generic mutation dispatcher or reintroducing the generic decisions root.

The serialized bridge envelope stays closed. Procedure input reuses the
existing diplomacy-response procedure input schema, controller-runtime metadata
is context-owned, and mutation dispatch requires controller proof metadata
before context construction and native router dispatch.

## Write Set

- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

The controller ingress now:

- accepts `diplomacy.response.request` as an additional allowlisted mutation
  procedure key;
- validates the existing semantic diplomacy response input shape: `actionId`,
  `responseType`, and optional `notificationId`;
- requires closed controller lifecycle, local-player, and hotseat proof
  metadata without accepting caller-provided mutation metadata fields;
- requires closed controller lifecycle proof for game-controller-ready lifecycle,
  `GameContext.localPlayerID` local-player evidence, and
  single-local-player/hotseat status;
- rejects missing or invalid lifecycle proof before context
  construction, native router dispatch, readiness reads, or direct-control
  mutation ports;
- maps readiness context metadata into native oRPC context and lets the
  existing mutation readiness/proof procedure path remain
  authoritative;
- delegates to
  `createCiv7ControlOrpcServerClient(context).diplomacy.response.request(...)`;
- returns the existing semantic diplomacy response procedure output, including
  source-owned acted-player evidence rather than caller `playerId` as send
  authority;
- rejects raw host, port, session, state, command, rawCommand, notification
  internals, App UI closeout internals, direct-control runtime payloads, and
  legacy `verified` from the serialized bridge request/response surface;
- keeps controller lifecycle, local-player, and hotseat proof out of
  bridge success or failure output.

The controller lifecycle proof is a local package boundary for serialized
ingress. It is not live-game proof that a Civ7 UIScript has collected those
facts in a running game.

## Non-Goals

- no generic mutation allowlist or bridge-local dispatcher;
- no additional diplomacy procedure implementation;
- no generic `decisions` root or `decisions.diplomacy.response.request`;
- no direct-control procedure-core scaffolding;
- no direct-control UI toggles such as `activateNotification` or `uiCloseout`
  as normal bridge input;
- no relationship labels or diplomacy state claims beyond the existing
  source-owned procedure output;
- no Civ7 modinfo or UIScript bundle;
- no ambient `globalThis` selection by this package;
- no local-player/hotseat runtime implementation beyond the serialized proof
  gate;
- no raw command/session/tuner payload ingress;
- no HTTP/RPCLink/OpenAPI transport;
- no custom router, procedure runner, middleware, context bus, or error bus;
- no runtime/live-game proof, play-thread action, or full `7.3` acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/controller-bridge-ingress.test.ts test/diplomacy-response-procedure.test.ts`
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
