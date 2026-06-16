# Design - Viz Contract Ownership Proof

## Frame

### Objective

Close `grit-viz-contract-ownership` as a row-owned Habitat proof checkpoint by
repairing the import predicate gap, remediating the one live same-stage
cross-step private-viz import, and recording current wrapper, baseline, injected,
source, and downstream proof separately.

### Product Movement

This row keeps shared visualization contracts at stage owner surfaces and
prevents step-private visualization helpers from becoming implicit shared hubs.
The live `map-ecology` helper was shared by `plotBiomes.ts`, so its owner is the
nearest stage-level `stages/map-ecology/viz.ts` surface rather than
`steps/plot-biomes/viz.ts`.

### Selection

- Rule id: `grit-viz-contract-ownership`
- Grit pattern: `viz_contract_ownership`
- Pattern file: `.grit/patterns/habitat/checks/viz_contract_ownership.md`
- Owner layer: `grit-check`
- Registry scope: standard recipe stage visualization files
- Current Grit predicate scope:
  `mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/.*\.ts$`

### Hard Core

1. This is a check proof plus source-remediation checkpoint, not an apply proof.
2. Predicate repair uses `import_statement(source=$source)` and source-literal
   guards for the row-owned import classes instead of the old snippet/resolve
   shape that failed to prove imports.
3. Source remediation is limited to moving the shared map-ecology biome-id
   visualization helper to the stage owner surface and updating consumers/tests.
4. Stage-level `stages/<stage>/viz.ts` imports and same-step private `./viz.js`
   imports are control shapes for this row.
5. Package source tests/checks, native Grit proof, Habitat wrapper proof,
   explicit baseline proof, and injected proof are separate proof classes.
6. Current parser inventory, wrapper success, and OpenSpec validation are not
   product/runtime proof.

### Exterior

- Raw direct Grit acquisition.
- Broad visualization architecture closure beyond VCO-owned stage/private-viz
  surfaces.
- Generated-output edits.
- Grit apply/codemod safety.
- Product/runtime Civ7 behavior.
- Neighboring visualization/runtime rows.

### Falsifier

This checkpoint fails if source remediation is hidden as a non-claim, if old
import predicate-gap evidence is treated as current closure, if same-step private
viz imports are reported as cross-step findings, if wrapper/baseline/injected
proof is conflated with source behavior, or if product/runtime proof is claimed.

## Source Synthesis

`rules.json` registers `grit-viz-contract-ownership` as an enforced
`grit-check`, scoped to standard recipe stage visualization files, and forbids
shared `steps/viz.ts` hubs or cross-step private viz imports.

`openspec/specs/mapgen-normalization-workstreams/spec.md` says standard recipe
visualization contracts live at the nearest real owner: stage/phase-level
contracts at the stage surface and step-private helpers in their owning step
only. It also says guardrails reject private-step visualization hubs or
cross-step imports once a stage-level surface exists.

Swooper source routers require source edits under `mods/mod-swooper-maps/src` to
be validated through the package-local build/check flow and treat generated
outputs as read-only.

The prior VCO checkpoint recorded two blockers: native import predicates did not
match, and `plotBiomes.ts` imported a shared helper from
`steps/plot-biomes/viz.js`. This closure resolves both inside VCO ownership.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| `stages/<stage>/steps/viz.ts` file | Reports |
| Import source `../steps/viz.js` from a stage file | Reports |
| Side-effect import source `../steps/viz.js` from a stage file | Reports |
| Import source `./<step>/viz.js` from an immediate step file | Reports |
| Side-effect import source `./<step>/viz.js` from an immediate step file | Reports |
| Import source `../<step>/viz.js` from a nested step file | Reports |
| Stage-level `stages/<stage>/viz.ts` file or import | Does not report |
| Same-step private `./viz.js` import | Does not report |
| Other-stage `../../<stage>/viz.js` import | Does not report |
| Browser-test recipe, `.tsx`, string lookalike, dynamic import, package path | Does not report |

## Proof Contract

This row checkpoint may record:

- predicate repair for row-owned static import declarations;
- native fixture/parser-edge proof for file-hub and import classes;
- parser inventory/current-tree zero-candidate evidence over standard recipe
  stage source;
- source remediation that moves the shared map-ecology helper to
  `stages/map-ecology/viz.ts`;
- package source tests/checks for the moved helper and updated imports;
- Habitat per-rule wrapper and aggregate `grit-check` proof;
- explicit empty baseline and `baseline-integrity` proof;
- row-specific injected violation/path-control proof for the repaired import
  class;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Proof ids:

- `VCO-PREDICATE-REPAIR-2026-06-16`
- `VCO-SOURCE-REMEDIATION-2026-06-16`
- `VCO-NATIVE-FIXTURES-2026-06-16`
- `VCO-NATIVE-CORPUS-REFRESH-2026-06-16`
- `VCO-STAGE-VIZ-INVENTORY-2026-06-16`
- `VCO-SWOOPER-SOURCE-PROOF-2026-06-16`
- `VCO-PER-RULE-SELECTOR-2026-06-16`
- `VCO-HABITAT-GRIT-TOOL-2026-06-16`
- `VCO-BASELINE-FILES-2026-06-16`
- `VCO-INJECTED-PROBE-2026-06-16`

This row checkpoint must not record:

- raw Grit acquisition;
- generated-output edit or freshness proof;
- Effect adapter proof;
- apply safety;
- generator/migration proof;
- retired parity;
- broader visualization architecture closure;
- neighboring row proof;
- aggregate injected-corpus closure while DDIT remains blocked;
- product/runtime proof.

## Downstream Records

The aggregate proof matrix, command proof log, and corpus ledger are updated for
the current closure checkpoint. Recovery ledger, taxonomy, invariant corpus,
discrepancy log, and command docs remain unchanged because this row does not
change taxonomy, add a new invariant, close DL-7 evergreen docs, or claim a
recovery/product closure.
