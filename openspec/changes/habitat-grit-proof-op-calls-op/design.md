# Design - Op Calls Op Proof

## Frame

### Objective

Make `grit-op-calls-op` a truthful Habitat check row for op atomicity: domain
op runtime entrypoints must not import sibling op runtime entrypoints or the
domain ops barrel.

### Product Movement

This row helps Habitat enforce authoring structure at the owner layer. Domain
ops stay atomic units; recipe steps and stages own cross-op orchestration.

### Selection

- Rule id: `grit-op-calls-op`
- Grit pattern: `op_calls_op`
- Pattern file: `.grit/patterns/habitat/checks/op_calls_op.md`
- Owner layer: `grit-check`
- Registry scope: `mods/mod-swooper-maps/src/domain/**/ops/*/index.ts`
- Current Grit predicate scope:
  `.*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/index\.ts$`
- Forbidden current syntax classes:
  - import declarations from `../<sibling-op>/index.js`;
  - import declarations from `@mapgen/domain/<domain>/ops`;
  - import declarations from `@mapgen/domain/<domain>/ops/index.js`.

### Hard Core

1. This is a check proof, not an apply proof.
2. Native fixture proof, parser inventory, wrapped test behavior, Habitat
   wrapper behavior, raw Grit acquisition, injected proof, baseline behavior,
   retired parity, classify/generator behavior, and product proof are separate
   proof classes.
3. Current row predicate is Swooper domain op runtime `index.ts` files only.
4. Value, type-only, namespace, named, single-quoted, and side-effect imports
   from the forbidden source classes are current native positives.
5. Same-op local imports, parent `lib` imports, domain private deep imports,
   `ops-by-id`, domain ops root barrel files, rules/strategy files, tests,
   recipes, `.tsx`, export-from, dynamic import, and source strings are
   controls or non-claims.

### Exterior

- Domain source remediation.
- Broader domain-refactor full-profile parity.
- Raw direct Grit acquisition.
- Classify or generator behavior.
- Apply/codemod safety.
- Product/runtime proof.

### Falsifier

This checkpoint fails if native fixture proof reports controls, if parser
inventory finds live current candidates without disposition, if inherited
shared proof is described as row-local proof, or if the row implies export,
dynamic import, broad op architecture closure, classify/generator, apply, or
product/runtime closure.

## Source Synthesis

The recovery corpus names `habitat-grit-op-calls-op` as a check-only candidate:
private sibling op composition should not bypass orchestration ownership. The
existing Foundation cutover test forbids sibling op runtime imports,
`@mapgen/domain/<domain>/ops` imports, `ops.bind`, and `runValidated` inside
foundation op `index.ts` files.

This row owns only the import-source portion. The neighboring
`ops.bind`/`runValidated` candidate remains separate because it overlaps with
runtime-purity rows and call-expression semantics. The current Grit predicate
therefore reports import declarations from sibling op runtimes and domain ops
barrels in Swooper domain op runtime entrypoints.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| Domain op runtime `index.ts` value import from `../<op>/index.js` | Reports |
| Domain op runtime `index.ts` type-only import from `../<op>/index.js` | Reports |
| Domain op runtime `index.ts` side-effect import from `../<op>/index.js` | Reports |
| Domain op runtime `index.ts` imports from `@mapgen/domain/<domain>/ops` or `/ops/index.js` | Report |
| Same-op `./contract.js`, `./strategies/index.js`, and `./rules/index.js` imports | Do not report |
| Parent `../../lib/...` imports | Do not report |
| Domain private deep import and `ops-by-id` lookalikes | Do not report in this row |
| Domain root `ops/index.ts`, rules path, `.tsx`, other mod, recipe, and test paths | Do not report |
| Export-from, dynamic import, and source-string classes | Do not report in this current native predicate |

## Proof Contract

This row checkpoint may record:

- `OCO-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof.
- `OCO-DOMAIN-OPS-INVENTORY-2026-06-15`: parser inventory/live
  zero-candidate record truth over current Swooper domain source.
- `OCO-WRAPPED-TEST-2026-06-15`: existing wrapped Foundation test behavior.
- `OCO-HABITAT-GRIT-TOOL-2026-06-15` and
  `OCO-PER-RULE-SELECTOR-2026-06-15`: current-tree wrapper and per-rule
  selector proof after OCO registration.
- `OCO-BASELINE-FILES-2026-06-15`: explicit empty baseline inventory after
  OCO registration.
- `OCO-INJECTED-PROBE-2026-06-15`: registered OCO injected probe and
  out-of-scope control path.
- Aggregate record alignment for this row.

This row checkpoint must not record:

- raw direct Grit acquisition;
- neighboring `ops.bind` / `runValidated` proof;
- injected cleanup/path-control closure beyond the registered OCO probe shape;
- baseline mutation;
- classify or generator behavior;
- export-from or dynamic import closure;
- apply/codemod safety;
- retired wrapped-script parity beyond the named Foundation test;
- broader op-architecture or domain-refactor closure;
- product/runtime proof.

Current restacked shared proof ids may be cited only as inherited shared proof:

- `HGPR-HABITAT-GRIT-TOOL-2026-06-15`
- `HGPR-PER-RULE-SELECTORS-2026-06-15`
- `HGPR-BASELINE-FILES-2026-06-15`
- `HGPR-BASELINE-INTEGRITY-2026-06-15`
- `HGPR-INJECTED-GRIT-ROWS-2026-06-15`
- `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`
