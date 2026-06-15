# D11 Closure Checklist - Studio Nx Dev Runner

Status: D11 implementation committed at current branch tip; live Civ7 product
proof not-green and handed off in `next-packet.md`
Date: 2026-06-15

- [x] Proposal, design, tasks, and spec delta agree on D11 ownership.
- [x] D11 packet uses the runtime Effect refactor frame and packet train as
      controlling authority.
- [x] Prework ledger exists and distinguishes completed prework from future
      implementation prework.
- [x] Testing ledger records baseline, graph, process, deletion, and live
      operation proof oracles.
- [x] Downstream realignment ledger names D12 owners and triggers.
- [x] Review disposition ledger has no unresolved P1/P2 findings.
- [x] Accepted Nx/Habitat baseline is a required implementation base.
- [x] Nx continuous backend/frontend target topology is explicit.
- [x] App-local supervisor and daemon Bun watcher deletion targets are explicit.
- [x] Play and Save&Deploy phase-sampled stable `serverInstanceId` proof is
      required.
- [x] Live Civ7 proof or not-green `next-packet.md` is required for
      implementation closure.
- [x] `bun run openspec -- validate mapgen-studio-nx-dev-runner --strict`
      passed on current implementation diff.
- [x] `bun run openspec:validate` passed on current implementation diff.
- [x] `git diff --check` passed on current implementation diff.
- [x] Graphite/status checks ran before commit and show the current branch with
      only the bounded D11 dirty diff; this local `gt status` delegates to
      `git status`, while `gt log --stack`/branch info render the stack.

Implementation evidence:

- The adopted implementation worktree is on the accepted Nx/Habitat baseline,
  and root `dev:mapgen-studio` routes through Nx.
- `mapgen-studio:dev` is now the user-facing frontend target and depends on
  continuous `mapgen-studio:serve-daemon`.
- `serve-daemon` runs `bun src/server/daemon/daemon.ts` and owns Studio
  generated/build prerequisites through Nx dependencies.
- `apps/mapgen-studio/src/server/daemon/devLive.ts` and its plan test are
  deleted; `test/server/nxDevRunner.test.ts` guards the target metadata and
  deletion boundary.
- Running process proof showed Nx-owned backend and frontend processes, no
  `devLive.ts`, and no daemon `bun --watch`.
- `studio-current.config.json` and generated `studio-current.ts` are classified
  as transient Studio live-run/proof outputs; saved authoring configs remain
  tracked.
- Live Play and Save&Deploy identity proof was not run and is not claimed.
  `workstream/next-packet.md` carries the exact missing proof.
- `bun run lint` is not green due to non-D11 stack hygiene failures
  (`mod-swooper-maps` normalization guard and workspace `biome-ci` formatting
  residue outside the D11 write set). D11 does not claim root lint green.

Pre-commit checklist:

- [x] D11 source/test/docs implementation diff exists.
- [x] Focused target topology test passed.
- [x] `mapgen-studio:check`, `mapgen-studio:build`, and `mapgen-studio:test`
      passed through Nx.
- [x] D11 write-set Biome check passed.
- [x] `habitat check --owner mapgen-studio` passed.
- [x] Running `mapgen-studio:dev` process proof captured.
- [x] Fresh implementation review findings dispositioned.
- [x] Full OpenSpec validation rerun after final docs.
- [x] `git diff --check`.
- [ ] `git diff --cached --check`.
- [x] Explicit path staging only.
- [x] Graphite implementation commit exists at the current branch tip.
- [x] Post-commit `git status --short --branch` was clean before this
      closure-record/message amend; rerun after amend before leaving D11.
