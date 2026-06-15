# Tasks - Ops Bind RunValidated Proof

## 1. Design And Authority

- [x] 1.1 Open the row packet before closure claims.
- [x] 1.2 Confirm the recovery reference, guardrail script, existing
  `runtime_run_validated`, `op_calls_op`, taxonomy, and corpus ledger.
- [x] 1.3 Define overlap and non-claims.

## 2. Native Fixture Proof

- [x] 2.1 Add `ops_bind_runvalidated` fixture positives for direct
  `ops.bind(...)`, direct `runValidated(...)`, nested `runValidated(...)`,
  awaited `ops.bind(...)`, and optional-chain `ops?.bind(...)`.
- [x] 2.2 Add controls for bind/lookalike/property shapes, member
  `runValidated`, strategy path, recipe path, `.tsx`, other mod, test path,
  and source string shapes.
- [x] 2.3 Run native Grit fixture proof and record
  `OBR-NATIVE-FIXTURES-2026-06-15`.

## 3. Parser Inventory

- [x] 3.1 Run deterministic TypeScript parser inventory over Swooper domain
  and recipe roots.
- [x] 3.2 Record current-predicate file counts, call counts, zero current
  candidates, adjacent runtime row overlap, and non-claims.
- [x] 3.3 Record `OBR-DOMAIN-OPS-INVENTORY-2026-06-15`.

## 4. Registration, Baseline, And Injected Proof

- [x] 4.1 Register active Habitat Grit rule metadata.
- [x] 4.2 Add explicit empty baseline file.
- [x] 4.3 Add injected-probe metadata with an entrypoint match and strategy
  control.
- [x] 4.4 Prove Habitat wrapper/current-tree selector behavior for
  `grit-ops-bind-runvalidated`.
- [x] 4.5 Prove explicit baseline file inventory/integrity for this row.
- [x] 4.6 Prove the registered injected finding is unbaselined, reports, and
  cleans up to a clean worktree.
- [x] 4.7 Keep raw direct Grit acquisition unclaimed through
  `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`.

## 5. Downstream Realignment

- [x] 5.1 Update the aggregate Grit proof matrix.
- [x] 5.2 Update the Grit pattern corpus ledger.
- [x] 5.3 Update the command proof log.
- [x] 5.4 Preserve non-claims for raw acquisition, export/dynamic closure,
  source remediation, classify/generator behavior, retired parity, apply
  safety, broader domain-refactor closure, and product proof.

## 6. Verification

- [x] 6.1 `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter ops_bind_runvalidated --json`
- [x] 6.2 Deterministic TypeScript parser inventory over Swooper domain and
  recipe roots.
- [x] 6.3 `bun run habitat:check -- --json --rule grit-ops-bind-runvalidated`
- [x] 6.4 `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- [x] 6.5 `bun run openspec -- validate habitat-grit-proof-ops-bind-runvalidated --strict`
- [x] 6.6 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 6.7 `bun run openspec:validate`
- [x] 6.8 `git diff --check`
- [x] 6.9 `git ls-files --deleted`
- [x] 6.10 Commit via Graphite with clean worktree.
