## 1. Baseline

- [x] 1.1 Confirm clean Graphite branch and current worktree.
- [x] 1.2 Identify root `check` as over-aggregating repo-wide build/test/verify
  work despite distinct Habitat structural and graph verification surfaces.

## 2. Implementation

- [x] 2.1 Move root `check` to the diagnostic Habitat structural aggregate.
- [x] 2.2 Add explicit root `check:graph` for affected graph validation.
- [x] 2.3 Keep CI on the full repo-wide graph aggregate.
- [x] 2.4 Update Habitat command docs for the structural/graph/verify split.
- [x] 2.5 Add OpenSpec records for the command-contract split.

## 3. Verification

- [x] 3.1 `bun run check`
- [ ] 3.2 `bun run check:graph` attempted; currently blocked by existing
  `mod-swooper-maps:test` failures unrelated to this root script contract
  change.
- [x] 3.3 `bun run openspec -- validate deep-habitat-effect-root-check-verify-split --strict`
- [x] 3.4 `bun run openspec:validate`
- [x] 3.5 `git diff --check`
