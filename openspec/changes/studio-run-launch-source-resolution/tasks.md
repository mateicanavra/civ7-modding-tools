## 1. Public Input

- [ ] 1.1 Define `CatalogLaunchSource` and `EditorLaunchSource`.
- [ ] 1.2 Replace Run in Game start input with the closed source union.
- [ ] 1.3 Update UI request construction to supply only the selected source
      variant.

## 2. Server Resolution

- [ ] 2.1 Implement catalog-source resolution through `CatalogSourceIndex`.
- [ ] 2.2 Implement editor-source resolution from editor payload.
- [ ] 2.3 Produce `ResolvedLaunchSource`, `LaunchEnvelope`,
      `LaunchSourceDigest`, and `LaunchEnvelopeDigest`.

## 3. Verification

- [ ] 3.1 Add behavior tests for accepted/rejected input and digest stability.
- [ ] 3.2 Register SA-05 `grit-studio-run-launch-source-boundary` with Pattern
      Authority metadata from the structural authority matrix.
