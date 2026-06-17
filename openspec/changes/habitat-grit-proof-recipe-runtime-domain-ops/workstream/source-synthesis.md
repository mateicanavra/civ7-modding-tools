# Source Synthesis - Recipe Runtime Domain Ops Proof

## Authority Order

Policy authority:

1. `tools/habitat-harness/src/rules/rules.json`
2. `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
3. `docs/projects/habitat-harness/invariant-corpus.md`
4. `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
5. `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`

Behavior/proof authority:

1. `.grit/patterns/habitat/checks/recipe_runtime_domain_ops.md`
2. `tools/habitat-harness/src/lib/grit.ts`
3. current recipe source under `mods/mod-swooper-maps/src/recipes`
4. fresh native Grit and parser inventory commands

## Product Source

Habitat's product target is executable structural control for agents. For this
row, the structural control is the runtime recipe/domain boundary: agents
editing recipe composition should be stopped before binding contract roots where
runtime op bundles are required.

## Architecture Source

`rules.json` gives this row owner identity, scope, message, and hook lane.
`STANDARD-RECIPE.md` describes the compile-time domain ops registry that binds
op contracts to implementations by op id. The invariant corpus records the
retired ESLint row as `eslint-recipe-domain-ops` and assigns the port to
`grit-check`.

## Current Pattern Source

The current Grit pattern has one arm:

- `import $imports from $source`

It filters filenames with `.*mods/[^/]+/src/recipes/.*/recipe\.ts$` and
matches sources with `.*@mapgen/domain/[^/]+$`.

## Current Source Exemplars

`mods/mod-swooper-maps/src/recipes/standard/recipe.ts` imports six domain ops
bundles:

- `@mapgen/domain/ecology/ops`
- `@mapgen/domain/foundation/ops`
- `@mapgen/domain/hydrology/ops`
- `@mapgen/domain/morphology/ops`
- `@mapgen/domain/placement/ops`
- `@mapgen/domain/resources/ops`

`mods/mod-swooper-maps/src/recipes/browser-test/recipe.ts` imports one domain
ops bundle:

- `@mapgen/domain/foundation/ops`

## Checkpoint Consequences

Current native fixture proof now records
`RDO-NATIVE-FIXTURES-2026-06-15`:

- 9 current-predicate positive classes: default import, named import,
  namespace import, type-only import, side-effect import, browser-test runtime
  recipe import, other-mod raw predicate import, nested runtime recipe import,
  and source-prefix root lookalike import;
- 0 ignore-sample matches for approved `/ops`, `/config.js`, deeper domain
  paths, non-`recipe.ts`, `.tsx`, map, package, step-contract, re-export,
  dynamic import, and trailing slash controls.

Current parser inventory now records `RDO-RECIPE-INVENTORY-2026-06-15`:

- scan root: `mods/mod-swooper-maps/src/recipes`;
- exclusions: `node_modules`, `dist`, `mod`;
- parser: TypeScript compiler API over `.ts`/`.tsx` imports and re-exports;
- counts: 222 scanned TS/TSX files, 2 current-predicate `recipe.ts` files, 29
  import declarations inside those runtime recipe files, 0 export-from
  declarations inside those runtime recipe files, 7 domain references inside
  those runtime recipe files, 0 current-row matches, 7 approved `/ops`
  references, 0 config references, 0 other deep domain references, 0
  source-prefix root lookalikes, 0 type-only root imports, 0 default root
  imports, 0 named root imports, 0 namespace root imports, 0 side-effect root
  imports, 0 root re-exports, 82 root-domain references outside runtime
  `recipe.ts`, and 117 domain references outside runtime `recipe.ts`.

This row proves current-predicate native fixture behavior and parser
inventory/live zero-candidate evidence only. It cannot claim wrapper selector
truth, raw acquisition, baseline behavior, injected cleanup, Effect adapter
behavior, apply safety, retired parity, all-mod wrapper enforcement, or product
proof in this stack/base.
