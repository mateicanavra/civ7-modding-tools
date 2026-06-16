## 1. Packet And Source Gate

- [x] 1.1 Open this per-pattern packet with proposal, design, spec delta,
  tasks, source synthesis, evidence log, phase record, downstream ledger, and
  review disposition ledger.
- [x] 1.2 Confirm `rules.json`, current Grit predicate, SDK and mapgen-core
  routers, SDK overview, normalization guardrails, OpenSpec normalization spec,
  taxonomy, discrepancy log, corpus ledger, and proof matrix source.
- [x] 1.3 Validate this packet with OpenSpec strict mode.

## 2. Native Fixture And Parser Inventory

- [x] 2.1 Expand
  `.grit/patterns/habitat/checks/sdk_mapgen_entrypoint.md` with
  current-predicate positive and negative/control fixtures.
- [x] 2.2 Run
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter sdk_mapgen_entrypoint --json`.
- [x] 2.3 Run parser inventory over current SDK and mapgen-core source with
  exclusions recorded in row-owned durable records.
- [x] 2.4 Record fixture classes, inventory counts, proof ids, blockers, and
  non-claims in this packet.

## 3. Dependency-Bound Gates

- [x] 3.1 Habitat wrapper selector/current-tree proof.
  - `SME-PER-RULE-SELECTOR-2026-06-16` selects exactly
    `grit-sdk-mapgen-entrypoint` plus `baseline-integrity`, both passing with
    zero diagnostics.
- [ ] 3.2 Raw acquisition or accepted adapter proof.
  - Blocked/non-claim for this checkpoint.
- [x] 3.3 Injected violation and cleanup proof.
  - `SME-INJECTED-PROBE-2026-06-16` records one diagnostic at the registered
    SDK root probe path, a clean SDK mapgen subpath control, clean initial/final
    git state, and clean injected-probe filesystem cleanup. Aggregate
    injected-corpus closure remains unclaimed while unrelated DDIT is blocked.
- [x] 3.4 Explicit baseline proof.
  - `tools/habitat-harness/baselines/grit-sdk-mapgen-entrypoint.json` is
    explicit `[]`; `SME-BASELINE-FILES-2026-06-16` records 30 Grit baseline
    files, no missing/extra/non-empty baselines, and `baseline-integrity`
    passing through per-rule and aggregate wrapper proof.
- [x] 3.5 Live current-predicate candidate disposition.
  - Parser inventory must record live current-row candidates as blockers or
    zero-candidate evidence. Raw acquisition remains a non-claim; active-check
    closure is bounded to native fixture proof, current parser inventory,
    Habitat wrapper proof, explicit empty baseline proof, and row-specific
    injected proof.

## 4. Downstream Realignment

- [x] 4.1 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`.
- [x] 4.2 Update `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
- [x] 4.3 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md`.
- [x] 4.4 Record no-change dispositions for SDK docs, taxonomy, discrepancy
  log, recovery, and command docs unless policy or user-facing behavior changes.

## 5. Verification

- [x] 5.1 `bun run openspec -- validate habitat-grit-proof-sdk-mapgen-entrypoint --strict`
- [x] 5.2 native fixture proof
- [x] 5.3 parser inventory proof
- [x] 5.4 active-packet language guardrail scan
- [x] 5.5 `git diff --check`
- [x] 5.6 `bun run openspec:validate`
- [x] 5.7 commit via Graphite with a clean worktree

## 6. Supervisor Repair

- [x] 6.1 Repair `SME-P2-NAMED-REEXPORT-PREDICATE-GAP-2026-06-15` by moving
  SDK-root named value re-exports from `./mapgen` and `./mapgen/index.js` into
  native positive coverage while preserving type-only export controls.
- [x] 6.2 Realign row and aggregate records so parser inventory labels named
  value re-export candidates explicitly.
- [x] 6.3 Rerun row OpenSpec validation, native Grit fixture proof, parser
  inventory, full OpenSpec validation, diff hygiene, deleted-file guard, and
  amend the same Graphite checkpoint.
- [x] 6.4 Repair `SME-P2-INLINE-TYPE-REEXPORT-CONTROL-GAP-2026-06-15` by
  keeping fixture-proven single-line pure inline type-only named re-exports as
  native controls while value-first mixed value+type named re-exports remain
  current-predicate positives.
- [x] 6.5 Realign row and aggregate records so parser inventory distinguishes
  `export type` named controls, single-line inline type-only controls, named
  value re-export candidates, and value-first mixed value+type named re-export candidates,
  with multiline/alternate-whitespace inline type-only forms recorded as
  unproven parser-edge non-claims.
