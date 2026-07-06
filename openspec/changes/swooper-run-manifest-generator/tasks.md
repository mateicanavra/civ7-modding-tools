## 1. Generator Port

- [ ] 1.1 Add manifest-only Swooper generator command/port.
- [ ] 1.2 Validate exactly one manifest path.
- [ ] 1.3 Generate `StudioRunGeneratedMod` under request workspace output root.

## 2. Generated Content

- [ ] 2.1 Use `RunArtifactId` for map row id and script path.
- [ ] 2.2 Embed `RunCorrelation` in generated runtime assets.
- [ ] 2.3 Use the Swooper file-plan renderer.

## 3. Verification

- [ ] 3.1 Add fixture manifest behavior tests.
- [ ] 3.2 Register SA-08
      `grit-swooper-run-manifest-generator-boundary` with Pattern Authority
      metadata from the structural authority matrix.
- [ ] 3.3 Run focused Swooper generation checks.
- [ ] 3.4 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`; this packet does not close with
      skipped gates.
- [ ] 3.5 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
