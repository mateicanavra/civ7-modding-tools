## 1. Registry Identity

- [ ] 1.1 Change admission to request-id identity only.
- [ ] 1.2 Rename content fingerprints in registry-facing code to correlation or
      attribution digests.
- [ ] 1.3 Make expired request records lookup facts only for their own request
      id.

## 2. Durable Operation Record

- [ ] 2.1 Add minimal `RunOperationRecord` persistence.
- [ ] 2.2 Write phase/status/diagnostics updates through the durable record.
- [ ] 2.3 Add `RuntimeOwnershipLease` acquisition at Run in Game admission.
- [ ] 2.4 Block second active Run in Game operations and Save/Deploy
      deployed-mod writes while the lease is held.
- [ ] 2.5 Terminalize abandoned non-terminal records on daemon startup.
- [ ] 2.6 Release stale durable lease slots for abandoned records during startup
      terminalization.

## 3. Verification

- [ ] 3.1 Add behavior tests for same-content new request admission after prior
      terminalization.
- [ ] 3.2 Add behavior tests for active Run in Game single-flight conflicts,
      Save/Deploy deployed-mod write conflicts, and lease release.
- [ ] 3.3 Add restart reconciliation behavior tests.
- [ ] 3.4 Run and record live Studio endpoint checks for request-id admission,
      same-content repeat admission after terminalization, and active ownership
      conflict projection.
- [ ] 3.5 Register SA-02 `grit-studio-run-operation-identity-owner` with
      Pattern Authority metadata from the structural authority matrix.
- [ ] 3.6 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`; this packet does not close with
      skipped gates.
- [ ] 3.7 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
