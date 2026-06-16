## Why

`grit-recipe-runtime-domain-ops` is an enforced Grit check for the runtime
recipe boundary: recipe compilation files bind runtime op bundles from
`@mapgen/domain/<domain>/ops`, not domain contract roots. This is a source
shape rule inside the recipe tree, so it belongs to `grit-check`.

This checkpoint closes the row's executable proof boundary. It repairs the Grit
predicate to exact optional-quote `@mapgen/domain/<domain>` source specifiers,
keeps source-prefix/relative/protocol lookalikes as controls, proves current
native fixture behavior, proves current Swooper recipe runtime inventory, and
records per-rule wrapper, aggregate `grit-check`, explicit empty baseline, and
row-specific injected violation/path-control proof.

## Target Authority Refs

- `tools/habitat-harness/src/rules/rules.json`
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `tools/habitat-harness/src/lib/grit.ts`
- `.grit/patterns/habitat/checks/recipe_runtime_domain_ops.md`
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- `mods/mod-swooper-maps/src/recipes/browser-test/recipe.ts`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-recipe-runtime-domain-ops`.
- Repair the native predicate and fixture for current-predicate behavior:
  - runtime `recipe.ts` imports from domain roots report;
  - default, named, namespace, type-only, side-effect, single-quote, nested
    recipe, browser-test recipe, and other-mod raw predicate classes report;
  - approved `/ops`, config/deep domain paths, non-`recipe.ts` files, `.tsx`,
    maps, packages, step contracts, re-exports, dynamic imports, trailing slash
    paths, and source-prefix/relative/protocol lookalikes remain controls.
- Record a parser inventory over the current Swooper recipe scan root with exact
  scan root, exclusions, counts, row id, and proof-class labels in durable
  records.
- Record current per-rule wrapper, aggregate `grit-check`, baseline-integrity,
  and row-specific injected probe proof for this active check.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current closure checkpoint.

## What Does Not Change

- No recipe source imports are changed.
- No generated recipe artifacts are edited.
- No raw Grit acquisition, source remediation, Effect adapter closure, apply
  safety, retired parity, all-mod wrapper enforcement beyond current wrapper
  roots, aggregate injected-corpus closure, or product/runtime proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-recipe-runtime-domain-ops`.

This workstream does not own recipe compilation semantics, domain ops exports,
target export synthesis, import rewriting, generated output repair, or command
selector/baseline/adapter implementation.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- A separate apply row before any exact import normalization claim.

## Stop Conditions

- Native fixture behavior finds a parser form that the repaired predicate cannot
  express safely.
- Current inventory finds live runtime `recipe.ts` domain-root imports and no
  owner accepts remediation or baseline disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim raw acquisition, Effect adapter, apply, all-mod wrapper
  enforcement, or product proof from native fixture/parser inventory evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter recipe_runtime_domain_ops --json`
- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --json`
- `bun run habitat:check -- --json --rule grit-recipe-runtime-domain-ops`
- `bun run habitat:check -- --json --tool grit-check`
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- `bun run openspec -- validate habitat-grit-proof-recipe-runtime-domain-ops --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
