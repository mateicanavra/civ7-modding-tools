## 1. Design And Authority

- [x] 1.1 Open the per-row packet before closure claims.
- [x] 1.2 Confirm corpus ledger, import policy, recipe-compile architecture
  records, testing policy, DDI sibling-row boundary, and registration surfaces.
- [x] 1.3 Read GritQL documentation and examples for structural imports,
  `$filename`, regex guards, negative conditions, and Markdown fixtures.
- [x] 1.4 Define proof classes and non-claims.

## 2. Source Remediation

- [x] 2.1 Inventory live test deep imports under mod and package test roots.
- [x] 2.2 Expose narrow narrative story helper values through the narrative
  root without adding broad root `export *` facades.
- [x] 2.3 Replace current test deep imports with public root, `/ops`, or
  `/config.js` surfaces or local public-type-derived test shapes.
- [x] 2.4 Preserve source-string and dynamic-import cases as controls or
  non-claims rather than source remediation targets.

## 3. Native Fixture Proof

- [x] 3.1 Add `domain_deep_import_tests` pattern.
- [x] 3.2 Add positives for mod/package test value imports, type-only imports,
  namespace imports, side-effect imports, named re-exports, export-star,
  `ops/<tail>`, `rules`, `strategies`, and `types.js` deep sources.
- [x] 3.3 Add controls for domain root, `/ops`, `/ops/index.js`, `/config.js`,
  recipe source paths, harness test paths, source strings, and dynamic imports.
- [x] 3.4 Run native Grit fixture proof and record
  `DDIT-NATIVE-FIXTURES-2026-06-15`.

## 4. Parser Inventory

- [x] 4.1 Run deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/test` and `packages/*/test`.
- [x] 4.2 Record scan roots, exclusions, current-predicate files, import/export
  classes, dynamic/source-string context, public controls, candidate counts,
  row id, and non-claims.
- [x] 4.3 Record `DDIT-TEST-IMPORT-INVENTORY-2026-06-15`.

## 5. Shared Proof And Baseline

- [x] 5.1 Register active Habitat Grit rule metadata for
  `grit-domain-deep-import-tests`.
- [x] 5.2 Add explicit empty baseline file.
- [x] 5.3 Add injected-probe metadata for the intended injected proof surface.
- [x] 5.4 Prove Habitat wrapper/current-tree projection over the owned
  mod/package test roots and injected mirrors after the HR adapter projection
  repair landed downstack; `DDIT-PER-RULE-SELECTOR-2026-06-17` and
  `DDIT-HABITAT-GRIT-TOOL-2026-06-17` both pass with zero diagnostics.
- [ ] 5.5 Run or consume accepted raw direct Grit acquisition proof for this
  row; raw remains `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`.
- [x] 5.6 Record explicit empty baseline file/integrity proof for this row.
- [x] 5.7 Run registered injected probe/path-control proof after the narrow
  adapter scan-root/ignore projection repair; `DDIT-INJECTED-PROBE-2026-06-17`
  passes with one DDIT diagnostic, a clean control path, and clean cleanup.

## 6. Downstream Realignment

- [x] 6.1 Update the aggregate Grit proof matrix for this row.
- [x] 6.2 Update the Grit pattern corpus ledger for this row.
- [x] 6.3 Update the command proof log for this row.
- [x] 6.4 Preserve non-claims for dynamic imports, source strings, raw
  acquisition, package export-map closure, classify/generator behavior,
  retired parity, apply safety, broader domain-refactor closure, and product
  proof.

## 7. Verification

- [x] 7.1 `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter domain_deep_import_tests --json`
- [x] 7.2 Deterministic TypeScript parser inventory over mod/package test roots.
- [x] 7.3 `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --json`
- [x] 7.4 `bun run habitat:check -- --json --rule grit-domain-deep-import-tests`
  as DDIT-owned test-root projection proof. Current command exits 0, selects
  exactly DDIT plus `baseline-integrity`, and reports zero diagnostics.
- [x] 7.5 `bun run habitat:check -- --json --tool grit-check` as aggregate
  Grit wrapper proof. Current command exits 0 with DDIT included in the 31-rule
  Grit set plus `baseline-integrity`, all passing.
- [x] 7.6 Deterministic baseline inventory over Grit rules and baselines.
- [x] 7.7 `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
  passes 31/31 rows after the HR adapter projection repair, with DDIT reporting
  one diagnostic at the injected test path and a clean public-surface control.
- [x] 7.8 Source remediation type/build or targeted check proof.
- [x] 7.9 `bun run openspec -- validate habitat-grit-proof-domain-deep-import-tests --strict`
- [x] 7.10 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 7.11 `bun run openspec:validate`
- [x] 7.12 `git diff --check`
- [x] 7.13 `git ls-files --deleted`
- [x] 7.14 Commit via Graphite with clean worktree as full active-row closure
  for DDIT wrapper/current-tree and injected violation/path-control projection,
  while preserving raw acquisition, dynamic/source-string, apply, and
  product/runtime non-claims.
