# Evidence Log - RNG Authority Static

## `RNG-NX-TARGET-2026-06-15`

- Proof class: package-owned Nx target / wrapped-test owner proof.
- Command:
  `nx run mod-swooper-maps:test:architecture-rng-authority --outputStyle=static`
- Exit status: 0.
- Result: Nx ran the architecture RNG authority target and its dependency
  chain; Bun reported 1 passing test, 0 failures, and 1 assertion for
  `test/pipeline/rng-authority-boundary.test.ts`.
- Boundary: proves current package-owned RNG boundary test execution, not a
  Grit rule, source remediation, or product/runtime proof.

## `RNG-HABITAT-WRAPPED-TEST-2026-06-15`

- Proof class: Habitat wrapped-test per-rule selector/current-tree proof.
- Command:
  `bun run habitat:check -- --json --rule arch-test-rng-authority`
- Exit status: 0.
- Result: CheckReport `ok:true`; selected exactly `arch-test-rng-authority`
  plus `baseline-integrity`; both passed with zero diagnostics.
- Boundary: proves per-rule Habitat wrapper selection for the RNG authority
  rule, not aggregate wrapped-test closure or Grit behavior.

## `RNG-WRAPPED-TEST-AGGREGATE-2026-06-15`

- Proof class: historical aggregate wrapped-test blocker separation.
- Command:
  `bun run habitat:check -- --json --tool wrapped-test`
- Exit status: 1.
- Historical result: `arch-test-rng-authority` passed with zero diagnostics;
  aggregate wrapped-test was red because `arch-test-map-bundle-runtime-imports`
  failed on missing generated map output.
- Current disposition: this historical red state is superseded by the accepted
  map-bundle/downstack freshness repair. The RNG row still owns only its package
  target and Habitat per-rule proof.
- Boundary: records that RNG authority was clean inside the historical
  aggregate report and that generated-output freshness is owned outside this
  row.

## `RNG-BASELINE-FILES-2026-06-15`

- Proof class: baseline / record truth.
- Command: deterministic Node inventory over wrapped-test `ownerTool` rule ids
  in `tools/habitat-harness/src/rules/rules.json` and baseline files under
  `tools/habitat-harness/baselines`.
- Exit status: 0.
- Result: 7 wrapped-test rule ids, 7 explicit empty baseline files, no missing
  baselines, no extra `arch-test-*` baselines, no non-empty baselines, and
  `arch-test-rng-authority` included.

## Non-Claims

- No active Grit rule, native Grit fixture, Grit baseline, or injected Grit
  probe.
- No source remediation.
- No Swooper map bundle freshness repair ownership.
- No classify/generator behavior, apply safety, retired parity, or
  product/runtime proof.
