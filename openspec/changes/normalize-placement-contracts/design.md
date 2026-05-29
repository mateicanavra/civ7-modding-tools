## Context

Placement currently contains many product and maintenance concerns in one
apply path. The accepted target is not one step per helper; it is one boundary
per product/effect contract.

## Goals / Non-Goals

**Goals:**

- Expose real placement products as steps or contracts.
- Preserve transactional maintenance work where independent contracts do not
  exist.
- Prepare resources/discoveries for typed reconciliation.

**Non-Goals:**

- Implement D4 typed reconciliation.
- Port all Civ7 feasibility rules.
- Change product behavior just to make cleaner steps.

## Decisions

### Product Or Effect Contract Is The Split Trigger

A placement concern may become a step when it owns a gameplay product, effect
surface, artifact, consumer, or verification boundary. Internal sequencing
alone is not enough.

### Maintenance Can Stay Transactional

Terrain validation, area recalculation, water cache storage, restamping, and
fertility recalculation may remain in a transaction unless a downstream
consumer needs their artifacts independently.

## Risks / Trade-offs

- Over-splitting can manufacture fake dependencies.
- Under-splitting can leave resource/discovery reconciliation blocked.
- Product steps can alter ordering if the recipe/stage composition is not
  tested.

## Review Lanes

- Architecture review: validates step contracts and stage composition.
- Product review: validates gameplay product boundaries.
- Adversarial review: looks for fake dependency chains and hidden behavior
  changes.
