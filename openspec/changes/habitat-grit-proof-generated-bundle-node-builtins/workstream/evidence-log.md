# Evidence Log - Generated Bundle Node Builtins

## GBNB-BUNDLE-INVENTORY-2026-06-15

Proof class: deterministic generated-bundle inventory / current-source scan.

Scan roots:

- `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- present files under `mods/mod-swooper-maps/mod/maps/*.js`

Current inventory:

- 1 tracked Intelligence Bridge UI bundle scanned.
- 6 present Swooper map bundle files scanned.
- 0 Node builtin import/require/dynamic-import source matches across scanned
  files.
- 0 direct-control/runtime transport token matches across scanned files.
- `mods/mod-swooper-maps/mod/swooper-maps.modinfo` lists
  `maps/studio-current.js`, but the ignored generated output directory does
  not currently contain that file.

This is scan evidence only. It does not hand-edit generated output, prove
Swooper bundle freshness, prove active Grit behavior, or prove product/runtime
behavior.

## GBNB-IB-BUNDLE-TEST-2026-06-15

Proof class: package-owned Nx generated UI bundle test.

Command:

`nx run mod-civ7-intelligence-bridge:test:architecture-bundle-runtime-imports --outputStyle=static`

Observed final checkpoint result: passed. Nx ran upstream workspace builds
including `@civ7/control-orpc`, this package's `gen:modinfo`,
`build:bundle`, `build`, and `test:architecture-bundle-runtime-imports`.
The target regenerated `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
and the Bun test reported 3 pass, 0 fail, and 18 expect() calls.

## GBNB-HABITAT-WRAPPED-TEST-2026-06-15

Proof class: Habitat wrapped-test rule proof.

Command:

`bun run habitat:check -- --json --rule arch-test-intelligence-bridge-bundle-runtime-imports`

Observed final checkpoint result: passed. Habitat selected exactly
`arch-test-intelligence-bridge-bundle-runtime-imports` plus
`baseline-integrity`; both passed with zero diagnostics. The wrapped-test rule
detect command is the graph-owned Nx target.

## GBNB-BASELINE-FILES-2026-06-15

Proof class: explicit Habitat baseline ownership.

Expected final checkpoint result:
`tools/habitat-harness/baselines/arch-test-intelligence-bridge-bundle-runtime-imports.json`
exists as an explicit empty baseline for the registered wrapped-test rule.
This is not a Grit baseline, source-debt baseline, or generated-output
freshness claim.

Observed baseline inventory: 7 registered `ownerTool=wrapped-test` rule ids,
7 explicit baseline files containing `[]`, no missing baselines, no extra
`arch-test-*` baselines, and no non-empty wrapped-test baselines.

## GBNB-GRAPH-TARGET-REPAIR-2026-06-15

Proof class: graph-owned generated-bundle target repair.

The first graph-owned proof attempt correctly exposed a dependency freshness
gap: this package's `build:bundle` cleaned the generated UI bundle and failed
while resolving `@civ7/control-orpc/game-ui` because the dependency output was
not built. The row repair added upstream workspace builds to this package's
`build:bundle` dependency chain. The corrected Nx target then regenerated the
tracked bundle and left it present without a tracked generated-output diff.

## GBNB-SWOOPER-FRESHNESS-BLOCKER-2026-06-15

Proof class: generated-output freshness blocker.

Command:

`bun test mods/mod-swooper-maps/test/build/map-bundle-runtime-imports.test.ts`

Observed result during row discovery: failed because the manifest lists
`maps/studio-current.js` while the ignored generated map output directory does
not contain that script. Existing Swooper map bundle wrapped-test ownership
remains active, but this row does not repair that generated-output freshness
gap.

Aggregate wrapped-test result after the Intelligence Bridge rule was added:
`arch-test-intelligence-bridge-bundle-runtime-imports` passed and
`baseline-integrity` passed, but aggregate `wrapped-test` exited 1 because the
existing Swooper map bundle rule still cannot read the missing ignored
`maps/studio-current.js` output.
