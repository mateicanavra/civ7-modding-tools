## 1. Frame And Baseline

- [x] 1.1 Reconfirm D0-D11 accepted packet state and downstream ledgers.
- [x] 1.2 Enter the selected implementation base, install dependencies, and run
      baseline build/check before trusting packet-specific proof.
- [x] 1.3 Run Habitat classify for the D12 write set and record reported gates.
- [x] 1.4 Partition D12 source changes, OpenSpec changes, evergreen docs,
      deferrals, and stack-drain proof.

## 2. Game Door Invariant

- [x] 2.1 Add or update
      `docs/system/direct-control/GAME-DOOR-INVARIANT.md`.
- [x] 2.2 Add a guard test for sanctioned `Civ7DirectControlSession`
      constructors across production `apps/` and `packages/`.
- [x] 2.3 Allow only daemon `Civ7TunerSession` and the direct-control package
      scoped wrapper as production session constructors.
- [x] 2.4 Add a final runtime surface classification ledger for
      `@civ7/control-orpc` and direct-control game-action/effect surfaces.
      The implementation ledger must preserve the D12 packet corpus in
      `workstream/control-orpc-surface-corpus.md` or update it with exact
      added/removed procedure keys.

## 3. Schema, Status, And Tuner Closeout

- [x] 3.1 Delete or disposition all `RunInGameHttpError` production residue.
- [x] 3.1a Delete, replace, or classify active `StudioEngineError`
      status-code bridge residue so final closeout does not retire one bridge
      name while leaving another live bridge unowned.
- [x] 3.2 Prove no Zod imports remain in `packages/studio-server/src/contract`.
- [x] 3.3 Classify retained public/manual status endpoints as diagnostic
      request/response reads, mutation-state reads/projections, or identity
      reads, or delete them.
      The implementation ledger must enumerate each retained endpoint named in
      `workstream/status-endpoint-corpus.md`.
- [x] 3.4 Close `mapgen-studio-tuner-session` deferred tasks by name.
- [x] 3.5 Implement, reject with product authority, or durably defer Restart
      Civ7 recovery with owner, trigger, scope, risk, and re-entry action.

## 4. Final Residue Sweep

- [x] 4.1 Run final negative searches for browser operation recovery,
      operation polling/watchdog, browser live-status cadence, dev supervisor,
      old satellite clients/paths, generic mutation DTOs, direct-control public
      aliases, Nx command residue, and case-insensitive run-in-game
      convergence/session/out-of-scope/deferred comments.
- [x] 4.2 Patch active docs/comments that describe deleted runtime paths as
      current.
- [x] 4.3 Record final residue ledger with every hit classified as deleted,
      guarded, historical evidence, diagnostic request/response, or durable
      deferral.
- [x] 4.4 Add D12 proof ledger separating OpenSpec validation, guard tests,
      package/app gates, negative searches, executed/not-green/new-if-run live
      proof, and Graphite state.
      Use `workstream/final-proof-ledger.md` as the packet proof contract.

## 5. Verification

- [x] 5.1 `bun run openspec -- validate mapgen-studio-game-door-invariant --strict`.
- [x] 5.2 `bun run openspec -- validate mapgen-studio-tuner-session --strict`.
- [x] 5.3 `bun run openspec:validate`.
- [x] 5.4 Repo-local Nx package/app check, test, and build targets for touched
      code; direct package scripts may be additional focused evidence only.
- [x] 5.5 Guard tests for direct-control session ownership.
- [x] 5.6 Final negative search set from `proposal.md`.
- [x] 5.7 New live proof if D12 implementation changes live behavior or final
      closeout lacks required live evidence; otherwise create a not-green
      `workstream/next-packet.md` that names the missing D10/D11 live proof and
      does not claim final live product closure.
- [x] 5.8 `git diff --check`, `git status --short --branch`, `gt status`, and
      `gt log --no-interactive`.

## 6. Closure

- [x] 6.1 Review findings dispositioned with no unresolved P1/P2.
- [x] 6.2 Packet train marks D12 accepted and all D0-D12 packets accepted.
- [x] 6.3 Submit the full Graphite stack with `--ai`.
- [x] 6.4 Merge/drain the stack bottom-to-top when review/merge policy allows.
- [x] 6.5 Run `gt sync --no-restack --no-interactive --force` and confirm
      merged branches are not checked out in worktrees.
- [x] 6.6 Leave worktree clean or write a precise next packet if external review
      or live proof blocks final closure.

Drain reconciliation note, 2026-06-16:

- Current `origin/main` first-parent history contains the submitted runtime
  stack PRs `#1729` through `#1747`, followed by `#1748`
  (`654f58d8f`) for D12 formatting/build hygiene after merge.
- Local and `origin/*` runtime-effect branch refs are no longer present, and no
  worktree has `codex/runtime-effect-game-door-invariant` checked out.
- This closes the Graphite merge/sync/drain task class from current repo
  evidence. It does not add new runtime/live proof.
