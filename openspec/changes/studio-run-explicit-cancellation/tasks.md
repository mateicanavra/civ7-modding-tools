## 1. API Contract

- [x] 1.1 Add `runInGame.cancel({ requestId })` to the public API contract.
- [x] 1.2 Project cancellation through `PublicRunStatus`.
- [x] 1.3 Ensure HTTP abort does not call cancellation logic.

## 2. Runtime

- [x] 2.1 Add active worker interruption.
- [x] 2.2 Run cleanup and diagnostics recording on cancellation.
- [x] 2.3 Release the runtime ownership lease after cleanup and diagnostics
      finalization.
- [x] 2.4 Emit exactly one terminal cancellation event.

## 3. Verification

- [x] 3.1 Add behavior tests for active, repeated, terminal, unknown, and HTTP
      abort cases.
- [x] 3.2 Add behavior tests for cancellation before deployment, during
      deployment, during observation, and after terminalization.
- [x] 3.3 Run and record live Studio endpoint checks for active, repeated,
      terminal, and unknown cancellation requests.
- [x] 3.4 Register SA-03 `grit-studio-run-cancel-command-owner` with Pattern
      Authority metadata from the structural authority matrix.
- [x] 3.5 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`; this packet does not close with
      skipped gates.
- [x] 3.6 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
