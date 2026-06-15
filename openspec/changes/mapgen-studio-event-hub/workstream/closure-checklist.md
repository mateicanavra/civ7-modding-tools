# D8 Closure Checklist - Studio Event Hub

Status: accepted pending commit
Date: 2026-06-14

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
- [x] Graphite/status checks passed before commit.

Residual implementation risk:

- Existing historical code/tests do not yet satisfy every D8 future
  implementation closure gate. That is intentional packet output, not packet
  acceptance proof. The implementation branch must satisfy `tasks.md` section
  `3A` before claiming D8 implementation closure.
