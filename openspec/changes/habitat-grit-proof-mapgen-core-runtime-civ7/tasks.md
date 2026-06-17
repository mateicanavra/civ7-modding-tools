## 1. Packet And Source Gate

- [x] 1.1 Open this per-pattern packet with proposal, design, spec delta,
  tasks, source synthesis, evidence log, phase record, downstream ledger, and
  review disposition ledger.
- [x] 1.2 Confirm `rules.json`, current Grit predicate, taxonomy, MapGen owner
  docs, invariant corpus, corpus ledger, proof matrix, and adjacent
  wrapped-test source authority.
- [x] 1.3 Read official GritQL documentation and local proven examples before
  changing predicate syntax.

## 2. Native Fixture And Parser Inventory

- [x] 2.1 Repair
  `.grit/patterns/habitat/checks/mapgen_core_runtime_civ7.md` with
  `import_statement(source=$source)` for value-bearing runtime import classes.
- [x] 2.2 Keep pure `import type` and single-line pure inline
  `import { type ... }` adapter imports as controls.
- [x] 2.3 Run
  `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter mapgen_core_runtime_civ7 --json`.
- [x] 2.4 Run full native Grit corpus proof.
- [x] 2.5 Run parser inventory over the current MapGen core/engine roots with
  exclusions recorded in row-owned durable records.
- [x] 2.6 Record fixture classes, inventory counts, proof ids, and non-claims
  in this packet.

## 3. Habitat Wrapper, Baseline, And Injected Proof

- [x] 3.1 Habitat wrapper selector/current-tree proof for
  `grit-mapgen-core-runtime-civ7`.
- [ ] 3.2 Raw direct Grit acquisition or accepted adapter proof.
  - Non-claim for this checkpoint.
- [x] 3.3 Injected violation and cleanup/path-control proof from clean row
  head.
- [x] 3.4 Explicit empty baseline and `baseline-integrity` proof.
- [x] 3.5 Import predicate-gap and live type-only adapter import disposition.
  - Repaired/dispositioned: value-bearing import classes now report; current
    source has 0 value-bearing candidates; 4 live adapter imports are pure
    type-only controls, not runtime coupling for this row.

## 4. Downstream Realignment

- [x] 4.1 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`.
- [x] 4.2 Update `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
- [x] 4.3 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md`.
- [x] 4.4 Update row-owned downstream, evidence, phase, source, and review
  records.
- [x] 4.5 Record no-change dispositions for taxonomy, invariant corpus,
  recovery, and command docs unless policy or user-facing behavior changes.

## 5. Verification

- [x] 5.1 `bun run openspec -- validate habitat-grit-proof-mapgen-core-runtime-civ7 --strict`
- [x] 5.2 focused native fixture proof
- [x] 5.3 full native Grit corpus proof
- [x] 5.4 parser inventory proof
- [x] 5.5 per-rule Habitat wrapper proof
- [x] 5.6 aggregate `grit-check` wrapper proof
- [x] 5.7 clean-start injected proof
- [x] 5.8 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 5.9 `bun run openspec:validate`
- [x] 5.10 `git diff --check`
- [x] 5.11 deleted-file guard
- [x] 5.12 commit via Graphite with a clean worktree
