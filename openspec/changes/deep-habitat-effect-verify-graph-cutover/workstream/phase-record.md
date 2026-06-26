# Phase Record

## Phase

- Project: Habitat Harness deep refactor
- Phase: Verify and graph cutover
- Owner: Effect-first implementation lane
- Branch/Graphite stack: `agent-DRA-effect-verify-graph-cutover` stacked on `agent-DRA-effect-orientation-workspace-graph`
- Started: 2026-06-19
- Status: implementation completed; receipt-only verify JSON closure repaired

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
- Current repair:
  - `bun run habitat verify --json` now emits a receipt-only JSON handoff instead
    of executing the affected target lane before output. Latest run:
    `/usr/bin/time -p bun run habitat -- verify --json >
    /tmp/habitat-verify-json-final.json` exited 0 in 19.16s with
    `outcome=planned`, `nxAffected.skipReason=receipt-only`, and
    `targetPlan.targets=[build,check,test]`.
  - Verify target planning no longer includes Habitat-owned structural targets
    (`boundaries`, `biome:ci`, `grit:check`, `generated:check`) in affected
    execution; root graph verification remains the review-grade aggregate path.
  - Graph-backed structural checks now batch through `NxProvider.runMany` by
    proof owner. Aggregate `habitat check --json` still took 37.34s; the
    remaining long pole is `import-boundaries` at roughly 23.9s, while the
    target-check corpus is batched down to roughly 7.8s. That remaining length
    is a follow-on architecture smell in the import-boundary proof path, not a
    timeout issue.
