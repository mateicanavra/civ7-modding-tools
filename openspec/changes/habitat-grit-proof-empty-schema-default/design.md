# Design - Empty Schema Default Proof

## Frame

### Objective

Make `grit-empty-schema-default` truthful as a row-owned Habitat proof
checkpoint for the current Grit predicate.

### Product Movement

This row helps Habitat preserve contract clarity before agents edit schema
surfaces: object-level empty defaults hide absent configuration, while
property-level defaults make defaults explicit and reviewable.

### Selection

- Rule id: `grit-empty-schema-default`
- Grit pattern: `empty_schema_default`
- Pattern file: `.grit/patterns/habitat/checks/empty_schema_default.md`
- Owner layer: `grit-check`
- Registry scope: contract schema files
- Current wrapper roots that can exercise this row:
  `mods/mod-swooper-maps/src/recipes` and
  `mods/mod-swooper-maps/src/domain`
- Current Grit predicate scope:
  `mods/<mod>/src/domain/**/ops/**/*.contract.ts` and
  `mods/<mod>/src/recipes/**/steps/**/*.contract.ts`
- Forbidden current syntax class: object property `default: {}`.

### Hard Core

1. This is a check proof, not an apply proof.
2. Current predicate proof covers `*.contract.ts` paths only; ordinary
   `contract.ts` files are outside the current predicate.
3. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, and product proof are
   separate proof classes.
4. Property-level defaults and non-empty object defaults are controls.
5. Current parser inventory is not Habitat wrapper enforcement proof.

### Exterior

- Contract schema remediation or migration.
- Predicate repair to cover ordinary `contract.ts` files.
- Runtime validation import proof, runtime default merge proof, or TypeBox
  runtime-purity neighboring rows.
- Baseline mutation.
- Product/runtime Civ7 behavior.

### Falsifier

This checkpoint fails if it claims wrapper/current-tree enforcement from native
fixtures, if a live current-predicate empty schema default is found but recorded
as a pass without owner disposition, if ordinary `contract.ts` files are
treated as covered by the current predicate, if temporary inventory artifacts
are cited as durable proof, or if neighboring schema/default rows are treated
as proven by this row.

## Source Synthesis

`rules.json` registers `grit-empty-schema-default` as an enforced `grit-check`
with contract schema scope, message "Do not use empty object defaults in schema
definitions; rely on property defaults.", and no remediation.

`invariant-corpus.md` records the retired `eslint-empty-schema-defaults`
invariant and assigns it to `grit-check`.

`grit-pattern-corpus-ledger.md` requests positive `Type.Object` default `{}`
shape, negative property defaults, parser-edge nested schemas, current schema
scan, empty locked baseline unless findings prove otherwise, and non-apply
disposition.

`grit-proof-matrix.md` records a design seed with one match and one ignore and
marks parser-edge and false-positive classification pending.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| Domain op `*.contract.ts` object-level `default: {}` | Reports |
| Domain op TypeBox options object containing `default: {}` | Reports as a current-predicate fact |
| Nested schema object containing `default: {}` | Reports as a current-predicate fact |
| Recipe step `*.contract.ts` object-level `default: {}` | Reports |
| Other-mod `*.contract.ts` object-level `default: {}` | Current behavior to classify as raw predicate fact |
| Property-level defaults inside schema properties | Do not report unless they contain object-level `default: {}` under current predicate |
| Non-empty object, array, null, string, numeric, boolean defaults | Do not report |
| Ordinary `contract.ts`, config, test, map, package, non-contract, and `.tsx` paths | Do not report under current predicate |
| Lookalike property names such as `defaultValue` | Do not report |

## Proof Contract

This row checkpoint may record:

- native fixture/parser-edge proof for current-predicate behavior;
- parser inventory/live candidate evidence over current Swooper recipe and
  domain contract-schema roots;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Planned proof ids:

- `ESD-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof for
  current-predicate positive classes and recorded controls.
- `ESD-SCHEMA-INVENTORY-2026-06-15`: parser inventory/live evidence over
  current Swooper recipe and domain roots. This evidence is zero-candidate for
  the current `*.contract.ts` predicate, but it exposes ordinary `contract.ts`
  empty defaults outside the current predicate, so exact schema-policy closure
  remains blocked.

This row checkpoint must not record:

- Habitat wrapper selector/current-tree proof;
- raw Grit acquisition;
- baseline proof;
- injected violation/cleanup proof;
- Effect adapter proof;
- apply safety;
- retired parity;
- neighboring schema/default row proof;
- product proof.

## Downstream Records

The aggregate proof matrix, command proof log, and corpus ledger are updated
for this row's current checkpoint after evidence is gathered. Recovery ledger,
taxonomy, invariant corpus, and command docs remain unchanged because the
implementation does not change policy, diagnostics, or user-facing behavior.
