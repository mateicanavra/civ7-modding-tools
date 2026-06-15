# Design - Viz Contract Ownership Proof

## Frame

### Objective

Make `grit-viz-contract-ownership` truthful as a row-owned Habitat proof
checkpoint for the current Grit predicate and live source inventory.

### Product Movement

This row helps Habitat keep shared visualization contracts at stage owner
surfaces and prevents step-private visualization helpers from becoming implicit
shared hubs.

### Selection

- Rule id: `grit-viz-contract-ownership`
- Grit pattern: `viz_contract_ownership`
- Pattern file: `.grit/patterns/habitat/checks/viz_contract_ownership.md`
- Owner layer: `grit-check`
- Registry scope: standard recipe stage visualization files
- Current Grit predicate scope:
  `mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/.*\.ts$`
- Current fixture-proven native positive:
  - `stages/<stage>/steps/viz.ts` file program.
- Intended but currently blocked/gap classes:
  - imports that resolve to `stages/<stage>/steps/viz`;
  - cross-step private imports that resolve to
    `stages/<stage>/steps/<step>/viz`.

### Hard Core

1. This is a check proof, not an apply proof.
2. Current native fixture proof covers the `steps/viz.ts` file-hub branch only.
3. Import-branch evidence remains a predicate-gap blocker unless a later repair
   proves those branches.
4. Parser inventory may identify live intended visualization ownership findings,
   but it is not Habitat wrapper enforcement proof.
5. Stage-level `stages/<stage>/viz.ts` imports and same-step private
   `./viz.js` imports are control shapes for this row.
6. Current parser inventory is not product/runtime proof.

### Exterior

- Swooper source remediation.
- Predicate repair for import branches not proven by current native fixtures.
- Baseline mutation.
- Product/runtime Civ7 behavior.

### Falsifier

This checkpoint fails if it claims wrapper/current-tree enforcement from native
fixtures, if the live private-viz import finding is recorded as clean closure,
if import predicate gaps are treated as proven, or if product/runtime proof is
treated as proven by this row.

## Source Synthesis

`rules.json` registers `grit-viz-contract-ownership` as an enforced
`grit-check`, scoped to standard recipe stage visualization files, and forbids
shared `steps/viz.ts` hubs or cross-step private viz imports.

`openspec/specs/mapgen-normalization-workstreams/spec.md` says standard recipe
visualization contracts live at the nearest real owner: stage/phase-level
contracts at the stage surface and step-private helpers in their owning step
only. It also says guardrails reject private-step visualization hubs or
cross-step imports once a stage-level surface exists.

`discrepancy-log.md` records DL-7: visualization contract ownership guardrail
coverage exists but still needs evergreen Swooper architecture documentation.

`grit-pattern-corpus-ledger.md` requests positive shared viz hub/private
cross-step import probes, negative stage-local viz contracts, current stage
visualization scan, and non-apply disposition.

`grit-proof-matrix.md` records a design seed with one match and one ignore and
marks parser-edge and false-positive classification pending.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| `stages/<stage>/steps/viz.ts` file | Reports |
| Import resolving to `stages/<stage>/steps/viz` | Current native fixture does not report; record as predicate-gap blocker |
| Cross-step private import resolving to `stages/<stage>/steps/<step>/viz` | Current native fixture does not report; record as predicate-gap blocker |
| Stage-level `stages/<stage>/viz.ts` file or import | Does not report |
| Same-step private `./viz.js` import | Does not report |
| Live-style `./<step>/viz.js` cross-step import | Does not report in current native predicate; record as predicate-gap/live-finding blocker if present |
| Browser-test recipe, `.tsx`, string lookalike, dynamic import, package path | Does not report in this current native predicate |

## Proof Contract

This row checkpoint may record:

- native fixture/parser-edge proof for current `steps/viz.ts` file behavior;
- native predicate-gap evidence for import branches;
- parser inventory/live candidate evidence over current standard recipe stage
  source;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Proof ids:

- `VCO-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof for the
  current file-hub branch, controls, and import-branch predicate gaps.
- `VCO-STAGE-VIZ-INVENTORY-2026-06-15`: parser inventory/live evidence over
  current standard recipe stage source.
- `VCO-IMPORT-PREDICATE-GAP-2026-06-15`: blocker for import branches not proven
  by current native fixture output.

This row checkpoint must not record:

- Habitat wrapper selector/current-tree proof;
- raw Grit acquisition;
- baseline proof;
- injected violation/cleanup proof;
- Effect adapter proof;
- apply safety;
- generator/migration proof;
- retired parity;
- source remediation;
- broader visualization architecture closure;
- neighboring row proof;
- product proof.

## Downstream Records

The aggregate proof matrix, command proof log, and corpus ledger will be
updated for this row's current checkpoint after evidence is gathered. Recovery
ledger, taxonomy, invariant corpus, discrepancy log, and command docs remain
unchanged unless implementation changes policy, diagnostics, or user-facing
behavior. DL-7 remains open because this row does not update evergreen Swooper
architecture documentation.
