## 1. Packet And Source Gate

- [x] 1.1 Open this per-pattern packet with proposal, design, spec delta,
  tasks, source synthesis, evidence log, phase record, downstream ledger, and
  review disposition ledger.
- [x] 1.2 Confirm `rules.json`, current Grit predicate, taxonomy, invariant
  corpus, discrepancy log, corpus ledger, and proof matrix source.
- [x] 1.3 Validate this packet with OpenSpec strict mode.

## 2. Native Fixture And Parser Inventory

- [x] 2.1 Expand
  `.grit/patterns/habitat/checks/domain_root_catalogs.md` with
  current-predicate positive and negative/control fixtures.
- [x] 2.2 Run
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter domain_root_catalogs --json`.
- [x] 2.3 Run parser inventory over the current Swooper domain source with
  exclusions recorded in row-owned durable records.
- [x] 2.4 Record fixture classes, inventory counts, proof ids, blockers, and
  non-claims in this packet.

## 3. Active Check Proof Gates

- [x] 3.1 Habitat wrapper selector/current-tree proof.
  - `DRC-PER-RULE-SELECTOR-2026-06-16` proves
    `bun run habitat:check -- --json --rule grit-domain-root-catalogs`
    selects `grit-domain-root-catalogs` plus `baseline-integrity`, with both
    passing and zero diagnostics.
- [ ] 3.2 Raw acquisition or accepted adapter proof.
  - Raw direct Grit current-tree acquisition remains unclaimed for this
    checkpoint; Habitat wrapper proof owns current-tree projection.
- [x] 3.3 Injected violation and cleanup proof.
  - `DRC-INJECTED-PROBE-2026-06-16` proves the registered DRC injected
    `domain/ecology/tags.ts` probe reports one diagnostic, the
    `domain/ecology/index.ts` control stays clean, and the runner restores
    clean initial/final git state and probe-root cleanup. Aggregate injected
    corpus closure remains a non-claim while unrelated DDIT is blocked.
- [x] 3.4 Explicit baseline proof.
  - `tools/habitat-harness/baselines/grit-domain-root-catalogs.json` is the
    explicit empty baseline for this rule, and `baseline-integrity` passes in
    both per-rule and aggregate wrapper proof.
- [x] 3.5 Live current-predicate catalog disposition.
  - Parser inventory found 0 live current-row domain-root catalog matches and
    0 nested domain catalog filename matches. Clean source closure is accepted
    only inside the current predicate; broader facade/export and
    generator/migration closure remain non-claims.

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

- [x] 5.1 `bun run openspec -- validate habitat-grit-proof-domain-root-catalogs --strict`
- [x] 5.2 native fixture proof
- [x] 5.3 parser inventory proof
- [x] 5.4 active-packet language guardrail scan
- [x] 5.5 `git diff --check`
- [x] 5.6 `bun run openspec:validate`
- [x] 5.7 commit via Graphite with a clean worktree
- [x] 5.8 `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --json`
- [x] 5.9 `bun run habitat:check -- --json --rule grit-domain-root-catalogs`
- [x] 5.10 `bun run habitat:check -- --json --tool grit-check`
- [x] 5.11 `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- [x] 5.12 `bun run openspec -- validate habitat-grit-proof-repair --strict`
