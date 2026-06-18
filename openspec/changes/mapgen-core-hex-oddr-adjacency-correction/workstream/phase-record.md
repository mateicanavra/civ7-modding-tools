# MapGen Hex Odd-R Adjacency Correction — Phase Record

## Frame

- Objective: correct mapgen-core's hex adjacency model from odd-Q (column-offset)
  to the engine's odd-R (row-offset) convention, so every adjacency-derived
  surface mapgen authors agrees with the live Civ7 engine, and consolidate the
  coast-ring safety net (superseding PR #1811).
- Future state: one canonical engine-aligned adjacency/projection/cube model;
  coast, components, distance fields, flow routing, climate vector fields, and
  spacing all computed against the engine graph; no per-consumer convention
  supersets; no floating-island notch on the live engine.
- Hard core: the engine owns neighbor math (native `getAdjacentPlotLocation`);
  the model must match it exactly and prove it on the live engine. The
  MockAdapter shares the model and cannot prove this class.
- Falsifier: the live probe contradicts the predicted odd-R table; or the live
  render still notches; or the migration shifts per-tile land/water truth; or a
  duplicate adjacency convention remains keyed on `x & 1`.

## Status

- Last updated: 2026-06-18.
- Current gate: Gate 8 (this is the spec/change-definition slice). Packet
  authored; pre-code review pending; behavioral migration not yet started.
- Next gate: Gate 1 (live `getAdjacentPlotLocation` probe) once the packet is
  reviewed — the probe is the audit-grade gate before any behavioral commit.
- Remaining proof boundary: nothing behavioral is implemented in this slice. All
  proof classes (unit, dump stats, golden delta, live probe, live render) are
  open. Closure requires the live in-game render.
- Stop condition: do not migrate to a guessed offset table; the live probe must
  pin it first. Do not retune configs to mask the adjacency delta.

## Repo State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-A-mapgen-core-hex-oddr-adjacency`
- Branch: `agent-A-mapgen-core-hex-oddr-adjacency`
- Parent: `main` (`b8387e3c2`)
- Related/superseded: `agent-A-fix-island-coast-ring` (PR #1811; origin head
  `69976e6be` v2 Moore-8 ring). Its coast-ring step is re-authored here with
  corrected adjacency; its Moore-8 widening is dropped.
- Note: the user's primary checkout is on `agent-A-fix-island-coast-ring` with
  uncommitted `latest-juicy` config/generated edits (serving the studio). Not
  touched by this worktree.

## Gate Trace

1. Frame — done (this record).
2. Isolate repo state — done (isolated worktree off main).
3. Diagnose — done (engine-convention investigation re-verified the audit; odd-Q
   vs odd-R differ by exactly one neighbor per tile; root cause of the notch).
4. Corpus — done (call-site corpus ledger; ~95 sites across 10 categories).
5. Group — done (categories in the corpus ledger).
6. Predeclare expectations — done (expectation-strategy ledger; pre-declared
   adjacency-delta bands).
7. Translate to architecture — done (design.md: four-definition fix surface,
   canonical model, rename strategy).
8. Plan slices — this packet (proposal/design/tasks/spec). Pre-code review next.
9–12. Verify stats / live proof / review / close — open.
