# Source Synthesis - Shim Cutover Terms

## Authority

`docs/projects/habitat-harness/invariant-corpus.md` classifies
`cutover-tests (x4)` as package tests with disposition `keep-as-test`.

`tools/habitat-harness/src/rules/rules.json` already registers
`arch-test-cutover` as an enforced `wrapped-test` rule with detect command
`nx run mod-swooper-maps:test:architecture-cutover --outputStyle=static`.
`mods/mod-swooper-maps/package.json` exposes that target and script.

## Test Surface

`mods/mod-swooper-maps/test/pipeline/no-shim-surfaces.test.ts` scans
`src/domain`, `src/recipes/standard`, and `src/maps` `.ts`/`.json` files. It
reports shim, shadow, dual-path, compare/comparison, compatibility bridge/shim,
and transitional bridge/shim term families in runtime source.

`mods/mod-swooper-maps/test/pipeline/no-dual-contract-paths.test.ts` checks
legacy stage names and dual legacy/target path pairs. `foundation-topology-lock`
checks the standard stage topology and legacy aliases.
`no-op-calls-op-tectonics.test.ts` checks foundation op entrypoints for sibling
op runtime imports, domain ops barrel imports, `ops.bind`, and `runValidated`.

## Disposition

The candidate is resolved as a wrapped-test proof checkpoint. Adding an active
Grit keyword rule would duplicate the wrong owner layer and could over-enforce
historical or documentation vocabulary without the exact structural context
owned by the package tests.

## Current Evidence

- The package-owned Nx target passes.
- Habitat per-rule wrapper selection for `arch-test-cutover` passes.
- Historical aggregate `wrapped-test` evidence included the cutover rule as
  passing while map-bundle freshness was still red; current aggregate health is
  inherited from the accepted map-bundle/downstack freshness repair.
- The no-shim runtime source inventory finds 0 current term hits in the owning
  roots.
- The explicit empty Habitat baseline for `arch-test-cutover` exists.

## Non-Claims

No active Grit rule, Grit baseline, injected Grit probe, source remediation,
natural-language documentation keyword enforcement, Swooper generated map
freshness repair ownership, classify/generator behavior,
apply safety, retired parity, or product/runtime proof is claimed.
