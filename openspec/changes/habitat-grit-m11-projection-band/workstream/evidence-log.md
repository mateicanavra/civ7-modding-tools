# Evidence Log - M11 Projection Band Wrapped-Test

## `M11-NX-TARGET-2026-06-16`

- Proof class: package-owned Nx target / wrapped-test owner proof.
- Command:
  `nx run mod-swooper-maps:test:architecture-m11-projection-band --outputStyle=static --skip-nx-cache`
- Exit status: 0.
- Result: Nx ran the architecture M11 projection-band target and its dependency
  chain; Bun reported 1 passing test, 0 failures, and 1 assertion for
  `test/foundation/m11-projection-boundary-band.test.ts`.
- Boundary: proves current package-owned projection-band regression execution,
  not a Grit rule, source remediation, generated-output freshness, model-wide
  tectonic correctness, or product/runtime proof.

## `M11-TEST-INVENTORY-2026-06-16`

- Proof class: deterministic package-test inventory / record truth.
- Command: inline TypeScript parser inventory over
  `mods/mod-swooper-maps/test/foundation/m11-projection-boundary-band.test.ts`.
- Exit status: 0.
- Result: 1 scanned `.ts` file, 196 lines, 9 import declarations, 0 type-only
  imports, 9 value imports, 0 side-effect imports, 1 `describe` call, 1 `it`
  call, 1 `expect` call, 1 `runTectonicHistoryChain` call, 1
  `computePlatesTensors.run` call, and 0 parse diagnostics.
- Boundary: records current package-test source shape. It does not prove active
  Grit behavior, generated-output freshness, or model-wide correctness beyond
  the executable test assertion.

## `M11-HABITAT-WRAPPED-TEST-2026-06-16`

- Proof class: Habitat wrapped-test per-rule selector/current-tree proof.
- Command:
  `bun run habitat:check -- --json --rule arch-test-m11-projection-band`
- Exit status: 0.
- Result: CheckReport `ok:true`; selected exactly
  `arch-test-m11-projection-band` plus `baseline-integrity`; both passed with
  zero diagnostics.
- Boundary: proves per-rule Habitat wrapper selection for the M11
  projection-band rule, not active Grit behavior.

## `M11-WRAPPED-TEST-AGGREGATE-2026-06-16`

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
  head. The M11 row owns only the projection-band package-test proof; generated
  output freshness is inherited downstack.

## `M11-BASELINE-FILES-2026-06-16`

- Proof class: baseline / record truth.
- Command: deterministic Node inventory over wrapped-test `ownerTool` rule ids
  in `tools/habitat-harness/src/rules/rules.json` and baseline files under
  `tools/habitat-harness/baselines`.
- Exit status: 0.
- Result: 7 wrapped-test rule ids, 7 explicit empty baseline files, no missing
  baselines, no extra `arch-test-*` baselines, no non-empty baselines, and
  `arch-test-m11-projection-band` included.

## Non-Claims

- No active Grit rule, native Grit fixture, Grit baseline, or injected Grit
  probe.
- No source remediation.
- No generated-output freshness ownership.
- No full Foundation topology closure or model-wide tectonic correctness proof.
- No classify/generator behavior, apply safety, hook/CI proof, retired parity,
  or product/runtime proof.
