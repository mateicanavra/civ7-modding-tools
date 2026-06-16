# Design - Empty Schema Default Proof

## Frame

### Objective

Make `grit-empty-schema-default` an active row-owned Habitat proof checkpoint
for contract schema files that still try to use object-level empty defaults.

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
  `mods/<mod>/src/domain/**/ops/**/{*.contract.ts,contract.ts}` and
  `mods/<mod>/src/recipes/**/steps/**/{*.contract.ts,contract.ts}`
- Forbidden current syntax class: object property `default: {}`.

### Hard Core

1. This is a check proof, not an apply proof.
2. Current predicate proof covers both `*.contract.ts` paths and ordinary
   `contract.ts` files under domain op and recipe step contract roots.
3. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, and product proof are
   separate proof classes.
4. Property-level defaults and non-empty object defaults are controls.
5. Current parser inventory is not Habitat wrapper enforcement proof.

### Exterior

- General contract schema migration outside the two live empty-default
  remediations.
- Runtime validation import proof, runtime default merge proof, or TypeBox
  runtime-purity neighboring rows.
- Baseline mutation.
- Product/runtime Civ7 behavior.

### Falsifier

This checkpoint fails if it claims wrapper/current-tree enforcement from native
fixtures, if a live current-predicate empty schema default remains after
remediation, if ordinary `contract.ts` files are treated as controls, if
temporary inventory artifacts are cited as durable proof, or if neighboring
schema/default rows are treated as proven by this row.

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
| Domain op ordinary `contract.ts` object-level `default: {}` | Reports |
| Domain op TypeBox options object containing `default: {}` | Reports as a current-predicate fact |
| Nested schema object containing `default: {}` | Reports as a current-predicate fact |
| Recipe step `*.contract.ts` object-level `default: {}` | Reports |
| Recipe step ordinary `contract.ts` object-level `default: {}` | Reports |
| Other-mod `*.contract.ts` object-level `default: {}` | Current behavior to classify as raw predicate fact |
| Property-level defaults inside schema properties | Do not report unless they contain object-level `default: {}` under current predicate |
| Non-empty object, array, null, string, numeric, boolean defaults | Do not report |
| Config, test, map, package, non-contract, contract-helper, and `.tsx` paths | Do not report under current predicate |
| Lookalike property names such as `defaultValue` | Do not report |

## Proof Contract

This row checkpoint may record:

- native fixture/parser-edge proof for current-predicate behavior;
- source remediation for the two live ordinary-contract empty defaults;
- parser inventory/live candidate evidence over current Swooper recipe and
  domain contract-schema roots;
- Habitat wrapper/current-tree selector proof, explicit empty baseline proof,
  and row-specific injected path-control proof;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Planned proof ids:

- `ESD-SOURCE-REMEDIATION-2026-06-16`: removal of the two live ordinary
  `contract.ts` empty defaults with focused tests proving property-default
  materialization.
- `ESD-NATIVE-FIXTURES-2026-06-16`: native fixture/parser-edge proof for
  current-predicate positive classes and recorded controls.
- `ESD-SCHEMA-INVENTORY-2026-06-16`: parser inventory/live evidence over
  current Swooper recipe and domain roots after predicate repair and source
  remediation.
- `ESD-HABITAT-GRIT-TOOL-2026-06-16` and
  `ESD-PER-RULE-SELECTOR-2026-06-16`: wrapper/current-tree proof for the
  aggregate and per-rule Habitat selector surfaces.
- `ESD-INJECTED-PROBE-2026-06-16`: row-specific injected violation and
  path-control proof.

This row checkpoint must not record:

- raw Grit acquisition;
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
