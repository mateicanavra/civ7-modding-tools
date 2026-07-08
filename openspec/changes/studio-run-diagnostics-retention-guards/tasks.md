## 1. Retention

- [x] 1.1 Implement request workspace retention policy.
- [x] 1.2 Run cleanup at daemon startup and terminalization.
- [x] 1.3 Preserve active operations.
- [x] 1.4 Keep diagnostics lookup behavior safe after cleanup.
- [x] 1.5 Use terminal timestamp ordering and request-id tie-breaker for the
      latest-100 terminal retention rule.

## 2. Structural Closure

- [x] 2.1 Register SA-14 `habitat-studio-run-runtime-authority-closure`.
- [x] 2.2 Verify SA-01 through SA-13 are registered and green.
- [x] 2.3 Remove or promote every packet-local temporary Grit pattern.
- [x] 2.4 Record Pattern Authority metadata for any new registered Grit rule.
      No new Grit rule was introduced by Packet 14; SA-14 is a Habitat script
      runner closure check.
- [x] 2.5 Record baseline/introduction contracts and hook-scope decisions.

## 3. Verification

- [x] 3.1 Add behavior tests for retention and diagnostics lookup.
- [x] 3.2 Run Habitat authority checks for registered structural assertions.
- [ ] 3.3 Run the full live Run in Game verification matrix from
      `target-vocabulary.md`, using actual Studio endpoint calls and
      successful in-game Civ7 launch variants with generated content proven
      present through post-start Civ7 evidence.
- [x] 3.4 Run `bun run openspec:validate`.
- [ ] 3.5 Complete final adversarial packet-set review.
- [x] 3.6 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`; final closure remains open until
      every behavioral unit, endpoint, structural, OpenSpec, and in-game gate is
      green.
- [x] 3.7 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
