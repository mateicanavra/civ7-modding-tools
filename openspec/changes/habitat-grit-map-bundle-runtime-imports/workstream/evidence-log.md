# Evidence Log - Map Bundle Runtime Imports Wrapped-Test

## `MAPBUNDLE-NX-TARGET-2026-06-16`

- Proof class: package-owned Nx target / wrapped-test owner proof.
- Command:
  `nx run mod-swooper-maps:test:architecture-map-bundle-runtime-imports --outputStyle=static --skip-nx-cache`
- Exit status: 0.
- Result: Nx ran the architecture map-bundle runtime-import target and 14
  dependency tasks, including `gen:maps`, `build`, and the package test. Bun
  reported 4 passing tests, 0 failures, and 34 assertions for
  `test/build/map-bundle-runtime-imports.test.ts`.
- Boundary: proves current package-owned generated map bundle guard execution
  through the graph-owned target, not an active Grit rule, generated-output
  hand edit, broad generated-output freshness ownership, or product/runtime
  proof.

## `MAPBUNDLE-TEST-INVENTORY-2026-06-16`

- Proof class: deterministic package-test and generated-output envelope
  inventory / record truth.
- Command: inline TypeScript parser and filesystem inventory over
  `mods/mod-swooper-maps/test/build/map-bundle-runtime-imports.test.ts`,
  `mods/mod-swooper-maps/mod/swooper-maps.modinfo`, and
  `mods/mod-swooper-maps/mod/maps/*.js`.
- Exit status: 0.
- Result: 1 scanned `.ts` test file, 97 lines, 3 import declarations, 0
  type-only imports, 3 value imports, 0 side-effect imports, 1 `describe` call,
  4 `test` calls, 8 `expect` call expressions, 4 `readFileSync` calls, 3
  `readdirSync` calls, 2 authored river marker literals, 6 present generated
  map bundles, 6 manifest-listed map bundles, 0 missing manifest bundles, 0
  extra present bundles, and 0 parse diagnostics.
- Boundary: records the current package-test and generated-bundle envelope. It
  does not prove active Grit behavior, generated-output freshness ownership
  beyond this graph-owned target path, or runtime product behavior.

## `MAPBUNDLE-HABITAT-BUILD-2026-06-16`

- Proof class: Habitat harness build / wrapper command surface proof.
- Command:
  `bun run nx run @internal/habitat-harness:build --outputStyle=static --skipNxCache`
- Exit status: 0.
- Result: Nx rebuilt the ignored Habitat harness `dist` and oclif manifest so
  the wrapper command resolved the updated source `rules.json` catalog before
  per-rule and aggregate Habitat checks.
- Boundary: proves current wrapper command surface alignment with the source
  rule catalog, not generated-output freshness, active Grit behavior, source
  remediation, or product/runtime proof.

## `MAPBUNDLE-HABITAT-WRAPPED-TEST-2026-06-16`

- Proof class: Habitat wrapped-test per-rule selector/current-tree proof.
- Setup command:
  `bun run nx run @internal/habitat-harness:build --outputStyle=static --skipNxCache`
- Setup exit status: 0.
- Setup result: rebuilt the ignored Habitat harness `dist` and manifest so the
  wrapper command resolved the updated source rule catalog.
- Command:
  `bun run habitat:check -- --json --rule arch-test-map-bundle-runtime-imports`
- Exit status: 0.
- Result: CheckReport `ok:true`; selected exactly
  `arch-test-map-bundle-runtime-imports` plus `baseline-integrity`; both passed
  with zero diagnostics. The rule detect command is
  `nx run mod-swooper-maps:test:architecture-map-bundle-runtime-imports --outputStyle=static`.
- Boundary: proves per-rule Habitat wrapper selection for the map-bundle rule,
  not active Grit behavior.

## `MAPBUNDLE-WRAPPED-TEST-AGGREGATE-2026-06-16`

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
  head. This row owns only the map-bundle package target and wrapped-test proof;
  broad generated-output freshness is inherited downstack.

## `MAPBUNDLE-BASELINE-FILES-2026-06-16`

- Proof class: baseline / record truth.
- Command: deterministic Node inventory over wrapped-test `ownerTool` rule ids
  in `tools/habitat-harness/src/rules/rules.json` and baseline files under
  `tools/habitat-harness/baselines`.
- Exit status: 0.
- Result: 7 wrapped-test rule ids, 7 explicit empty baseline files, no missing
  baselines, no extra `arch-test-*` baselines, no non-empty baselines, and
  `arch-test-map-bundle-runtime-imports` included.

## Non-Claims

- No active Grit rule, native Grit fixture, Grit baseline, or injected Grit
  probe.
- No generated-output hand edits or source remediation.
- No broad generated-output freshness ownership outside this rule's
  graph-owned proof path.
- No classify/generator behavior, apply safety, hook/CI proof, retired parity,
  or product/runtime proof.
