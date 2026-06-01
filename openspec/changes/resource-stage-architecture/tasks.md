## 1. Architecture Decision

- [x] 1.1 Establish `resources` as the accepted target stage.
- [x] 1.2 Define the required support split for placement preparation.
- [x] 1.3 Define target resources-stage steps and artifact handoffs.
- [x] 1.4 Define resource group step criteria.
- [x] 1.5 Define migration sequence and stop conditions.
- [x] 1.6 Define placement-preparation split and merge-resource-intents step.
- [x] 1.7 Define future slice write sets, equivalence tests, and migration hazards.

## 2. OpenSpec

- [x] 2.1 Add OpenSpec requirement for resource stage promotion.
- [x] 2.2 Add OpenSpec requirement for placement-preparation handoff.
- [x] 2.3 Add OpenSpec requirement for resource group step acceptance.
- [x] 2.4 Add OpenSpec requirements for artifact-boundary migration,
  pass-through preservation, resource expectation evidence, and runtime summary
  proof.

## 3. Review And Verification

- [x] 3.1 Complete agent review of the architecture slice.
- [x] 3.2 Run OpenSpec validation and `git diff --check`.
- [x] 3.3 Commit the slice with Graphite and leave the worktree clean.
