# Attention Turn Completion Source Slice

Status: implemented local package slice.
Date: 2026-06-04.

## Purpose

Deepen the service-owned `attention.current` procedure by composing the
existing direct-control `getCiv7TurnCompletionStatus` read port into the
semantic attention answer.

This continues the native control-oRPC rebaseline: `packages/civ7-control-orpc`
owns the offered attention service behavior, while `@civ7/direct-control`
remains the runtime/Tuner source owner for turn status probes and send
authority.

## Write Set

- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/modules/attention/contract.ts`
- `packages/civ7-control-orpc/src/modules/attention/procedures/current.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/attention-current-procedure.test.ts`
- this OpenSpec record and `tasks.md`

## Behavior Boundary

`attention.current` now:

- reads turn-completion status whenever playable, alongside notifications;
- projects only semantic turn-completion fields into normal output:
  `hasSentTurnComplete`, `canEndTurn`, `firstReadyUnitId`, and
  `blockerStatus`;
- uses turn-completion `firstReadyUnitId` as a ready-unit read hint when
  notification evidence lacks actor IDs;
- recommends `end-turn` only when turn-completion status says end turn is
  currently available and does not indicate an already-sent turn, active
  blocker, or ready-unit pointer;
- keeps `host`, `port`, raw state/session fields, raw command text, and source
  payload bundles out of normal output.

## Non-Goals

- no new standalone `runtime.turn.completion.status` oRPC read wrapper;
- no direct-control attention facade;
- no turn-complete send/mutation procedure, approval middleware,
  postcondition/no-repeat middleware, or runtime/live-game proof claim;
- no CLI, Studio, HTTP/RPCLink, OpenAPI, global bridge, or in-game UIScript
  adapter work;
- no broad Task 5.4 or 5.5 acceptance beyond the recorded subitems;
- no custom oRPC/effect-orpc middleware, context, error, correlation, or
  transport scaffolding.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test attention-current-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`

Focused proof covers turn-completion source reads, semantic projection, ready
unit hinting from turn-completion evidence, conservative end-turn next-step
selection, in-process procedure/client calls, and raw context/input exclusion.
These are local package proofs only.
