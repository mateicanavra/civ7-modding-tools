# Closure Checklist

## Records

- [ ] `tasks.md` reflects actual task state.
- [ ] `phase-record.md` reflects branch, commit, proof, and closure state.
- [ ] `review-disposition-ledger.md` has no open accepted P1/P2 blockers.
- [ ] `downstream-realignment-ledger.md` records patch/no-patch/deferred state.
- [ ] `next-packet.md` is absent, accurate, or explicitly marks remaining work.
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
