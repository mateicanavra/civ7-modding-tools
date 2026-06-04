# Closure Checklist

## Records

The `tasks.md`, `phase-record.md`, `review-disposition-ledger.md`,
`downstream-realignment-ledger.md`, and `next-packet.md` templates are owned by
`civ7-open-spec-workstream` (see its `assets/`); copy them from there for an
OpenSpec implementation slice. For a pre-OpenSpec planning slice that has no
OpenSpec change, mark the OpenSpec-only rows (downstream realignment, next
packet) `N/A` rather than leaving them unchecked.

- [ ] `tasks.md` reflects actual task state.
- [ ] `phase-record.md` reflects branch, commit, proof, and closure state.
- [ ] `review-disposition-ledger.md` has no open accepted P1/P2 blockers.
- [ ] `downstream-realignment-ledger.md` records patch/no-patch/deferred state
  (or `N/A` for a non-OpenSpec planning slice).
- [ ] `next-packet.md` is absent, accurate, or explicitly marks remaining work
  (or `N/A` for a non-OpenSpec planning slice).
- [ ] Watcher notes are acknowledged or preserved until their boundary is met.

## Gates

- [ ] Focused tests or checks passed.
- [ ] OpenSpec strict validation passed, if an OpenSpec change exists.
- [ ] All OpenSpec validation passed when required by repo workflow.
- [ ] `git diff --check` passed.
- [ ] Runtime proof is recorded when the closure claim needs runtime evidence.

## Proof Labels

- [ ] Local commit, Graphite submit, PR state, local stats proof, runtime proof,
  and product proof are labeled separately.
- [ ] Runtime records include branch, commit, deploy command/path, restart or
  control path, downstack control branch/commit when relevant, request id,
  response, logs, timestamps, parsed payload, and manual boundaries.
- [ ] Product proof records required conditions, covered scope, uncovered scope,
  authority refs, evidence per condition, and excluded claims.
- [ ] No stronger proof claim is made than the evidence supports.

## Repo State

- [ ] Worktree clean or explicitly handed off.
- [ ] Graphite branch/stack state inspected.
- [ ] External Graphite submission/PR delivery unclaimed unless evidence exists.
