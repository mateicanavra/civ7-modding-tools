# Evidence Log - Ecology Step Imports Wrapped-Test

## `ECOSTEP-NX-TARGET-2026-06-16`

- Proof class: package-owned Nx target / wrapped-test owner proof.
- Command:
  `nx run mod-swooper-maps:test:architecture-ecology-step-imports --outputStyle=static`
- Exit status: 0.
- Result: Nx ran the architecture ecology-step-imports target and its
  dependency chain; Bun reported 3 passing tests, 0 failures, and 3 assertions
  for `test/ecology/ecology-step-import-guardrails.test.ts`.
- Boundary: proves current package-owned ecology step import/topology boundary
  execution, not a Grit rule, source remediation, generated-output freshness, or
  product/runtime proof.

## `ECOSTEP-SOURCE-INVENTORY-2026-06-16`

- Proof class: deterministic source inventory / record truth.
- Command: inline TypeScript parser inventory over active ecology stage roots:
  `ecology-biomes`, `ecology-features`, `ecology-pedology`, and `map-ecology`.
- Exit status: 0.
- Result: 44 scanned `.ts` files, 0 `.tsx`, 0 `.json`, 189 import
  declarations, 16 type-only imports, 173 value imports, 0 side-effect imports,
  0 export-from declarations, 30 public `@mapgen/domain/ecology` root
  references, 0 public `/ops` references, 0 forbidden ecology ops/rules import
  findings, 0 forbidden ecology ops/rules export findings, 0 dynamic imports, 0
  ecology ops/rules source strings, 0 parse diagnostics, and no retired ecology
  topology directories present.
- Boundary: records current source state for the wrapped-test predicate. It
  does not prove dynamic import closure, source-string closure, Grit behavior,
  or broader domain import normalization.

## `ECOSTEP-HABITAT-WRAPPED-TEST-2026-06-16`

- Proof class: Habitat wrapped-test per-rule selector/current-tree proof.
- Command:
  `bun run habitat:check -- --json --rule arch-test-ecology-step-imports`
- Exit status: 0.
- Result: CheckReport `ok:true`; selected exactly
  `arch-test-ecology-step-imports` plus `baseline-integrity`; both passed with
  zero diagnostics.
- Boundary: proves per-rule Habitat wrapper selection for the ecology step
  imports rule, not aggregate wrapped-test closure or Grit behavior.

## `ECOSTEP-WRAPPED-TEST-AGGREGATE-2026-06-16`

- Proof class: aggregate wrapped-test current-state proof.
- Command:
  `bun run habitat:check -- --json --tool wrapped-test`
- Exit status: 0.
- Result: CheckReport `ok:true`; `arch-test-core-purity`,
  `arch-test-rng-authority`, `arch-test-ecology-step-imports`,
  `arch-test-m11-projection-band`, `arch-test-map-bundle-runtime-imports`,
  `arch-test-intelligence-bridge-bundle-runtime-imports`,
  `arch-test-cutover`, and `baseline-integrity` all passed with zero
  diagnostics.
- Boundary: records current aggregate wrapped-test health from the corrected HG
  head. The ecology row owns only the ecology import/topology test repair; the
  generated-output freshness needed by the map-bundle rule is inherited
  downstack.

## `ECOSTEP-BASELINE-FILES-2026-06-16`

- Proof class: baseline / record truth.
- Command: deterministic Node inventory over wrapped-test `ownerTool` rule ids
  in `tools/habitat-harness/src/rules/rules.json` and baseline files under
  `tools/habitat-harness/baselines`.
- Exit status: 0.
- Result: 7 wrapped-test rule ids, 7 explicit empty baseline files, no missing
  baselines, no extra `arch-test-*` baselines, no non-empty baselines, and
  `arch-test-ecology-step-imports` included.

## Non-Claims

- No active Grit rule, native Grit fixture, Grit baseline, or injected Grit
  probe.
- No source remediation.
- No dynamic import, source-string, export-map, or broad domain import
  normalization closure.
- No ecology-owned generated-output freshness repair.
- No classify/generator behavior, apply safety, retired parity, or
  product/runtime proof.
