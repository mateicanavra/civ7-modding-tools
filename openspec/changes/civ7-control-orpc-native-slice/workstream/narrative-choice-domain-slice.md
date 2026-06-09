# Narrative Choice Domain Procedure Slice

Status: implemented local source slice.
Date: 2026-06-05.

## Purpose

Rehome the existing narrative choice mutation from the generic
`decisions.narrative.choice.request` placement to the domain-owned
`narrative.choice.request` procedure over the existing direct-control narrative
choice runtime/proof authority.

This advances the write-capable native procedure lane and burns down the
generic decisions root without adding a broad narrative catalog,
direct-control procedure core, transport edge, caller-local command wiring, or
live-game/runtime proof claim.

## Write Set

- `packages/civ7-control-orpc/src/contract.ts`
- `packages/civ7-control-orpc/src/router.ts`
- `packages/civ7-control-orpc/src/metadata.ts`
- `packages/civ7-control-orpc/src/modules/narrative/contract.ts`
- `packages/civ7-control-orpc/src/modules/narrative/procedures/choice-request.ts`
- `packages/civ7-control-orpc/src/modules/narrative/router.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/narrative-choice-procedure.test.ts`
- `packages/cli/src/commands/game/play/choose-narrative.ts`
- `packages/cli/test/commands/game.play.narrative.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-narrative-choice-orpc-send-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/semantic-capability-hierarchy.md`
- this workstream note

## Behavior Boundary

`narrative.choice.request`:

- uses the native narrative router shape
  `Civ7ControlOrpcRouter.narrative.choice.request`;
- does not preserve a `Civ7ControlOrpcRouter.decisions` route or
  `Civ7Decisions*` public type surface;
- reuses shared native readiness and playable-readiness middleware
  before direct-control runtime authority is invoked;
- calls the direct-control narrative choice runtime port with endpoint
  defaults and runtime policy supplied through oRPC context;
- consumes source-owned direct-control narrative proof helpers for
  postcondition and no-repeat classification;
- projects normal output as semantic choice status, validation summary,
  postcondition summary, and next steps;
- projects acted player identity from source-owned direct-control runtime
  evidence rather than echoing caller validation identity;
- excludes endpoint host/port, state/session controls, raw command strings,
  raw payloads, and legacy `verified` details from procedure input and normal
  output.

Unverified, stale, missing-postcondition, no-state-change, validation-blocked,
and not-sent paths remain no-repeat guarded. Confirmed source-owned narrative
postconditions may summarize as sent-confirmed.

## Non-Goals

- no broad narrative catalog, operation router, direct-control procedure core,
  custom middleware/context/correlation/error wiring, or raw command tunnel;
- no CLI behavior change beyond retargeting the existing
  `choose-narrative --send` caller to the domain procedure; no Studio,
  RPCLink, OpenAPI, in-game bridge, transport, or `Civ7IntelligenceBridge`
  implementation;
- no telemetry persistence, AI ingestion surface, normal debug projection, or
  broad validator/postcondition middleware promotion;
- no runtime/live-game proof claim, play-thread action, or Task 5.x/6.x parent
  acceptance by implication.

## Proof

Focused package proof covers:

- readiness is required and narrative request execution;
- playable readiness middleware runs before direct-control request authority;
- confirmed source-owned narrative postconditions project as sent-confirmed;
- source-owned acted-player evidence is projected instead of caller validation
  player identity when runtime sends use the local player;
- validator-blocked and no-state-change paths remain guarded and do not infer
  repeat safety from legacy `verified`;
- endpoint/session/state/raw command fields are rejected as procedure input;
- raw command, payload, host, port, state, and `verified` details are absent
  from normal output;
- direct-control failures map through native effect-oRPC tagged errors without
  raw command details;
- the in-process server-side router client can call the same procedure.

Closure gates:

- `bun run --cwd packages/civ7-direct-control test test/narrative-choice-proof-policy.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run --cwd packages/civ7-control-orpc test -- narrative-choice-procedure.test.ts`
- `bun run --cwd packages/cli test -- game.play.narrative.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run check:cli`
- `bun run test:cli:play`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

## Residual Risk

This is local package proof only. It proves native service composition,
middleware ordering, semantic projection, tagged error shape, and local
no-repeat preservation. It does not prove live Civ7 narrative panel behavior,
runtime Tuner responsiveness, bridge/transport behavior, full decisions-family
compatibility, shared validator/postcondition middleware, or parent Task 5.x/6.x
completion.
