## 1. Runtime Integration

- [x] 1.1 Add server port for invoking the manifest-only generator.
- [x] 1.2 Wire Run in Game workflow to call the generator after manifest write.
- [x] 1.3 Record generated mod metadata privately.
- [x] 1.4 Project success/failure through public status categories.

## 2. Target Shape

- [x] 2.1 Update Nx target inputs for request generation topology.
- [x] 2.2 Register SA-10 `grit-studio-run-generator-port-boundary` with Pattern
      Authority metadata from the structural authority matrix.

## 3. Verification

- [x] 3.1 Add behavior tests for generation success and failure.
- [x] 3.2 Run focused Studio server and Swooper generator checks.
- [x] 3.3 Run and record live Studio endpoint check that a run invokes the manifest
      generator and records generated mod metadata privately.
- [x] 3.4 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`; this packet does not close with
      skipped gates.
- [x] 3.5 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
