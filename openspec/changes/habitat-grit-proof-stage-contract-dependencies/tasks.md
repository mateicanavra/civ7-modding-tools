## 1. Design And Authority

- [x] 1.1 Open the per-row packet before closure claims.
- [x] 1.2 Confirm corpus ledger, recovery reference, stage/step authoring docs,
  step contract type surface, artifact guard context, and registration surfaces.
- [x] 1.3 Define proof classes and non-claims.

## 2. Native Fixture Proof

- [x] 2.1 Add `stage_contract_dependencies` pattern.
- [x] 2.2 Add positives for direct `requires`, direct `provides`, and multiline
  top-level dependency arrays.
- [x] 2.3 Add controls for typed dependency constants, typed artifact contract
  references, artifact literal arrays under `artifacts.*`, helper objects
  outside `defineStep`, source strings, non-contract files, `.tsx`, and other
  mods.
- [x] 2.4 Run native Grit fixture proof and record
  `STCD-NATIVE-FIXTURES-2026-06-15`.

## 3. Parser Inventory

- [x] 3.1 Run deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/recipes/standard/stages`.
- [x] 3.2 Record scan root, exclusions, current-predicate files, array classes,
  candidate counts, controls, and non-claims.
- [x] 3.3 Record `STCD-STAGE-CONTRACT-INVENTORY-2026-06-15`.

## 4. Shared Proof And Baseline

- [x] 4.1 Register active Habitat Grit rule metadata for
  `grit-stage-contract-dependencies`.
- [x] 4.2 Add explicit empty baseline file.
- [x] 4.3 Add injected-probe metadata for the accepted injected proof surface.
- [x] 4.4 Run Habitat wrapper/current-tree proof for the current row.
- [ ] 4.5 Run or consume accepted raw direct Grit acquisition proof for this
  row; raw remains `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`.
- [x] 4.6 Record explicit empty baseline file/integrity proof for this row.
- [x] 4.7 Run registered injected probe/path-control proof for this row.

## 5. Downstream Realignment

- [x] 5.1 Update the aggregate Grit proof matrix for this row.
- [x] 5.2 Update the Grit pattern corpus ledger for this row.
- [x] 5.3 Update the command proof log for this row.
- [x] 5.4 Preserve non-claims for raw acquisition, artifact dependency
  enforcement, semantic DAG validation, generated artifact parity, source
  remediation, classify/generator behavior, retired parity, apply safety,
  broader recipe architecture closure, and product proof.

## 6. Verification

- [x] 6.1 `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter stage_contract_dependencies --json`
- [x] 6.2 Deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/recipes/standard/stages`
- [x] 6.3 `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --json`
- [x] 6.4 `bun run habitat:check -- --json --rule grit-stage-contract-dependencies`
- [x] 6.5 `bun run habitat:check -- --json --tool grit-check`
- [x] 6.6 Deterministic baseline inventory over Grit rules and baselines
- [x] 6.7 `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- [x] 6.8 `bun run openspec -- validate habitat-grit-proof-stage-contract-dependencies --strict`
- [x] 6.9 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 6.10 `bun run openspec:validate`
- [x] 6.11 `git diff --check`
- [x] 6.12 `git ls-files --deleted`
- [x] 6.13 Commit via Graphite with clean worktree.
