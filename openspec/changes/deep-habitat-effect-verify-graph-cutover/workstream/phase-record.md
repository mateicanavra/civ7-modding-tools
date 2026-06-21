# Phase Record

## Phase

- Project: Habitat Harness deep refactor
- Phase: Verify and graph cutover
- Owner: Effect-first implementation lane
- Branch/Graphite stack: `agent-DRA-effect-verify-graph-cutover` stacked on `agent-DRA-effect-orientation-workspace-graph`
- Started: 2026-06-19
- Status: implementation completed except aggregate verify CLI closure

## Objective

- Target movement: move verify proof contracts into
  `src/domains/proof-contract/**`, consume workspace graph contracts from
  `src/domains/workspace-graph-integration/**`, and route Git/Nx execution
  through providers.
- Non-goals: compatibility shims, duplicate `src/lib/verify` ownership, or
  caller-local verify service logic outside the effect-oRPC router.
- Done condition: verify receipt behavior, workspace graph behavior, router
  ownership guardrails, package typecheck, Biome, OpenSpec, diff checks, and
  full build pass.

## Verification

- Passed:
  - `bun run --cwd tools/habitat-harness check`
  - `bun run --cwd tools/habitat-harness test -- test/lib/verify-receipt.test.ts test/lib/workspace-graph.test.ts test/lib/verify-service.test.ts test/service/service-architecture.test.ts`
  - `bun run biome:ci`
  - `bun run openspec -- validate deep-habitat-effect-verify-graph-cutover --strict`
  - `bun run openspec:validate`
  - `git diff --check`
  - `bun run build` exited 0; Nx reported the existing flaky-task notice for
    `@civ7/adapter:build` after successful completion.
- Bounded limitation:
  - `bun run habitat verify --json` was started and interrupted after a bounded
    wait with no JSON output. This matches the current aggregate Habitat
    pattern-check boundary recorded by the static-inventory domino. This packet
    does not claim aggregate verify CLI closure until that boundary is repaired.
  - After the current-tree `pattern-check` repair, `bun run habitat verify --json`
    was rerun and interrupted after roughly 74s with no JSON output. The old
    broad-Grit pattern-check failure is no longer the known cause; aggregate
    verify still needs a focused runtime/target orchestration repair before this
    task can close.
