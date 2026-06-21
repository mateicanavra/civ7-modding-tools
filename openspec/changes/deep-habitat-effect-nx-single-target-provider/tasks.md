## 1. Baseline

- [x] 1.1 Confirm `import-boundaries` resolves to one Nx target.
- [x] 1.2 Measure direct `nx run` against single-target `nx run-many`.
- [x] 1.3 Confirm structural-check graph execution always used `runMany`.

## 2. Implementation

- [x] 2.1 Add `NxProvider.runTarget` and command-vector construction.
- [x] 2.2 Route one unique graph target through `runTarget`.
- [x] 2.3 Preserve `runMany` for true batches.
- [x] 2.4 Add OpenSpec records for the single-target provider path.

## 3. Verification

- [x] 3.1 `bun run --cwd tools/habitat-harness test -- vendor-providers.test.ts --reporter=verbose`
- [x] 3.2 `bun run habitat -- check --tool import-boundaries --json`
- [x] 3.3 `bun run check`
- [x] 3.4 `bun run --cwd tools/habitat-harness check`
- [x] 3.5 `bun run --cwd tools/habitat-harness build`
- [x] 3.6 `bun run biome:ci`
- [x] 3.7 `bun run openspec -- validate deep-habitat-effect-nx-single-target-provider --strict`
- [x] 3.8 `bun run openspec:validate`
- [x] 3.9 `git diff --check`
