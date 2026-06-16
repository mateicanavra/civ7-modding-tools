# Design - Generated Bundle Node Builtins Proof

## Frame

### Objective

Make generated-bundle safety executable through the correct owner layer:
Habitat wrapped tests, not Grit scan roots over generated output.

### Product Movement

Civ7 generated bundles are loaded by game runtimes that do not own Node
builtins, direct-control sessions, ORPC transport classes, or server-side
control helpers. Habitat should catch those artifacts as generated-bundle
failures instead of asking future agents to inspect minified/bundled output by
hand.

### Selection

- Candidate id: `habitat-grit-generated-bundle-node-builtins`
- Active Habitat rule: `arch-test-intelligence-bridge-bundle-runtime-imports`
- Owner layer: `wrapped-test`
- Tracked bundle proof root:
  `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- Existing Swooper generated map wrapper:
  `arch-test-map-bundle-runtime-imports`
- Non-owner for this row: generated-output Grit scan roots

### Hard Core

1. Generated outputs are scanned as evidence, not hand-edited proof targets.
2. Grit scan-root validation rejects generated roots; this row must not
   register a `grit-check` rule over generated output.
3. The tracked Intelligence Bridge UI bundle is currently enforceable through
   a package-owned Nx target and Habitat wrapped-test registration. The target
   depends on this package's build chain so the generated bundle is refreshed
   before the test reads it, with upstream workspace builds available before
   the bundle resolves workspace package exports.
4. Swooper map bundle freshness is already an executable wrapped-test concern,
   but this checkout is missing a manifest-listed ignored output file and this
   row does not repair that generated-output freshness gap.
5. Native Grit fixture proof, Grit baselines, injected probes, apply safety,
   classify/generator behavior, and product/runtime proof are non-claims.
6. The registered wrapped-test rule still requires an explicit empty Habitat
   baseline file.

### Exterior

- Generated map output rebuilds.
- Generated-output hand edits.
- Grit adapter scan-root policy changes.
- DDIT adapter activation repair.
- Live Civ7 deployment or runtime proof.
- Broad bundle-size or dependency-policy closure.

### Falsifier

This checkpoint fails if the Intelligence Bridge wrapped-test rule is not
selectable by Habitat, if the tracked generated UI bundle contains Node builtin
imports or direct-control/runtime transport tokens, if records claim Swooper
map bundle freshness is repaired, or if the row claims generated-output Grit
closure.

## Source Synthesis

`mods/mod-civ7-intelligence-bridge/AGENTS.md` defines the package as a thin
game-scoped UI mod and states that `mod/` is generated deployable Civ7 output
owned by package scripts. Its package test file already asserts that the
generated UI bundle avoids direct-control and transport code. This row hardens
that test
so it derives the forbidden module-source set from the runtime builtin module
list and catches `node:` sources, bare Node builtin sources, static
named/default imports, static side-effect imports, `require(...)`, and dynamic
import forms. The executable proof is exposed as
`mod-civ7-intelligence-bridge:test:architecture-bundle-runtime-imports`, whose
Nx target depends on `build`; this package's `build` target depends on
`build:bundle`, which depends on `gen:modinfo` and upstream workspace builds.

`mods/mod-swooper-maps/test/build/map-bundle-runtime-imports.test.ts` is the
existing wrapped-test owner for Swooper generated map bundle self-containment.
Current disk evidence shows that test fails before a Node-builtin assertion can
serve as row closure because `mods/mod-swooper-maps/mod/swooper-maps.modinfo`
lists `maps/studio-current.js` while the ignored generated output directory
lacks that file. This checkpoint records that as a generated-output freshness
blocker rather than hiding it behind a Grit rule or generated-file edit.

`tools/habitat-harness/src/lib/grit.ts` rejects generated roots as Grit scan
roots, so this row uses `wrapped-test` owner behavior.

## Fixture And Inventory Matrix

| Class | Expected behavior |
| --- | --- |
| Tracked Intelligence Bridge UI bundle has Node builtin static import, side-effect import, require, or dynamic import | Package-owned Nx target and Habitat wrapped-test report |
| Tracked Intelligence Bridge UI bundle has direct-control/runtime transport tokens | Package-owned Nx target and Habitat wrapped-test report |
| Tracked Intelligence Bridge UI bundle is browser/game-runtime safe | Package-owned Nx target and Habitat wrapped-test pass |
| Present Swooper generated map bundles have no current Node/runtime token matches | Parser/file inventory records zero token matches |
| Manifest-listed Swooper map output is missing from ignored generated directory | Existing map bundle wrapped-test remains blocked |
| Generated output under ignored map bundle directory | Scan evidence only; not committed as a hand-edit target |

## Proof Contract

This row checkpoint may record:

- `GBNB-IB-BUNDLE-TEST-2026-06-15`: package-owned Nx target proof for the
  Intelligence Bridge bundle test, including this package's generated-bundle
  freshness dependency and upstream workspace build dependency.
- `GBNB-HABITAT-WRAPPED-TEST-2026-06-15`: Habitat per-rule wrapped-test
  proof for the Intelligence Bridge bundle rule.
- `GBNB-BASELINE-FILES-2026-06-15`: explicit empty Habitat baseline for the
  wrapped-test registration.
- `GBNB-BUNDLE-INVENTORY-2026-06-15`: deterministic generated-bundle inventory
  over the tracked Intelligence Bridge bundle and present Swooper map bundles.
- `GBNB-SWOOPER-FRESHNESS-BLOCKER-2026-06-15`: current Swooper generated map
  freshness blocker evidence.

This row checkpoint must not record:

- active Grit rule closure;
- generated-output hand-edit proof;
- Swooper map bundle freshness repair;
- Grit baseline or injected-probe proof;
- raw direct Grit acquisition;
- apply/codemod safety;
- classify/generator behavior;
- product/runtime proof.
