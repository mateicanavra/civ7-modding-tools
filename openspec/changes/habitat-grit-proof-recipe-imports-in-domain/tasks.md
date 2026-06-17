## 1. Design And Authority

- [x] 1.1 Open the per-row packet before closure claims.
- [x] 1.2 Confirm corpus ledger, taxonomy, invariant corpus, recovery
  reference, mod routers, and current registration surfaces.
- [x] 1.3 Define proof classes and non-claims.

## 2. Native Fixture Proof

- [x] 2.1 Add `recipe_imports_in_domain` pattern and positives for domain
  source recipe imports/re-exports.
- [x] 2.2 Add positives for value, type-only, side-effect, dynamic import,
  alias, named re-export, and export-star classes.
- [x] 2.3 Add controls for public domain imports, domain-relative imports,
  source lookalikes, `.tsx`, other mods, recipes, source strings, and dynamic
  import lookalikes.
- [x] 2.4 Run native Grit fixture proof and record
  `RID-NATIVE-FIXTURES-2026-06-15` plus the dynamic-import repair proof
  `RID-DYNAMIC-NATIVE-FIXTURES-2026-06-16`.

## 3. Parser Inventory

- [x] 3.1 Run deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`.
- [x] 3.2 Record current-predicate scan roots, exclusions, counts, zero
  current candidates, controls, and non-claims.
- [x] 3.3 Record `RID-DOMAIN-INVENTORY-2026-06-15`.

## 4. Shared Proof And Baseline

- [x] 4.1 Register active Habitat Grit rule metadata for
  `grit-recipe-imports-in-domain`.
- [x] 4.2 Add explicit empty baseline file.
- [x] 4.3 Add injected-probe metadata for the accepted shared injected proof
  surface.
- [x] 4.4 Run Habitat wrapper/current-tree proof for the current row.
- [ ] 4.5 Run or consume accepted raw direct Grit acquisition proof for this
  row; raw remains `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`.
- [x] 4.6 Record explicit empty baseline file/integrity proof for this row.
- [x] 4.7 Run registered injected probe/path-control proof for this row.

## 5. Downstream Realignment

- [x] 5.1 Update the aggregate Grit proof matrix for this row.
- [x] 5.2 Update the Grit pattern corpus ledger for this row.
- [x] 5.3 Update the command proof log for this row.
- [x] 5.4 Preserve non-claims for raw acquisition,
  source remediation, classify/generator behavior, retired parity, apply
  safety, broader domain-refactor closure, and product proof.

## 6. Verification

- [x] 6.1 `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter recipe_imports_in_domain --json`
- [x] 6.2 Deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`
- [x] 6.3 `bun run habitat:check -- --json --rule grit-recipe-imports-in-domain`
- [x] 6.4 `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- [x] 6.5 `bun run openspec -- validate habitat-grit-proof-recipe-imports-in-domain --strict`
- [x] 6.6 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 6.7 `bun run openspec:validate`
- [x] 6.8 `git diff --check`
- [x] 6.9 `git ls-files --deleted`
- [x] 6.10 Commit via Graphite with clean worktree.
