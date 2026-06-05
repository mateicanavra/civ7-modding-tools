# Controller Global Bridge Source Slice

Status: implemented local package source seed.
Date: 2026-06-05.

## Purpose

Seed the installable `Civ7IntelligenceBridge` binding without creating a
product API outside the native control-oRPC router.

This slice adds a package-local bridge object with a single
`invoke(request)` member and an installer that writes it to a caller-provided
target. The bridge delegates to the existing controller ingress, which
validates the serialized envelope and calls the in-process router client for
`readiness.current`.

## Write Set

- `packages/civ7-control-orpc/src/bridge/intelligence-bridge.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/intelligence-bridge.test.ts`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

The global bridge source seed:

- exposes only `invoke(request)`;
- installs on a caller-provided target;
- refuses accidental overwrite of an existing bridge unless replacement is
  explicit;
- delegates requests to the existing controller ingress instead of
  implementing a second router, dispatcher, or procedure runner;
- preserves the ingress rejection of raw command, session, state, endpoint, and
  readiness fields for the current read-only allowlist;
- returns the same bounded success and failure response shapes as the
  controller ingress.

The actual Civ7 UIScript/modinfo package remains unimplemented and is the
future owner that may pass ambient `globalThis`. This package does not own game
global discovery, local-player/hotseat identity,
controller-proof minting, or runtime lifecycle certification in this slice.

## Non-Goals

- no Civ7 modinfo or UIScript bundle;
- no runtime/live-game proof or play-thread action;
- no mutation procedure allowlist;
- no local-player/hotseat proof, controller-proof implementation, or evidence
  sink;
- no raw command/session/tuner payload ingress;
- no HTTP/RPCLink/OpenAPI transport;
- no custom router, procedure runner, middleware, context bus, or error bus;
- no full `7.3` acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/intelligence-bridge.test.ts test/controller-bridge-ingress.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

These are local package/OpenSpec proofs only.

## Residual Risk

The repository still needs the actual Civ7 controller UIScript/mod package that
loads this adapter in the `scope="game"` environment. Mutation ingress remains
blocked until a separate slice owns local-player/hotseat identity, explicit
lifecycle certification, and proof/evidence sinks.
