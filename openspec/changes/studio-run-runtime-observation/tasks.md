## 1. Observation

- [ ] 1.1 Add observation precondition checks.
- [ ] 1.2 Establish scripting-log observation window before Civ7 start or
      focus.
- [ ] 1.3 Exclude stale log lines before the observation cursor.
- [ ] 1.4 Collect scripting log observation.
- [ ] 1.5 Collect setup row readback.
- [ ] 1.6 Collect loaded-game readback after game start: the
      generated-artifact marker emitted by the running game plus
      `civ7.live.status` and `civ7.live.snapshot` over the public `/rpc` oRPC
      mount.
- [ ] 1.7 Match observations against every `RunCorrelation` field.

## 2. Failure Mapping

- [ ] 2.1 Map direct-control failures to public category `runtime-control`.
- [ ] 2.2 Map observation timeout, mismatch, missing setup row, and mismatched
      setup row to `runtime-observation`.
- [ ] 2.3 Map missing or mismatched loaded-game readback to
      `runtime-observation`.
- [ ] 2.4 Record private diagnostics for observation failures.

## 3. Verification

- [ ] 3.1 Add behavior tests with fake direct-control/log readers.
- [ ] 3.2 Add behavior tests for stale-log exclusion, timeout, setup-row
      missing, setup-row mismatch, loaded-game marker missing/mismatch, and
      shape-only status/snapshot evidence not satisfying the loaded-game
      oracle.
- [ ] 3.3 Run and record live Studio endpoint plus Civ7-controlled observation
      gate that establishes a fresh log window, excludes stale log markers,
      observes the generated-artifact marker from the running game, reads setup
      row state, reads loaded-game status and bounded map snapshot through
      `civ7.live.status` and `civ7.live.snapshot` over `/rpc`, and correlates
      the deployed run.
- [x] 3.4 Register SA-12
      `grit-studio-run-direct-control-observation-boundary` with Pattern
      Authority metadata from the structural authority matrix.
- [ ] 3.5 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`; this packet does not close with
      skipped gates.
- [x] 3.6 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
