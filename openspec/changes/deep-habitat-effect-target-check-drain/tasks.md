## 1. Baseline

- [x] 1.1 Confirm worktree, Graphite branch, and clean starting state.
- [x] 1.2 Run review lanes for former `target-check` row classification and
  replacement owners.

## 2. Rule Drain

- [x] 2.1 Add source-check replacements for RNG authority, ecology step imports,
  and cutover source guardrails.
- [x] 2.2 Expand `mapgen-core-runtime-civ7` to production-source core purity
  coverage.
- [x] 2.3 Remove active `arch-test-*` Habitat rule rows and empty baselines.
- [x] 2.4 Keep generated-bundle and domain correctness package tests outside
  active Habitat structural rules.

## 3. Records

- [x] 3.1 Update Habitat docs and registry counts.
- [x] 3.2 Mark the predecessor target-scope packet's drain tasks complete.
- [x] 3.3 Add this OpenSpec packet.

## 4. Verification

- [x] 4.1 `bun run --cwd tools/habitat-harness check`
- [x] 4.2 `bun run --cwd tools/habitat-harness test`
- [x] 4.3 `bun run habitat -- check --tool pattern-check --json`
- [x] 4.4 `bun run habitat -- check --json`
- [x] 4.5 `bun run openspec -- validate deep-habitat-effect-target-check-drain --strict`
- [x] 4.6 `bun run openspec:validate`
- [x] 4.7 `git diff --check`
- [x] 4.8 `bun run --cwd tools/habitat-harness validate:grit-patterns`
