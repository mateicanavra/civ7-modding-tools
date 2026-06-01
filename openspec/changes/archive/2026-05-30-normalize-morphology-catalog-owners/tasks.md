## 1. Inventory

- [x] 1.1 Inventory morphology hub files and classify each target owner.
- [x] 1.2 Inventory recipe-root/domain-root catalogs and classify each as
  thin barrel, explicit shared surface, or multi-owner drift.
- [x] 1.3 Inventory milestone-prefixed tag identifiers in active source.

## 2. Owner Cleanup

- [x] 2.1 Rehome morphology hub files to owning stage/domain/step surfaces.
- [x] 2.2 Decompose multi-owner catalogs into nearest real owners.
- [x] 2.3 Preserve shared config surfaces only with named invariants and
  consumers.
- [x] 2.4 Rename or retire milestone-prefixed tags where final owners are
  known.

## 3. Docs And Tests

- [x] 3.1 Update morphology/tag/catalog docs.
- [x] 3.2 Add or update focused morphology/tag tests.
- [x] 3.3 Record any shared surface retained for future G2 exceptions.

## 4. Verification

- [x] 4.1 Run milestone-tag and catalog searches.
- [x] 4.2 Run focused morphology/tag tests.
- [x] 4.3 Run `bun run openspec -- validate normalize-morphology-catalog-owners --strict`.
- [x] 4.4 Run `bun run openspec:validate`.
- [x] 4.5 Run `git diff --check`.
