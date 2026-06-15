# Review Disposition Ledger

**Change:** `habitat-classify-generator-repair`
**Status:** P1/P2 review findings dispositioned; classify/generator repair slices
implemented through stale-guidance and downstream realignment; final packet
acceptance pending supervisor review
**Owner:** DRA Habitat recovery owner

Accepted P1/P2 findings block implementation until repaired, rejected with
source evidence, invalidated with later evidence, or moved by explicit
authority decision.

## Findings

| ID | Lane | Severity | Finding | Disposition | Required repair | Status |
| --- | --- | --- | --- | --- | --- | --- |
| HCG-REV-P2-001 | command-surface dependency review | P2 | Command-surface prerequisite was stated in proposal/design but not represented as a closure task, verification gate, or downstream dependency row. At design review time, upstream oclif repair was not yet accepted and root help failed through the manual dev dispatcher. | accepted | Tasks now include command-surface dependency evidence, downstream consumption, and verification gate 9.13. The accepted command-surface repair is consumed for bounded classify wrapper proof; this packet does not claim root command-trust repair. | patched |
| HCG-REV-P2-002 | evidence/system review | P2 | An Nx sidecar correctly identified official Nx target-proof constraints but reported local no-workspace/no-pinned-Nx evidence from the wrong checkout. | invalidated | Packet source synthesis and phase record rely on current worktree probes instead: `nx --version` reports local Nx v22.7.5, `nx show project @civ7/adapter --json` resolves, `nx show target @civ7/adapter:check` resolves, and `nx show target @civ7/adapter:test` rejects. Do not use the sidecar's local no-workspace claim. | patched |
| HCG-RS-P2-001 | rule-scope precision review | P2 | Exact-path extraction scraped the glob prefix from prose scope `packages/**/*.ts outside packages/civ7-adapter`, causing `grit-adapter-base-standard-import` to appear in scope for `packages/civ7-adapter/src/index.ts` despite the exclusion. | accepted | Exact-path extraction now refuses unmodeled qualifier prose such as `outside`, `except`, `excluding`, `and root`, `or root`, `and`, and `or`; the adapter exclusion regression proves the rule is not emitted as exact-path or in `rulesInScope`, while a pure glob scope still resolves as exact-path. | supervisor accepted |
