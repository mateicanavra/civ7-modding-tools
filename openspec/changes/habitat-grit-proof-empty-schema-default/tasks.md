## 1. Packet And Source Gate

- [x] 1.1 Open this per-pattern packet with proposal, design, spec delta,
  tasks, source synthesis, evidence log, phase record, downstream ledger, and
  review disposition ledger.
- [x] 1.2 Confirm `rules.json`, current Grit predicate, invariant corpus,
  corpus ledger, and full-profile guardrail source.
- [x] 1.3 Validate this packet with OpenSpec strict mode.

## 2. Native Fixture And Parser Inventory

- [x] 2.1 Repair `.grit/patterns/habitat/checks/empty_schema_default.md` with
  `*.contract.ts` and ordinary `contract.ts` positives plus negative/control
  fixtures.
- [x] 2.2 Run
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter empty_schema_default --json`.
- [x] 2.3 Run parser inventory over the current Swooper contract-schema roots
  with exclusions recorded in row-owned durable records.
- [x] 2.4 Record fixture classes, inventory counts, proof ids, and non-claims
  in this packet.

## 3. Source Remediation And Active Proof

- [x] 3.1 Remove the two live ordinary `contract.ts` empty object defaults.
- [x] 3.2 Prove the source remediation preserves property-default materialized
  config for `planStarts.tierBias` and `selectResourceSites.familyDensity`.
- [x] 3.3 Habitat wrapper selector/current-tree proof.
- [ ] 3.4 Raw acquisition or accepted adapter proof.
  - Non-claim for this checkpoint.
- [x] 3.5 Injected violation and cleanup proof.
- [x] 3.6 Explicit baseline proof through the empty baseline file and
  `baseline-integrity`.
- [x] 3.7 Exact schema-policy closure for current domain op and recipe step
  contract roots.
- [ ] 3.8 Apply safety.
  - Non-claim; this row performs manual source remediation, not a registered
    apply/codemod path.
- [ ] 3.9 Product/runtime proof.
  - Non-claim; source tests and Habitat checks do not prove Civ7 runtime
    behavior.

## 4. Downstream Realignment

- [x] 4.1 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`.
- [x] 4.2 Update `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
- [x] 4.3 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md`.
- [x] 4.4 Record no-change dispositions for taxonomy, invariant corpus,
  recovery, and command docs unless policy or user-facing behavior changes.

## 5. Verification

- [x] 5.1 `bun run openspec -- validate habitat-grit-proof-empty-schema-default --strict`
- [x] 5.2 native fixture proof
- [x] 5.3 parser inventory proof
- [x] 5.4 source remediation tests/checks
- [x] 5.5 Habitat per-rule wrapper proof
- [x] 5.6 aggregate `grit-check` wrapper proof
- [x] 5.7 injected probe proof
- [x] 5.8 active-packet language guardrail scan
- [x] 5.9 `git diff --check`
- [x] 5.10 `bun run openspec:validate`
- [x] 5.11 commit via Graphite with a clean worktree
