## 1. Design And Authority

- [x] 1.1 Open the per-row packet before closure claims.
- [x] 1.2 Confirm `rules.json`, legacy guardrail script, invariant corpus,
  architecture packet, corpus ledger, proof matrix, and injected probe metadata
  for this row.
- [x] 1.3 Define proof classes and non-claims.

## 2. Native Fixture Proof

- [x] 2.1 Repair the predicate and expand positives for two-or-more-parent
  root-config imports, re-exports, and dynamic string-literal imports.
- [x] 2.2 Add positives for default, named, namespace, type-only, side-effect,
  and single-quoted import classes that the current native predicate reports.
- [x] 2.3 Add controls for local config, one-parent config, non-op domain
  paths, other mods, `.tsx`, recipe paths, extensionless paths, JSON paths,
  one-parent re-exports, one-parent/JSON dynamic imports, and source strings.
- [x] 2.4 Run native Grit fixture proof and record
  `DORC-NATIVE-FIXTURES-2026-06-17`.

## 3. Parser Inventory

- [x] 3.1 Run deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`.
- [x] 3.2 Record current-predicate scan roots, exclusions, counts, zero
  current-row candidates, local config controls, and non-claims.
- [x] 3.3 Record current export-from and dynamic-import zero-candidate
  inventory for the repaired predicate.

## 4. Shared Proof And Baseline

- [x] 4.1 Record current Habitat wrapper/current-tree proof through
  `DORC-PER-RULE-SELECTOR-2026-06-17` and
  `DORC-HABITAT-GRIT-TOOL-2026-06-17`.
- [ ] 4.2 Run or consume accepted raw direct Grit acquisition proof for this
  row; raw remains `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`.
- [x] 4.3 Record row-specific injected dynamic-import violation/path-control
  proof through `DORC-INJECTED-PROBE-2026-06-17`.
- [x] 4.4 Record explicit empty baseline file/integrity proof through
  `DORC-BASELINE-FILES-2026-06-17`.
- [x] 4.5 Prove a row-specific injected finding is unbaselined and fails.

## 5. Downstream Realignment

- [x] 5.1 Update the aggregate Grit proof matrix for this row.
- [x] 5.2 Update the Grit pattern corpus ledger for this row.
- [x] 5.3 Update the command proof log for this row.
- [x] 5.4 Preserve non-claims for raw acquisition, non-string dynamic import
  closure, source remediation, classify/generator behavior, retired parity,
  apply safety, and product proof.

## 6. Verification

- [x] 6.1 `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter domain_ops_root_config --json`
- [x] 6.2 Deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`
- [x] 6.3 `bun run openspec -- validate habitat-grit-proof-domain-ops-root-config --strict`
- [x] 6.4 `bun run openspec:validate`
- [x] 6.5 `git diff --check`
- [x] 6.6 `git ls-files --deleted`
- [x] 6.7 Commit via Graphite with clean worktree
