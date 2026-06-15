## 1. Design And Review Gate

- [x] 1.1 Open this codemod packet with proposal, design, spec delta, tasks,
  source synthesis, evidence log, phase record, downstream ledger, and review
  disposition ledger.
- [ ] 1.2 Run product/outcome, Grit/apply, TypeScript/export, Effect/substrate,
  and evidence/system review lanes.
- [ ] 1.3 Disposition every P1/P2 finding in
  `workstream/review-disposition-ledger.md`.
- [ ] 1.4 Validate this packet with OpenSpec strict mode after review repairs.

## 2. Source And Corpus Refresh

- [ ] 2.1 Reread `dra-takeover-frame.md`, recovery claim ledger, Grit corpus
  ledger, local Grit extraction, official Grit evidence, official Effect
  evidence, and the Effect orchestration evaluation before implementation.
- [ ] 2.2 Confirm the selected scan roots from current code:
  `mods/*/src/recipes` and `mods/*/src/maps`.
- [ ] 2.3 Confirm the allowlisted apply pattern list in
  `tools/habitat-harness/src/lib/grit.ts`.
- [ ] 2.4 Re-inventory public domain `/ops` entrypoints and record which
  symbols are exported by each target public module.
- [ ] 2.5 Re-run live match inventory before any apply proof.

## 3. Native Grit Fixture Proof

- [ ] 3.1 Run
  `GRIT_TELEMETRY_DISABLED=true PATH="$PWD/node_modules/.bin:$PATH" grit patterns test --filter deep_import_to_public_surface --json`.
- [ ] 3.2 Expand fixtures for positive value imports, positive type imports,
  mixed imports, already-public imports, out-of-scope paths, missing exports,
  and alias/default edge cases where the current sample does not prove the
  class.
- [ ] 3.3 Decide whether the Grit rewrite template preserves semicolons or the
  applied-diff proof classifies semicolon changes as Biome-owned formatting.
- [ ] 3.4 Record which fixture classes are native Grit proof and which require
  Habitat target-export preflight.

## 4. Target Export Preflight

- [ ] 4.1 Define the preflight contract for resolving
  `@mapgen/domain/<domain>/ops` to source authority.
- [ ] 4.2 Implement or consume the accepted adapter service that extracts
  exported names, local aliases, per-specifier type/value kind, source
  specifier, target specifier, and import-clause form for every candidate.
- [ ] 4.3 Prove exported-symbol success cases for every injected positive case.
- [ ] 4.4 Prove missing-export refusal or unchanged-import behavior.
- [ ] 4.5 Prove target-export failures are structured data, not stderr string
  parsing.
- [ ] 4.6 Reject default, namespace, mixed default-plus-named, and side-effect
  import forms unless the proof contract explicitly proves semantic equivalence.

## 5. Dry-Run No-Write Proof

- [ ] 5.1 Run direct live dry-run over exact roots and record zero/nonzero match
  inventory.
- [ ] 5.2 Run `bun run habitat:fix -- --dry-run` on the clean live tree and
  record Grit and Biome output classes.
- [ ] 5.3 Run injected dry-run through the Habitat fix path.
- [ ] 5.4 Prove no source file changes after each dry-run.
- [ ] 5.5 Record final clean status.

## 6. Transaction And Applied Diff

- [ ] 6.1 Wait for `habitat-effect-grit-adapter` task 8 or an equivalent
  accepted typed transaction substrate before live apply proof.
- [ ] 6.2 Run candidate inventory and target-export preflight inside the
  transaction context.
- [ ] 6.3 Reject missing exports, unexpected files, unapproved ranges, and
  dry-run mismatches before writes.
- [ ] 6.4 Apply only approved candidates.
- [ ] 6.5 Capture approved diff, file digests, command provenance, and
  non-claims.
- [ ] 6.6 Run Biome only over approved changed paths.
- [ ] 6.7 Run selected typecheck/test gates.
- [ ] 6.8 Roll back through substrate-owned cleanup/finalizers. Git may be the
  rollback primitive only when invoked through the typed transaction service
  with before digests, allowed paths, command provenance, and final
  clean-status proof.
- [ ] 6.9 Prove final clean status.

## 7. Downstream Realignment

- [ ] 7.1 Update `habitat-grit-proof-repair` matrix and command-proof log with
  proof ids from this packet after implementation.
- [ ] 7.2 Update the recovery claim ledger for `CLAIM-PRODUCT-TRANSFORMS`.
- [ ] 7.3 Update the Grit pattern corpus ledger current apply row.
- [ ] 7.4 Update phase records that currently cite dry-run evidence so they
  keep dry-run, applied-diff, and safe-transform claims separate.

## 8. Verification

- [ ] 8.1 `bun run openspec -- validate habitat-grit-apply-deep-import-public-surface-proof --strict`
- [ ] 8.2 native Grit fixture proof
- [ ] 8.3 live match inventory
- [ ] 8.4 Habitat dry-run proof
- [ ] 8.5 injected dry-run no-write proof
- [ ] 8.6 target-export preflight proof
- [ ] 8.7 missing-export refusal proof
- [ ] 8.8 controlled applied-diff proof through accepted transaction substrate
- [ ] 8.9 Biome handoff and selected type/test gates
- [ ] 8.10 rollback and final clean-status proof
- [ ] 8.11 downstream ledgers aligned
- [ ] 8.12 full-depth language guardrail scan over active packet docs
- [ ] 8.13 `git diff --check`
- [ ] 8.14 `bun run openspec:validate`
- [ ] 8.15 commit via Graphite with a clean worktree
