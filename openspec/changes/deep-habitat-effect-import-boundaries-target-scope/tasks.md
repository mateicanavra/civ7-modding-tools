# Tasks

## 1. Target Scope

- [x] 1.1 Add a boundary-specific Nx input set.
- [x] 1.2 Keep Nx as the full boundary command owner while removing unrelated
  target inputs from cache invalidation.
- [x] 1.3 Use the vendor-native ESLint content cache for changed-file local
  boundary executions without changing boundary authority.

## 2. Structural Ownership

- [x] 2.1 Route `format-ci` through `BiomeProvider` instead of the Nx graph
  target in `habitat check`.
- [x] 2.2 Inventory target-check architecture-test rows by owner and replacement
  owner.
- [ ] 2.3 Next domino: remove any target-check row whose invariant is already enforced by
  source-check or file-layer ownership.
- [ ] 2.4 Next domino: keep real behavioral/generated-bundle tests under package `test` or
  `build` targets, not Habitat structural rule rows.

## 3. Verification

- [x] 3.1 `nx run @internal/habitat-harness:boundaries --skipNxCache`
- [x] 3.2 `bun run habitat -- check --tool import-boundaries --json`
- [x] 3.3 `bun run habitat -- check --json`
- [x] 3.4 `bun run --cwd tools/habitat-harness check`
- [x] 3.5 `bun run openspec -- validate deep-habitat-effect-import-boundaries-target-scope --strict`
- [x] 3.6 `bun run openspec:validate`
- [x] 3.7 `git diff --check`
