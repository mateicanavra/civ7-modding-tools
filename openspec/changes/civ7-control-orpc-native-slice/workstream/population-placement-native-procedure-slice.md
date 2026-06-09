# Population Placement Native Procedure Slice

Status: implemented local package slice.
Date: 2026-06-04.

## Purpose

Seed a native `packages/civ7-control-orpc` city procedure for accepted
population placement without exposing a generic operation tunnel or copying
direct-control procedure-core wiring. `city.population.place.request` owns the
caller-facing oRPC service contract for assigning population to a workable plot
or expanding the city to a purchased plot. `@civ7/direct-control` remains the
runtime, validator, command-serialization, population-placement postcondition,
and proof/no-repeat owner.

## Write Set

- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-direct-control/src/proof/population-placement-proof-policy.ts`
- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/src/modules/city/contract.ts`
- `packages/civ7-control-orpc/src/modules/city/router.ts`
- `packages/civ7-control-orpc/src/modules/city/procedures/population-place-request.ts`
- `packages/civ7-control-orpc/test/city-population-placement-procedure.test.ts`
- this OpenSpec record and `tasks.md`

## Behavior Boundary

`city.population.place.request`:

- lives under the semantic `city` router family and keeps
  `procedureKey: "city.population.place.request"` as the stable capability key;
- accepts a semantic placement mode instead of generic operation vocabulary:
  `assign-worker` with `location`, or `expand-city` with `cityId` and bounded
  map `destination`;
- reads live local-player notification evidence for assign-worker sends and
  passes that value to the low-level direct-control assign-worker runtime port
  instead of accepting caller `playerId` as send authority;
- takes explicit readiness from typed oRPC context through the shared
  native effect-oRPC readiness middleware, not normal procedure input;
- maps `assign-worker` to the control-oRPC runtime facade's semantic
  `requestCiv7AssignWorkerPlacement` port; the live facade adapter maps that
  to direct-control's low-level player-operation runtime authority internally;
- maps `expand-city` to the control-oRPC runtime facade's semantic
  `requestCiv7ExpandCityPlacement` port; the live facade adapter maps that to
  direct-control's low-level city-command runtime authority internally;
- consumes the direct-control population-placement proof helper through a
  narrowed proof-source shape (`sent` plus population postcondition evidence)
  for confirmed, unverified, missing-postcondition, and no-repeat
  classification;
- returns semantic normal output with placement summary, send status,
  validation summary, postcondition summary, no-repeat guard, and next steps;
- distinguishes repeat-safe confirmed `population-ready-cleared` sends from
  confirmed-but-guarded `placement-state-changed` sends with `sent-guarded`;
- keeps validation-only, missing-postcondition, not-sent, and no-state-change
  paths no-repeat guarded;
- omits raw `host`, `port`, `state`, session, operation `args` input, command
  text, command result payloads, legacy `verified`, raw telemetry, and
  command-source internals from normal output.

## Non-Goals

- no direct-control procedure-core, middleware runner, context composer,
  router registry, correlation bus, error bus, or transport adapter;
- no generic operation catalog, raw `operationType`, raw `args`, raw command,
  setup, restart, autoplay, turn-send, reveal-map, or facade-wrapper claim;
- no shared validator/postcondition middleware promotion in this slice;
- no CLI, Studio, HTTP/RPCLink, OpenAPI, global bridge, or in-game UIScript
  adapter work;
- no runtime/live-game proof claim from local package tests;
- no Task 2.9.4, 5.x, or 6.x parent acceptance beyond the recorded subitems;
- no play-thread action.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control build`
- `bun run --cwd packages/civ7-control-orpc test city-population-placement-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control test -- population-placement-proof-policy.test.ts population-placement.test.ts`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization
  --strict`
- `git diff --check`

Focused proof covers in-process procedure calls, server-side router client
calls, live local-player notification evidence for assign-worker sends,
caller `playerId` rejection before facade execution, shared readiness
middleware refusal before mutation, endpoint/session/raw operation input
rejection, safe tagged error projection, confirmed
`population-ready-cleared` repeat-safe postconditions, confirmed
`placement-state-changed` guarded postconditions, unverified validation-only
and missing-postcondition guarding, and validator-blocked not-sent projection.
These are local package proofs only.

## Residual Risk

Shared validator-first, postcondition/proof, safe-error, and correlation
middleware remain pending. This slice adds one concrete city mutation procedure
over two source-owned runtime ports, but it does not claim a generic operation
catalog or parent Task 5.x/6.x acceptance. Runtime proof remains pending until
a support-owned real-game verification slice explicitly exercises the procedure
against a responsive Civ7 session.
