# Design - Control oRPC Contract Ownership Proof

## Frame

### Objective

Make `grit-control-orpc-contract-ownership` truthful as a row-owned Habitat proof
checkpoint for the current Grit predicate.

### Product Movement

This row helps Habitat keep control-oRPC public contracts transport-pure while
allowing runtime dependencies in the procedure/service layers that own behavior.

### Selection

- Rule id: `grit-control-orpc-contract-ownership`
- Grit pattern: `control_orpc_contract_ownership`
- Pattern file:
  `.grit/patterns/habitat/checks/control_orpc_contract_ownership.md`
- Owner layer: `grit-check`
- Registry scope:
  `packages/civ7-control-orpc/src/modules/**/contract.ts and root index`
- Current Grit predicate scope:
  - module contract filenames matching
    `.*packages/civ7-control-orpc/src/modules/.*/contract\.ts$`;
  - root index filename matching
    `.*packages/civ7-control-orpc/src/index\.ts$`.
- Forbidden current syntax classes:
  - direct `@civ7/direct-control` import declarations inside module
    `contract.ts` files;
  - exported contract-local schema consts whose names match
    `Civ7*InputSchema`, `Civ7*ResultSchema`, `Civ7*OutputSchema`, or
    `Civ7*StandardSchema`;
  - intended root `index.ts` named export-from declarations from
    `./modules/<module>/contract` containing schema specifiers. The current
    native fixture probe does not report this class and records it as a
    predicate-gap blocker instead of claiming proof.

### Hard Core

1. This is a check proof, not an apply proof.
2. Current predicate proof covers syntax/path classes only; it is not a
   semantic proof of all control-oRPC architecture.
3. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, retired parity, and product
   proof are separate proof classes.
4. Direct-control imports in context, dependency, and procedure files are
   outside the current contract predicate and are path controls for this row.
5. Private contract-local input/result/standard schemas are allowed controls for
   this row when they are not exported.
6. Root index schema exports from bridge, errors, and model files are not
   current-row module-contract schema export candidates.

### Exterior

- Package source remediation.
- Predicate repair for semantic ownership outside the current native predicate.
- Baseline mutation.
- Product/runtime Civ7 behavior.

### Falsifier

This checkpoint fails if it claims wrapper/current-tree enforcement from native
fixtures, if live current-predicate candidates are found but recorded as a clean
pass without owner disposition, if the root-index module-contract schema export
gap is treated as proven, if root index bridge/error schema exports are
mislabeled as module-contract schema leaks, or if product/runtime proof is
treated as proven by this row.

## Source Synthesis

`rules.json` registers `grit-control-orpc-contract-ownership` as an enforced
`grit-check`, scoped to control-oRPC module contracts and the root index, and
forbids direct-control imports in contracts or contract-local schemas from the
public root.

`packages/civ7-control-orpc/AGENTS.md` records that this package owns native
oRPC/Effect procedure contracts, routers, typed context, typed errors,
middleware, in-process server-side clients, and service behavior over
`@civ7/direct-control` runtime ports. It also records that runtime access stays
in `@civ7/direct-control`, provider construction belongs to callers/adapters,
and direct-control procedure use should own service behavior rather than only
delegating inputs.

`grit-pattern-corpus-ledger.md` requests positive transport/runtime imports in
contracts, negative schema-private module use, current control-oRPC scan,
non-apply disposition, and the `habitat-grit-proof-control-orpc-contract-ownership`
packet.

`grit-proof-matrix.md` records a design seed with one match and one ignore and
marks parser-edge and false-positive classification pending.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| Direct value import from `@civ7/direct-control` in a module `contract.ts` | Reports |
| Direct type-only import from `@civ7/direct-control` in a module `contract.ts` | Reports if current native predicate reports it |
| Exported `Civ7*InputSchema` / `Civ7*ResultSchema` / `Civ7*OutputSchema` / `Civ7*StandardSchema` const in a module `contract.ts` | Reports |
| Root `index.ts` export-from of a schema from `./modules/<module>/contract` | Current native fixture probe does not report; record as predicate-gap blocker |
| Private schema consts in module contracts | Does not report |
| Exported non-input/result schema lookalikes in module contracts | Does not report |
| Direct-control imports in procedures, context, and dependency files | Does not report in this row |
| Root index schema exports from bridge/errors/model files | Does not report in this row |
| `.tsx`, source lookalike, and dynamic import shapes | Do not report in this current native predicate |

## Proof Contract

This row checkpoint may record:

- native fixture/parser-edge proof for current-predicate behavior;
- parser inventory/live candidate evidence over current control-oRPC source;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Proof ids:

- `COCO-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof for
  contract import/schema-export positive classes, recorded controls, and the
  root-index predicate-gap probe.
- `COCO-CONTROL-ORPC-INVENTORY-2026-06-15`: parser inventory/live evidence over
  current control-oRPC source.

This row checkpoint must not record:

- Habitat wrapper selector/current-tree proof;
- raw Grit acquisition;
- baseline proof;
- injected violation/cleanup proof;
- Effect adapter proof;
- apply safety;
- generator/migration proof;
- retired parity;
- broader control-oRPC architecture closure;
- exact root-index module-contract schema re-export closure;
- neighboring row proof;
- product proof.

## Downstream Records

The aggregate proof matrix, command proof log, and corpus ledger will be
updated for this row's current checkpoint after evidence is gathered. Recovery
ledger, taxonomy, invariant corpus, discrepancy log, and command docs remain
unchanged unless implementation changes policy, diagnostics, or user-facing
behavior.
