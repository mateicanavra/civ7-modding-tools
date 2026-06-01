## 1. Product Boundary Inventory

- [x] 1.1 Inventory placement apply sub-concerns and classify each as product,
  effect, maintenance, or helper.
- [x] 1.2 Name artifact/effect/consumer/verification surfaces for promoted
  products.

## 2. Decomposition

- [x] 2.1 Split natural wonder placement if it has a real product/effect
  contract.
- [x] 2.2 Split resource, start, discovery, and advanced-start boundaries only
  where contracts are explicit.
- [x] 2.3 Keep maintenance operations transactional unless promoted by a named
  contract.
- [x] 2.4 Preserve current projection semantics for resources/discoveries until
  the D4 slice.

## 3. Docs And Tests

- [x] 3.1 Add placement contract tests.
- [x] 3.2 Update placement docs to describe product/effect boundaries.
- [x] 3.3 Record any maintenance operations intentionally left transactional.

## 4. Verification

- [x] 4.1 Run placement focused tests.
- [x] 4.2 Run recipe/stage contract checks affected by the split.
- [x] 4.3 Run `bun run openspec -- validate normalize-placement-contracts --strict`.
- [x] 4.4 Run `bun run openspec:validate`.
- [x] 4.5 Run `git diff --check`.
