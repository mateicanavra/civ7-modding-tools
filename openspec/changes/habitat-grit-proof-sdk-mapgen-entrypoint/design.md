# Design - SDK MapGen Entrypoint Proof

## Frame

### Objective

Make `grit-sdk-mapgen-entrypoint` truthful as a row-owned Habitat proof
checkpoint for the current Grit predicate.

### Product Movement

This row helps Habitat keep general SDK authoring APIs runtime-neutral. Civ7
map runtime bindings stay behind `@mateicanavra/civ7-sdk/mapgen` rather than
loading through the SDK root or mapgen-core.

### Selection

- Rule id: `grit-sdk-mapgen-entrypoint`
- Grit pattern: `sdk_mapgen_entrypoint`
- Pattern file:
  `.grit/patterns/habitat/checks/sdk_mapgen_entrypoint.md`
- Owner layer: `grit-check`
- Registry scope: `packages/sdk/src/**/*.ts` and
  `packages/mapgen-core/src/**/*.ts`
- Current Grit predicate scope:
  - `packages/sdk/src/index.ts` imports, value export-stars, or named value
    re-exports from `./mapgen` and `./mapgen/index.js`, including mixed
    value+type named re-exports;
  - `packages/sdk/src/**/*.ts` imports from `@civ7/adapter/civ7` outside
    `packages/sdk/src/mapgen/`;
  - `packages/mapgen-core/src/**/*.ts` imports from `@civ7/adapter/civ7`.

### Hard Core

1. This is a check proof, not an apply proof.
2. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, retired parity, and product
   proof are separate proof classes.
3. SDK root `./mapgen` runtime entrypoint imports, value export-stars, named
   value re-exports, and value-first mixed value+type named re-exports are forbidden under
   the current predicate.
4. SDK root `export type { ... } from "./mapgen"` forms and fixture-proven
   single-line `export { type ... } from "./mapgen"` / `./mapgen/index.js`
   forms are non-runtime controls in this row; they must not be conflated with
   value re-export behavior.
5. Multiline or alternate-whitespace inline type-only re-export formatting is
   an unproven parser edge under the current textual guard and remains a
   non-claim for this checkpoint.
6. `@civ7/adapter/civ7` imports are allowed inside `packages/sdk/src/mapgen/`
   and forbidden outside that subpath and inside mapgen-core source by this
   row's current predicate.
7. Parser inventory is not Habitat wrapper enforcement proof or product/runtime
   proof.

### Exterior

- Package source remediation.
- Predicate repair beyond the SDK-root named value re-export branch repaired by
  `SME-P2-NAMED-REEXPORT-PREDICATE-GAP-2026-06-15` and the single-line inline
  type-only control branch repaired by
  `SME-P2-INLINE-TYPE-REEXPORT-CONTROL-GAP-2026-06-15`.
- Baseline mutation.
- Product/runtime Civ7 behavior.

### Falsifier

This checkpoint fails if it claims wrapper/current-tree enforcement from native
fixtures, if live current-row candidates are found but recorded as clean closure
without disposition, if syntax forms are mislabeled as native-proven when the
fixture did not report them, or if product/runtime proof is treated as proven by
this row.

## Source Synthesis

`rules.json` registers `grit-sdk-mapgen-entrypoint` as an enforced `grit-check`,
scoped to SDK and mapgen-core TypeScript source, and forbids SDK root
importing/exporting `./mapgen` or importing `@civ7/adapter/civ7` outside the SDK
mapgen runtime subpath.

`packages/sdk/AGENTS.md` records the SDK root as high-level mod authoring APIs.
`docs/system/sdk/overview.md` records the root package as the Node/Bun-safe
authoring surface and `@mateicanavra/civ7-sdk/mapgen` as the explicit Civ7 map
runtime subpath.

`packages/mapgen-core/AGENTS.md` records mapgen-core as pure TypeScript domain
logic and says no direct Civ7 engine imports belong there.

`openspec/specs/mapgen-normalization-workstreams/spec.md` requires the SDK root
to remain build-tool safe and not transitively load `@civ7/adapter/civ7`, while
allowing `createMap` through the explicit SDK mapgen subpath.

`NORMALIZATION-GUARDRAILS.md` records G11 as the SDK map runtime entrypoint
boundary, with Habitat `grit-sdk-mapgen-entrypoint` as one guard surface.

`discrepancy-log.md` records DL-1: `packages/sdk/AGENTS.md` underspecifies the
mapgen surface even though G11 enforces SDK root and adapter-subpath isolation.
This row does not close DL-1 documentation.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| SDK root value export-star from `./mapgen` | Reports |
| SDK root value export-star from `./mapgen/index.js` | Reports |
| SDK root named value re-export from `./mapgen` or `./mapgen/index.js` | Reports |
| SDK root value-first mixed value+type named re-export from `./mapgen` or `./mapgen/index.js` | Reports |
| SDK root import from `./mapgen` or `./mapgen/index.js` | Current-predicate behavior to record |
| SDK non-mapgen import from `@civ7/adapter/civ7` | Current-predicate behavior to record |
| mapgen-core import from `@civ7/adapter/civ7` | Current-predicate behavior to record |
| SDK mapgen subpath import from `@civ7/adapter/civ7` | Does not report |
| SDK root `export type { ... }` named export from `./mapgen` or `./mapgen/index.js` | Does not report; type-only non-runtime control |
| SDK root single-line `export { type ... }` named export from `./mapgen` or `./mapgen/index.js` | Does not report for the fixture-proven supported spelling; type-only non-runtime control |
| SDK root multiline or alternate-whitespace inline type-only named export from `./mapgen` or `./mapgen/index.js` | Unproven parser-edge non-claim under the current textual guard |
| Package subpath, source lookalikes, dynamic import, tests, `.tsx` | Controls or predicate-gap inputs as native behavior proves |

## Proof Contract

This row checkpoint may record:

- native fixture/parser-edge proof for current-predicate behavior;
- parser inventory/live candidate evidence over current SDK and mapgen-core
  source;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Proof ids:

- `SME-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof for
  current-predicate positive classes and recorded controls.
- `SME-SDK-MAPGEN-INVENTORY-2026-06-15`: parser inventory/live evidence over
  current SDK and mapgen-core source.

This row checkpoint must not record Habitat wrapper selector/current-tree proof,
raw Grit acquisition, baseline proof, injected violation/cleanup proof, Effect
adapter proof, apply safety, generator/migration proof, retired parity, broader
SDK/mapgen architecture closure, neighboring row proof, or product proof.

## Downstream Records

The aggregate proof matrix, command proof log, and corpus ledger will be updated
for this row's current checkpoint after evidence is gathered. SDK docs,
taxonomy, discrepancy log, recovery ledger, and command docs remain unchanged
unless implementation changes policy, diagnostics, or user-facing behavior.
