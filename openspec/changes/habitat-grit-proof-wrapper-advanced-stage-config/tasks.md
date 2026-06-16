## 1. Packet And Source Gate

- [x] 1.1 Open this per-pattern packet with proposal, design, spec delta,
  tasks, source synthesis, evidence log, phase record, downstream ledger, and
  review disposition ledger.
- [x] 1.2 Confirm `rules.json`, current Grit predicate, normalization packet,
  MapGen guardrails, corpus ledger, and proof matrix source.
- [x] 1.3 Validate this packet with OpenSpec strict mode.

## 2. Native Fixture And Parser Inventory

- [x] 2.1 Expand
  `.grit/patterns/habitat/checks/wrapper_advanced_stage_config.md` with
  current-predicate positive and negative/control fixtures.
- [x] 2.2 Run
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter wrapper_advanced_stage_config --json`.
- [x] 2.3 Run parser inventory over current Swooper standard recipe and map
  config source with exclusions recorded in row-owned durable records.
- [x] 2.4 Record fixture classes, inventory counts, proof ids, blockers, and
  non-claims in this packet.

## 3. Dependency-Bound Gates

- [x] 3.1 Habitat wrapper selector/current-tree proof.
  - `WASC-PER-RULE-SELECTOR-2026-06-16` passed for
    `grit-wrapper-advanced-stage-config` plus `baseline-integrity` with zero
    diagnostics.
- [ ] 3.2 Raw acquisition or accepted adapter proof.
  - Blocked/non-claim for this checkpoint.
- [x] 3.3 Injected violation and cleanup proof.
  - `WASC-INJECTED-PROBE-2026-06-16` records row-specific injected finding and
    path-control proof. Aggregate injected-corpus closure remains unclaimed
    while unrelated DDIT remains blocked.
- [x] 3.4 Explicit baseline proof.
  - `WASC-BASELINE-FILES-2026-06-16` records the explicit `[]` baseline and
    `baseline-integrity` passing in per-rule and aggregate wrapper proof.
- [x] 3.5 Live current-predicate wrapper advanced config disposition.
  - Parser inventory found 0 live current-row exact `advanced` config-key
    candidates. Raw acquisition, broader config-surface closure, generator or
    migration behavior, apply safety, retired parity, neighboring-row proof,
    Effect adapter proof, aggregate injected-corpus closure, and product/runtime
    proof remain non-claims.

## 4. Downstream Realignment

- [x] 4.1 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`.
- [x] 4.2 Update `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
- [x] 4.3 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md`.
- [x] 4.4 Record no-change dispositions for taxonomy, invariant corpus,
  discrepancy log, recovery, and command docs unless policy or user-facing
  behavior changes.

## 5. Verification

- [x] 5.1 `bun run openspec -- validate habitat-grit-proof-wrapper-advanced-stage-config --strict`
- [x] 5.2 native fixture proof
- [x] 5.3 full native Grit corpus proof
- [x] 5.4 parser inventory proof
- [x] 5.5 per-rule Habitat wrapper proof
- [x] 5.6 aggregate Habitat `grit-check` wrapper proof
- [x] 5.7 explicit empty baseline / `baseline-integrity` proof
- [x] 5.8 clean-start injected proof after local row commit
- [x] 5.9 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 5.10 `bun run openspec:validate`
- [x] 5.11 `git diff --check HEAD^..HEAD` and `git diff --check`
- [x] 5.12 deleted-file guard
- [x] 5.13 commit via Graphite with a clean worktree
