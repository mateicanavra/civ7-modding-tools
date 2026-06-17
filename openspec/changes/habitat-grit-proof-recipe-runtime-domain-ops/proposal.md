## Why

`grit-recipe-runtime-domain-ops` is an enforced Grit check for the runtime
recipe boundary: recipe compilation files bind runtime op bundles from
`@mapgen/domain/<domain>/ops`, not domain contract roots. This is a source
shape rule inside the recipe tree, so it belongs to `grit-check`.

The rule is registered and has a native sample, but the row still needs
row-level proof before future agents can treat it as executable structural
truth. This checkpoint opens the row packet and proves the current predicate's
native fixture/parser behavior and current Swooper recipe runtime inventory
only. It does not claim Habitat wrapper selector truth, raw acquisition,
injected cleanup, baseline behavior, Effect adapter behavior, apply safety, or
product proof because those surfaces are outside this row's current stack/base.

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
- Expand the native fixture for current-predicate behavior:
  - runtime `recipe.ts` imports from domain roots report;
  - default, named, namespace, type-only, side-effect, nested recipe, raw
    all-mod, and source-prefix classes are recorded as current-predicate facts;
  - approved `/ops`, config/deep domain paths, non-`recipe.ts` files, `.tsx`,
    maps, packages, step contracts, re-exports, dynamic imports, and trailing
    slash paths remain controls.
- Record a parser inventory over the current Swooper recipe scan root with exact
  scan root, exclusions, counts, row id, and proof-class labels in durable
  records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint.

## What Does Not Change

- No recipe source imports are changed.
- No pattern predicate repair is claimed.
- No generated recipe artifacts are edited.
- No Habitat wrapper/current-tree proof is claimed.
- No raw Grit acquisition, baseline, injected cleanup, Effect adapter, apply
  safety, or product proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-recipe-runtime-domain-ops`.

This workstream does not own recipe compilation semantics, domain ops exports,
target export synthesis, import rewriting, generated output repair, or command
selector/baseline/adapter implementation.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- A landed/restacked command-trust layer before Habitat wrapper selector proof.
- An accepted typed adapter/probe cleanup surface before injected proof.
- The scaffold/baseline contract surface before explicit baseline proof.
- A separate apply row before any exact import normalization claim.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live runtime `recipe.ts` domain-root imports and no
  owner accepts remediation or baseline disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim wrapper, raw acquisition, baseline, injected, Effect
  adapter, apply, or product proof from native fixture/parser inventory
  evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter recipe_runtime_domain_ops --json`
- `bun run openspec -- validate habitat-grit-proof-recipe-runtime-domain-ops --strict`
- `bun run openspec:validate`
- `git diff --check`
