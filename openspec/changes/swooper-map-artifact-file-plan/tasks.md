## 1. Extract File Plan

- [ ] 1.1 Identify rendering logic currently coupled to writes.
- [ ] 1.2 Add pure `SwooperMapArtifactFilePlan` data model.
- [ ] 1.3 Refactor renderer to return file plans.
- [ ] 1.4 Refactor writer code to consume file plans and output roots.

## 2. Preserve Existing Behavior

- [ ] 2.1 Keep catalog artifact output behavior equivalent for existing inputs.
- [ ] 2.2 Add fixture behavior tests for generated content.

## 3. Structural Enforcement

- [ ] 3.1 Register SA-06 `grit-swooper-map-render-file-plan-boundary` with
      Pattern Authority metadata from the structural authority matrix.
- [ ] 3.2 Run focused Swooper Maps checks.
- [ ] 3.3 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`; this packet does not close with
      skipped gates.
- [ ] 3.4 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
