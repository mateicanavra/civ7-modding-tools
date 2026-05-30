## Context

Current behavior delegates lake generation to Civ7 projection. The target is
Hydrology-owned intent projected through adapter capability. The prior failure
mode is gating a planned mask that the runtime cannot actually stamp or read
back.

## Goals / Non-Goals

**Goals:**

- Add adapter lake materialization/readback capability.
- Publish Hydrology lake intent as a truth artifact.
- Project and verify lake intent in `map-hydrology`.
- Migrate placement lake inputs to Hydrology truth once projection capability
  exists.
- Preserve proof boundaries.

**Non-Goals:**

- Split placement products beyond the lake-input contract migration.
- Fully port every Civ7 hydrography legality rule.
- Make engine-generated lake diagnostics into truth.

## Decisions

### Capability Comes Before Fail-Hard Parity

The change order is adapter capability, then lake intent, then projection, then
parity. Any other order creates a brittle gate over unmaterialized intent.

### Lake Truth Lives Upstream Of map-hydrology

Hydrology owns `plan-lakes`. `map-hydrology` consumes that plan and owns engine
state writes/readback.

### Placement Consumes Truth, Not Projection Diagnostics

After lake truth can be materialized and read back, placement input derivation
must consume the Hydrology lake artifact rather than an engine projection
diagnostic.

## Risks / Trade-offs

- Adapter readback may expose engine limitations that require a deferral rather
  than a parity gate.
- Test doubles can overstate proof if they do not model runtime constraints.
- Lake-input migration can collide with placement decomposition. This slice
  changes only the lake input contract; product/effect splitting remains in
  `normalize-placement-contracts`.

## Review Lanes

- Architecture review: confirms truth/projection ownership.
- Product/proof review: confirms what local tests prove versus in-game checks.
- Adversarial review: checks for fail-hard gates before capability and hidden
  engine-as-truth language.
