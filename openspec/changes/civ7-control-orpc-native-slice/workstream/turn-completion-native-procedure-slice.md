# Turn Completion Native Procedure Slice

## Scope

Add `turn.complete.request` as a native control-oRPC service procedure under
the semantic `turn` router. The procedure owns the caller-facing empty input,
semantic turn-completion output projection, request status, and next-step
wording. `@civ7/direct-control` remains the runtime/proof authority for
`sendCiv7TurnComplete`, command serialization, and the turn-completion
postcondition/no-repeat helper.

## Write Set

- `packages/civ7-control-orpc/src/modules/turn/contract.ts`
- `packages/civ7-control-orpc/src/modules/turn/procedures/complete-request.ts`
- `packages/civ7-control-orpc/src/modules/turn/router.ts`
- Root control-oRPC contract/router/index/error/runtime-port wiring
- `packages/civ7-control-orpc/test/turn-completion-procedure.test.ts`
- This OpenSpec scenario/task/workstream record

## Boundary

- No CLI `game play end-turn` or other edge-adapter migration.
- No Studio, controller bridge, transport, OpenAPI, or RPCLink work.
- No direct-control procedure-core scaffolding or caller-local command tunnel.
- No raw command/session/state/Tuner payloads or legacy `verified` in normal
  procedure input/output.
- No play-thread wake and no live-game/runtime proof claim.
- No parent Task 5.x/6.x/7.x acceptance by implication.

## Proof

- Focused package proof calls the procedure in process with fake context and a
  fake direct-control runtime port.
- Tests cover context-owned empty input, readiness before mutation,
  playable readiness before mutation, server-side client calls, tagged failure
  projection, raw-output omission, confirmed turn-advanced projection, and
  guarded turn-complete-sent/no-state-change/missing-postcondition paths.
- Closure still requires package test/check/build, relevant OpenSpec strict
  validation, diff hygiene, and a durable Graphite commit.
