## 1. Investigation And Review

- [x] 1.1 Inspect fresh Civ7 logs and classify this as behavior, not load
      failure.
- [x] 1.2 Record that the shared root issue is weak-positive score admission.
- [x] 1.3 Split planner admission from reef/wetland feature physics without
      creating generic shared machinery.
- [x] 1.4 Pass adversarial review before implementation.

## 2. Implementation

- [x] 2.1 Add local `policies/` owners for reef, wetland, vegetation, and ice
      score-to-intent admission.
- [x] 2.2 Apply family-local policy functions to reef, wetland, vegetation, and
      ice planners where they share the positive-score admission category.
- [x] 2.3 Keep generic score math separate from admission ownership; do not land
      admission in `score-shared`, `features-plan-shared`, or a generic
      `shared` bucket.
- [x] 2.4 Ensure each planner applies feature-family habitat eligibility before
      family-local admission and occupancy publish.
- [x] 2.5 Add why/what comments at policy owners and non-obvious call sites.

## 3. Tests And Docs

- [x] 3.1 Add categorical planner tests for positive-but-not-confident scores.
- [x] 3.2 Add guard coverage that prevents generic feature-planner shared
      admission and proves each in-kind planner owns a local policy.
- [x] 3.3 Run the existing normalization guardrails or focused ecology import
      guard that proves the new owner does not break import direction.
- [x] 3.4 Add recipe-level balance coverage without manual step wiring.
- [x] 3.5 Update Ecology docs and implementation evidence.

## 4. Verification

- [x] 4.1 Run focused ecology tests.
- [x] 4.2 Run `bun run --cwd mods/mod-swooper-maps check`.
- [x] 4.3 Run `bun run openspec -- validate bound-ecology-feature-intent-planners --strict`.
- [x] 4.4 Run `bun run openspec:validate`.
- [x] 4.5 Run `bun run build`.
- [x] 4.6 Run `bun run deploy:mods`.
- [x] 4.7 Run `git diff --check`.
