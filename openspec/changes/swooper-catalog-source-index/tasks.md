## 1. Source Data

- [x] 1.1 Add tracked `CatalogSourceIndex` source data.
- [x] 1.2 Define catalog source entry schema and parser.
- [x] 1.3 Add validator for unique ids, unique paths, and resolvable configs.
- [x] 1.4 Register the temporary consistency Grit pattern that guards the
      source-index equality test and transient generation exclusion until
      cutover.

## 2. Consumers

- [x] 2.1 Add a Swooper-owned index reader.
- [x] 2.2 Prepare Studio/server consumers to read catalog source ids from the
      index in later packets.

## 3. Verification

- [x] 3.1 Add behavior tests for parser and validator behavior.
- [x] 3.2 Register SA-04 `structure-swooper-catalog-source-index`.
- [x] 3.3 Register temporary
      `grit-swooper-catalog-index-consistency-temporary` as
      `registered-advisory` over `mods/mod-swooper-maps/src/maps`,
      `mods/mod-swooper-maps/test/config`, and
      `mods/mod-swooper-maps/scripts`; guard the source index,
      reader/validator entry points, behavior equality-test anchor, and
      transient `studio-current` exclusion; use committed empty baseline, no
      hook scope, and removal condition `swooper-catalog-index-cutover` SA-09
      registration.
- [x] 3.4 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`; this packet does not close with
      skipped gates.
- [x] 3.5 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
