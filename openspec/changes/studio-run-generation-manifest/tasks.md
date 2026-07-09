## 1. Workspace And Manifest

- [x] 1.1 Add internal `StudioRunGenerationManifest` schema and parser.
- [x] 1.2 Add `StudioRunGenerationManifestPayload` and compute
      `generationManifestDigest` from that payload only.
- [x] 1.3 Add `StudioRunWorkspace` path allocation.
- [x] 1.4 Add `RunArtifactId` and `RunCorrelation` helpers.
- [x] 1.5 Write exactly one manifest from `ResolvedLaunchSource`.

## 2. Runtime Flow

- [x] 2.1 Insert manifest writing before generation invocation.
- [x] 2.2 Record manifest path and digest in private diagnostics/operation data.
- [x] 2.3 Keep manifest data out of public status.

## 3. Verification

- [x] 3.1 Add behavior tests for manifest writing and digest stability.
- [x] 3.2 Run and record live Studio endpoint check that an admitted run creates one
      request workspace and manifest while keeping manifest data out of public
      status.
- [x] 3.3 Register SA-07 `structure-studio-run-workspace-topology`.
- [x] 3.4 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`; this packet does not close with
      skipped gates.
- [x] 3.5 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
