# Design - Domain Engine Imports Candidate Disposition

## Frame

### Objective

Make `habitat-grit-domain-engine-imports` truthful as a candidate blocker
checkpoint: the product boundary is real, the current source inventory is clean,
and the current Grit predicate design is unsafe to register.

### Product Movement

Domain ops should remain portable domain logic. If a domain op imports
`@swooper/mapgen-core/engine` or `@mapgen/engine` as a runtime value, it couples
domain planning to engine entrypoints that belong behind public domain/runtime
surfaces. Type-only references must stay distinct from runtime value imports.

### Selection

- Candidate id: `habitat-grit-domain-engine-imports`
- Proposed Grit pattern: `domain_engine_imports`
- Owner layer: candidate `grit-check`
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
4. This checkpoint must not register a pattern that false-positives pure
   type-only controls.
5. Current source inventory is evidence about today's tree, not proof that the
   Grit rule is implementable or registered.

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
claims wrapper/baseline/injected/apply/product proof from parser inventory.

## Source Synthesis

`scripts/lint/lint-domain-refactor-guardrails.sh` runs two full-profile checks
under each domain ops root: one for imports from
`@swooper/mapgen-core/engine` or `@mapgen/engine`, and one for non-type engine
imports using a PCRE negative lookahead.

`grit-pattern-corpus-ledger.md` carries the candidate as a Grit-check row for
domain ops staying engine/adapter clean except explicitly allowed type-only
surfaces.

`taxonomy.md` and `invariant-corpus.md` support the owner boundary: domain ops
should express domain behavior through approved surfaces rather than direct
runtime/engine coupling.

## Predicate Attempts

| Attempt class | Result | Disposition |
| --- | --- | --- |
| Structural `import $imports from $source` with `$source` bound to exact engine sources and textual negation of `type` imports | Positive samples matched, but pure `import type` and `import { type ... }` controls also matched | Unsafe; not registered |
| Structural import-node binding with `includes` or regex negation on the matched import node | Type-only controls still matched | Unsafe; not registered |
| Root regex using negative lookahead like `import(?!\s+type)` | Native Grit rejected the regex because lookaround is unsupported | Unsupported; not registered |
| Root or `contains` regex alternatives without lookahead | Positive samples did not match | Non-working; not registered |

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
- failed native predicate design evidence for the candidate;
- durable non-registration and non-claim records.

This checkpoint must not record:

- active Grit rule registration;
- native positive fixture proof;
- Habitat wrapper/current-tree proof;
- raw Grit acquisition;
- baseline proof;
- injected violation/cleanup proof;
- apply safety;
- classify/generator behavior;
- retired parity;
- broader domain-refactor closure;
- product/runtime proof.

## Reopen Trigger

Reopen the candidate when one of these is true:

- Grit can safely express value engine imports without pure type-only false
  positives and positive fixtures prove that behavior; or
- Habitat intentionally moves this boundary to a TypeScript parser-backed check
  with row-level proof and owner acceptance; or
- the architecture owner decides type-only engine imports should also be
  forbidden and records that changed product boundary explicitly.

## Downstream Records

The corpus ledger and command proof log are updated for this candidate blocker.
The aggregate proof matrix is not updated as a current check row because no
active `rules.json` entry, `.grit` pattern, baseline, or injected probe is
registered for this candidate.
