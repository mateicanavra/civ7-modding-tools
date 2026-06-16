# Design - Recipe Runtime Domain Ops Proof

## Frame

### Objective

Close `grit-recipe-runtime-domain-ops` as a row-owned active Habitat/Grit check
with exact predicate behavior, current-tree zero-candidate proof, wrapper
projection, baseline ownership, and row-specific injected path-control proof.

### Product Movement

This row helps Habitat enforce structural control before agents modify runtime
recipe composition: recipe runtime files bind executable domain ops, while
contract roots stay in contract and step-boundary surfaces.

### Selection

- Rule id: `grit-recipe-runtime-domain-ops`
- Grit pattern: `recipe_runtime_domain_ops`
- Pattern file: `.grit/patterns/habitat/checks/recipe_runtime_domain_ops.md`
- Owner layer: `grit-check`
- Registry scope: `mods/*/src/recipes/**/recipe.ts`
- Current wrapper root that can exercise this row:
  `mods/mod-swooper-maps/src/recipes`
- Repaired current Grit predicate scope:
  `mods/<mod>/src/recipes/**/recipe.ts` import declarations with exact
  optional-quote sources shaped `@mapgen/domain/<domain>`
- Forbidden current source class:
  runtime recipe imports from domain contract roots.
- Allowed current source class:
  runtime recipe imports from `@mapgen/domain/<domain>/ops`.

### Hard Core

1. This is a check proof, not an apply proof.
2. `rules.json` is the rule metadata authority and the standard recipe docs
   explain the compile-time ops registry.
3. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, and product proof are
   separate proof classes.
4. The repaired predicate includes all `mods/<mod>/src/recipes/**/recipe.ts`
   import declarations and excludes source-prefix, relative, protocol, trailing
   slash, `/ops`, `/config.js`, deep domain, re-export, dynamic, and
   non-`recipe.ts` controls.
5. Current parser inventory over Swooper recipes is not all-mod wrapper
   enforcement proof.

### Exterior

- Import rewriting.
- Domain ops export synthesis.
- Recipe compilation runtime behavior.
- Generated output repair.
- Baseline mutation.
- Apply codemods.
- Product/runtime Civ7 behavior.

### Falsifier

This checkpoint fails if a live runtime `recipe.ts` domain-root import is found
but recorded as a pass without owner disposition, if temporary inventory
artifacts are cited as durable proof, if source lookalikes report, or if raw
acquisition, apply safety, all-mod wrapper enforcement, or product/runtime proof
is claimed from this check row.

## Source Synthesis

`rules.json` registers `grit-recipe-runtime-domain-ops` as an enforced
`grit-check` with scope `mods/*/src/recipes/**/recipe.ts`, message
"Recipe runtime files must import @mapgen/domain/<domain>/ops for runtime
domains.", and no remediation.

`docs/system/libs/mapgen/reference/STANDARD-RECIPE.md` says the standard recipe
collects compile-time domain ops into a registry used to bind op contracts to
implementations by op id.

`docs/projects/habitat-harness/invariant-corpus.md` records the retired
`eslint-recipe-domain-ops` invariant and assigns it to `grit-check`.

The repaired Grit predicate uses `import_statement(source=$source)` in
`mods/<mod>/src/recipes/**/recipe.ts` and matches exact optional-quote
`@mapgen/domain/<domain>` source specifiers.

Current source exemplars:

- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` imports six domain
  op bundles from `@mapgen/domain/<domain>/ops`.
- `mods/mod-swooper-maps/src/recipes/browser-test/recipe.ts` imports the
  foundation op bundle from `@mapgen/domain/foundation/ops`.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| Runtime `recipe.ts` default domain-root import | Reports |
| Runtime `recipe.ts` named domain-root import | Reports |
| Runtime `recipe.ts` namespace domain-root import | Reports |
| Runtime `recipe.ts` type-only domain-root import | Reports |
| Runtime `recipe.ts` side-effect domain-root import | Reports |
| Browser-test runtime `recipe.ts` domain-root import | Reports |
| Other-mod runtime `recipe.ts` domain-root import | Reports as a raw current-predicate fact |
| Nested runtime `recipe.ts` domain-root import | Reports |
| Single-quote runtime `recipe.ts` domain-root import | Reports |
| Source-prefix, source-relative, or source-protocol root lookalike | Does not report |
| Approved `/ops` import | Does not report |
| Domain `/config.js` or deeper domain path | Does not report under this predicate |
| Non-`recipe.ts`, `.tsx`, maps, package, and step-contract paths | Do not report |
| Re-export, dynamic import, or trailing slash source | Do not report under this predicate |

## Proof Contract

This row checkpoint may record:

- predicate repair and native fixture/parser-edge proof for current-predicate
  behavior;
- parser inventory/live zero-candidate evidence over
  `mods/mod-swooper-maps/src/recipes`;
- Habitat per-rule wrapper and aggregate `grit-check` proof;
- explicit empty baseline proof through `baseline-integrity`;
- row-specific injected violation/path-control proof;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Current proof ids:

- `RDO-PREDICATE-REPAIR-2026-06-16`: exact source predicate repair.
- `RDO-NATIVE-FIXTURES-2026-06-16`: native fixture/parser-edge proof for 9
  positive classes and the recorded controls.
- `RDO-NATIVE-CORPUS-REFRESH-2026-06-16`: full native Grit corpus remains
  green with RDO included.
- `RDO-RECIPE-INVENTORY-2026-06-16`: parser inventory/live zero-candidate
  evidence over the current Swooper recipe root.
- `RDO-PER-RULE-SELECTOR-2026-06-16`: per-rule wrapper proof.
- `RDO-HABITAT-GRIT-TOOL-2026-06-16`: aggregate `grit-check` proof.
- `RDO-BASELINE-FILES-2026-06-16`: explicit empty baseline plus wrapper
  `baseline-integrity` proof.
- `RDO-INJECTED-PROBE-2026-06-16`: row-specific injected violation and
  path-control proof.

This row checkpoint must not record:

- raw Grit acquisition;
- Effect adapter proof;
- apply safety;
- all-mod wrapper enforcement beyond current wrapper roots;
- retired parity;
- aggregate injected-corpus closure while DDIT remains blocked;
- product/runtime proof.

## Downstream Records

The aggregate proof matrix and corpus ledger are updated for this row's current
checkpoint. Recovery ledger, standard recipe docs, invariant corpus, and command
docs remain unchanged unless the implementation changes policy, diagnostics, or
user-facing behavior.
