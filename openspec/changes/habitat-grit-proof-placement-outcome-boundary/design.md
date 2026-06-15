# Design - Placement Outcome Boundary Proof

## Frame

### Objective

Make `grit-placement-outcome-boundary` truthful as a row-owned Habitat proof
checkpoint for the current Grit predicate.

### Product Movement

This row helps Habitat keep terminal placement apply as a typed evidence
collation boundary instead of a hidden official-generator materialization
surface. Resources and discoveries must arrive as typed outcome artifacts before
the terminal apply step consumes them.

### Selection

- Rule id: `grit-placement-outcome-boundary`
- Grit pattern: `placement_outcome_boundary`
- Pattern file:
  `.grit/patterns/habitat/checks/placement_outcome_boundary.md`
- Owner layer: `grit-check`
- Registry scope: placement apply implementation
- Current Grit predicate scope: exact path regex
  `.*mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply\.ts$`
- Forbidden current syntax class: direct calls to
  `generateOfficialResources($...)` or `generateOfficialDiscoveries($...)`.

### Hard Core

1. This is a check proof, not an apply proof.
2. Current predicate proof covers only the terminal Swooper placement
   `steps/placement/apply.ts` file.
3. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, and product proof are
   separate proof classes.
4. Typed outcome artifact consumption is the approved control shape for this
   row.
5. Same-name property/member lookalikes, non-placement apply paths, generated
   output, packages, `.tsx`, and other-mod paths are controls under this row.
6. Current parser inventory is not Habitat wrapper enforcement proof or product
   placement proof.

### Exterior

- Swooper placement source remediation.
- Predicate repair for official-generator member/import classes outside the
  current direct-call predicate.
- Generator or migration behavior.
- Baseline mutation.
- Product/runtime Civ7 placement behavior.

### Falsifier

This checkpoint fails if it claims wrapper/current-tree enforcement from native
fixtures, if live current-predicate direct official-generator calls are found
but recorded as a clean pass without owner disposition, if typed outcome
artifact consumption is mislabeled as an official-generator call, or if product
placement proof is treated as proven by this row.

## Source Synthesis

`rules.json` registers `grit-placement-outcome-boundary` as an enforced
`grit-check` for `mod-swooper-maps`, scoped to placement apply implementation,
forbidding direct official resource/discovery generation calls.

The architecture normalization packet records D3/D4 placement decisions:
placement splits at real product/effect contracts, and resources/discoveries
use typed intent reconciliation rather than official generator output as truth.

`NORMALIZATION-GUARDRAILS.md` records G8 as the placement hidden-subconcerns
guardrail owned by this Habitat Grit rule and placement reconciliation tests.

`PLACEMENT.md` records runtime semantics where deterministic plans are the
typed intent authority, materializers reconcile adapter legality/readback with
typed outcomes, and placement apply consumes outcome artifacts.

`grit-pattern-corpus-ledger.md` requests positive direct official generator
calls, negative typed outcome use, current placement implementation scan,
empty locked baseline unless findings prove otherwise, and non-apply
disposition.

`grit-proof-matrix.md` records a design seed with one match and one ignore and
marks parser-edge and false-positive classification pending.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| Direct `generateOfficialResources(...)` call in terminal placement `apply.ts` | Reports |
| Direct `generateOfficialDiscoveries(...)` call in terminal placement `apply.ts` | Reports |
| Multiple arguments, nested call position, or awaited direct call | Reports when direct call syntax matches |
| Typed `resourcePlacement` / `discoveryPlacement` outcome artifact consumption | Does not report |
| Same-name property/member or string lookalikes | Do not report in this current predicate |
| Non-placement apply path, generated-output-shaped path, package path, `.tsx`, and other-mod path | Do not report |

## Proof Contract

This row checkpoint may record:

- native fixture/parser-edge proof for current-predicate behavior;
- parser inventory/live candidate evidence over current Swooper terminal
  placement apply source;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Proof ids:

- `POB-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof for
  current-predicate positive classes and recorded controls.
- `POB-PLACEMENT-INVENTORY-2026-06-15`: parser inventory/live evidence over
  current Swooper terminal placement apply source.

This row checkpoint must not record:

- Habitat wrapper selector/current-tree proof;
- raw Grit acquisition;
- baseline proof;
- injected violation/cleanup proof;
- Effect adapter proof;
- apply safety;
- generator/migration proof;
- retired parity;
- broader placement product closure;
- neighboring row proof;
- product proof.

## Downstream Records

The aggregate proof matrix, command proof log, and corpus ledger will be
updated for this row's current checkpoint after evidence is gathered. Recovery
ledger, taxonomy, invariant corpus, discrepancy log, and command docs remain
unchanged unless implementation changes policy, diagnostics, or user-facing
behavior.
