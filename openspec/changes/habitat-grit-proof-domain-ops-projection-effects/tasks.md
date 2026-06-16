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

- [x] 4.1 Record current Habitat wrapper/current-tree proof through
  `DOPE-PER-RULE-SELECTOR-2026-06-16` and
  `DOPE-HABITAT-GRIT-TOOL-2026-06-16`.
- [ ] 4.2 Run or consume accepted raw direct Grit acquisition proof for this
  row; raw remains `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`.
- [x] 4.3 Record row-specific injected violation/path-control proof through
  `DOPE-INJECTED-PROBE-2026-06-16`; aggregate injected-corpus closure remains
  unclaimed while unrelated DDIT remains blocked.
- [x] 4.4 Record explicit empty baseline ownership through
  `DOPE-BASELINE-FILES-2026-06-16` and wrapper `baseline-integrity`.
- [x] 4.5 Prove a row-specific injected finding is unbaselined and fails.

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
- [x] 6.3 `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --json`
- [x] 6.4 `bun run habitat:check -- --json --rule grit-domain-ops-projection-effects`
- [x] 6.5 `bun run habitat:check -- --json --tool grit-check`
- [x] 6.6 Explicit empty Grit baseline inventory with DOP included.
- [x] 6.7 `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- [x] 6.8 `bun run openspec -- validate habitat-grit-proof-domain-ops-projection-effects --strict`
- [x] 6.9 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 6.10 `bun run openspec:validate`
- [x] 6.11 Stale inherited/pending closure wording scan for this packet and
  aggregate DOP rows.
- [x] 6.12 `git diff --check HEAD^..HEAD`
- [x] 6.13 `git diff --check`
- [x] 6.14 `git ls-files --deleted`
- [x] 6.15 Commit via Graphite with clean worktree
