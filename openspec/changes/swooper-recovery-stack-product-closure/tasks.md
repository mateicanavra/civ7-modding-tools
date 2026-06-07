## 1. Closure Inputs

- [ ] 1.1 Verify exact-authorship, final-surface parity, product acceptance, and
  activated targeted repairs are closed or explicitly out of scope.
  - Current audit snapshot on
    `codex/swooper-resource-rejection-assignment-context-drain`
    verifies exact-authorship and mapgen completion are complete for request
    `studio-run-in-game-mq3twjd7-18mg`, but final-surface parity is still
    unresolved. Refreshed parity artifact
    `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3twjd7-18mg-current-final-surface-parity-with-resource-rejection-identity.json`
    (`sha256:a8d0c18f155cd60dd13dd80c52961fc3d24bdabe172edf45d8677764c116b115`,
    `proofHash:b7a32c172ce1e7cf0b26812c551e789a2f246e0e5598f92d5388adc8c116b68c`)
    remains `unresolved` with terrain, biome, feature, resource, and
    resource-coordinate proof links open. It records exact resource rejection
    numeric identity: `RESOURCE_WINE`, numeric `resourceType:16`, plot `4838`,
    `x=68`, `y=45`, `cannot-have-resource`, observed resource type `-1`, plus
    exact `FEATURE_APPLY_V1` telemetry (`1493` attempted, `1491` applied, `2`
    rejected). This narrows source-authority work but does not close final
    parity or product acceptance. The current top branch adds exact
    rejected-row assignment context for future proof packets; it does not
    supersede the `mq3twjd7` proof until a fresh exact run consumes it.
- [ ] 1.2 Audit accepted P1/P2 review findings across recovery changes.
  - Current audit pass found no active review-disposition ledger inside
    `earthlike-live-feature-resource-legality-repair` or
    `swooper-recovery-stack-product-closure`. Broader review-ledger scan found
    historical resource/direct-control/morphology P1/P2 findings, generally
    recorded as repaired, implemented, cleared, or source-branch scoped; final
    closure still needs a supervisor review pass to confirm no accepted P1/P2
    finding remains open inside the closure claim.
- [ ] 1.3 Audit repo, Graphite, PR, and remote predecessor state.
  - Current repo snapshot is on
    `codex/swooper-resource-rejection-assignment-context-drain`; Graphite top
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
  - Current proof-contract slice must leave
    `codex/swooper-resource-rejection-assignment-context-drain` clean before
    commit or closure.
- [ ] 3.2 Inspect Graphite branch/stack state.
  - Current audit snapshot: top branch
    `codex/swooper-resource-rejection-assignment-context-drain` above
    `codex/swooper-resource-rejection-identity-rerun-record-drain`,
    `codex/swooper-resource-rejection-proof-identity-drain`, and the current
    feature/resource/source-authority proof-record branches.
- [ ] 3.3 Run `git diff --check`.
- [ ] 3.4 Run `bun run openspec -- validate swooper-recovery-stack-product-closure --strict`.
- [ ] 3.5 Run `bun run openspec:validate`.
- [ ] 3.6 Commit/submit according to Graphite workflow.
