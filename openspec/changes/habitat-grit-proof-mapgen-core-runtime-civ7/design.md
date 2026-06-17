# Design - MapGen Core Runtime Civ7 Proof

## Frame

### Objective

Make `grit-mapgen-core-runtime-civ7` truthful as a row-owned Habitat blocker
checkpoint for the current Grit predicate.

### Product Movement

This row helps Habitat preserve the MapGen owner boundary before agents edit
core generation logic: pure engine code stays portable and testable, while
Civ7 runtime values stay behind adapter/control surfaces.

### Selection

- Rule id: `grit-mapgen-core-runtime-civ7`
- Grit pattern: `mapgen_core_runtime_civ7`
- Pattern file: `.grit/patterns/habitat/checks/mapgen_core_runtime_civ7.md`
- Owner layer: `grit-check`
- Registry scope: `packages/mapgen-core/src/{core,engine}/**/*.ts`
- Current Grit predicate scope:
  `packages/mapgen-core/src/core/**/*.ts` and
  `packages/mapgen-core/src/engine/**/*.ts`
- Textual predicate classes:
  - imports from `@civ7/adapter`, `@civ7/adapter/civ7`, or
    `/base-standard/...` under the current predicate;
  - side-effect imports from `/base-standard/...` under the current predicate;
  - member expressions on `GameplayMap`, `TerrainBuilder`,
    `ResourceBuilder`, `FeatureBuilder`, `AreaBuilder`,
    `MapConstructibles`, or `GameInfo` under the current predicate.
- Proven native behavior in this checkpoint: runtime global member expressions
  report; import classes do not report and are recorded as a predicate gap.

### Hard Core

1. This is a check proof, not an apply proof.
2. Current predicate proof covers `packages/mapgen-core/src/core/**/*.ts` and
   `packages/mapgen-core/src/engine/**/*.ts` only.
3. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, and product proof are
   separate proof classes.
4. Type-only adapter imports are a required parser-edge classification because
   existing MapGen core files import adapter types.
5. Current parser inventory is not Habitat wrapper enforcement proof.
6. Clean row closure is blocked because import-class predicate behavior does
   not match the row/registry intent.

### Exterior

- MapGen source remediation or migration.
- Predicate repair for broader runtime-coupling syntax.
- SDK mapgen entrypoint proof, adapter base-standard import proof, or
  direct-control/runtime product proof.
- Baseline mutation.
- Product/runtime Civ7 behavior.

### Falsifier

This checkpoint fails if it claims wrapper/current-tree enforcement from native
fixtures, if live intended runtime-coupling candidates are found but recorded
as a clean pass without owner disposition, if type-only adapter imports are
hidden instead of classified, if the import predicate gap is represented as
clean enforcement closure, if temporary inventory artifacts are cited as
durable proof, or if neighboring runtime/adapter rows are treated as proven by
this row.

## Source Synthesis

`packages/mapgen-core/AGENTS.md` defines MapGen core as pure TypeScript domain
logic and says direct Civ7 engine imports do not belong there; engine
interaction goes through `@civ7/adapter` and `MapGenContext.adapter`.

`rules.json` registers `grit-mapgen-core-runtime-civ7` as an enforced
`grit-check` for `@swooper/mapgen-core`, scoped to
`packages/mapgen-core/src/{core,engine}/**/*.ts`, forbidding Civ7 adapter value
imports, `/base-standard` paths, and runtime globals.

`taxonomy.md` classifies `@swooper/mapgen-core` as `kind:engine`: pure TS
engine/domain logic with no Civ7 runtime values or engine globals.

`invariant-corpus.md` records normalization guardrail G3 and core-purity
lineage for MapGen core production code.

`grit-pattern-corpus-ledger.md` requests positive Civ7 runtime imports,
negative authoring/adapter boundaries, parser-edge type imports, current
MapGen core scan, empty locked baseline unless findings prove otherwise, and
non-apply disposition.

`grit-proof-matrix.md` records a design seed with one match and one ignore and
marks parser-edge and false-positive classification pending.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| Core/engine value import from `@civ7/adapter` | Does not report under current native behavior; predicate-gap blocker |
| Core/engine value import from `@civ7/adapter/civ7` | Does not report under current native behavior; predicate-gap blocker |
| Core/engine value import from `/base-standard/...` | Does not report under current native behavior; predicate-gap blocker |
| Core/engine side-effect import from `/base-standard/...` | Does not report under current native behavior; predicate-gap blocker |
| Core/engine member expression on listed Civ7 globals | Reports |
| Core/engine type-only adapter import | Does not report under current native behavior; parser-edge/policy-disposition blocker |
| Authoring, adapter-style, package, map, test, `.tsx`, and non-core/engine paths | Do not report under current predicate |
| Source lookalikes such as `@civ7/adapterish` or `/base-standardish/...` | Do not report |
| Local identifiers or interface names that merely contain runtime global names | Do not report unless they form the current member-expression predicate |

## Proof Contract

This row checkpoint may record:

- native fixture/parser-edge proof for proven runtime-global member behavior
  and import-class predicate-gap controls;
- parser inventory/live candidate evidence over current MapGen core/engine
  roots;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Planned proof ids:

- `MCR-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof for
  runtime-global member positive classes and recorded import/path controls.
- `MCR-CORE-INVENTORY-2026-06-15`: parser inventory/live evidence over current
  MapGen core/engine roots. This evidence classifies value imports, type-only
  imports, `/base-standard` references, runtime global member expressions, and
  out-of-scope lookalikes without claiming Habitat wrapper behavior. Live
  type-only adapter imports are disposition inputs, not clean closure.

This row checkpoint must not record:

- Habitat wrapper selector/current-tree proof;
- raw Grit acquisition;
- baseline proof;
- injected violation/cleanup proof;
- Effect adapter proof;
- apply safety;
- retired parity;
- neighboring adapter/sdk/runtime row proof;
- product proof.
- import-class enforcement closure.

## Downstream Records

The aggregate proof matrix, command proof log, and corpus ledger are updated
for this row's current checkpoint after evidence is gathered. Recovery ledger,
taxonomy, invariant corpus, and command docs remain unchanged unless the
implementation changes policy, diagnostics, or user-facing behavior.
