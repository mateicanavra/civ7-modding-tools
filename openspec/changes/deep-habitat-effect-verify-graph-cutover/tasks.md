# Tasks

## 1. Move And Adapt

- [x] 1.1 Move verify source into `src/domains/proof-contract/**`.
- [x] 1.2 Move workspace graph contracts into `src/domains/workspace-graph-integration/**`.
- [x] 1.3 Route base resolution and status reads through `GitProvider`.
- [x] 1.4 Route affected target execution through `NxProvider`.

## 2. Receipt Preservation

- [x] 2.1 Preserve verify receipt schemas.
- [x] 2.2 Preserve bounded stdout/stderr previews.
- [x] 2.3 Preserve check-before-affected sequencing.

## 3. Verification

- [x] 3.1 Run `bun run --cwd tools/habitat-harness test -- test/lib/verify-receipt.test.ts test/lib/workspace-graph.test.ts`.
- [x] 3.2 Run `bun run habitat verify --json`.
- [x] 3.3 Run `bun run --cwd tools/habitat-harness check`.
- [x] 3.4 Run `bun run openspec -- validate deep-habitat-effect-verify-graph-cutover --strict`.
- [x] 3.5 Run `bun run openspec:validate`.
- [x] 3.6 Run `git diff --check`.

## Notes

- 3.1 was expanded during implementation to include `test/lib/verify-service.test.ts`
  and `test/service/service-architecture.test.ts`.
- 3.2 was started with `bun run habitat verify --json` and interrupted after a
  bounded wait with no JSON output. The hang is consistent with the existing
  aggregate Habitat pattern-check boundary recorded by the static-inventory
  domino; this packet does not claim aggregate verify CLI closure.
- 3.2 was repaired by splitting receipt-only JSON from affected execution and by
  narrowing the verify target plan to graph-owned project targets
  (`build,check,test`). Latest run:
  `/usr/bin/time -p bun run habitat -- verify --json >
  /tmp/habitat-verify-json-final.json` exited 0 in 19.16s with
  `outcome=planned`, `nxAffected.skipReason=receipt-only`, and
  `targetPlan.targets=[build,check,test]`.
- Aggregate `habitat check --json` remains longer than desired: graph-backed
  structural checks now batch through `NxProvider.runMany` by proof owner, but
  the final aggregate still took 37.34s. The remaining long pole is
  `import-boundaries` at roughly 23.9s; the target-check corpus is batched down
  to roughly 7.8s.
