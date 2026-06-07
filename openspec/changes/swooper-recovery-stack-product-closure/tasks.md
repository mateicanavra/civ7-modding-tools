## 1. Closure Inputs

- [ ] 1.1 Verify exact-authorship, final-surface parity, product acceptance, and
  activated targeted repairs are closed or explicitly out of scope.
  - Current audit snapshot on `codex/swooper-feature-apply-proof-telemetry-drain`
    (`a992eb243c407f33676de208ee11a8358ea3c3c1`) verifies exact-authorship
    and mapgen completion are complete for request
    `studio-run-in-game-mq3ryaop-1p7l`, but final-surface parity is still
    unresolved. Refreshed parity artifact
    `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3ryaop-1p7l-current-final-surface-parity-with-feature-apply.json`
    (`sha256:7d3225aec82c5596a6dd8e58ca1a44aebbdc4b79c5fa6117ca43ad89568dc34b`,
    `proofHash:89d48831dd981e5144c89e14842b1052d989d3748b011fc7590070075236ba02`)
    remains `unresolved` with terrain `139`, biome `874`, feature `381`, and
    resource `308` mismatches plus resource coordinate proof placed/rejected
    links. It also records exact `FEATURE_APPLY_V1` telemetry (`1493`
    attempted, `1491` applied, `2` rejected), narrowing but not closing feature
    source-authority work. Product acceptance is therefore not closed.
- [ ] 1.2 Audit accepted P1/P2 review findings across recovery changes.
  - Current audit pass found no active review-disposition ledger inside
    `earthlike-live-feature-resource-legality-repair` or
    `swooper-recovery-stack-product-closure`. Broader review-ledger scan found
    historical resource/direct-control/morphology P1/P2 findings, generally
    recorded as repaired, implemented, cleared, or source-branch scoped; final
    closure still needs a supervisor review pass to confirm no accepted P1/P2
    finding remains open inside the closure claim.
- [ ] 1.3 Audit repo, Graphite, PR, and remote predecessor state.
  - Current repo snapshot is clean on
    `codex/swooper-feature-apply-proof-telemetry-drain`; Graphite top
    branch is local and stacked above the Swooper recovery drain. PR/remote
    predecessor disposition remains blocked until proof categories close.

## 2. Reconciliation

- [ ] 2.1 Update stale OpenSpec tasks, phase records, proof ledgers, and review
  disposition ledgers.
- [ ] 2.2 Patch downstream docs/tests/guards only where stable facts changed.
- [ ] 2.3 Record remote predecessor branch/PR disposition after replacement
  durability is explicit.

## 3. Verification And Closure

- [ ] 3.1 Run `git status --short --branch`.
  - Current audit snapshot: clean on
    `codex/swooper-feature-apply-proof-telemetry-drain`.
- [ ] 3.2 Inspect Graphite branch/stack state.
  - Current audit snapshot: top branch
    `codex/swooper-feature-apply-proof-telemetry-drain` above
    `codex/swooper-product-closure-audit-record-drain` and the current
    feature/resource/source-authority proof-record branches.
- [ ] 3.3 Run `git diff --check`.
- [ ] 3.4 Run `bun run openspec -- validate swooper-recovery-stack-product-closure --strict`.
- [ ] 3.5 Run `bun run openspec:validate`.
- [ ] 3.6 Commit/submit according to Graphite workflow.
