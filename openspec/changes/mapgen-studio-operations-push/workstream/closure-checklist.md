# D9 Closure Checklist - Studio Operations Push

Status: D9 implementation committed at the current branch tip with post-commit clean-state proof
Date: 2026-06-15

- [x] Proposal, design, tasks, and spec delta agree on D9 ownership.
- [x] D9 packet uses the runtime Effect refactor frame and packet train as
      controlling authority.
- [x] Prework ledger exists and distinguishes completed prework from future
      implementation prework.
- [x] Testing ledger records layered publisher/client/deletion proof oracles.
- [x] Downstream realignment ledger names D10 and D12 owners and triggers.
- [x] Review disposition ledger has no unresolved P1/P2 findings.
- [x] Operation publisher ownership covers Run in Game and Save&Deploy.
- [x] Production daemon EventHub composition is a required proof.
- [x] Operation polling/watchdog deletion targets are explicit.
- [x] Public/manual status procedures are separated from background freshness
      authority.
- [x] D10 live-game cadence is protected.
- [x] `bun run openspec -- validate mapgen-studio-operations-push --strict`
      passed for packet acceptance.
- [x] `bun run openspec:validate` passed for packet acceptance.
- [x] Focused implementation tests passed before Graphite commit:
      `bun run --cwd apps/mapgen-studio test -- test/studioEvents/operationAdoption.test.ts test/runInGame/GameConsole.test.tsx test/runInGame/status.test.ts test/server/oneMount.test.ts`.
- [x] Focused runtime bridge tests passed before Graphite commit:
      `bun run --cwd packages/studio-server test -- test/handler.test.ts test/operationRuntime.test.ts`.
- [x] Nx package/app checks passed before Graphite commit:
      `bun run nx run @civ7/studio-server:check --outputStyle=static` and
      `bun run nx run mapgen-studio:check --outputStyle=static`.
- [x] Nx package/app tests passed before Graphite commit:
      `bun run nx run @civ7/studio-server:test --outputStyle=static` and
      `bun run nx run mapgen-studio:test --outputStyle=static`.
- [x] Browser operation readback deletion scan passed or returned only
      deletion-proof literals / classified non-D9 timers.
- [x] `git diff --check` passed before Graphite commit.
- [x] Fresh implementation-diff review disposition recorded with no unresolved
      P1/P2 findings.
- [x] Strict OpenSpec validation rerun after implementation doc updates.
- [x] Graphite implementation commit exists and post-commit
      `git status --short --branch` is clean.

Residual implementation boundary:

- Live Civ7 Play/Save&Deploy proof is not run or claimed by D9.
- Public/manual status procedures remain for D12 classification; D9 deletes
  browser background freshness/readback, not the server status contract.
- Live-game cadence/polling/timer deletion remains D10-owned and is not claimed
  closed by D9.
