# Controller Supported Procedures Readiness Slice

Status: implemented local package proof.
Date: 2026-06-05.

## Purpose

Expose exact game-controller supported procedure facts through
`readiness.current` without turning one implemented game UI runtime port into a
generic observe/mutate readiness claim.

This follows the game UI notification dismissal runtime slice: the controller
can execute `notifications.dismiss.request` when controller proof and ambient
notification APIs are available, but other game UI read and mutation ports are
still pending.

## Write Set

- `packages/civ7-control-orpc/src/context.ts`
- `packages/civ7-control-orpc/src/modules/readiness/contract.ts`
- `packages/civ7-control-orpc/src/modules/readiness/procedures/current.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/readiness-current-procedure.test.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

- Controller-supported procedure facts are derived from typed oRPC context.
- `readiness.current.controller.supportedProcedures` lists procedure keys plus
  risk classification.
- The current game UI context lists only
  `notifications.dismiss.request` with `risk: "mutation"` when the matching
  game-safe runtime port is available.
- Broad `readiness.current` `canObserve`, `canMutate`, and `read-attention`
  remain conservative until the corresponding read/attention and mutation ports
  are actually implemented.
- Unsupported game UI reads and mutations remain bounded by existing service and
  bridge projections; this slice does not add a second dispatcher or transport.

## Non-Goals

- no separate `controller.capabilities` catalog/router;
- no new game UI runtime read or mutation port;
- no CLI, Studio, transport, OpenAPI, or bridge envelope expansion;
- no deployed Civ7 runtime proof or play-thread action;
- no full `7.3` acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/readiness-current-procedure.test.ts test/game-ui-controller.test.ts test/controller-bridge-ingress.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

## Residual Risk

The supported procedure list is only as accurate as the context provider. Future
game UI ports must update the list only after the matching facade method and
runtime proof boundary exist, and local tests must prove unsupported procedures
remain bounded.
