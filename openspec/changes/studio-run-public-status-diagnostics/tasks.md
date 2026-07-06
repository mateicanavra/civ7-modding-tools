## 1. Public Contract

- [ ] 1.1 Define closed public phase and failure-category enums.
- [ ] 1.2 Replace public status/event/current schemas with `PublicRunStatus`.
- [ ] 1.3 Align declared Run in Game public errors to the same safe projection.
- [ ] 1.4 Remove open public payload fields by changing the public schema shape,
      not by adding behavior tests for retired keys.

## 2. Diagnostics Record

- [ ] 2.1 Add `RunDiagnosticsRecord` identity, allocation, writer, and lookup.
- [ ] 2.2 Store diagnostics durably under
      `.mapgen-studio/run-in-game/<requestId>/diagnostics/diagnostics.json`.
- [ ] 2.3 Ensure every emitted `diagnosticsId` resolves across daemon restart or
      returns safe not-found after retention.
- [ ] 2.4 Move copy-diagnostics behavior to diagnostics lookup.

## 3. Verification

- [ ] 3.1 Add behavior tests for public projection and diagnostics lookup.
- [ ] 3.2 Run and record live Studio endpoint checks for public status and
      diagnostics lookup shape.
- [ ] 3.3 Register SA-01 `grit-studio-run-public-contract-closed` with Pattern
      Authority metadata from the structural authority matrix.
- [ ] 3.4 Run focused package checks and OpenSpec validation.
- [ ] 3.5 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`; this packet does not close with
      skipped gates.
- [ ] 3.6 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
