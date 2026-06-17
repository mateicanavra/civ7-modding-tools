## Why

`habitat-grit-map-bundle-runtime-imports` records the executable owner for the
Swooper generated map bundle runtime-import guard. Civ7 loads the generated map
scripts directly, so the guard must run through a package-owned target that
first produces the bundle output it inspects.

The active Habitat rule already belongs to the `wrapped-test` owner layer. This
checkpoint makes that owner boundary graph-owned through Nx, then records the
current package target, Habitat selector, aggregate wrapped-test, baseline, and
inventory proof. It is not a candidate for an active Grit scan over generated
outputs.

## Target Authority Refs

- `tools/habitat-harness/src/rules/rules.json`
- `mods/mod-swooper-maps/AGENTS.md`
- `mods/mod-swooper-maps/package.json`
- `mods/mod-swooper-maps/test/build/map-bundle-runtime-imports.test.ts`
- accepted downstack generated-output freshness/enforcement repair
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`

## What Changes

- Add `mod-swooper-maps:test:architecture-map-bundle-runtime-imports` as the
  package-owned Nx target for the existing bundle runtime-import test.
- Route `arch-test-map-bundle-runtime-imports` through that Nx target instead
  of a raw `bun test` file command.
- Record deterministic bundle/test inventory, package-owned Nx target proof,
  Habitat per-rule wrapper proof, aggregate wrapped-test proof, baseline
  ownership, and downstream aggregate proof records.

## What Does Not Change

- No active Grit check is registered for generated map bundles.
- No native Grit fixture, Grit baseline, or injected Grit probe is added.
- No generated output is hand-edited.
- No source remediation is claimed.
- No broad generated-output freshness ownership, apply safety,
  classify/generator behavior, hook/CI, or product/runtime proof is claimed.

## Owner Boundary

This workstream owns the Habitat wrapped-test proof record and graph-owned
target registration for the Swooper map bundle runtime-import guard. It consumes
the accepted downstack generated-output freshness/enforcement repair as current
context, but it does not own that broader repair.

## Verification Gates

- `nx run mod-swooper-maps:test:architecture-map-bundle-runtime-imports --outputStyle=static --skip-nx-cache`
- `bun run nx run @internal/habitat-harness:build --outputStyle=static --skipNxCache`
- `bun run habitat:check -- --json --rule arch-test-map-bundle-runtime-imports`
- `bun run habitat:check -- --json --tool wrapped-test`
- deterministic map bundle test/source inventory
- deterministic wrapped-test baseline inventory
- `bun run openspec -- validate habitat-grit-map-bundle-runtime-imports --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted`
