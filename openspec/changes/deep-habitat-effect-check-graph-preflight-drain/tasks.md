## 1. Baseline

- [x] 1.1 Measure Habitat `import-boundaries` against direct Nx target
  execution.
- [x] 1.2 Measure graph generation as a separate high-cost operation.
- [x] 1.3 Identify check-time graph preflight as duplicated target ownership.

## 2. Implementation

- [x] 2.1 Remove structural-check graph preflight refusals.
- [x] 2.2 Keep graph-backed rule routing through registry facts.
- [x] 2.3 Let provider execution own target failures.
- [x] 2.4 Add OpenSpec records for graph preflight drain.

## 3. Verification

- [x] 3.1 `bun run --cwd tools/habitat-harness check`
- [x] 3.2 `bun run habitat -- check --tool import-boundaries --json`
- [x] 3.3 `nx run @internal/habitat-harness:boundaries --outputStyle=static`
- [x] 3.4 `bun run check`
- [x] 3.5 `bun run biome:ci`
- [x] 3.6 `bun run openspec -- validate deep-habitat-effect-check-graph-preflight-drain --strict`
- [x] 3.7 `bun run openspec:validate`
- [x] 3.8 `git diff --check`
