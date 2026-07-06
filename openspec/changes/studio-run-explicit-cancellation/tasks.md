## 1. API Contract

- [ ] 1.1 Add `runInGame.cancel({ requestId })` to the public API contract.
- [ ] 1.2 Project cancellation through `PublicRunStatus`.
- [ ] 1.3 Ensure HTTP abort does not call cancellation logic.

## 2. Runtime

- [ ] 2.1 Add active worker interruption.
- [ ] 2.2 Run cleanup and diagnostics recording on cancellation.
- [ ] 2.3 Release the runtime ownership lease after cleanup and diagnostics
      finalization.
- [ ] 2.4 Emit exactly one terminal cancellation event.

## 3. Verification

- [ ] 3.1 Add behavior tests for active, repeated, terminal, unknown, and HTTP
      abort cases.
- [ ] 3.2 Add behavior tests for cancellation before deployment, during
      deployment, during observation, and after terminalization.
- [ ] 3.3 Register SA-03 `grit-studio-run-cancel-command-owner` with Pattern
      Authority metadata from the structural authority matrix.
