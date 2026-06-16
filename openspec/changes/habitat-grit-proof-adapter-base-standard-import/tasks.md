## 1. Packet And Source Gate

- [x] 1.1 Open this per-pattern packet with proposal, design, spec delta,
  tasks, source synthesis, evidence log, phase record, downstream ledger, and
  review disposition ledger.
- [x] 1.2 Confirm `rules.json`, current Grit predicate, adapter package router,
  legacy adapter-boundary script, taxonomy, invariant corpus, corpus ledger,
  and proof matrix source.
- [x] 1.3 Validate this packet with OpenSpec strict mode.

## 2. Native Fixture And Parser Inventory

- [x] 2.1 Expand
  `.grit/patterns/habitat/checks/adapter_base_standard_import.md` with
  current-predicate positive and negative/control fixtures.
- [x] 2.2 Run
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter adapter_base_standard_import --json`.
- [x] 2.3 Run parser inventory over current package source with exclusions
  recorded in row-owned durable records.
- [x] 2.4 Record fixture classes, inventory counts, proof ids, blockers, and
  non-claims in this packet.

## 3. Active Check Closure Gates

- [x] 3.1 Habitat wrapper selector/current-tree proof.
  - `ABSI-PER-RULE-SELECTOR-2026-06-16` selects exactly
    `grit-adapter-base-standard-import` plus `baseline-integrity`, both passing
    with zero diagnostics.
- [ ] 3.2 Raw acquisition or accepted adapter proof.
  - Raw direct Grit acquisition remains a non-claim for this checkpoint.
- [x] 3.3 Injected violation and cleanup proof.
  - `ABSI-INJECTED-PROBE-2026-06-16` records one diagnostic at an injected
    non-adapter package path and a clean adapter-owned control; aggregate
    injected-corpus closure remains a non-claim while DDIT is blocked.
- [x] 3.4 Explicit baseline proof.
  - `ABSI-BASELINE-FILES-2026-06-16` records the explicit `[]` row baseline and
    `baseline-integrity` passing in per-rule and aggregate wrapper proof.
- [x] 3.5 Live current-predicate base-standard import disposition.
  - Parser inventory must record live current-row direct import candidates as
    blockers or zero-candidate evidence. Parser inventory records zero live
    current-row candidates outside the adapter.

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

- [x] 5.1 `bun run openspec -- validate habitat-grit-proof-adapter-base-standard-import --strict`
- [x] 5.2 native fixture proof
- [x] 5.3 parser inventory proof
- [x] 5.4 Habitat per-rule wrapper proof
- [x] 5.5 aggregate `grit-check` wrapper proof
- [x] 5.6 explicit empty baseline / `baseline-integrity` proof
- [x] 5.7 row-specific injected violation/path-control proof
- [x] 5.8 active-packet language guardrail scan
- [x] 5.9 `git diff --check`
- [x] 5.10 `bun run openspec:validate`
- [x] 5.11 commit via Graphite with a clean worktree
