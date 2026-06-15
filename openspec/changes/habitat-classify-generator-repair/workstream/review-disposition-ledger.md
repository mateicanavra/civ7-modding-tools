# Review Disposition Ledger

**Change:** `habitat-classify-generator-repair`
**Status:** P1/P2 review findings dispositioned and patched into packet
**Owner:** DRA Habitat recovery owner

Accepted P1/P2 findings block implementation until repaired, rejected with
source evidence, invalidated with later evidence, or moved by explicit
authority decision.

## Findings

| ID | Lane | Severity | Finding | Disposition | Required repair | Status |
| --- | --- | --- | --- | --- | --- | --- |
| HCG-REV-P2-001 | command-surface dependency review | P2 | Command-surface prerequisite was stated in proposal/design but not represented as a closure task, verification gate, or downstream dependency row. Current upstream oclif repair is still implementation-open and root `bun run habitat -- --help` still exits 2 through the manual dev dispatcher. | accepted | Tasks now include command-surface dependency evidence, downstream consumption, and verification gate 9.13; downstream ledger now records `habitat-oclif-entrypoint-repair` as a blocking dependency before canonical classify command proof can close. | patched |
| HCG-REV-P2-002 | evidence/system review | P2 | An Nx sidecar correctly identified official Nx target-proof constraints but reported local no-workspace/no-pinned-Nx evidence from the wrong checkout. | invalidated | Packet source synthesis and phase record rely on current worktree probes instead: `bun run nx --version` reports local Nx v22.7.5, `nx show project @civ7/adapter --json` resolves, `nx show target @civ7/adapter:check` resolves, and `nx show target @civ7/adapter:test` rejects. Do not use the sidecar's local no-workspace claim. | patched |
