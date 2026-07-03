## 1. Baseline

- [x] 1.1 Identify duplicate Habitat rule command vectors.
- [x] 1.2 Confirm distinct `command-check` rules use separate command vectors.
- [x] 1.3 Confirm command-rule execution previously fanned out without command
  vector dedupe.

## 2. Implementation

- [x] 2.1 Group command rules by executable, argv, and cwd.
- [x] 2.2 Execute each command group once through `CommandRunner`.
- [x] 2.3 Project command results back into each rule-specific report.
- [x] 2.4 Mark multi-rule command groups as shared timing.
- [x] 2.5 Add OpenSpec records for command execution dedupe.

## 3. Verification

- [x] 3.1 `bun run --cwd tools/habitat-harness check`
- [x] 3.2 `bun run habitat -- check --tool habitat --json`
- [x] 3.3 `bun run habitat -- check --tool command-check --json`
- [x] 3.4 `bun run habitat -- check --tool habitat`
- [x] 3.5 `bun run check`
- [x] 3.6 `bun run biome:ci`
- [x] 3.7 `bun run openspec -- validate deep-habitat-effect-command-execution-dedupe --strict`
- [x] 3.8 `bun run openspec:validate`
- [x] 3.9 `git diff --check`
