## 1. Design And Review Gate

- [x] 1.1 Open this codemod packet with proposal, design, spec delta, tasks,
  source synthesis, evidence log, phase record, downstream ledger, and review
  disposition ledger.
- [x] 1.2 Record product/outcome, Grit/apply, TypeScript/export,
  Effect/substrate, and evidence/system review lanes in
  `workstream/review-disposition-ledger.md`.
- [x] 1.3 Disposition every recorded P1/P2 finding in
  `workstream/review-disposition-ledger.md`.
- [x] 1.4 Validate this packet with OpenSpec strict mode after this record
  alignment.

## 2. Source And Corpus Refresh

- [x] 2.1 Reread the current Habitat recovery, corpus, aggregate Grit proof,
  and Effect/apply substrate records before aligning this packet.
- [x] 2.2 Confirm the selected scan roots from current code:
  `mods/*/src/recipes` and `mods/*/src/maps`.
- [x] 2.3 Confirm the allowlisted apply pattern list in
  `tools/habitat-harness/src/lib/grit.ts`.
- [x] 2.4 Consume the accepted target-export proof for public domain `/ops`
  entrypoints from `HGPR-APPLY-TARGET-EXPORT-UNIT-2026-06-15`.
- [x] 2.5 Consume the accepted live match inventory from
  `HGPR-APPLY-LIVE-INVENTORY-2026-06-15`.

## 3. Native Grit Fixture Proof

- [ ] 3.1 Re-run
  `GRIT_TELEMETRY_DISABLED=true grit patterns test --filter deep_import_to_public_surface --json`
  for this checkpoint.
- [x] 3.2 Keep native fixture proof scoped to the current value/type rewrite
  sample; target-export, missing-export, and import-kind safety are proved by
  the Habitat adapter/unit/injected proof IDs below, not by native Grit alone.
- [x] 3.3 Classify semicolon and formatting changes as Biome-handoff scope
  during applied-diff proof, not as native Grit semantic proof.
- [x] 3.4 Record which classes are native Grit proof and which require Habitat
  target-export preflight in the evidence and aggregate records.

## 4. Target Export Preflight

- [x] 4.1 Define the preflight contract for resolving
  `@mapgen/domain/<domain>/ops` to source authority.
- [x] 4.2 Consume the accepted adapter service that extracts exported names,
  per-specifier type/value kind, source specifier, and target specifier for
  supported named import candidates.
- [x] 4.3 Prove exported-symbol success cases for injected positive cases via
  `HGPR-APPLY-TARGET-EXPORT-UNIT-2026-06-15`,
  `HGPR-APPLY-POSITIVE-DRY-RUN-2026-06-15`, and
  `HGPR-APPLY-LIVE-FIXED-2026-06-15`.
- [x] 4.4 Prove missing-export refusal and unchanged-source behavior via
  `HGPR-APPLY-MISSING-EXPORT-2026-06-15`.
- [x] 4.5 Prove target-export failures are structured failure-tag data via
  `HGPR-APPLY-TARGET-EXPORT-UNIT-2026-06-15`.
- [x] 4.6 Keep unsupported default, namespace, mixed default-plus-named, and
  side-effect import forms outside the supported safe-transform claim unless a
  later proof contract proves semantic equivalence.

## 5. Dry-Run No-Write Proof

- [x] 5.1 Run live dry-run and match inventory over exact roots; recorded as
  `HGPR-APPLY-LIVE-INVENTORY-2026-06-15`.
- [x] 5.2 Run `bun run habitat:fix -- --dry-run` on the clean live tree and
  record Grit/Biome output classes in the aggregate command proof log.
- [x] 5.3 Run injected dry-run through the Habitat fix path; recorded as
  `HGPR-APPLY-POSITIVE-DRY-RUN-2026-06-15`.
- [x] 5.4 Prove no source file changes after dry-run success and failure cases;
  recorded in the positive and missing-export dry-run proof IDs.
- [x] 5.5 Record final clean status for the dry-run probes.

## 6. Transaction And Applied Diff

- [x] 6.1 Consume the accepted Grit apply transaction substrate from the
  downstack Habitat repair layers before live apply proof.
- [x] 6.2 Run candidate inventory and target-export preflight inside the proof
  path; recorded by `HGPR-APPLY-TARGET-EXPORT-UNIT-2026-06-15` and
  `HGPR-APPLY-LIVE-FIXED-2026-06-15`.
- [x] 6.3 Reject missing exports, unexpected files, unapproved ranges, and
  dry-run mismatches before writes; recorded by
  `HGPR-APPLY-MISSING-EXPORT-2026-06-15` and the transaction unit proof.
- [x] 6.4 Apply only approved candidates in the named proof worktree; recorded
  by `HGPR-APPLY-LIVE-FIXED-2026-06-15`.
- [x] 6.5 Capture approved diff, file digests, command provenance, and
  non-claims for the controlled live proof.
- [x] 6.6 Run Biome only over the approved changed path in the controlled live
  proof.
- [x] 6.7 Run selected typecheck/test gates; recorded by
  `HGPR-APPLY-LIVE-COLD-GATES-2026-06-15`.
- [x] 6.8 Roll back and clean proof worktrees through recorded cleanup; recorded
  by `HGPR-APPLY-LIVE-ROLLBACK-2026-06-15` and
  `HGPR-APPLY-LIVE-COLD-GATES-2026-06-15`.
- [x] 6.9 Prove final clean status for the proof worktrees and current packet
  before commit.

## 7. Downstream Realignment

- [x] 7.1 Update `habitat-grit-proof-repair` matrix and command-proof log with
  proof ids from this packet after implementation.
- [x] 7.2 Update the recovery claim ledger for `CLAIM-PRODUCT-TRANSFORMS`.
- [x] 7.3 Update the Grit pattern corpus ledger current apply row.
- [x] 7.4 Update phase records so dry-run, applied-diff, selected-gate, cleanup,
  and remaining non-claims stay separate.

## 8. Verification

- [x] 8.1 `bun run openspec -- validate habitat-grit-apply-deep-import-public-surface-proof --strict`
- [x] 8.2 native Grit fixture proof
- [x] 8.3 live match inventory: `HGPR-APPLY-LIVE-INVENTORY-2026-06-15`
- [x] 8.4 Habitat dry-run proof: `HGPR-APPLY-LIVE-INVENTORY-2026-06-15`
- [x] 8.5 injected dry-run no-write proof:
  `HGPR-APPLY-POSITIVE-DRY-RUN-2026-06-15`
- [x] 8.6 target-export preflight proof:
  `HGPR-APPLY-TARGET-EXPORT-UNIT-2026-06-15`
- [x] 8.7 missing-export refusal proof:
  `HGPR-APPLY-MISSING-EXPORT-2026-06-15`
- [x] 8.8 controlled applied-diff proof through accepted transaction substrate:
  `HGPR-APPLY-LIVE-FIXED-2026-06-15`
- [x] 8.9 Biome handoff and selected type/test gates:
  `HGPR-APPLY-LIVE-COLD-GATES-2026-06-15`
- [x] 8.10 rollback and final clean-status proof:
  `HGPR-APPLY-LIVE-ROLLBACK-2026-06-15`
- [x] 8.11 downstream ledgers aligned
- [x] 8.12 full-depth language guardrail scan over active packet docs
- [x] 8.13 `git diff --check`
- [x] 8.14 `bun run openspec:validate`
- [x] 8.15 commit via Graphite with a clean worktree
