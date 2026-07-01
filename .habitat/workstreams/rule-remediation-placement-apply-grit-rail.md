# Rule Remediation: Placement Apply Grit Rail

Status: closed on `codex/habitat-placement-apply-grit-rail`

## Slice

Selected rule:

- `require_typed_placement_outcomes_before_apply`

Input action class: split by owner.

## Decision

The row does not require a new owner split. The existing Grit rule is already
atomized to terminal `placement/apply.ts`.

Official resource and discovery materialization lives in separate placement
substeps. Terminal apply consumes typed outcome artifacts and must not call the
official generators directly.

## Mutation

No rule packet mutation was required.

## Proof

- `bun habitat check --rule require_typed_placement_outcomes_before_apply --json`
  passed.
- A temporary `generateOfficialResources()` probe in terminal
  `placement/apply.ts` failed the Grit rule at the inserted callsite and was
  removed.

## Proof Limit

This slice does not settle broader placement materialization policy. It only
repairs the canonical remediation matrix so an already-atomized terminal apply
rail is not kept in the split-by-owner queue.
