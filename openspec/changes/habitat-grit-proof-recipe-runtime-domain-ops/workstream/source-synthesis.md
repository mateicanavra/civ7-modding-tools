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

The repaired Grit pattern has one arm:

- `import_statement(source=$source)`

It filters filenames with `.*mods/[^/]+/src/recipes/.*/recipe\.ts$` and
matches exact optional-quote sources with
`^[\"']?@mapgen/domain/[^/]+[\"']?$`. Source-prefix, source-relative,
source-protocol, trailing slash, `/ops`, `/config.js`, and deeper domain
sources are controls.

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

Current predicate repair and native fixture proof now record
`RDO-PREDICATE-REPAIR-2026-06-16` and
`RDO-NATIVE-FIXTURES-2026-06-16`:

- 9 positive classes: default import, named import, namespace import,
  type-only import, side-effect import, browser-test runtime recipe import,
  other-mod raw predicate import, nested runtime recipe import, and
  single-quote exact domain-root import;
- 0 ignore-sample matches for approved `/ops`, `/config.js`, deeper domain
  paths, non-`recipe.ts`, `.tsx`, map, package, step-contract, re-export,
  dynamic import, trailing slash, source-prefix, source-relative, and
  source-protocol controls.

Full native corpus proof records `RDO-NATIVE-CORPUS-REFRESH-2026-06-16`:

- 32 testable Grit patterns passed with 0 failures, including
  `recipe_runtime_domain_ops`.

Current parser inventory now records `RDO-RECIPE-INVENTORY-2026-06-16`:

- scan root: `mods/mod-swooper-maps/src/recipes`;
- exclusions: `node_modules`, `dist`, `mod`;
- parser: TypeScript compiler API over `.ts`/`.tsx` imports and re-exports;
- counts: 222 scanned `.ts` files, 2 current-predicate `recipe.ts` files, 29
  current-predicate import declarations, 7 current-predicate domain references,
  0 exact contract-root candidates, 7 approved `/ops` imports, 0 `/config.js`
  imports, 0 other deep domain imports, 0 source lookalikes, 0
  type-only/value/side-effect forbidden imports, 0 current export-from
  declarations, 0 current dynamic imports, 82 root-domain references outside
  runtime `recipe.ts`, 117 domain references outside runtime `recipe.ts`, and
  0 parse diagnostics.

Current Habitat proof records:

- `RDO-PER-RULE-SELECTOR-2026-06-16`: per-rule wrapper selects RDO plus
  `baseline-integrity`, both passing with zero diagnostics.
- `RDO-HABITAT-GRIT-TOOL-2026-06-16`: aggregate `grit-check` passes 30 Grit
  rules plus `baseline-integrity`, with RDO included.
- `RDO-BASELINE-FILES-2026-06-16`: explicit empty baseline file is present and
  `baseline-integrity` passes.
- `RDO-INJECTED-PROBE-2026-06-16`: row-specific injected probe reports one
  diagnostic at the runtime recipe contract-root import and a clean
  non-`recipe.ts` control with clean initial/final git state and probe cleanup.

This row proves active-check closure for the repaired RDO predicate inside the
current wrapper roots. It cannot claim raw acquisition, source remediation,
all-mod wrapper enforcement beyond current wrapper roots, Effect adapter
behavior, apply safety, retired parity, aggregate injected-corpus closure while
DDIT remains blocked, or product/runtime proof.
