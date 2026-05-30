## Context

The archived packet train completed the named dominoes, but the follow-on review
found residual in-kind violations. This design treats those residuals as a
single standardization pass because the failures share a cause: responsibility
moved, but some compensation paths and special surfaces remained.

## Standard Shape

### Artifact And Effect Owners

Truth artifacts live with the truth stage/family that produces the domain
state. Projection/readback artifacts live with the `map-*` or placement owner
that observes engine state. Recipe-root surfaces are allowed only for named
cross-projection invariants that multiple projection owners consume.

### Config Owners

Persisted stage config uses flat step ids by default:

```ts
{ knobs?: StageKnobs; [stepId]?: StepConfig }
```

Operation or strategy schemas live with the owning op/strategy contract or a
named op-family invariant. Domain `/config.ts` files may aggregate recipe-facing
knobs or re-export owner-local surfaces; they are not schema catalogs.

### Projection Owners

`map-*` stages project existing truth into engine terrain/effects/readback.
They do not run domain planning. If a `map-*` step needs a mask or intent, a
truth stage publishes it first and the projection step consumes it.

### Placement Product Owners

Placement steps split at real product/effect contracts:

- natural wonders
- resources
- starts
- discoveries
- advanced starts
- final placement summary/evidence

Maintenance operations such as terrain validation, area recalculation, water
store refresh, and landmass-region restamping remain grouped only when they are
transactional preparation/finalization, not product contracts.

### Comments

New or modified code comments should explain why the owner exists, what policy
or invariant is encoded, and what future maintainers must preserve. Comments
should not restate obvious control flow.

## Decisions

### No Compatibility Paths

Old ids, old config keys, old helper paths, and old monolith entrypoints are
removed when the new owner exists. Tests and docs move to the new surface in the
same change.

### Shared Surfaces Need Named Invariants

An apparent bucket can remain only when it names the invariant and consumer set.
Otherwise the implementation moves the contents to a stage, step, op, domain
family, SDK, adapter, or MapGen core owner.

### Guards Follow Source Truth

Persistent categorical failures get guards after the source is made true. Guards
must reject categories, not just one file, and must not use broad exception
buckets to pass.

## Review Lanes

- Architecture review: owner boundaries, truth/projection separation, and no
  false shared owners.
- Developer experience review: predictable file tree, config keys, imports, and
  diagnostics.
- Complexity review: delete compensation paths, wrapper churn, helper ladders,
  unused ops, and stale monolith APIs.
- Adversarial review: no alias/fallback/silent compatibility paths, no
  proof inflation from manual step wiring, and no guard that exceeds achieved
  source truth.

## Risks / Trade-offs

- Splitting placement too finely could manufacture fake dependencies. This pass
  splits only product/effect contracts and keeps transactional maintenance
  grouped.
- Moving every shared artifact to producing stages can create import loops or
  false owners. A named contract surface is acceptable when it represents a real
  shared invariant and concrete consumers.
- Large config migrations can look mechanical; tests must reject old keys so
  the old shape is not silently preserved.
