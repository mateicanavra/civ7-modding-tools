## 1. Closure Inputs

- [ ] 1.1 Verify exact-authorship, final-surface parity, product acceptance, and
  activated targeted repairs are closed or explicitly out of scope.
  - Current audit snapshot on
    `codex/swooper-resource-rejection-local-context-drain`
    verifies exact-authorship and mapgen completion are complete for request
    `studio-run-in-game-mq3v6xr9-4w9`, but final-surface parity is still
    unresolved. Refreshed parity artifact
    `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3v6xr9-4w9-current-final-surface-parity-with-resource-rejection-local-context.json`
    (`sha256:1387bbcc0d645263a068854884acbc7746c7f82a0742650168393e7e3f78e8cf`,
    `proofHash:66ed0c2537374e77548ac560eb39434bf481162f3a9024a3986fbf0cc1fc0290`)
    remains `unresolved` with terrain, biome, feature, resource, and
    resource-coordinate proof links open. It records exact resource rejection
    numeric identity: `RESOURCE_WINE`, numeric `resourceType:16`, plot `4838`,
    `x=68`, `y=45`, `cannot-have-resource`, observed resource type `-1`,
    and exact assignment context: `assignmentPhase:scarce-floor`,
    `assignmentOrder:85`, `initialResourceType:16`,
    `preferredResourceType:4`, `perTypeCountBefore:1`,
    `legalPlotCountForResource:313`, `targetMinPerType:7`. It also records
    exact `FEATURE_APPLY_V1` telemetry (`1493` attempted, `1491` applied, `2`
    rejected) and current `NATURAL_WONDER_PLACEMENT_V1` telemetry (`7`
    planned, `4` placed, `3` rejected). This narrows source-authority work but
    does not close final parity, natural-wonder repair, or product acceptance.
    Joined local context shows the same coordinate locally placed
    `RESOURCE_LIMESTONE` (`46`) from scarce-floor assignment order `168`, with
    original local preferred plan `RESOURCE_SILK` (`13`), so the resource gate
    is now classified as cross-resource assignment/materialization divergence
    rather than same-resource local Wine overacceptance.
    Current resource feasibility artifact
    `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3v6xr9-4w9-resource-delta-feasibility-local-context.json`
    (`sha256:46bd5b4452000a0696432772f3ea3179efeffd43b80fbfa0947b319e3697842f`,
    `proofHash:8c41a37e08b3375c02f9f6c732a2c54af564583e1978cabd70237c5b3c03bd35`)
    records `308` resource rows with matched runtime identity and `0` omitted
    cells. The current source-authority split is dominated by scarce-floor
    assignment (`183/194` local-assigned delta rows), including `62`
    local-overaccepted/live-empty rows. This narrows the resource blocker to
    assignment/materialization reconciliation; it does not close resource
    parity or product acceptance.
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
    `codex/swooper-resource-rejection-local-context-drain`;
    Graphite top branch is local and stacked above the Swooper recovery drain.
    PR/remote predecessor disposition remains blocked until proof categories
    close.

## 2. Reconciliation

- [ ] 2.1 Update stale OpenSpec tasks, phase records, proof ledgers, and review
  disposition ledgers.
- [ ] 2.2 Patch downstream docs/tests/guards only where stable facts changed.
- [ ] 2.3 Record remote predecessor branch/PR disposition after replacement
  durability is explicit.

## 3. Verification And Closure

- [ ] 3.1 Run `git status --short --branch`.
  - Current proof-contract slice must leave
    `codex/swooper-resource-delta-feasibility-current-record-drain`
    clean before commit or closure.
- [ ] 3.2 Inspect Graphite branch/stack state.
  - Current audit snapshot: top branch
    `codex/swooper-resource-delta-feasibility-current-record-drain` above
    `codex/swooper-resource-rejection-local-context-drain`,
    `codex/swooper-resource-rejection-assignment-context-rerun-record-drain`,
    `codex/swooper-resource-rejection-assignment-context-drain`,
    `codex/swooper-resource-rejection-identity-rerun-record-drain`,
    `codex/swooper-resource-rejection-proof-identity-drain`, and the current
    feature/resource/source-authority proof-record branches.
- [ ] 3.3 Run `git diff --check`.
- [ ] 3.4 Run `bun run openspec -- validate swooper-recovery-stack-product-closure --strict`.
- [ ] 3.5 Run `bun run openspec:validate`.
- [ ] 3.6 Commit/submit according to Graphite workflow.
