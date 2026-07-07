## 1. Public Input

- [x] 1.1 Define `CatalogLaunchSource` and `EditorLaunchSource`.
- [x] 1.2 Replace Run in Game start input with the closed source union.
- [x] 1.3 Update UI request construction to supply only the selected source
      variant.
- [x] 1.4 Keep
      `openspec/changes/studio-run-launch-source-resolution/fixtures/editor-launch-source-standard.json`
      aligned with the accepted `EditorLaunchSource` request shape used by the
      final live matrix.

## 2. Server Resolution

- [x] 2.1 Implement catalog-source resolution through `CatalogSourceIndex`.
- [x] 2.2 Implement editor-source resolution from editor payload.
- [x] 2.3 Produce `ResolvedLaunchSource`, `LaunchEnvelope`,
      `LaunchSourceDigest`, and `LaunchEnvelopeDigest`.

## 3. Verification

- [x] 3.1 Add behavior tests for accepted/rejected input and digest stability.
- [x] 3.2 Run and record live Studio endpoint checks for accepted
      catalog/editor source variants and rejected invalid start input.
- [x] 3.3 Register SA-05 `grit-studio-run-launch-source-boundary` with Pattern
      Authority metadata from the structural authority matrix.
- [x] 3.4 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`; this packet does not close with
      skipped gates.
- [x] 3.5 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
