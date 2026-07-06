## 1. Observation

- [ ] 1.1 Add observation precondition checks.
- [ ] 1.2 Establish scripting-log observation window before Civ7 start or
      focus.
- [ ] 1.3 Exclude stale log lines before the observation cursor.
- [ ] 1.4 Collect scripting log observation.
- [ ] 1.5 Collect setup row readback.
- [ ] 1.6 Match observations against every `RunCorrelation` field.

## 2. Failure Mapping

- [ ] 2.1 Map direct-control failures to public category `runtime-control`.
- [ ] 2.2 Map observation timeout, mismatch, missing setup row, and mismatched
      setup row to `runtime-observation`.
- [ ] 2.3 Record private diagnostics for observation failures.

## 3. Verification

- [ ] 3.1 Add behavior tests with fake direct-control/log readers.
- [ ] 3.2 Add behavior tests for stale-log exclusion, timeout, setup-row
      missing, and setup-row mismatch.
- [ ] 3.3 Register SA-12
      `grit-studio-run-direct-control-observation-boundary` with Pattern
      Authority metadata from the structural authority matrix.
