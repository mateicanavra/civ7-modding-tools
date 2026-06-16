## Why

`habitat-grit-generated-bundle-node-builtins` turns the generated-bundle safety
candidate into executable Habitat proof without forcing Grit over generated
outputs. Civ7 loads generated game UI and map bundles directly; those bundles
must not carry Node builtin imports or direct-control/runtime transport code
that belongs in package/server/control owner layers.

This checkpoint owns the row-specific generated-bundle test hardening,
Habitat wrapped-test registration, current bundle inventory, and record truth
for the Intelligence Bridge UI bundle. Historical Swooper map bundle freshness
failure evidence is superseded by the accepted map-bundle/downstack freshness
repair; this row still does not own that repair.

## Target Authority Refs

- `mods/mod-civ7-intelligence-bridge/AGENTS.md`
- `mods/mod-civ7-intelligence-bridge/test/controller-mod-package.test.ts`
- `mods/mod-swooper-maps/test/build/map-bundle-runtime-imports.test.ts`
- `tools/habitat-harness/src/rules/rules.json`
- `tools/habitat-harness/src/lib/grit.ts`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`

## What Changes

- Harden the Intelligence Bridge generated UI bundle test so it detects
  `node:` sources, bare Node builtin imports/requires/dynamic imports, and
  direct-control/runtime transport tokens.
- Add a package-owned Nx target for the bundle runtime test with this package's
  build chain as a dependency, and make the bundle build depend on upstream
  workspace builds, so generated-bundle proof does not bypass artifact
  freshness.
- Register `arch-test-intelligence-bridge-bundle-runtime-imports` as an
  enforced Habitat wrapped-test rule that runs the graph-owned target.
- Add the explicit empty Habitat baseline required for the new wrapped-test
  registration.
- Record current generated-bundle inventory for the tracked Intelligence
  Bridge UI bundle and present Swooper map bundles.
- Record that generated output is not a Grit scan-root owner in this row.
- Keep Swooper map-bundle freshness ownership outside this row.

## What Does Not Change

- No generated output is hand-edited.
- No Swooper map bundle freshness repair ownership is claimed.
- No active Grit check, Grit baseline, injected probe, raw Grit acquisition,
  apply safety, classify/generator behavior, or product/runtime proof is
  claimed.
- No generated-output build pipeline, mod deployment, or Civ7 live run is
  changed.

## Owner Boundary

This workstream owns the generated-bundle wrapped-test proof records and the
Intelligence Bridge test hardening needed to make the current bundle safety
claim executable through Habitat.

This workstream does not own generated map output freshness, Swooper map build
pipeline repair, generated-output hand edits, Grit adapter scan-root policy,
or live Civ7 product proof.

## Verification Gates

- `nx run mod-civ7-intelligence-bridge:test:architecture-bundle-runtime-imports --outputStyle=static`
- `bun run habitat:check -- --json --rule arch-test-intelligence-bridge-bundle-runtime-imports`
- `bun run habitat:check -- --json --tool wrapped-test`
- Deterministic generated-bundle inventory over Intelligence Bridge and
  present Swooper map bundles
- `bun run openspec -- validate habitat-grit-proof-generated-bundle-node-builtins --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted`
