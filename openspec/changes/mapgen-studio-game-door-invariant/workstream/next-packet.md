# D12 Follow-Up - Final Drain

Status: live proof completed; final Graphite drain remains open
Date: 2026-06-15

## Why This Exists

D12 originally used this file as the not-green handoff for missing live Civ7
proof. That gap is now closed by the live state-machine pass recorded in
`testing-ledger.md` and `final-proof-ledger.md`:

- stable daemon identity:
  `studio-server-mqftopnk-1d3t-1`,
  `2026-06-15T23:06:45.345Z`;
- invalid newline `setupConfig.mapScript` rejected before Run in Game
  admission with no `operations.current` pollution;
- disposable Run in Game completed through `studio.events.watch`, keyed
  status, and current projection for
  `studio-run-in-game-mqftp8p8-1d3t-2`;
- Save&Deploy completed through `studio.events.watch`, keyed status, and
  current projection for `live-save-mqftqfp9`;
- tracked shipped catalog artifacts were clean after the pass, while transient
  `studio-current` generated files remained ignored.

The remaining follow-up is final Graphite drain only. Do not use this file as a
reason to defer live product behavior again unless a new live regression is
found.

## Root Graph Hygiene

Before final runtime-stack closure, rerun or disposition:

```bash
bun run lint
bun run openspec -- validate mapgen-studio-game-door-invariant --strict
bun run openspec -- validate mapgen-studio-tuner-session --strict
bun run openspec:validate
bun run nx run @civ7/studio-server:check --outputStyle=static
bun run nx run @civ7/studio-server:test --outputStyle=static
bun run nx run @civ7/studio-server:build --outputStyle=static
bun run nx run mapgen-studio:check --outputStyle=static
bun run nx run mapgen-studio:test --outputStyle=static
bun run nx run mapgen-studio:build:vite --outputStyle=static
```

If root `bun run lint` remains non-green from stack-owned Habitat/Grit debt,
record the exact failing target, owner, and re-entry action. Do not label the
stack final-clean while root graph hygiene is unresolved.

## Graphite Drain Re-Entry

The runtime refactor stack has already been submitted through Graphite:

- PR #1729 through PR #1747.
- Top D12 PR: #1747,
  `codex/runtime-effect-game-door-invariant`.

Before merge/drain, ensure review policy permits merging and root graph proof is
green or explicitly accepted:

```bash
git status --short --branch
gt branch info codex/runtime-effect-game-door-invariant
gt log --stack
git diff --stat codex/runtime-effect-nx-dev-runner..codex/runtime-effect-game-door-invariant
git worktree list
gt submit --stack --publish --ai --branch codex/runtime-effect-game-door-invariant --no-interactive
```

The submit command is an update path for already-created PRs, not a fresh
creation requirement. Merge/drain only when review policy allows it. After
merge, run:

```bash
gt sync --no-restack --no-interactive --force
git status --short --branch
gt status
gt log --no-interactive
git worktree list
```

## Owner

MapGen Studio runtime/DRA stack owner. This packet is a final drain handoff,
not a new implementation design.
