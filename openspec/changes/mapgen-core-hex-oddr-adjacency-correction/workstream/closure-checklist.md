# Closure Checklist

This slice is the change-definition packet. Most gates are intentionally open;
do not mark them until the behavioral migration and live proof are done.

## Records

- [x] `proposal.md`, `design.md`, `tasks.md`, spec delta authored.
- [x] `phase-record.md` reflects branch, parent, gate, and stop conditions.
- [x] `corpus-ledger.md` enumerates the fix surface and call-site categories.
- [x] `expectation-strategy-ledger.md` pre-declares the adjacency-delta bands.
- [x] `review-disposition-ledger.md` records pre-code findings.
- [x] `downstream-realignment-ledger.md` lists required downstream slices.
- [ ] `next-packet.md` handoff kept current as work proceeds.

## Gates

- [ ] Live `getAdjacentPlotLocation` probe recorded (Task 1).
- [ ] mapgen-core / map-policy / mod tests green.
- [ ] Diagnostics dump: zero coastless land under odd-R; no Moore-8.
- [ ] Adjacency-delta expectations vs observed recorded.
- [ ] `bun run --cwd mods/mod-swooper-maps check` + biome.
- [ ] `openspec validate mapgen-core-hex-oddr-adjacency-correction --strict` +
      `bun run openspec:validate`.
- [ ] `git diff --check`.

## Proof Labels

- [ ] Unit, dump-stat, golden-delta, OpenSpec-validation, live-probe, and
      live-render proof are labeled separately; no stronger claim than evidence.
- [ ] Live in-game render proof captured (closure-blocking; MockAdapter cannot
      substitute).

## Repo State

- [ ] Worktree clean or explicitly handed off.
- [ ] Graphite stack inspected; PR #1811 dispositioned (closed, not merged).
