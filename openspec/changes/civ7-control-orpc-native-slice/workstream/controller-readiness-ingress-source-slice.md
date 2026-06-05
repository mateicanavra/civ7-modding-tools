# Controller Readiness Ingress Source Slice

Status: implemented local package source seed.
Date: 2026-06-05.

## Purpose

Seed the first source-owned in-game controller ingress component without
installing `globalThis.Civ7IntelligenceBridge`, adding a mod UIScript package,
or creating a generic bridge API.

This slice proves a narrow serialized ingress path into the existing native
control-oRPC router: a caller-provided controller runtime factory constructs
typed oRPC context, the bridge validates a closed read-only envelope, the
procedure key is allowlisted to `readiness.current`, and the implementation
calls the existing in-process router client.

## Write Set

- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

The controller ingress core:

- validates a closed TypeBox envelope for `readiness.current`;
- rejects unsupported procedure keys before context construction;
- rejects host, port, session, state, command, rawCommand, and mutation
  approval fields in the read-only envelope;
- passes correlation IDs into existing control-oRPC context;
- calls `createCiv7ControlOrpcServerClient(context).readiness.current({})`;
- returns semantic readiness output on success;
- projects procedure failures into bounded bridge error data without raw
  direct-control command details.

The controller runtime adapter remains responsible for constructing
`Civ7ControlOrpcContext`. This package-local core does not read game globals,
own local-player identity, mint approval tokens, or install a global bridge.

## Non-Goals

- no `globalThis.Civ7IntelligenceBridge` installation;
- no modinfo, UIScript bundle, or Civ runtime packaging;
- no mutation procedure allowlist;
- no local-player/hotseat identity proof or approval-token implementation;
- no raw command/session/tuner payload ingress;
- no HTTP/RPCLink/OpenAPI transport;
- no custom router, procedure runner, middleware, or error bus;
- no runtime/live-game proof, play-thread action, or full `7.3` acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/controller-bridge-ingress.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

These are local package/OpenSpec proofs only.

## Residual Risk

The global bridge and actual Civ7 UIScript loading path are still unimplemented.
The next source slice must choose the mod/package owner and build shape before
installing `globalThis.Civ7IntelligenceBridge.invoke(...)`. Mutation ingress
also remains blocked on controller-owned approval, local-player/hotseat
identity, lifecycle certification, and proof/evidence sinks.
