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

## 3. Dependency-Bound Gates

- [ ] 3.1 Habitat wrapper selector/current-tree proof.
  - Blocked/non-claim until the accepted command-trust/selector layer is
    available in this row's stack/base or supervisor coordinates integration.
- [ ] 3.2 Raw acquisition or accepted adapter proof.
  - Blocked/non-claim for this checkpoint.
- [ ] 3.3 Injected violation and cleanup proof.
  - Blocked/non-claim until the typed adapter/probe cleanup surface is
    available.
- [ ] 3.4 Explicit baseline proof.
  - Blocked/non-claim until the scaffold/baseline contract surface is
    available.
- [x] 3.5 Live current-predicate base-standard import disposition.
  - Parser inventory must record live current-row direct import candidates as
    blockers or zero-candidate evidence. Clean row closure remains a non-claim
    until wrapper/current-tree, baseline, injected, raw/adapter, and supervisor
    acceptance gates are available.

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
- [x] 5.4 active-packet language guardrail scan
- [x] 5.5 `git diff --check`
- [x] 5.6 `bun run openspec:validate`
- [x] 5.7 commit via Graphite with a clean worktree
