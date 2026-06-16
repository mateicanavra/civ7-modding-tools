# Design - Sibling Stage Step Imports Proof

## Frame

### Objective

Make `grit-sibling-stage-step-imports` truthful as a row-owned active Habitat
check for the repaired static import-declaration predicate.

### Product Movement

This row helps Habitat preserve the stage topology boundary before agents edit
recipe stages: private step implementation stays local to its stage, while
cross-stage reuse moves through stage contracts, recipe ordering, or domain
surfaces.

### Selection

- Rule id: `grit-sibling-stage-step-imports`
- Grit pattern: `sibling_stage_step_imports`
- Pattern file: `.grit/patterns/habitat/checks/sibling_stage_step_imports.md`
- Owner layer: `grit-check`
- Registry scope:
  `mods/mod-swooper-maps/src/recipes/standard/stages/**/*.ts`
- Current Grit predicate scope:
  path regex
  `mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/.*\.ts$`
- Forbidden current syntax class:
  static import declarations whose source contains `../<stage>/steps/`,
  including side-effect import declarations.

### Hard Core

1. This is a check proof, not an apply proof.
2. Current predicate proof covers the actual current predicate subset under
   Swooper standard stage directories; immediate stage-root public-config
   files are contextual inventory only.
3. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, and product proof are
   separate proof classes.
4. Same-stage step imports are controls under the current predicate.
5. Current parser inventory is not Habitat wrapper enforcement proof; wrapper
   and injected behavior require separate commands.

### Exterior

- Stage source remediation or migration.
- Predicate repair for re-exports, dynamic imports, source strings, or broader
  recipe roots.
- Visualization contract ownership and recipe/domain surface neighboring rows.
- Baseline mutation.
- Product/runtime Civ7 behavior.

### Falsifier

This checkpoint fails if live current-predicate sibling-stage step imports are
found but recorded as a clean pass without owner disposition, if temporary
inventory artifacts are cited as durable proof, if wrapper/baseline/injected
proof is claimed without the row-specific commands, or if neighboring
stage/viz/import rows are treated as proven by this row.

## Source Synthesis

`rules.json` registers `grit-sibling-stage-step-imports` as an enforced
`grit-check` for `mod-swooper-maps`, scoped to
`mods/mod-swooper-maps/src/recipes/standard/stages/**/*.ts`, forbidding stage
code importing another stage's `steps/` implementation.

`taxonomy.md` records `scope:stage-isolation` for no sibling-stage step imports
and maps it to Habitat `grit-sibling-stage-step-imports`.

`invariant-corpus.md` records normalization guardrail G5 for no sibling stage
step imports and assigns it to `grit-check`.

`discrepancy-log.md` records DL-4: G5 forbids sibling-stage step imports and
needs documentation in Swooper Maps architecture. This row does not close that
documentation discrepancy.

`architecture-normalization-packet.md` states that a step owns executable
contract boundaries and bounded orchestration responsibility, while stage owns
local step composition and recipe owns global stage/step order.

`grit-pattern-corpus-ledger.md` requests positive sibling step import,
negative stage contract/domain import, parser-edge relative depth, current
stage scan, empty locked baseline unless findings prove otherwise, and
non-apply disposition.

`grit-proof-matrix.md` records a design seed with one match and one ignore and
marks parser-edge and false-positive classification pending.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| Standard stage file importing `../other-stage/steps/...` | Reports |
| Nested standard stage file importing `../../other-stage/steps/...` | Reports if the source contains `../<segment>/steps/` |
| Side-effect static import from sibling-stage `steps/...` | Reports |
| Type-only import from sibling-stage `steps/...` | Reports under current native behavior |
| Same-stage `./steps/...` import | Does not report |
| Stage contract/config or domain surface imports | Do not report unless source contains sibling `steps/` shape |
| Package, map, test, `.tsx`, and non-standard recipe paths | Do not report under current predicate |
| Source lookalikes such as `stepstore` or `stepsish` | Do not report |
| Re-export or dynamic import forms | Do not report in the current native fixture; broader import-form closure remains a non-claim |

## Proof Contract

This row checkpoint may record:

- predicate repair to `import_statement(source=$source)` for static import
  declarations;
- native fixture/parser-edge proof for current-predicate behavior;
- parser inventory/live candidate evidence over current Swooper standard stage
  roots;
- per-rule Habitat wrapper proof and aggregate `grit-check` wrapper proof;
- explicit empty baseline / `baseline-integrity`;
- row-specific injected violation/path-control proof;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Proof ids:

- `SSS-PREDICATE-REPAIR-2026-06-16`: predicate repair from an
  `import-from` snippet to `import_statement(source=$source)` so side-effect
  static imports share the same source/path guard.
- `SSS-NATIVE-FIXTURES-2026-06-16`: native fixture/parser-edge proof for
  current-predicate positive classes and recorded controls. The current
  checkpoint records 5 native matches and 0 ignore-sample matches.
- `SSS-STAGE-INVENTORY-2026-06-16`: parser inventory/live evidence over current
  Swooper standard stage roots. This evidence classifies import
  declarations, export-from declarations, dynamic imports, relative-depth
  classes, out-of-predicate public-config files, and out-of-scope lookalikes
  without claiming wrapper behavior. The current checkpoint records 0
  live current-row sibling-stage step import matches in both the contextual
  stage-root scan and the actual current-predicate subset.
- `SSS-PER-RULE-SELECTOR-2026-06-16`: Habitat per-rule wrapper proof selects
  `grit-sibling-stage-step-imports` plus `baseline-integrity` and reports zero
  diagnostics.
- `SSS-HABITAT-GRIT-TOOL-2026-06-16`: aggregate `grit-check` wrapper proof
  includes SSS in the current green Grit rule set.
- `SSS-BASELINE-FILES-2026-06-16`: explicit `[]` baseline and
  `baseline-integrity` proof are current for this row.
- `SSS-INJECTED-PROBE-2026-06-16`: row-specific injected violation/path-control
  proof reports one diagnostic at the injected sibling-step import and a clean
  out-of-scope control path.

This row checkpoint must not record:

- raw Grit acquisition;
- export-from or dynamic-import closure;
- Effect adapter proof;
- apply safety;
- retired parity;
- neighboring visualization/import row proof;
- product proof.

## Downstream Records

The aggregate proof matrix, command proof log, and corpus ledger are updated
for this row's current checkpoint after evidence is gathered. Recovery ledger,
taxonomy, invariant corpus, discrepancy log, and command docs remain unchanged
because the implementation does not change policy, diagnostics, or user-facing
behavior.
