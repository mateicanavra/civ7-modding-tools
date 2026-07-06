## 1. Catalog Generation

- [ ] 1.1 Change catalog map artifact generation to read `CatalogSourceIndex`.
- [ ] 1.2 Keep Studio recipe/schema/catalog generation metadata-only.
- [ ] 1.3 Update Nx target dependencies to reflect catalog metadata ownership.

## 2. Verification

- [ ] 2.1 Add catalog generation behavior tests using index fixtures.
- [ ] 2.2 Register SA-09 `nx-swooper-catalog-index-target-topology`.
- [ ] 2.3 Run focused Swooper Maps and Studio catalog checks.
- [ ] 2.4 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`; this packet does not close with
      skipped gates.
- [ ] 2.5 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
