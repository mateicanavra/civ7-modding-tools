## 1. Product Boundary Inventory

- [ ] 1.1 Inventory placement apply sub-concerns and classify each as product,
  effect, maintenance, or helper.
- [ ] 1.2 Name artifact/effect/consumer/verification surfaces for promoted
  products.

## 2. Decomposition

- [ ] 2.1 Split natural wonder placement if it has a real product/effect
  contract.
- [ ] 2.2 Split resource, start, discovery, and advanced-start boundaries only
  where contracts are explicit.
- [ ] 2.3 Keep maintenance operations transactional unless promoted by a named
  contract.
- [ ] 2.4 Preserve current projection semantics for resources/discoveries until
  the D4 slice.

## 3. Docs And Tests

- [ ] 3.1 Add placement contract tests.
- [ ] 3.2 Update placement docs to describe product/effect boundaries.
- [ ] 3.3 Record any maintenance operations intentionally left transactional.

## 4. Verification

- [ ] 4.1 Run placement focused tests.
- [ ] 4.2 Run recipe/stage contract checks affected by the split.
- [ ] 4.3 Run `bun run openspec -- validate normalize-placement-contracts --strict`.
- [ ] 4.4 Run `bun run openspec:validate`.
- [ ] 4.5 Run `git diff --check`.
