# Proposal: Tighten MapGen Visual Quality Gates

## Why

Repair the deployed Earthlike visual regression where Hydrology projected many
isolated circular lakes despite aggregate world-balance tests passing. Extend
the shipped-map proof suite so it measures player-visible lake shape and engine
water drift, then align shipped configs with the current strategy surface where
older/simple selections remain.

The previous world-balance proof checked total lake share, reef share, wetland
share, and required feature presence. That missed a product-visible failure:
acceptable lake area split into dozens of one-tile circular basins. The proof
must reject that class directly and configs must use current domain strategies
where the richer strategy is available for the map identity.

## What Changes

- Tighten Hydrology lakeiness policy so lake levels produce basin clusters, not
  singleton sink dots.
- Add shipped-map lake component, singleton, projection-mismatch, and water-drift
  metrics through the public standard recipe/runtime path.
- Update shipped map configs and Earthlike preset to use current strategy
  selections where the older selection is clearly inferior for that map.
- Preserve stage-local artifact validation ownership and avoid generic shared
  routing machinery.

## Non-Goals

- Do not introduce a generic artifact module architecture.
- Do not introduce a sea-level compatibility layer; current official evidence
  does not justify one.
- Do not centralize feature policy logic into generic shared planner machinery.
