# Morphology Rough-Land Owner

## Why

The terrain authorship diagnosis showed that Swooper Earthlike was not failing
because mountain or hill caps were too low. It was failing because hills had no
Morphology-owned candidate surface beyond ridge skirts and strong boundary
deformation. That left broad continental interiors flat even when mountain
shares looked plausible.

## What Changes

- Add `morphology/plan-rough-lands`, a dedicated Morphology op for non-foothill
  hills.
- Feed the op with post-erosion topography, belt drivers, routing, coastline
  distance, and substrate.
- Publish separate `foothillMask`, `roughLandMask`, and `roughnessPotential`
  diagnostics while preserving the existing combined `hillMask` projection
  contract.
- Add focused Earthlike relief tests that assert the predeclared hard-fail
  bands for hills and flatness.

## What Does Not Change

- No shipped map config tuning.
- No map-projection ownership change; `plotMountains` still stamps Morphology
  truth only.
- No claim of runtime engine elevation or cliff proof.
