## 1. Investigation And Spec

- [x] 1.1 Map official feature valid terrain/biome rules for vegetation and
  reef-family features.
- [x] 1.2 Identify planner/projection boundaries that need symbolic legality
  inputs.

## 2. Implementation

- [x] 2.1 Add shared strict feature legality support used by planner
  admission and product-balance diagnostics.
- [x] 2.2 Add per-feature rejection diagnostics to feature apply.
- [x] 2.3 Repair vegetation and wetland planning for engine-valid forest,
  taiga, savanna, steppe, rainforest, marsh, bog, mangrove, oasis, and
  watering-hole surfaces.
- [x] 2.4 Repair reef-family planning for coast-valid reefs/cold reefs and
  ocean-valid atolls.

## 3. Verification

- [x] 3.1 Run focused strict eligibility validation through the world-balance
  stats gate.
- [x] 3.2 Run world-balance stats tests.
- [x] 3.3 Run OpenSpec validation.
- [x] 3.4 Run `git diff --check`.
