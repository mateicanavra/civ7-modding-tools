# Diplomacy Response Decision Procedure Slice

Status: implemented local source slice.
Date: 2026-06-05.

## Purpose

Seed `decisions.diplomacy.response.request` as a native service-owned decision
procedure over the existing direct-control diplomacy response runtime/proof
authority.

This advances the write-capable native procedure lane without adding a broad
decisions catalog, direct-control procedure core, transport edge, caller-local
command wiring, or live-game/runtime proof claim.

## Write Set

- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/modules/decisions/contract.ts`
- `packages/civ7-control-orpc/src/modules/decisions/procedures/diplomacy-response-request.ts`
- `packages/civ7-control-orpc/src/modules/decisions/router.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/decisions-diplomacy-response-procedure.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/semantic-capability-hierarchy.md`
- this workstream note

## Behavior Boundary

`decisions.diplomacy.response.request`:

- uses the native decisions router shape
  `Civ7ControlOrpcRouter.decisions.diplomacy.response.request`;
- reuses shared native mutation approval and playable-readiness middleware
  before direct-control runtime authority is invoked;
- accepts semantic caller input: `playerId`, `actionId`, `responseType`, and
  optional `notificationId`;
- does not expose direct-control-only `activateNotification` or `uiCloseout`
  toggles as normal procedure input;
- calls the direct-control diplomacy response runtime port with endpoint
  defaults and approval supplied through oRPC context;
- consumes source-owned direct-control diplomacy proof helpers for
  postcondition and no-repeat classification;
- projects normal output as semantic response status, validation summary,
  postcondition summary, and next steps;
- excludes endpoint host/port, state/session controls, raw command strings,
  raw payloads, notification internals, UI closeout internals, and legacy
  `verified` details from procedure input and normal output.

Unverified, missing-postcondition, no-state-change, validation-changed,
validation-blocked, and not-sent paths remain no-repeat guarded. Confirmed
source-owned diplomacy postconditions may summarize as sent-confirmed.

## Non-Goals

- no broad decisions catalog, operation router, direct-control procedure core,
  custom middleware/context/correlation/error wiring, or raw command tunnel;
- no normal input for direct-control UI toggles such as `activateNotification`
  or `uiCloseout`;
- no culture/technology closeout procedure; those still need source-owned
  postcondition/proof policy before native decision exposure;
- no CLI, Studio, RPCLink, OpenAPI, in-game bridge, transport, or
  `Civ7IntelligenceBridge` implementation;
- no telemetry persistence, AI ingestion surface, normal debug projection, or
  broad validator/postcondition middleware promotion;
- no runtime/live-game proof claim, play-thread action, or Task 5.x/6.x parent
  acceptance by implication.

## Proof

Focused package proof covers:

- approval is required before readiness and diplomacy response execution;
- playable readiness middleware runs before direct-control request authority;
- confirmed source-owned diplomacy postconditions project as sent-confirmed;
- validator-blocked and no-state-change paths remain guarded and do not infer
  repeat safety from legacy `verified`;
- endpoint/session/state/raw command fields and direct-control UI toggles are
  rejected as procedure input;
- raw command, payload, host, port, state, UI closeout, and `verified` details
  are absent from normal output;
- direct-control failures map through native effect-oRPC tagged errors without
  raw command details;
- the in-process server-side router client can call the same procedure.

Closure gates:

- `bun run --cwd packages/civ7-direct-control test test/diplomacy-response-proof-policy.test.ts`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run --cwd packages/civ7-control-orpc test test/decisions-diplomacy-response-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

## Residual Risk

This is local package proof only. It proves native service composition,
middleware ordering, semantic projection, tagged error shape, and local
no-repeat preservation. It does not prove live Civ7 diplomacy panel behavior,
runtime Tuner responsiveness, bridge/transport behavior, full decisions-family
coverage, shared validator/postcondition middleware, or parent Task 5.x/6.x
completion.
