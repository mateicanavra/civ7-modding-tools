## 1. Phase Opening

- [x] 1.1 Create phase record before implementation.
- [x] 1.2 Reproduce or preserve the H4 root-test timeout evidence.

## 2. Implementation

- [x] 2.1 Add a project-scoped timeout budget for `mapgen-studio` in root
  Vitest project config.
- [x] 2.2 Confirm no assertions, suites, or unrelated projects are skipped or
  weakened.

## 3. Verification

- [x] 3.1 Run `bunx vitest run --config vitest.config.ts --project
  mapgen-studio`.
- [x] 3.2 Run a representative root-load test probe that includes
  `mapgen-studio:test`.
- [x] 3.3 Run `bun run openspec -- validate mapgen-studio-test-timeouts
  --strict`.
- [x] 3.4 Run `git diff --check`.
- [x] 3.5 Update H4 records with the result.
