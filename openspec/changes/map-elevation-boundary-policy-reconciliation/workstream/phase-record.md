# Phase Record: Map-Elevation Boundary Policy Reconciliation

## Status

Closed locally pending verification and Graphite commit.

## Evidence

- `rg` found `applyCiv7BuildElevationBoundaryPolicy` only in
  `@civ7/map-policy` export/test files.
- The active `map-elevation/buildElevation` step now reads the post-lake
  expected land mask, calls `TerrainBuilder.buildElevation`, repairs small
  drift, refreshes Civ caches, and fails only above the water-drift policy
  budget.

## Decision

Remove the unused helper. The active policy boundary is the lifecycle-aware
water-drift policy in the recipe projection layer, not a static preprojection
helper with no caller.
