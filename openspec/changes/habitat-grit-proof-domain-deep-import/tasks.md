## 1. Design And Review Gate

- [x] 1.1 Open this per-pattern packet with proposal, design, spec delta,
  tasks, source synthesis, evidence log, phase record, downstream ledger, and
  review disposition ledger.
- [ ] 1.2 Run product/outcome, Grit semantics, architecture, evidence, and
  system review lanes.
- [ ] 1.3 Disposition every P1/P2 finding in
  `workstream/review-disposition-ledger.md`.
- [ ] 1.4 Validate this packet with OpenSpec strict mode after review repairs.

## 2. Source And Authority Refresh

- [ ] 2.1 Reread the takeover frame, Grit corpus ledger, recovery claim ledger,
  official Grit docs pack, local Grit corpus extraction, aggregate Grit proof
  repair, and apply proof packet.
- [ ] 2.2 Confirm `rules.json` metadata for `grit-domain-deep-import`.
- [ ] 2.3 Confirm `IMPORTS.md` and `NORMALIZATION-GUARDRAILS.md` G4 remain the
  active policy source for recipe/map public domain surfaces.
- [ ] 2.4 Confirm this row's boundary with `grit-recipe-domain-surface`,
  `grit-step-contract-domain-surface`, and
  `deep_import_to_public_surface`.
- [ ] 2.5 Reconcile `rules.json` scope, Grit filename predicate, corpus-ledger
  scan roots, and fixture paths for `.ts` and `.tsx` reach.
- [ ] 2.6 Decide whether overlapping recipe `rules` and `strategies` imports
  should produce one specialized diagnostic or reviewed multi-rule diagnostics.
- [ ] 2.7 Record `ops-by-id` as a current semantic defect and design the
  fixture-proven predicate repair.
- [ ] 2.8 Classify recipe/map-local `__tests__`, `__type_tests__`, and
  `*.test.ts` paths as included or excluded.
- [ ] 2.9 Record current relative `src/domain/**` reaches as a sibling guard
  candidate or accepted non-claim.

## 3. Native Fixture Proof

- [ ] 3.1 Run
  `GRIT_TELEMETRY_DISABLED=true PATH="$PWD/node_modules/.bin:$PATH" grit patterns test --filter domain_deep_import --json`.
- [ ] 3.2 Add positive fixtures for named imports, `ops-by-id`, `rules`,
  `strategies`, recipe paths, map paths, `export { ... } from`, and
  `export * from`.
- [ ] 3.2a Add `ops-by-id` import and re-export positives after predicate
  repair.
- [ ] 3.2b Add `ops-by-id` lookalike negatives.
- [ ] 3.3 Add negative fixtures for public domain root, public `/ops`,
  `/config.js`, out-of-scope domain/test paths, and generated-path controls.
- [ ] 3.4 Decide and prove whether `import type` and namespace imports are
  matched or classified outside this row.
- [ ] 3.5 Add `.tsx` fixture coverage or record the accepted reason `.tsx`
  is outside the rule after scope reconciliation.
- [ ] 3.6 Add neighboring-rule overlap controls for recipe `rules` and
  `strategies` imports, plus map equivalents that prove this row outside the
  recipe-only policy.
- [ ] 3.7 Add recipe/map-local test-path fixtures according to the accepted
  ownership decision.
- [ ] 3.8 Record fixture class counts in the aggregate proof matrix.

## 4. Current-Tree Proof

- [ ] 4.1 Run `bun run habitat:check -- --json --rule grit-domain-deep-import`
  and record output class, selected rule ids, diagnostics count, and
  baseline state.
- [ ] 4.2 Run bounded raw Grit acquisition over exact recipe/map roots or
  consume an accepted adapter proof id.
- [ ] 4.3 Run parser-grade current-tree import inventory for this row's source
  predicate, or record reviewed regex inventory as supplemental evidence.
- [ ] 4.4 Record whether generated map files are included in live scans and how
  live generated findings would be remediated.
- [ ] 4.5 Record live relative local-domain reaches and link the sibling guard
  or non-claim decision.

## 5. Injected Violation Proof

- [ ] 5.1 Wait for `habitat-effect-grit-adapter` or accepted typed Grit adapter
  substrate before implementing probe creation/cleanup, parser
  classification, pattern projection, or command provenance.
- [ ] 5.2 Add positive recipe probe that fails the exact Habitat rule id.
- [ ] 5.3 Add positive non-generated map probe that fails the exact Habitat
  rule id.
- [ ] 5.4 Add `ops-by-id` injected recipe and map probes that fail the exact
  Habitat rule id.
- [ ] 5.5 Add outside-scope path-control probe in domain or external test
  source.
- [ ] 5.6 Prove cleanup leaves `git status --short` clean after success and
  failure.
- [ ] 5.7 Record protected generated-output non-claims.
- [ ] 5.8 Record the Effect/no-Effect substrate decision and prove a non-Effect
  substrate supplies tagged failures, service-injected tests, explicit command
  provenance, scan-root provenance, and cleanup behavior before use.

## 6. Baseline Proof

- [ ] 6.1 Add explicit empty baseline file
  `tools/habitat-harness/baselines/grit-domain-deep-import.json`.
- [ ] 6.2 Prove `baseline-integrity` accepts the explicit empty baseline.
- [ ] 6.3 Prove an injected finding is unbaselined and fails.
- [ ] 6.4 Link baseline expansion safety to the accepted scaffold/baseline
  contract repair owner before claiming shared baseline mutation safety.

## 7. Downstream Realignment

- [ ] 7.1 Update
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
  with proof ids and fixture counts.
- [ ] 7.2 Update `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
  for this row after implementation.
- [ ] 7.3 Update H5/H6 historical records if their wording implies stronger
  proof than this packet supplies.
- [ ] 7.4 Update command docs only if user-visible diagnostics or remediation
  text changes.
- [ ] 7.5 Update `docs/projects/habitat-harness/recovery-claim-ledger.md` rows
  for H5, H6, baseline, and stale-record truth after aggregate proof ids exist.

## 8. Verification

- [ ] 8.1 `bun run openspec -- validate habitat-grit-proof-domain-deep-import --strict`
- [ ] 8.2 native fixture proof
- [ ] 8.3 Habitat current-tree wrapper proof
- [ ] 8.4 bounded raw acquisition or adapter proof id
- [ ] 8.5 current-tree import inventory
- [ ] 8.6 scope reconciliation proof
- [ ] 8.7 neighboring-rule overlap disposition
- [ ] 8.8 `ops-by-id` defect repair proof
- [ ] 8.9 recipe/map-local test scope disposition
- [ ] 8.10 alias-only and relative local-domain reach disposition
- [ ] 8.11 injected recipe and map proof
- [ ] 8.12 outside-scope path-control proof
- [ ] 8.13 explicit baseline proof
- [ ] 8.14 baseline owner linkage
- [ ] 8.15 aggregate proof matrix aligned
- [ ] 8.16 recovery claim ledger aligned
- [ ] 8.17 active-packet language guardrail scan
- [ ] 8.18 `git diff --check`
- [ ] 8.19 `bun run openspec:validate`
- [ ] 8.20 commit via Graphite with a clean worktree
