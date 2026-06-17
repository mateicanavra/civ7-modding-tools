## 1. Packet And Source Gate

- [x] 1.1 Open this per-pattern packet with proposal, design, spec delta,
  tasks, source synthesis, evidence log, phase record, downstream ledger, and
  review disposition ledger.
- [x] 1.2 Confirm `rules.json`, current Grit predicate, taxonomy runtime-purity
  family, invariant corpus, corpus ledger, and full-profile guardrail source.
- [x] 1.3 Validate this packet with OpenSpec strict mode.

## 2. Native Fixture And Parser Inventory

- [x] 2.1 Expand
  `.grit/patterns/habitat/checks/runtime_helper_redeclarations.md` with
  current-predicate positive and negative/control fixtures.
- [x] 2.2 Run
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter runtime_helper_redeclarations --json`.
- [x] 2.3 Run parser inventory over the current Swooper runtime roots with
  exclusions recorded in row-owned durable records.
- [x] 2.4 Record fixture classes, inventory counts, proof ids, and non-claims
  in this packet.

## 3. Dependency-Bound Gates

- [x] 3.1 Habitat wrapper selector/current-tree proof.
  - Current closure proof runs
    `bun run habitat:check -- --json --rule grit-runtime-helper-redeclarations`;
    it selects exactly RHR plus `baseline-integrity` and reports zero
    diagnostics (`RHR-PER-RULE-SELECTOR-2026-06-16`).
- [ ] 3.2 Raw acquisition or accepted adapter proof.
  - Raw direct Grit acquisition remains unclaimed for this row.
- [x] 3.3 Injected violation and cleanup proof.
  - Current closure proof runs the clean-start injected probe harness. The
    aggregate runner still exits nonzero only for accepted unrelated DDIT, while
    RHR reports one diagnostic at the injected runtime step path and keeps the
    outside-scope control clean (`RHR-INJECTED-PROBE-2026-06-16`).
- [x] 3.4 Explicit baseline proof.
  - `tools/habitat-harness/baselines/grit-runtime-helper-redeclarations.json`
    is explicit `[]`; `baseline-integrity` passes in per-rule and aggregate
    wrapper proof (`RHR-BASELINE-FILES-2026-06-16`).
- [x] 3.5 Live helper redeclaration disposition.
  - Resolved by successor `habitat-grit-apply-helper-redeclarations`: the three
    current-predicate `clamp01` function declarations were remediated through a
    bounded source-owner/apply checkpoint, and current parser inventory now
    reports zero RHR candidates.
- [x] 3.6 Aggregate `grit-check` wrapper proof.
  - `bun run habitat:check -- --json --tool grit-check` passes with RHR
    included in the current Grit rule set plus `baseline-integrity`
    (`RHR-HABITAT-GRIT-TOOL-2026-06-16`).
- [x] 3.7 Native Grit corpus refresh.
  - Full native Grit corpus proof passes with RHR included
    (`RHR-NATIVE-CORPUS-REFRESH-2026-06-16`).

## 4. Downstream Realignment

- [x] 4.1 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`.
- [x] 4.2 Update `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
- [x] 4.3 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md`.
- [x] 4.4 Record no-change dispositions for taxonomy, invariant corpus,
  recovery, and command docs unless policy or user-facing behavior changes.

## 5. Verification

- [x] 5.1 `bun run openspec -- validate habitat-grit-proof-runtime-helper-redeclarations --strict`
- [x] 5.2 native fixture proof
- [x] 5.3 parser inventory proof
- [x] 5.4 Habitat per-rule wrapper proof
- [x] 5.5 aggregate `grit-check` wrapper proof
- [x] 5.6 explicit empty baseline proof
- [x] 5.7 row-specific injected violation/path-control proof
- [x] 5.8 active-packet language guardrail scan
- [x] 5.9 `git diff --check`
- [x] 5.10 `bun run openspec:validate`
- [x] 5.11 commit via Graphite with a clean worktree
