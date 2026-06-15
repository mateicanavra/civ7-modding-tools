# D7 Packet Closure Checklist

Status: accepted
Date: 2026-06-14

## Packet Shape

- [x] Proposal repaired.
- [x] Design repaired.
- [x] Tasks repaired.
- [x] Spec delta repaired.
- [x] Findings repaired.
- [x] Phase record repaired.
- [x] Prework ledger created.
- [x] Testing ledger created.
- [x] Downstream realignment ledger created.
- [x] Fresh reviews complete.
- [x] Hardening/prework review complete.
- [x] Black-ice review complete.
- [x] Accepted P1/P2 findings repaired or rejected with evidence.
- [x] Packet status moved from draft to accepted.

## Packet Verification Before Acceptance

- [x] `bun run openspec -- validate mapgen-studio-stream-spike --strict`
- [x] `bun run openspec:validate`
- [x] `git diff --check`
- [x] shortcut/black-ice scan
- [x] `git status --short --branch`
- [x] `gt status`
- [x] `gt log --no-interactive`
- [x] prework recorded in `prework-ledger.md`
- [x] testing strategy recorded in `testing-ledger.md`
- [x] downstream assumptions recorded in `downstream-realignment-ledger.md`

## Future Implementation Closure Gates

- [ ] `studio.events.watch` uses `.effect()` and `eventIterator(...)`.
- [ ] event schema origin is TypeBox/Standard Schema.
- [ ] iterator close cleanup is tested.
- [ ] abort/disconnect cleanup is tested as its own case.
- [ ] interruption cleanup is tested as its own case.
- [ ] repeated subscribe/close leak proof is tested.
- [ ] Vite `/rpc` stream passthrough is tested with at least two ordered chunks before upstream close.
- [ ] `experimental_liveOptions` and nonzero retry are tested on the actual watch path.
- [ ] spike fixture promotion/deletion is recorded.
