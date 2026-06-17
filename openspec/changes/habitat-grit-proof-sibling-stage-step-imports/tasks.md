## 1. Packet And Source Gate

- [x] 1.1 Open this per-pattern packet with proposal, design, spec delta,
  tasks, source synthesis, evidence log, phase record, downstream ledger, and
  review disposition ledger.
- [x] 1.2 Confirm `rules.json`, current Grit predicate, taxonomy, invariant
  corpus, discrepancy log, Swooper/normalization docs, corpus ledger, and proof
  matrix source.
- [x] 1.3 Validate this packet with OpenSpec strict mode.

## 2. Native Fixture And Parser Inventory

- [x] 2.1 Expand
  `.grit/patterns/habitat/checks/sibling_stage_step_imports.md` with
  current-predicate positive and negative/control fixtures.
- [x] 2.2 Run
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter sibling_stage_step_imports --json`.
- [x] 2.3 Run parser inventory over the current Swooper standard stage root and
  actual current-predicate subset with exclusions recorded in row-owned durable
  records.
- [x] 2.4 Record fixture classes, inventory counts, proof ids, and non-claims
  in this packet.
- [x] 2.5 Repair predicate to `import_statement(source=$source)` and prove the
  side-effect static import positive while preserving re-export, dynamic,
  `.tsx`, same-stage, source-lookalike, map/test/package, and non-standard
  recipe controls.

## 3. Dependency-Bound Gates

- [x] 3.1 Habitat wrapper selector/current-tree proof.
  - `bun run habitat:check -- --json --rule grit-sibling-stage-step-imports`
    passed with exactly `grit-sibling-stage-step-imports` plus
    `baseline-integrity`, both zero diagnostics.
- [ ] 3.2 Raw acquisition or accepted adapter proof.
  - Blocked/non-claim for this checkpoint.
- [x] 3.3 Injected violation and cleanup proof.
  - Row-specific injected proof is recorded by
    `SSS-INJECTED-PROBE-2026-06-16`; aggregate injected-corpus closure remains
    separate while the unrelated DDIT adapter activation gap is accepted.
- [x] 3.4 Explicit baseline proof.
  - `tools/habitat-harness/baselines/grit-sibling-stage-step-imports.json`
    is explicit `[]`; `baseline-integrity` passed in per-rule and aggregate
    wrapper proof.
- [x] 3.5 Live current-predicate sibling-stage import disposition.
  - Parser inventory found 0 live current-row sibling-stage step import
    matches in both the all-stage-root contextual scan and the actual
    current-predicate subset. Raw acquisition, export-from/dynamic closure,
    apply safety, neighboring-row proof, and product/runtime proof remain
    non-claims.

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

- [x] 5.1 `bun run openspec -- validate habitat-grit-proof-sibling-stage-step-imports --strict`
- [x] 5.2 native fixture proof
- [x] 5.3 parser inventory proof
- [x] 5.4 active-packet language guardrail scan
- [x] 5.5 `git diff --check`
- [x] 5.6 `bun run openspec:validate`
- [x] 5.7 commit via Graphite with a clean worktree
- [x] 5.8 `bun run habitat:check -- --json --rule grit-sibling-stage-step-imports`
- [x] 5.9 `bun run habitat:check -- --json --tool grit-check`
- [x] 5.10 `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
  - Exited 1 only for the accepted unrelated DDIT adapter activation gap; SSS
    passed with one diagnostic at the injected path and a clean control path.
- [x] 5.11 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 5.12 `bun run openspec:validate`
