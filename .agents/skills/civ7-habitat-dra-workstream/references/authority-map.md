# Habitat DRA Authority Map

## Source Order

Read current evidence in this order and record any contradiction that changes scope or proof:

1. Direct current user instructions.
2. Root `AGENTS.md`, closest subtree `AGENTS.md`, and repo workflow docs.
3. `docs/projects/habitat-harness/FRAME.md`.
4. `docs/projects/habitat-harness/dra-takeover-frame.md`.
5. `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md`.
6. Habitat review ledgers, discrepancy logs, recovery claim ledger, and Grit pattern corpus ledger.
7. Current code, tests, scripts, generated manifests, and fresh command behavior.
8. Active OpenSpec records.
9. Older records as historical evidence only.
10. Prior chat/session summaries as discovery aids only.

If a lower source contradicts a higher source, preserve the higher source unless fresh disk or command evidence proves the higher source stale.

## Required Reads By Role

For any Habitat DRA work, read:

- `AGENTS.md`
- `.agents/skills/README.md`
- `docs/process/GRAPHITE.md`
- `docs/projects/habitat-harness/FRAME.md`
- `docs/projects/habitat-harness/dra-takeover-frame.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`

For a repair-chain implementation DRA, also read:

- the active OpenSpec packet `proposal.md`, `design.md`, `tasks.md`
- the packet `workstream/phase-record.md`
- the packet `workstream/review-disposition-ledger.md`
- the packet `workstream/downstream-realignment-ledger.md`
- any packet source synthesis or proof-contract document

For a Grit pattern implementation DRA, also read:

- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- the pattern source corpus referenced by the active row
- the relevant Grit docs and current Habitat adapter behavior
- fixtures or wrappers that demonstrate native Grit behavior and current-tree behavior

For a supervisor or watcher, read:

- this skill
- `habitat:dra-structural-watcher`
- the supervised DRA goal
- the supervised DRA's branch, diff, status, phase record, review ledger, and verification output

## Proof Classes

Keep these evidence classes separate in reports and closure records:

- **Spec validation**: OpenSpec shape, task lists, and packet consistency.
- **Unit behavior**: package-level assertions and local module contracts.
- **Native tool behavior**: Grit, Biome, Nx, Git hook, or CLI behavior outside Habitat wrappers.
- **Current-tree behavior**: behavior through Habitat wrappers against repo files.
- **Injected violation proof**: a known-bad case fails for the intended reason.
- **Safe write proof**: apply path, transaction/rollback, cleanup, and no unintended writes.
- **Runtime/product proof**: command behavior that protects the Habitat product outcome in the repo.

No single proof class substitutes for another.

## Stack And Worktree Hygiene

Before and after each workstream:

- inspect branch, Graphite stack, upstream state, dirty state, and untracked files;
- identify stack splits or needs-restack markers that affect the workstream;
- avoid resolving broad historical conflicts inside an unrelated packet;
- commit reviewable layers via Graphite according to `docs/process/GRAPHITE.md`;
- leave the worktree clean unless the supervising user explicitly directs otherwise.

If a stack split blocks closure, record the exact branch, conflict surface, owner boundary, and why it belongs to a stack repair instead of the active Habitat packet.
