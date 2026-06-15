## 1. Design And Authority

- [x] 1.1 Open the per-row packet before closure claims.
- [x] 1.2 Confirm `rules.json`, legacy guardrail script, invariant corpus,
  architecture packet, corpus ledger, proof matrix, and injected probe metadata
  for this row.
- [x] 1.3 Define proof classes and non-claims.

## 2. Native Fixture Proof

- [x] 2.1 Expand positives for `artifact:map.*` and `effect:map.*`.
- [x] 2.2 Add positives for array element, property-name, import/export source,
  dynamic import source, and single-quoted literal classes that the current
  native predicate reports.
- [x] 2.3 Add controls for domain-owned artifact/effect keys, map-key
  lookalikes, non-op domain paths, other mods, `.tsx`, recipe paths, and
  template literals.
- [x] 2.4 Run native Grit fixture proof and record
  `DOPE-NATIVE-FIXTURES-2026-06-15`.

## 3. Parser Inventory

- [x] 3.1 Run deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`.
- [x] 3.2 Record current-predicate scan roots, exclusions, counts, zero
  current-row candidates, domain-owned key controls, and non-claims.
- [x] 3.3 Record template-literal parser-edge non-claim.

## 4. Shared Proof And Baseline

- [x] 4.1 Record current restacked Habitat wrapper/current-tree proof inherited
  through `HGPR-HABITAT-GRIT-TOOL-2026-06-15` and
  `HGPR-PER-RULE-SELECTORS-2026-06-15`.
- [ ] 4.2 Run or consume accepted raw direct Grit acquisition proof for this
  row; raw remains `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`.
- [x] 4.3 Record shared injected-probe API inheritance through
  `HGPR-INJECTED-GRIT-ROWS-2026-06-15`; row-specific cleanup/path-control
  closure remains unclaimed.
- [x] 4.4 Record explicit empty baseline file/integrity inheritance through
  `HGPR-BASELINE-FILES-2026-06-15` and
  `HGPR-BASELINE-INTEGRITY-2026-06-15`.
- [ ] 4.5 Prove a row-specific injected finding is unbaselined and fails.

## 5. Downstream Realignment

- [x] 5.1 Update the aggregate Grit proof matrix for this row.
- [x] 5.2 Update the Grit pattern corpus ledger for this row.
- [x] 5.3 Update the command proof log for this row.
- [x] 5.4 Preserve non-claims for raw acquisition, template-literal closure,
  source remediation, classify/generator behavior, retired parity, apply
  safety, and product proof.

## 6. Verification

- [x] 6.1 `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter domain_ops_projection_effects --json`
- [x] 6.2 Deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`
- [x] 6.3 `bun run openspec -- validate habitat-grit-proof-domain-ops-projection-effects --strict`
- [x] 6.4 `bun run openspec:validate`
- [x] 6.5 `git diff --check`
- [x] 6.6 `git ls-files --deleted`
- [x] 6.7 Commit via Graphite with clean worktree
