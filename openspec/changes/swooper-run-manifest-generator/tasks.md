## 1. Generator Port

- [x] 1.1 Add manifest-only Swooper generator command/port.
- [x] 1.2 Validate exactly one manifest path.
- [x] 1.3 Generate `StudioRunGeneratedMod` under request workspace output root.

## 2. Generated Content

- [x] 2.1 Use `RunArtifactId` for map row id and script path.
- [x] 2.2 Embed `RunCorrelation` in generated runtime assets.
- [x] 2.3 Use the Swooper file-plan renderer.

## 3. Verification

- [x] 3.1 Add fixture manifest behavior tests.
- [x] 3.2 Register SA-08
      `grit-swooper-run-manifest-generator-boundary` with Pattern Authority
      metadata from the structural authority matrix.
- [x] 3.3 Run focused Swooper generation checks.
- [x] 3.4 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`; this packet does not close with
      skipped gates.
- [x] 3.5 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
