## 1. Source Artifact

- [x] 1.1 Add typed resource-domain expectation artifact source.
- [x] 1.2 Preserve official corpus order and static row slots.
- [x] 1.3 Keep runtime numeric ids unverified and absent from expectation rows.
- [x] 1.4 Keep blocked/no-biome resources visible and active-zero.
- [x] 1.5 Preserve crabs navigable-river eligibility.

## 2. Schema And Artifact Registration

- [x] 2.1 Register `artifact:resources.earthlikeExpectations`.
- [x] 2.2 Add strict TypeBox artifact schema.
- [x] 2.3 Reject runtime-id overclaims, feature rows, invalid statuses, missing
  range fields, and blocked-row range leakage.

## 3. Tests And Review

- [x] 3.1 Add focused resource artifact tests.
- [x] 3.2 Run framed implementation-readiness review before commit.
- [x] 3.3 Run post-implementation review and repair accepted P1/P2 findings.

## 4. Verification And Closure

- [x] 4.1 Run focused resource tests.
- [x] 4.2 Run package check.
- [x] 4.3 Run OpenSpec validation.
- [x] 4.4 Run `git diff --check`.
- [x] 4.5 Commit the Graphite slice and leave the worktree clean.
