## 1. Packet And Source Gate

- [x] 1.1 Open this per-pattern packet with proposal, design, spec delta,
  tasks, source synthesis, evidence log, phase record, downstream ledger, and
  review disposition ledger.
- [x] 1.2 Confirm `rules.json`, current Grit predicate, ADR-004, invariant
  corpus, corpus ledger, and current Studio import exemplars.
- [x] 1.3 Validate this packet with OpenSpec strict mode.

## 2. Native Fixture And Parser Inventory

- [x] 2.1 Expand `.grit/patterns/habitat/checks/studio_recipe_artifacts.md`
  with current-predicate positive and negative/control fixtures.
- [x] 2.2 Run
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter studio_recipe_artifacts --json`.
- [x] 2.3 Run parser inventory over `apps/mapgen-studio/src` with exclusions
  recorded in row-owned durable records.
- [x] 2.4 Record fixture classes, inventory counts, proof ids, and non-claims
  in this packet.

## 3. Current Wrapper, Baseline, And Injected Proof

- [x] 3.1 Habitat wrapper selector/current-tree proof.
  - `SRA-PER-RULE-SELECTOR-2026-06-16` selects exactly
    `grit-studio-recipe-artifacts` plus `baseline-integrity`, both passing with
    zero diagnostics.
- [ ] 3.2 Raw acquisition or accepted adapter proof.
  - Non-claim for this closure; parser inventory, wrapper proof, and injected
    proof are not raw direct Grit acquisition.
- [x] 3.3 Injected violation and cleanup proof.
  - `SRA-INJECTED-PROBE-2026-06-16` reports one diagnostic at the injected
    Studio UI runtime import path, keeps the `browser-runner` control clean,
    and leaves initial/final git state and probe cleanup clean. Aggregate
    injected-corpus closure remains unclaimed while unrelated DDIT is blocked.
- [x] 3.4 Explicit baseline proof.
  - `tools/habitat-harness/baselines/grit-studio-recipe-artifacts.json` is
    explicit `[]`; per-rule and aggregate wrapper proof pass
    `baseline-integrity`.

## 4. Downstream Realignment

- [x] 4.1 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`.
- [x] 4.2 Update `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
- [x] 4.3 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md`.
- [x] 4.4 Record no-change dispositions for ADR/recovery/command docs unless
  policy or user-facing behavior changes.

## 5. Verification

- [x] 5.1 `bun run openspec -- validate habitat-grit-proof-studio-recipe-artifacts --strict`
- [x] 5.2 native fixture proof
- [x] 5.3 parser inventory proof
- [x] 5.4 full native Grit corpus refresh
- [x] 5.5 Habitat per-rule wrapper proof
- [x] 5.6 aggregate `grit-check` wrapper proof
- [x] 5.7 explicit empty baseline / `baseline-integrity` proof
- [x] 5.8 row-specific injected violation/path-control proof
- [x] 5.9 active-packet language guardrail scan
- [x] 5.10 `git diff --check`
- [x] 5.11 `bun run openspec:validate`
- [x] 5.12 commit via Graphite with a clean worktree
