## 1. Baseline

- [x] 1.1 Confirm source-check eagerly parses TypeScript-like files during file
  acquisition.
- [x] 1.2 Confirm generated policy helpers read `file.sourceFile` directly when
  AST access is needed.

## 2. Implementation

- [x] 2.1 Replace eager source file construction with a memoized lazy getter.
- [x] 2.2 Keep the generated policy contract unchanged.
- [x] 2.3 Add OpenSpec records for the source-check substrate repair.

## 3. Verification

- [x] 3.1 `bun run check`
- [x] 3.2 `bun run --cwd tools/habitat-harness check`
- [x] 3.3 `bun run --cwd tools/habitat-harness build`
- [x] 3.4 `bun run openspec -- validate deep-habitat-effect-source-check-lazy-ast --strict`
- [x] 3.5 `bun run openspec:validate`
- [x] 3.6 `git diff --check`
