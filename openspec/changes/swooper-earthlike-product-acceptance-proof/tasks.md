## 1. Acceptance Definition

- [ ] 1.1 Select stable seed/size matrix for acceptance proof.
- [ ] 1.2 Convert the takeover hard core into acceptance rows with proof fields.
- [ ] 1.3 Link existing diagnostic gates and identify missing acceptance tests.

## 2. Evidence Run

- [ ] 2.1 Run exact-authorship proof for acceptance seed/size set.
- [ ] 2.2 Run diagnostics/stats for acceptance seed/size set.
- [ ] 2.3 Capture Studio screenshots and relevant layer/projection evidence.
- [ ] 2.4 Capture live readback or classified policy deltas for the same runs.

## 3. Disposition

- [ ] 3.1 Mark each acceptance row pass/fail/blocked with evidence.
- [ ] 3.2 Open targeted repair workstreams only for concrete failing rows.
- [ ] 3.3 Re-run acceptance rows after targeted repairs.

## 4. Verification And Closure

- [ ] 4.1 Run focused package tests/checks for any touched owner.
- [ ] 4.2 Update product proof and review disposition ledgers.
- [ ] 4.3 Run `bun run openspec -- validate swooper-earthlike-product-acceptance-proof --strict`.
- [ ] 4.4 Run `bun run openspec:validate`.
