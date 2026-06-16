# Design - Domain Engine Imports Active Check Repair

## Frame

### Objective

Make `habitat-grit-domain-engine-imports` truthful as an active Grit-check
checkpoint. The previous predicate blocker is repaired for the proven static
import subset, the current source inventory is clean, and the rule can be
registered with explicit baseline and injected-probe proof.

### Product Movement

Domain ops should remain portable domain logic. If a domain op imports
`@swooper/mapgen-core/engine` or `@mapgen/engine` as a runtime value, it couples
domain planning to engine entrypoints that belong behind public domain/runtime
surfaces. Type-only references must stay distinct from runtime value imports.

### Selection

- Change id: `habitat-grit-proof-domain-engine-imports`
- Grit pattern: `domain_engine_imports`
- Owner layer: `grit-check`
- Intended scan root: `mods/mod-swooper-maps/src/domain`
- Intended current predicate: domain-op `.ts` files under
  `mods/mod-swooper-maps/src/domain/**/ops/**/*.ts`
- Intended forbidden sources: `@swooper/mapgen-core/engine` and
  `@mapgen/engine`

### Hard Core

1. Non-type engine imports in domain ops are the product shape to catch.
2. Type-only engine imports are controls unless an owner later decides they are
   also forbidden.
3. Native Grit fixture proof and parser inventory are separate proof classes.
4. The active predicate must not false-positive pure type-only controls inside
   the proven single-line control boundary.
5. Current source inventory is evidence about today's tree; native fixture,
   wrapper, baseline, and injected proof are recorded separately.

### Exterior

- Grit engine feature changes.
- A TypeScript parser-backed Habitat rule implementation.
- Domain source remediation.
- Apply/codemod behavior.
- HR classify/generator implementation or packet records.
- Product/runtime behavior.

### Falsifier

This checkpoint fails if it registers an unsafe pattern, treats a type-only
false positive as acceptable fixture proof, omits current source inventory, or
conflates parser inventory with wrapper, baseline, injected, apply, or product
proof.

## Source Synthesis

`scripts/lint/lint-domain-refactor-guardrails.sh` runs two full-profile checks
under each domain ops root: one for imports from
`@swooper/mapgen-core/engine` or `@mapgen/engine`, and one for non-type engine
imports using a PCRE negative lookahead.

`grit-pattern-corpus-ledger.md` now carries the repaired active Grit-check row
for domain ops staying engine/adapter clean except explicitly allowed type-only
surfaces.

`taxonomy.md` and `invariant-corpus.md` support the owner boundary: domain ops
should express domain behavior through approved surfaces rather than direct
runtime/engine coupling.

## Predicate Attempts

| Attempt class | Result | Disposition |
| --- | --- | --- |
| Structural `import $imports from $source` with `$source` bound to exact engine sources and textual negation of `type` imports | Positive import-from samples matched, but it did not cover side-effect imports by itself | Incomplete; not registered alone |
| Broad structural side-effect snippets such as ``import "$source"`` | Side-effect positives matched, but Grit also matched import-from declarations with the same source, including pure type-only controls | Unsafe; not registered |
| Root/standalone regex import alternatives without AST binding | Positive samples did not match as current Grit AST patterns | Non-working; not registered |
| Root regex using negative lookahead like `import(?!\s+type)` | Native Grit rejected the regex because lookaround is unsupported | Unsupported; not registered |
| AST `import_statement(source=$source)` binding with exact engine-source regex and full-statement type-only guards | Positive value/default, namespace, side-effect, and value-first mixed value/type imports matched; pure `import type` and single-line inline type-only controls did not match | Registered active check for the proven static import subset |

## Parser Inventory Contract

`DEI-DOMAIN-OPS-INVENTORY-2026-06-15` scans
`mods/mod-swooper-maps/src/domain`, excludes `node_modules`, `dist`, and `mod`,
and parses `.ts`, `.tsx`, and `.json` files with the TypeScript compiler API.
The current predicate subset is `.ts` files under
`mods/mod-swooper-maps/src/domain/**/ops/**/*.ts`.

The inventory classifies import declarations, exact engine import sources,
type-only/value/side-effect imports, export-from declarations, dynamic imports,
source lookalikes, outside-predicate engine imports, parse diagnostics, and the
current-row match list.

## Proof Contract

This checkpoint may record:

- current-source parser inventory and zero exact engine-import candidates;
- repaired native predicate design evidence;
- active native fixture proof;
- Habitat wrapper/current-tree selector proof;
- explicit empty baseline proof;
- registered injected probe/path-control proof;
- durable non-claim records.

This checkpoint must not record:

- raw Grit acquisition;
- apply safety;
- classify/generator behavior;
- retired parity;
- broader domain-refactor closure;
- export-from, dynamic import, source-string, or broader inline type-only
  formatting closure;
- product/runtime proof.

## Reopen Trigger

Reopen the row when one of these is true:

- the product owner wants export-from, dynamic import, source-string, or broader
  inline type-only formatting closure; or
- Habitat intentionally moves this boundary to a TypeScript parser-backed check
  with row-level proof and owner acceptance; or
- the architecture owner decides type-only engine imports should also be
  forbidden and records that changed product boundary explicitly.

## Downstream Records

The corpus ledger, proof matrix, and command proof log are updated for this
active check. The records keep raw direct Grit acquisition, unsupported import
forms, apply safety, retired parity, and product/runtime proof as non-claims.
