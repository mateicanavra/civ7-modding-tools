## 1. Inventory

- [ ] 1.1 Inventory morphology hub files and classify each target owner.
- [ ] 1.2 Inventory recipe-root/domain-root catalogs and classify each as
  thin barrel, explicit shared surface, or multi-owner drift.
- [ ] 1.3 Inventory milestone-prefixed tag identifiers in active source.

## 2. Owner Cleanup

- [ ] 2.1 Rehome morphology hub files to owning stage/domain/step surfaces.
- [ ] 2.2 Decompose multi-owner catalogs into nearest real owners.
- [ ] 2.3 Preserve shared config surfaces only with named invariants and
  consumers.
- [ ] 2.4 Rename or retire milestone-prefixed tags where final owners are
  known.

## 3. Docs And Tests

- [ ] 3.1 Update morphology/tag/catalog docs.
- [ ] 3.2 Add or update focused morphology/tag tests.
- [ ] 3.3 Record any shared surface retained for future G2 exceptions.

## 4. Verification

- [ ] 4.1 Run milestone-tag and catalog searches.
- [ ] 4.2 Run focused morphology/tag tests.
- [ ] 4.3 Run `bun run openspec -- validate normalize-morphology-catalog-owners --strict`.
- [ ] 4.4 Run `bun run openspec:validate`.
- [ ] 4.5 Run `git diff --check`.
