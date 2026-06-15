# D10 Closure Checklist - Studio Live Game Watch

Status: implementation committed at current branch tip; live Civ7 product proof not run or claimed.
Date: 2026-06-15

- [x] Proposal, design, tasks, and spec delta agree on D10 ownership.
- [x] D10 packet uses the runtime Effect refactor frame and packet train as
      controlling authority.
- [x] Testing ledger records layered watcher/client/deletion/live-proof oracles
      with current implementation results.
- [x] Downstream realignment ledger names D11 and D12 owners and triggers.
- [x] Review disposition ledger has no unresolved implementation P1/P2 findings.
- [x] `StudioLiveGameWatcher` is an Effect-scoped daemon runtime service/layer.
- [x] Watcher tick path is native Effect and does not bridge through
      `Runtime.runPromise` / `Effect.runtime`.
- [x] Fake live-status read layer is source-private for package tests and is not
      exported from the public package barrel.
- [x] Production source proof shows watcher reads through
      `Civ7TunerClient`/`Civ7TunerSession` composition and no direct-control
      watcher bypass.
- [x] EventHub retains and replays latest `live-game` truth to late subscribers
      after `hello`.
- [x] Browser live-status cadence deletion targets are satisfied by negative
      search with retained non-D10 hits classified.
- [x] Snapshot/setup request-response follow-up rules are protected by model
      tests and `StudioShell` source guard.
- [x] `workstream/next-packet.md` records the missing live Civ7 proof, re-entry
      commands, prerequisites, log paths, owner, and not-green claim.
- [x] `bun run openspec -- validate mapgen-studio-live-game-watch --strict`
      passed.
- [x] `bun run openspec:validate` passed.
- [x] Focused package/app tests and checks passed.
- [x] Nx-owned `@civ7/studio-server:check` and `mapgen-studio:check` passed.
- [ ] Live Civ7 proof with real game/FireTuner evidence passed.
- [x] Graphite implementation commit exists for D10 at the current branch tip.
- [x] Post-commit `git status --short --branch` was clean before closure-doc
      amendment; this checklist is amended into that commit so the final
      post-amend status must also be clean.

Residual implementation risk:

- Live Civ7 behavior is not green until `workstream/next-packet.md` is executed
  and recorded. D10 may commit static/runtime implementation evidence, but must
  not claim product-runtime green for live game behavior.
