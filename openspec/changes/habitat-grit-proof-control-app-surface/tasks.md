## 1. Design And Authority

- [x] 1.1 Open the per-row packet before closure claims.
- [x] 1.2 Confirm game-door invariant, direct-control architecture, Habitat
  taxonomy, current guard test, corpus ledger, and registration surfaces.
- [x] 1.3 Define proof classes and non-claims.

## 2. Native Fixture Proof

- [x] 2.1 Add `control_app_surface` pattern.
- [x] 2.2 Add positives for app feature/server, package CLI/server/control,
  and `.tsx` direct `Civ7DirectControlSession` construction.
- [x] 2.3 Add controls for sanctioned owner files, tests, tools, identifier
  references, source strings, and wrapper/helper calls.
- [x] 2.4 Run native Grit fixture proof and record
  `CAS-NATIVE-FIXTURES-2026-06-15`.

## 3. Parser Inventory

- [x] 3.1 Run deterministic TypeScript parser inventory over `apps` and
  `packages`.
- [x] 3.2 Record current-predicate scan roots, exclusions, counts, zero
  current candidates, controls, and non-claims.
- [x] 3.3 Record `CAS-CONTROL-SURFACE-INVENTORY-2026-06-15`.

## 4. Shared Proof And Baseline

- [x] 4.1 Register active Habitat Grit rule metadata for
  `grit-control-app-surface`.
- [x] 4.2 Add explicit empty baseline file.
- [x] 4.3 Add injected-probe metadata for the CAS row.
- [x] 4.4 Record current Habitat wrapper/current-tree proof for CAS through
  `CAS-HABITAT-GRIT-TOOL-2026-06-15` and
  `CAS-PER-RULE-SELECTOR-2026-06-15`.
- [ ] 4.5 Run or consume accepted raw direct Grit acquisition proof for this
  row; raw remains `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`.
- [x] 4.6 Record explicit empty baseline inventory for this row through
  `CAS-BASELINE-FILES-2026-06-15`.
- [x] 4.7 Record CAS-only injected probe/path-control proof through
  `CAS-INJECTED-PROBE-2026-06-15`.
- [ ] 4.8 Full shared injected-probe corpus closure remains blocked by DDIT
  adapter scan-root/ignore activation, not by CAS.

## 5. Downstream Realignment

- [x] 5.1 Update the aggregate Grit proof matrix for this row.
- [x] 5.2 Update the Grit pattern corpus ledger for this row.
- [x] 5.3 Update the command proof log for this row.
- [x] 5.4 Preserve non-claims for raw acquisition, broad direct-control import
  policy, DDIT adapter activation, control-oRPC contract ownership, source
  remediation, classify/generator behavior, apply safety, and product proof.

## 6. Verification

- [x] 6.1 `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter control_app_surface --json`
- [x] 6.2 Deterministic TypeScript parser inventory over `apps` and `packages`
- [x] 6.3 `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --json`
- [x] 6.4 `bun run habitat:check -- --json --rule grit-control-app-surface`
- [x] 6.5 `bun run habitat:check -- --json --tool grit-check`
- [x] 6.6 Deterministic baseline inventory over Grit rules and baselines
- [x] 6.7 CAS-only injected proof through the accepted harness API from a clean
  start
- [x] 6.8 `bun run openspec -- validate habitat-grit-proof-control-app-surface --strict`
- [x] 6.9 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 6.10 `bun run openspec:validate`
- [x] 6.11 `git diff --check`
- [x] 6.12 `git ls-files --deleted`
- [x] 6.13 Commit via Graphite with clean worktree.
