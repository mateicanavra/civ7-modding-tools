# D8 Closure Checklist - Studio Event Hub

Status: implementation committed at current branch tip; live Civ7 proof is not run or claimed
Date: 2026-06-15

- [x] Proposal, design, tasks, and spec delta agree on D8 ownership.
- [x] D8 packet uses the runtime Effect refactor frame and packet train as
      controlling authority.
- [x] Prework ledger exists and distinguishes completed prework from future
      implementation prework.
- [x] Testing ledger records layered package/app/service/static proof oracles.
- [x] Downstream realignment ledger names D9, D10, D12 owners and triggers.
- [x] Review disposition ledger has no unresolved P1/P2 findings.
- [x] Polling retention has D9/D10 deletion owners and is not an open-ended
      retained path.
- [x] Actual watch-path retry is explicit; default retry construction is not
      closure proof.
- [x] Cleanup proof requires close, abort/disconnect, interruption, shutdown,
      and repeated subscribe/close cases.
- [x] TypeBox event schema origin and canonical DTO owners are explicit.
- [x] `bun run openspec -- validate mapgen-studio-event-hub --strict` passed.
- [x] `bun run openspec:validate` passed.
- [x] `git diff --check` passed.
- [x] Fresh implementation-diff review disposition is recorded with no
      unresolved P1/P2.
- [x] Graph-owned `@civ7/studio-server:check` Habitat/Grit blocker is repaired
      in separate lower slice `codex/runtime-effect-domain-contract-import-surface`
      before D8 closure.
- [x] D8 Graphite implementation commit exists at current branch tip:
      `feat(studio): establish event hub watch spine`.
- [x] Post-commit `git status --short --branch` was clean immediately after
      the D8 implementation commit; this checklist update is amended into the
      same D8 slice.

Residual implementation risk:

- Live Civ7 Play/SaveDeploy proof is not run or claimed by D8.
- D9/D10 publisher parity and polling/timer deletion remain downstream
  ownership, not D8 closure claims.
