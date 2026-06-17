## 1. Candidate Packet And Authority

- [x] 1.1 Open this per-candidate packet before any closure claim.
- [x] 1.2 Confirm the corpus ledger, retired full-profile guardrail, taxonomy,
  invariant corpus, and recovery references.
- [x] 1.3 Define proof classes, non-claims, and reopen trigger.

## 2. Predicate Design Disposition

- [x] 2.1 Test structural import-source predicate forms against value and
  type-only fixture classes.
- [x] 2.2 Test regex-based forms and record Grit lookaround support limits.
- [x] 2.3 Repair the predicate with AST `import_statement(source=$source)`
  binding and full-statement type-only guards for the proven static import
  subset.
- [x] 2.4 Record historical `DEI-PREDICATE-BLOCKER-2026-06-15` as repaired by
  `DEI-PREDICATE-REPAIR-2026-06-15`.

## 3. Parser Inventory

- [x] 3.1 Run deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`.
- [x] 3.2 Record scan root, exclusions, current predicate, counts, zero current
  exact engine-import candidates, and parser-edge non-claims.
- [x] 3.3 Record `DEI-DOMAIN-OPS-INVENTORY-2026-06-15`.

## 4. Shared Proof And Non-Claims

- [x] 4.1 Register active Habitat Grit rule.
  - `grit-domain-engine-imports` is registered in `rules.json`.
- [x] 4.2 Native positive fixture proof.
  - `DEI-NATIVE-FIXTURES-2026-06-15` proves value/default, namespace,
    side-effect, and value-first mixed value/type import positives plus pure
    type-only controls.
- [x] 4.3 Habitat wrapper/current-tree proof.
  - `DEI-PER-RULE-SELECTOR-2026-06-15` proves per-rule wrapper selector and
    current-tree zero diagnostics.
- [ ] 4.4 Raw direct Grit acquisition.
  - Non-claim: raw direct proof remains separate.
- [x] 4.5 Baseline file/integrity proof.
  - Explicit empty baseline added for `grit-domain-engine-imports`; final
    baseline inventory records the current Grit rule set.
- [x] 4.6 Injected violation and cleanup/path-control proof.
  - Clean-start injected runner proof reports one DEI diagnostic at the
    injected value import path and a clean pure type-only control path. The
    only aggregate injected-runner failure remains the accepted DDIT adapter
    activation gap.
- [ ] 4.7 Apply safety, retired parity, classify/generator behavior, broader
  domain-refactor closure, and product/runtime proof.
  - Non-claims for this checkpoint.
- [ ] 4.8 Export-from, dynamic import, source-string, and broader inline
  type-only formatting closure.
  - Non-claims unless separately proven.

## 5. Downstream Realignment

- [x] 5.1 Update the corpus ledger row with active-check proof, current counts,
  and non-claims.
- [x] 5.2 Update the command proof log with native, inventory, wrapper,
  baseline, and injected proof ids.
- [x] 5.3 Add the proof-matrix row for the active Habitat Grit check.

## 6. Verification

- [x] 6.1 Deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`.
- [x] 6.2 `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter domain_engine_imports --json 2>&1`
- [x] 6.3 `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --json 2>&1`
- [x] 6.4 `bun run habitat:check -- --json --rule grit-domain-engine-imports`
- [x] 6.5 `bun run habitat:check -- --json --tool grit-check`
- [x] 6.6 `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- [x] 6.7 `bun run openspec -- validate habitat-grit-proof-domain-engine-imports --strict`
- [x] 6.8 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 6.9 `bun run openspec:validate`
- [x] 6.10 `git diff --check`
- [ ] 6.11 Supervisor review of this repaired active-check checkpoint.
