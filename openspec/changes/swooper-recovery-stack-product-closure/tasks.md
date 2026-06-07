## 1. Closure Inputs

- [ ] 1.1 Verify exact-authorship, final-surface parity, product acceptance, and
  activated targeted repairs are closed or explicitly out of scope.
  - Current audit snapshot on `codex/swooper-resource-rejection-proof-identity-drain`
    verifies exact-authorship and mapgen completion are complete for request
    `studio-run-in-game-mq3sk0ck-1vl`, but final-surface parity is still
    unresolved. Refreshed parity artifact
    `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3sk0ck-1vl-current-final-surface-parity-with-resource-rejection-example.json`
    (`sha256:3d06cd54ec86875ddd1ac5fd25bdae4b0a1ba25919ea0046070104f76b23fdcc`,
    `proofHash:4184a136601dbc3768fe175ab9f4f896bdd3754f2fcaf9e65c249d0d79f6a5f1`)
    remains `unresolved` with terrain `139`, biome `874`, feature `381`, and
    resource `308` mismatches plus resource coordinate proof placed/rejected
    links. It also records an exact string-only resource rejection row
    (`RESOURCE_WINE`, plot `4838`, `x=68`, `y=45`, `cannot-have-resource`) and
    exact `FEATURE_APPLY_V1` telemetry (`1493` attempted, `1491` applied, `2`
    rejected), narrowing but not closing source-authority work. The current top
    branch adds structured numeric rejection-row proof for future exact runs
    because local evidence for plot `4838` records numeric resource type `46`,
    mapped by the repo table to `RESOURCE_LIMESTONE`; the old string label is
    therefore not sufficient repair authority. Product acceptance is therefore
    not closed.
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
    `codex/swooper-resource-rejection-proof-identity-drain`; Graphite top
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
    `codex/swooper-resource-rejection-proof-identity-drain`.
- [ ] 3.2 Inspect Graphite branch/stack state.
  - Current audit snapshot: top branch
    `codex/swooper-resource-rejection-proof-identity-drain` above
    `codex/swooper-current-feature-apply-proof-rerun-record-drain` and the
    current feature/resource/source-authority proof-record branches.
- [ ] 3.3 Run `git diff --check`.
- [ ] 3.4 Run `bun run openspec -- validate swooper-recovery-stack-product-closure --strict`.
- [ ] 3.5 Run `bun run openspec:validate`.
- [ ] 3.6 Commit/submit according to Graphite workflow.
