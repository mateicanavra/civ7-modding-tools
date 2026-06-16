# Source Synthesis - Generated Bundle Node Builtins

## Authority

- `mods/mod-civ7-intelligence-bridge/AGENTS.md` defines the package as a
  game-scoped UI bridge and says `mod/` is generated deployable Civ7 output.
- `mods/mod-civ7-intelligence-bridge/test/controller-mod-package.test.ts`
  owns local bundle assertions for the generated UI script.
- `mods/mod-civ7-intelligence-bridge/package.json` owns the package Nx target
  and build dependency chain for generated-bundle and upstream workspace
  export freshness.
- `mods/mod-swooper-maps/test/build/map-bundle-runtime-imports.test.ts` owns
  Swooper generated map bundle self-containment.
- `tools/habitat-harness/src/lib/grit.ts` rejects generated roots as Grit scan
  roots.
- `tools/habitat-harness/src/rules/rules.json` already models generated bundle
  proof through `wrapped-test` and file-layer owners.

## Current Corpus

The tracked Intelligence Bridge generated UI bundle exists and currently has no
Node builtin source imports, Node builtin `require(...)` calls, Node builtin
dynamic imports, direct-control package tokens, or runtime transport tokens in
the row scan.

The Swooper generated map output directory is ignored by Git. Six generated
map scripts exist locally and have no current row token matches, but the
Swooper mod manifest lists `maps/studio-current.js` and the ignored generated
output directory lacks that file. That prevents Swooper map bundle closure in
this row.

## Owner Decision

Generated-bundle runtime safety is not a Grit scan-root row in this checkpoint.
The executable owner is Habitat wrapped-test registration over a package-owned
Nx target that refreshes this package's generated bundle through the build
chain, with upstream workspace builds available before bundling, before
inspecting it.

## Non-Claims

- No generated output hand edit.
- No active Grit rule, Grit baseline, or injected Grit probe.
- The new wrapped-test rule has an explicit empty Habitat baseline.
- No Swooper map bundle freshness repair.
- No generated-output build pipeline repair.
- No apply safety, classify/generator behavior, or product/runtime proof.
