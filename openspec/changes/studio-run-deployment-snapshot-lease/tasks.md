## 1. Deployment

- [ ] 1.1 Copy from `StudioRunGeneratedMod` to `mod-swooper-studio-run`.
- [ ] 1.2 Ensure Run in Game setup config enables the Studio-run mod id.
- [ ] 1.3 Record `RunDeployment` and `DeployedModSnapshot` after copy.
- [ ] 1.4 Map deployment failures to public category `deployment`.

## 2. Runtime Lease

- [ ] 2.1 Attach deployed mod identity to the existing admitted
      `RuntimeOwnershipLease`.
- [ ] 2.2 Gate Run in Game deployment/setup/start with the lease.
- [ ] 2.3 Gate Save/Deploy deployed-mod writes with the same lease without
      changing Save/Deploy catalog semantics.
- [ ] 2.4 Release lease on success, failure, and cancellation cleanup.

## 3. Verification

- [ ] 3.1 Add behavior tests for deployment copy/snapshot.
- [ ] 3.2 Add behavior tests for Save/Deploy conflict and lease release.
- [ ] 3.3 Register SA-11 `grit-studio-run-copy-deploy-boundary` with Pattern
      Authority metadata from the structural authority matrix.
