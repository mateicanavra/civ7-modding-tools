# Turn Completion Proof Policy Slice

Status: implemented direct-control proof ownership prework.
Date: 2026-06-05.

## Purpose

Add a source-owned turn-completion proof/no-repeat helper in
`@civ7/direct-control` before any native turn completion mutation procedure is
accepted in `packages/civ7-control-orpc`.

This is service-enabling prework. The existing direct-control runtime send still
owns the App UI `GameContext.sendTurnComplete()` authority, before/after turn
completion reads, fallback preflight assertion, and command
serialization. The new proof helper gives future native procedures a stable
postcondition/no-repeat port instead of inferring repeat safety from legacy
`verified`.

## Write Set

- `packages/civ7-direct-control/src/proof/turn-completion-proof-policy.ts`
- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-direct-control/test/turn-completion-proof-policy.test.ts`
- this OpenSpec record, `tasks.md`, the control-oRPC spec delta, and the
  atom/policy inventory

## Behavior Boundary

Direct-control now owns turn-completion proof classification for:

- `turn-advanced`;
- `turn-complete-sent`;
- `already-complete`;
- `no-state-change`;
- `missing-postcondition`;
- `pending-runtime-proof`.

Only `turn-advanced` is confirmed without a no-repeat guard. A confirmed
`turn-complete-sent` or `already-complete` postcondition is still no-repeat
guarded because the player agent must wait for fresh turn/attention evidence
instead of sending turn completion again. Missing, no-state-change, and pending
runtime proof paths stay unverified or pending and no-repeat guarded.

## Non-Goals

- no control-oRPC procedure, router, middleware, or transport change;
- no CLI `game play end-turn` behavior change;
- no change to direct-control App UI send behavior or fallback preflight;
- no shared validator/postcondition middleware promotion;
- no runtime/live-game proof claim;
- no play-thread action;
- no Task 5.x/6.x/7.x parent acceptance.

## Proof Collected

Closure gates:

- `bun run --cwd packages/civ7-direct-control test test/turn-completion-proof-policy.test.ts`
- `bun run --cwd packages/civ7-direct-control test`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

These are local package/OpenSpec proofs only. Runtime proof remains pending for
any future live turn-completion mutation closure claim.

## Residual Risk

`game play end-turn` still calls direct-control directly and emits raw
direct-control action results when `--send` is used. A future native
`turn.complete.request` procedure must own the caller-facing semantic contract
and projection, consume this proof policy, keep readiness in native
middleware/context, and exclude raw command/session/tuner fields from normal
input and output.
