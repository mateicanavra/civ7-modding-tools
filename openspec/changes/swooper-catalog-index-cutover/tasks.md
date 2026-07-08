## 1. Catalog Generation

- [x] 1.1 Change catalog map artifact generation to read `CatalogSourceIndex`.
- [x] 1.2 Keep Studio recipe/schema/catalog generation metadata-only.
- [x] 1.3 Update Nx target dependencies to reflect catalog metadata ownership.

## 2. Verification

- [x] 2.1 Add catalog generation behavior tests using index fixtures.
- [x] 2.2 Register SA-09 `structure-swooper-catalog-index-target-topology`.
- [x] 2.3 Run focused Swooper Maps and Studio catalog checks.
- [x] 2.4 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`; this packet does not close with
      skipped gates.
- [x] 2.5 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
