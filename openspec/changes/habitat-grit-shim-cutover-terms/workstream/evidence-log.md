# Evidence Log - Shim Cutover Terms

## `SCT-NX-TARGET-2026-06-15`

- Proof class: package-owned Nx target / wrapped-test owner proof.
- Command:
  `nx run mod-swooper-maps:test:architecture-cutover --outputStyle=static`
- Exit status: 0.
- Result: Nx ran the architecture cutover target and its dependency chain; Bun
  reported 6 passing tests, 0 failures, and 8,150 assertions across the four
  cutover test files.
- Boundary: proves current package-owned cutover target execution, not a Grit
  rule, source remediation, broad documentation keyword enforcement, or
  product/runtime proof.

## `SCT-HABITAT-WRAPPED-TEST-2026-06-15`

- Proof class: Habitat wrapped-test per-rule selector/current-tree proof.
- Command:
  `bun run habitat:check -- --json --rule arch-test-cutover`
- Exit status: 0.
- Result: CheckReport `ok:true`; selected exactly `arch-test-cutover` plus
  `baseline-integrity`; both passed with zero diagnostics.
- Boundary: proves per-rule Habitat wrapper selection for the cutover rule,
  not aggregate wrapped-test closure or Grit behavior.

## `SCT-WRAPPED-TEST-AGGREGATE-2026-06-15`

- Proof class: aggregate wrapped-test blocker separation.
- Command:
  `bun run habitat:check -- --json --tool wrapped-test`
- Exit status: 1.
- Result: `arch-test-cutover` passed with zero diagnostics; aggregate
  wrapped-test remained current-red because `arch-test-map-bundle-runtime-imports`
  failed on missing ignored generated output
  `mods/mod-swooper-maps/mod/maps/studio-current.js`.
- Boundary: records that cutover is clean inside the aggregate report and that
  the aggregate blocker belongs to separate Swooper generated-output freshness
  work.

## `SCT-SHIM-INVENTORY-2026-06-15`

- Proof class: deterministic source inventory / record truth.
- Command: inline Node inventory over `mods/mod-swooper-maps/src/domain`,
  `mods/mod-swooper-maps/src/recipes/standard`, and
  `mods/mod-swooper-maps/src/maps`, using the term regexes from
  `no-shim-surfaces.test.ts` and `.ts`/`.json` files only.
- Exit status: 0.
- Result: 904 scanned files; 898 `.ts`; 6 `.json`; root counts were 664
  domain files, 221 standard recipe files, and 19 maps files. The inventory
  applied 9 forbidden term patterns and found 0 hits.
- Boundary: proves the current source roots covered by the no-shim test have
  no term hits; it does not prove documentation keyword enforcement or source
  outside those roots.

## `SCT-BASELINE-FILES-2026-06-15`

- Proof class: baseline / record truth.
- Command: deterministic Node inventory over wrapped-test `ownerTool` rule ids
  in `tools/habitat-harness/src/rules/rules.json` and baseline files under
  `tools/habitat-harness/baselines`.
- Exit status: 0.
- Result: 7 wrapped-test rule ids, 7 explicit empty baseline files, no missing
  baselines, no extra `arch-test-*` baselines, no non-empty baselines, and
  `arch-test-cutover` included.

## Non-Claims

- No active Grit rule, native Grit fixture, Grit baseline, or injected Grit
  probe.
- No source remediation or broad documentation keyword enforcement.
- No Swooper map bundle freshness repair or aggregate wrapped-test closure.
- No classify/generator behavior, apply safety, retired parity, or
  product/runtime proof.
