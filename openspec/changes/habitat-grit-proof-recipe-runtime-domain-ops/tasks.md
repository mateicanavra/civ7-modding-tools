## 1. Packet And Source Gate

- [x] 1.1 Open this per-pattern packet with proposal, design, spec delta,
  tasks, source synthesis, evidence log, phase record, downstream ledger, and
  review disposition ledger.
- [x] 1.2 Confirm `rules.json`, current Grit predicate, standard recipe docs,
  invariant corpus, corpus ledger, and current runtime recipe import exemplars.
- [x] 1.3 Validate this packet with OpenSpec strict mode.

## 2. Native Fixture And Parser Inventory

- [x] 2.1 Expand `.grit/patterns/habitat/checks/recipe_runtime_domain_ops.md`
  with current-predicate positive and negative/control fixtures.
  - Closure repair uses `import_statement(source=$source)` with exact
    optional-quote `@mapgen/domain/<domain>` source matching; source-prefix,
    source-relative, and source-protocol lookalikes are controls.
- [x] 2.2 Run
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter recipe_runtime_domain_ops --json`.
- [x] 2.3 Run parser inventory over `mods/mod-swooper-maps/src/recipes` with
  exclusions recorded in row-owned durable records.
- [x] 2.4 Record fixture classes, inventory counts, proof ids, and non-claims
  in this packet.

## 3. Current Wrapper, Baseline, Injected, And Non-Claim Gates

- [x] 3.1 Habitat wrapper selector/current-tree proof.
  - `RDO-PER-RULE-SELECTOR-2026-06-16` selects exactly
    `grit-recipe-runtime-domain-ops` plus `baseline-integrity`, both passing
    with zero diagnostics.
- [ ] 3.2 Raw acquisition or accepted adapter proof.
  - Blocked/non-claim for this checkpoint.
- [x] 3.3 Injected violation and cleanup proof.
  - `RDO-INJECTED-PROBE-2026-06-16` records one diagnostic at the injected
    runtime recipe contract-root import and a clean non-`recipe.ts` control,
    with clean initial/final git state and probe-root cleanup. Aggregate
    injected-corpus closure remains a non-claim while DDIT is blocked.
- [x] 3.4 Explicit baseline proof.
  - The explicit empty baseline is present and `baseline-integrity` passes in
    per-rule and aggregate wrapper proof.
- [ ] 3.5 Apply safety proof for exact import normalization.
  - Blocked/non-claim for this check row; any rewrite belongs to a separate
    apply row.
- [x] 3.6 Aggregate `grit-check` wrapper proof.
  - `RDO-HABITAT-GRIT-TOOL-2026-06-16` passes with 30 Grit rules plus
    `baseline-integrity`, with RDO included and zero diagnostics.

## 4. Downstream Realignment

- [x] 4.1 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`.
- [x] 4.2 Update `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
- [x] 4.3 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md`.
- [x] 4.4 Record no-change dispositions for standard recipe docs,
  invariant corpus, recovery, and command docs unless policy or user-facing
  behavior changes.

## 5. Verification

- [x] 5.1 `bun run openspec -- validate habitat-grit-proof-recipe-runtime-domain-ops --strict`
- [x] 5.2 native fixture proof
- [x] 5.3 full native Grit corpus proof
- [x] 5.4 parser inventory proof
- [x] 5.5 per-rule and aggregate Habitat wrapper proof
- [x] 5.6 row-specific injected/path-control proof
- [x] 5.7 active-packet language guardrail scan
- [x] 5.8 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 5.9 `git diff --check`
- [x] 5.10 `bun run openspec:validate`
- [x] 5.11 commit via Graphite with a clean worktree
