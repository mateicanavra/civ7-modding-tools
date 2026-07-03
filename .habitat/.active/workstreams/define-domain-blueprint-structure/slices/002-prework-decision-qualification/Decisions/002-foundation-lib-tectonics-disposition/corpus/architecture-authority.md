# Architecture Authority

Status: closed evidence artifact

## Governing References

- `.habitat/.active/workstreams/define-domain-blueprint-structure/scopes/domain/scope.md`
- `.habitat/.active/workstreams/define-domain-blueprint-structure/scopes/domain/overview.md`
- `.habitat/.active/workstreams/define-domain-blueprint-structure/decision-book/content-classes.md`
- `.habitat/.active/workstreams/define-domain-blueprint-structure/decision-book/move-classes.md`
- `.habitat/.active/workstreams/define-domain-blueprint-structure/decision-book/owner-boundaries.md`
- `packages/mapgen-core/src/AGENTS.md`
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`

## Authority Rules Used

Current source location is evidence only. Placement must be selected by the
closed blueprint owner classes.

`foundation/lib/**` is not an accepted target owner. Rows currently there must
classify to a named owner class or to deletion.

Domain model policy owns named cross-operation foundation semantic law:
classification encodings, domain-owned legality interpretation, scoring policy,
selection policy, and domain interpretation over artifacts.

Domain model data owns domain-authored data and expectation tables. No current
`foundation/lib/**` row in this packet is authored data or an expectation table.

Artifact contract owns pipeline truth product contracts. Foundation TypeBox
schemas consumed by operation contracts and downstream artifact consumers route
to exact `foundation/artifacts/contract/<artifact>.contract.ts` destinations or
to a narrow artifact-contract reference update before execution.

Operation-local rules own implementation for one operation. Historical shared
tectonics algorithms that are now implemented under operation `rules/` qualify
for deletion rather than promotion back into a shared operation-family bucket.

`packages/mapgen-core/src/lib/**` owns pure math, grid, scalar, or algorithmic
mechanics only when they have no domain model meaning, Civ7 policy, recipe-stage
meaning, adapter calls, or mod-specific semantics. Current evidence shows
foundation code imports core mechanics; core does not import foundation
`lib/**`.

## Non-Owners

`foundation/lib/**` is a current red source shape, not an authority owner.

Generic destinations such as `foundation/model/policy/misc.ts`,
`foundation/model/data/index.ts`, `foundation/artifacts/contract/shared.ts`, or
`packages/mapgen-core/src/lib/helpers.ts` are not acceptable dispositions.

The standard recipe stages are downstream consumers for this decision. They do
not own the foundation domain semantics classified here.

## Authority Gaps Before Execution

The destination classes exist, but several exact foundation-wide support
surfaces need a reference update before source movement:

- a named foundation artifact-contract surface for tectonic event records,
  era-field payloads, tracer index arrays, plate-id-by-era arrays, tectonic
  history, current tectonics, and tectonic provenance;
- a named foundation model policy surface for crust buoyancy/strength,
  foundation reference-area/dimension policy, and tectonic event/era constants;
- a named foundation operation-rule support surface or decomposition plan for
  cross-operation input guards;
- exact core API proof and file law for generic math/mesh helpers currently
  carried by `lib/tectonics/shared.ts`;
- exact operation-local owners for the foundation-specific threshold and
  advection constants mixed into `lib/tectonics/constants.ts` and
  `lib/tectonics/shared.ts`.

Those gaps do not block this prework decision. They do block immediate
source-moving execution until the later slice either tightens the scope law or
opens narrower implementation rows.
