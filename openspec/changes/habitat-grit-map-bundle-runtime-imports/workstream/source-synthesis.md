# Source Synthesis - Map Bundle Runtime Imports Wrapped-Test

## Authority

`tools/habitat-harness/src/rules/rules.json` registers
`arch-test-map-bundle-runtime-imports` as an enforced `wrapped-test` rule for
Swooper generated map bundle output under `mods/mod-swooper-maps/mod/**`.

`mods/mod-swooper-maps/package.json` now exposes
`test:architecture-map-bundle-runtime-imports` as the package target for
`test/build/map-bundle-runtime-imports.test.ts`. The target depends on
`build`, and `build` depends on `gen:maps`, so the package-owned proof path
regenerates the map artifacts before the test reads them.

`mods/mod-swooper-maps/AGENTS.md` treats `mod/` as generated build output and
requires regeneration through package scripts rather than hand editing.

## Test Surface

`mods/mod-swooper-maps/test/build/map-bundle-runtime-imports.test.ts` checks the
generated map bundle envelope that Civ7 loads:

- every manifest-listed `maps/*.js` script is present under `mod/maps`;
- generated scripts do not retain bare workspace package imports or exports;
- generated scripts install the Civ7 TextEncoder bootstrap before creating a
  `TextEncoder`;
- manifest-listed map scripts include authored river materialization markers.

## Disposition

The candidate is resolved as a wrapped-test proof checkpoint. Generated bundle
runtime-import safety depends on generated output and package build ordering,
so the executable owner is the package architecture target selected by Habitat,
not a Grit scan over generated files.

## Current Evidence

- The package-owned Nx target passes with the map-bundle runtime-import package
  test after running the build dependency chain.
- Habitat per-rule wrapper selection for `arch-test-map-bundle-runtime-imports`
  passes.
- Aggregate `wrapped-test` passes from the corrected current HG head: all seven
  wrapped-test rules and `baseline-integrity` are green.
- Inventory found one map-bundle test file, four test cases, six present
  generated map bundles, six manifest-listed map bundles, no missing/extra map
  bundles, and no parse diagnostics.
- The explicit empty Habitat baseline for
  `arch-test-map-bundle-runtime-imports` exists.

## Non-Claims

No active Grit rule, Grit baseline, injected Grit probe, generated-output hand
edit, source remediation, broad generated-output freshness ownership,
classify/generator behavior, apply safety, hook/CI proof, retired parity, or
product/runtime proof is claimed.
