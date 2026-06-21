## 1. Baseline

- [x] 1.1 Confirm root check showed repeated identical `pattern-check`
  durations.
- [x] 1.2 Confirm multi-rule pattern checks execute as one shared source-check
  scan.
- [x] 1.3 Confirm single-rule pattern checks still have a real dedicated
  duration.

## 2. Implementation

- [x] 2.1 Add structured rule execution timing metadata.
- [x] 2.2 Mark grouped source-check pattern execution as shared.
- [x] 2.3 Mark grouped graph-backed Nx execution as shared.
- [x] 2.4 Render shared work as one summary in human output.
- [x] 2.5 Add OpenSpec records for shared check timing.

## 3. Verification

- [x] 3.1 `bun run --cwd tools/habitat-harness test -- rule-selection.test.ts --reporter=verbose`
- [x] 3.2 `bun run --cwd tools/habitat-harness check`
- [x] 3.3 `bun run habitat -- check --rule adapter-base-standard-import`
- [x] 3.4 `bun run habitat -- check --tool pattern-check --json`
- [x] 3.5 `bun run habitat -- check --tool pattern-check`
- [x] 3.6 `bun run check`
- [x] 3.7 `bun run biome:ci`
- [x] 3.8 `bun run openspec -- validate deep-habitat-effect-check-shared-timing --strict`
- [x] 3.9 `bun run openspec:validate`
- [x] 3.10 `git diff --check`
