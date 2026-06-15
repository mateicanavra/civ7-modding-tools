## 1. Phase Opening

- [x] 1.1 Reproduce/inspect the DL-15 bare Vitest script class in plugin
  package scripts.
- [x] 1.2 Confirm existing root Vitest project names for plugin files, git,
  graph, and the missing plugin-mods project.

## 2. Implementation

- [x] 2.1 Scope plugin package `test` scripts with
  `vitest run --project <plugin-project>`.
- [x] 2.2 Add the missing `plugin-mods` root Vitest project.
- [x] 2.3 Update DL-15/H4 records after verification.

## 3. Verification

- [x] 3.1 Run each plugin package-local test script.
- [x] 3.2 Run Nx plugin test targets together.
- [x] 3.3 Run `bun run openspec -- validate plugin-vitest-project-scope
  --strict`.
- [x] 3.4 Run `git diff --check`.
