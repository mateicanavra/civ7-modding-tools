# Source Synthesis - Control App Surface

## Authority

The game-door invariant names the production constructor owner files for
`Civ7DirectControlSession`: the direct-control session implementation and the
Studio server `Civ7TunerSession` service. It also states that app code, router
leaves, feature modules, operation engines, and caller-local utility scripts
must not construct direct-control sessions locally.

The Habitat taxonomy assigns raw tuner/session primitives to
`@civ7/direct-control`, the long-lived Studio host session to
`@civ7/studio-server`, and procedure/service behavior to
`@civ7/control-orpc`. Therefore this row targets direct constructor ownership,
not every direct-control import.

## Current Predicate

Current Grit path predicate:

`apps/**/*.ts`, `apps/**/*.tsx`, `packages/**/*.ts`, and `packages/**/*.tsx`,
excluding tests and the sanctioned owner files.

Current source predicate:

- `new Civ7DirectControlSession(...)`

## Parser Inventory

`CAS-CONTROL-SURFACE-INVENTORY-2026-06-15` scanned `apps` and `packages`,
skipped `node_modules`, `dist`, `mod`, and `coverage`, and found zero current
candidates across 849 current-predicate production `.ts`/`.tsx` files.

The scan found the expected controls: two sanctioned owner constructors in
`packages/civ7-direct-control/src/session/session.ts` and
`packages/studio-server/src/services/Civ7TunerSession.ts`, plus five test-only
constructors under `packages/civ7-direct-control/test`. Those controls are not
current-row candidates.

## Row Boundary

This row does not ban direct-control imports broadly. It does not prove
control-oRPC contract ownership, DDIT adapter scan-root activation, source
remediation, apply safety, classify/generator behavior, broader control
architecture closure, or product/runtime behavior. The registered CAS-only
injected proof is separate from the full shared injected corpus, which remains
blocked by the accepted DDIT adapter activation gap.
