# Terrain Stats Readback Proof

## Commands

- `bun test test/pipeline/terrain-relief-diagnostics.test.ts`
  - passed as part of the focused relief test run.
- `bun test test/pipeline/terrain-relief-diagnostics.test.ts test/pipeline/terrain-relief-balance.test.ts`
  - passed, `3` tests after the rough-land owner slice.
- `bun run openspec -- validate morphology-terrain-stats-readback --strict`
  - passed.
- `bun run openspec:validate`
  - passed, `30` items.
- `git diff --check`
  - passed.

## Review Findings

- Fresh peer review found no P1 issues for this slice.
- Accepted P2 follow-up: connected-component and local-relief diagnostics should
  use the canonical odd-q, x-wrapping map topology rather than a local no-wrap
  neighbor model.
- Accepted P2 follow-up: resource regression proof is not covered by the current
  terrain/feature stats and remains a downstream Resources realignment item.

## Proof Boundary

This slice proves diagnostic accounting for terrain-relief readback. It does not
prove downstream resources, controlled in-game target-map output, or broad
ecology-feature closure.
