## 1. Acceptance Definition

- [ ] 1.1 Select stable seed/size matrix for acceptance proof.
  - River/floodplain seed inputs are recorded in
    `workstream/acceptance-seed-matrix.md`: `24681357`/`84x54` for existing
    river terrain proof, and `1018`/`84x54` as the floodplain-producing live
    visibility proof. Full product matrix selection remains open.
- [ ] 1.2 Convert the takeover hard core into acceptance rows with proof fields.
  - Started in `workstream/acceptance-row-ledger.md` for the current
    river/floodplain proof input. The full takeover hard core remains open.
- [ ] 1.3 Link existing diagnostic gates and identify missing acceptance tests.
  - Added `test/pipeline/world-balance-stats.test.ts` coverage that keeps the
    `swooper-earthlike` `1018`/`84x54` floodplain-producing seed from silently
    losing floodplain-family attempts.

## 2. Evidence Run

- [ ] 2.1 Run exact-authorship proof for acceptance seed/size set.
  - River proof `studio-run-in-game-mq6c38rf-n2p` and floodplain proof
    `studio-run-in-game-mq6dx234-1wx4` both have complete exact-authorship
    packets. Full matrix proof selection remains open.
- [ ] 2.2 Run diagnostics/stats for acceptance seed/size set.
- [ ] 2.3 Capture Studio screenshots and relevant layer/projection evidence.
- [ ] 2.4 Capture live readback or classified policy deltas for the same runs.
  - Floodplain proof `studio-run-in-game-mq6dx234-1wx4` captured live full-grid
    feature readback with `11` floodplain-family feature ids. After repairing
    local replay latitude orientation, local/exact/live floodplain counts match
    and river terrain projection matches live terrain for this seed. The same
    proof remains unresolved for deterministic full-surface parity.

## 3. Disposition

- [ ] 3.1 Mark each acceptance row pass/fail/blocked with evidence.
  - River/floodplain rows are dispositioned in
    `workstream/acceptance-row-ledger.md` as technical proof-class passes:
    visible major/navigable river terrain is proven by live terrain readback,
    river metadata is reclassified as an unsupported writer capability, and
    floodplain feature-family live visibility is proven on the separate
    floodplain-producing seed. Studio visible-state evidence, product/visual
    reviewer disposition, other product rows, and deterministic full-surface
    parity remain open.
- [ ] 3.2 Open targeted repair workstreams only for concrete failing rows.
- [ ] 3.3 Re-run acceptance rows after targeted repairs.

## 4. Verification And Closure

- [ ] 4.1 Run focused package tests/checks for any touched owner.
- [ ] 4.2 Update product proof and review disposition ledgers.
- [ ] 4.3 Run `bun run openspec -- validate swooper-earthlike-product-acceptance-proof --strict`.
- [ ] 4.4 Run `bun run openspec:validate`.
