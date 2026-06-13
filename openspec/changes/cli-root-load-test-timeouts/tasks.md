## 1. Phase Opening

- [x] 1.1 Create phase record before implementation.
- [x] 1.2 Preserve direct and Nx CLI failure/pass evidence.

## 2. Implementation

- [x] 2.1 Add a project-scoped timeout budget for `cli` in root Vitest project
  config.
- [x] 2.2 Confirm no CLI assertions, command semantics, suites, or unrelated
  projects are changed.

## 3. Verification

- [x] 3.1 Run `bunx nx run @mateicanavra/civ7-cli:test --outputStyle=static`.
- [x] 3.2 Run representative/root-load probes that include
  `@mateicanavra/civ7-cli:test`, and record any non-CLI blocker separately.
- [x] 3.3 Run `bun run openspec -- validate cli-root-load-test-timeouts
  --strict`.
- [x] 3.4 Run `git diff --check`.
- [x] 3.5 Update H4 records with the result.
