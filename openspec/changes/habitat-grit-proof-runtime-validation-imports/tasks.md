## 1. Packet And Source Gate

- [x] 1.1 Open this per-pattern packet with proposal, design, spec delta,
  tasks, source synthesis, evidence log, phase record, downstream ledger, and
  review disposition ledger.
- [x] 1.2 Confirm `rules.json`, current Grit predicate, taxonomy runtime-purity
  family, invariant corpus, corpus ledger, and full-profile guardrail source.
- [x] 1.3 Validate this packet with OpenSpec strict mode.

## 2. Native Fixture And Parser Inventory

- [x] 2.1 Expand `.grit/patterns/habitat/checks/runtime_validation_imports.md`
  with current-predicate positive and negative/control fixtures.
- [x] 2.2 Run
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter runtime_validation_imports --json`.
- [x] 2.3 Run parser inventory over the current Swooper runtime roots with
  exclusions recorded in row-owned durable records.
- [x] 2.4 Record fixture classes, inventory counts, proof ids, and non-claims
  in this packet.

## 3. Active Check Closure Gates

- [x] 3.1 Habitat wrapper selector/current-tree proof.
  - `RVI-PER-RULE-SELECTOR-2026-06-16` selects exactly
    `grit-runtime-validation-imports` plus `baseline-integrity`, both passing
    with zero diagnostics.
- [ ] 3.2 Raw acquisition or accepted adapter proof.
  - Non-claim for this checkpoint; row closure uses Habitat wrapper behavior,
    not raw direct Grit acquisition.
- [x] 3.3 Injected violation and cleanup proof.
  - `RVI-INJECTED-PROBE-2026-06-16` proves one diagnostic at the injected
    runtime step path with a clean stage-root control and clean filesystem/Git
    cleanup. Aggregate injected-corpus closure remains blocked by unrelated DDIT.
- [x] 3.4 Explicit baseline proof.
  - `tools/habitat-harness/baselines/grit-runtime-validation-imports.json` is
    explicit `[]`; per-rule and aggregate wrapper commands include passing
    `baseline-integrity`.
- [x] 3.5 Aggregate `grit-check` wrapper proof.
  - `RVI-HABITAT-GRIT-TOOL-2026-06-16` records aggregate `grit-check` passing
    with RVI included.

## 4. Downstream Realignment

- [x] 4.1 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`.
- [x] 4.2 Update `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
- [x] 4.3 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md`.
- [x] 4.4 Record no-change dispositions for taxonomy, invariant corpus,
  recovery, and command docs unless policy or user-facing behavior changes.

## 5. Verification

- [x] 5.1 `bun run openspec -- validate habitat-grit-proof-runtime-validation-imports --strict`
- [x] 5.2 native fixture proof
- [x] 5.3 full native Grit corpus proof
- [x] 5.4 parser inventory proof
- [x] 5.5 Habitat per-rule wrapper proof
- [x] 5.6 Habitat aggregate `grit-check` wrapper proof
- [x] 5.7 row-specific injected violation/path-control proof
- [x] 5.8 active-packet language guardrail scan
- [x] 5.9 `git diff --check`
- [x] 5.10 `bun run openspec:validate`
- [x] 5.11 commit via Graphite with a clean worktree
