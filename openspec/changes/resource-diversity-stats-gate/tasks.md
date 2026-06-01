## 1. Stats Gate

- [x] 1.1 Add unique planned numeric resource type count.
- [x] 1.2 Add unique placed numeric resource type count.
- [x] 1.3 Add min/max placed count per numeric resource id.
- [x] 1.4 Assert shipped map identities use the available numeric resource
  catalog when placement counts permit.
- [x] 1.5 Assert per-id placed counts remain near-even.

## 2. Tests And Review

- [x] 2.1 Run world-balance stats tests.
- [x] 2.2 Run package check.
- [x] 2.3 Run framed peer review and disposition accepted P1/P2 findings.

## 3. Verification And Closure

- [x] 3.1 Run OpenSpec validation.
- [x] 3.2 Run `git diff --check`.
- [x] 3.3 Commit the Graphite slice locally at `3cecdf6b49a1` and leave the
  worktree clean before opening `codex/resource-runtime-proof` above it, while
  keeping external Graphite submission/PR delivery, symbolic `RESOURCE_*`
  runtime-id proof, and FireTuner runtime proof unclaimed.
