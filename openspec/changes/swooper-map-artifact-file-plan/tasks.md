## 1. Extract File Plan

- [x] 1.1 Identify rendering logic currently coupled to writes.
- [x] 1.2 Add pure `SwooperMapArtifactFilePlan` data model.
- [x] 1.3 Refactor renderer to return file plans.
- [x] 1.4 Refactor writer code to consume file plans and output roots.

## 2. Preserve Existing Behavior

- [x] 2.1 Keep catalog artifact output behavior equivalent for existing inputs.
- [x] 2.2 Add fixture behavior tests for generated content.

## 3. Structural Enforcement

- [x] 3.1 Register SA-06 `grit-swooper-map-render-file-plan-boundary` with
      Pattern Authority metadata from the structural authority matrix.
- [x] 3.2 Run focused Swooper Maps checks.
- [x] 3.3 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`, with exact command, exit status,
      inline output summary, proof class, non-claims, and no skipped gates.
- [x] 3.4 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
- [x] 3.5 Run and record bounded Habitat Grit provider compatibility checks for
      the changed provider files: `nx run habitat:check --skip-nx-cache
      --outputStyle=static` and `nx run habitat:test --skip-nx-cache
      --outputStyle=static`.
