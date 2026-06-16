# Next Objective - Runtime Effect Recovery Workstream

Status: activated with `create_goal` on 2026-06-16.
Prepared at: 2026-06-16
Character budget: under 4,000 characters.

## Objective To Activate

Run the Studio runtime Effect recovery workstream from the reviewed prework frame. First, design the full remaining change set sequentially, one packet/workstream at a time, using current `main`, the accepted runtime frame, OpenSpec packet train, packet corpus ledger, problem classification, and review dispositions as authority/evidence. Begin by reconciling whether D12 final Graphite drain is still open or stale now that `origin/main` includes runtime PRs through `#1748`; do not assume closure from either merged commits or old next-packet text. For each packet or closure unit, complete design prework before implementation: confirm objective, exterior, owners/forbidden owners, write set, protected/generated paths, user-scenario expectations, proof classes, review lanes, stop conditions, and downstream realignment. Run fresh read-only reviews and repair, reject with evidence, or explicitly move outside scope every accepted P1/P2 finding before marking that packet design approved.

Only after the full packet/change design set is reviewed and approved, implement changes sequentially as Graphite/OpenSpec workstream slices. Keep one coherent change per branch, update packet/docs/tasks/ledgers as facts change, use explicit path staging, and never claim stronger proof than evidence supports. Preserve the hard boundary that OpenSpec validation, tests, build, runtime/live proof, product proof, Graphite submit, and final merge/sync/drain are separate claims. Do not implement runtime code, redesign public contracts, rerun live Civ7 proof, or drain the Graphite stack unless the active packet design explicitly requires it and the repo/worktree state is clean or safely isolated. Close only when reviewed artifacts, implementation, verification, downstream records, Graphite state, and worktree cleanliness agree.

## Activation Preconditions

- `FRAME.md`, `INVESTIGATION-BRIEF.md`, `WORKSTREAM-RECORD.md`, `PACKET-CORPUS-LEDGER.md`, `PROBLEM-CLASSIFICATION.md`, and `REVIEW-DISPOSITION.md` are complete.
- Accepted P1/P2 review findings are repaired, rejected with evidence, or moved outside the closure claim.
- Validation commands for this prework slice are recorded.
- Root lint non-green findings from unrelated Swooper Habitat architecture tests are carried as a separate graph-hygiene caveat and must not be mistaken for prework-doc failure.
- Goal tooling has no conflicting active goal, or the new objective is recorded as fallback active goal if tooling cannot attach it.

## Initial Next Action After Activation

Open the first design pass by reconciling D12 final-drain records with current `main` and deciding whether the next packet is final Graphite drain, archival closure audit, or a new targeted design packet. Do not start implementation in that first pass.
