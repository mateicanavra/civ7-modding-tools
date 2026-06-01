## 1. Investigation And Spec

- [ ] 1.1 Map official feature valid terrain/biome rules for vegetation and
  reef-family features.
- [ ] 1.2 Identify planner/projection boundaries that need symbolic legality
  inputs.

## 2. Implementation

- [ ] 2.1 Add strict feature legality support to tests or mock adapter.
- [ ] 2.2 Add per-feature rejection diagnostics to feature apply.
- [ ] 2.3 Repair vegetation planning for engine-valid forest, taiga, savanna,
  steppe, and rainforest surfaces.
- [ ] 2.4 Repair reef-family planning for coast-valid reefs/cold reefs and
  ocean-valid atolls.

## 3. Verification

- [ ] 3.1 Run focused strict eligibility tests.
- [ ] 3.2 Run world-balance stats tests.
- [ ] 3.3 Run OpenSpec validation.
- [ ] 3.4 Run `git diff --check`.
