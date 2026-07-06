## 1. Retention

- [ ] 1.1 Implement request workspace retention policy.
- [ ] 1.2 Run cleanup at daemon startup and terminalization.
- [ ] 1.3 Preserve active operations.
- [ ] 1.4 Keep diagnostics lookup behavior safe after cleanup.
- [ ] 1.5 Use terminal timestamp ordering and request-id tie-breaker for the
      latest-100 terminal retention rule.

## 2. Structural Closure

- [ ] 2.1 Register SA-14 `habitat-studio-run-runtime-authority-closure`.
- [ ] 2.2 Verify SA-01 through SA-13 are registered and green.
- [ ] 2.3 Remove or promote every packet-local temporary Grit pattern.
- [ ] 2.4 Record Pattern Authority metadata for any new registered Grit rule.
- [ ] 2.5 Record baseline/introduction contracts and hook-scope decisions.

## 3. Verification

- [ ] 3.1 Add behavior tests for retention and diagnostics lookup.
- [ ] 3.2 Run Habitat authority checks for registered structural assertions.
- [ ] 3.3 Run the live Run in Game verification contract from
      `target-vocabulary.md`, or record not-green closure if Civ7 is
      unavailable.
- [ ] 3.4 Run `bun run openspec:validate`.
- [ ] 3.5 Complete final adversarial packet-set review.
