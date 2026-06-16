## Why

`habitat-grit-core-purity-wrapped-test` resolves the MapGen core purity
candidate by proving the existing executable owner layer instead of forcing a
duplicate Grit pattern over a source-scan test.

MapGen core must remain pure TypeScript engine code. Civ7 runtime values belong
in the adapter layer, while adapter type references are allowed where they keep
core contracts typed without binding runtime implementation.

## Target Authority Refs

- `tools/habitat-harness/src/rules/rules.json`
- `packages/mapgen-core/AGENTS.md`
- `packages/mapgen-core/src/AGENTS.md`
- `packages/mapgen-core/package.json`
- `packages/mapgen-core/test/architecture/core-purity.test.ts`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`

## What Changes

- Record `arch-test-core-purity` as an already active Habitat wrapped-test rule.
- Prove the package-owned Nx target and Habitat per-rule wrapper path for that
  rule.
- Record current source inventory for the production MapGen core source root.
- Realign the corpus and aggregate proof records so MapGen core purity is
  represented as wrapped-test-owned proof, not as a new Grit check.

## What Does Not Change

- No MapGen core source is remediated.
- No active Grit check is registered for core purity.
- No Grit baseline or injected Grit probe is added.
- No aggregate wrapped-test closure is claimed while the separate Swooper map
  bundle freshness blocker remains current-red.
- No apply safety, classify/generator behavior, retired parity, or
  product/runtime proof is claimed.

## Owner Boundary

This workstream owns proof and record truth for the existing core-purity
Habitat enforcement surface. It does not own the separate
`grit-mapgen-core-runtime-civ7` Grit predicate gap, adapter type-import policy,
Swooper generated map bundle freshness, or live Civ7 runtime proof.

## Verification Gates

- `nx run @swooper/mapgen-core:test:architecture-core-purity --outputStyle=static`
- `bun run habitat:check -- --json --rule arch-test-core-purity`
- `bun run habitat:check -- --json --tool wrapped-test`
- `bun run openspec -- validate habitat-grit-core-purity-wrapped-test --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted`
