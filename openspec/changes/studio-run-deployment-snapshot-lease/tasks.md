## 1. Deployment

- [x] 1.1 Copy from `StudioRunGeneratedMod` to `mod-swooper-studio-run`.
- [x] 1.2 Launch Run in Game through the Studio-run map script and report
      setup/visibility failure if Civ7 cannot observe the deployed row.
- [x] 1.3 Record `RunDeployment` and `DeployedModSnapshot` after copy.
- [x] 1.4 Map deployment failures to public category `deployment`.

## 2. Runtime Lease

- [x] 2.1 Attach deployed mod identity to the existing admitted
      `RuntimeOwnershipLease`.
- [x] 2.2 Gate Run in Game deployment/setup/start with the lease.
- [x] 2.3 Gate Save/Deploy deployed-mod writes with the same lease without
      changing Save/Deploy catalog semantics.
- [x] 2.4 Release lease on success, failure, and cancellation cleanup.

## 3. Verification

- [x] 3.1 Add behavior tests for deployment copy/snapshot.
- [x] 3.2 Add behavior tests for Save/Deploy conflict and lease release.
- [x] 3.3 Run and record live Studio endpoint checks for deployment snapshot
      creation and Save/Deploy ownership conflict projection.
- [x] 3.4 Register SA-11 `grit-studio-run-copy-deploy-boundary` with Pattern
      Authority metadata from the structural authority matrix.
- [x] 3.5 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`; this packet does not close with
      skipped gates.
- [x] 3.6 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
