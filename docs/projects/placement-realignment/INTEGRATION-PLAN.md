# Stack Integration / Drain Plan (placement × taxonomy × rivers × orpc)

Recorded 2026-06-11 as the accepted drain order. Four parties:

1. **Placement stack** — `placement-realignment-s0..s11`, PRs #1565–#1575
   (+ S11), off main, green and proof-closed.
2. **Direct-control / CLI taxonomy stack** — 4 slices, PRs #1576–#1579,
   off main, independent of placement.
3. **Rivers stack** — `codex/*` (~66 commits), oldest and largest, unmerged.
4. **`mapgen-studio-server-orpc`** — in flight in the user's primary
   checkout; rivers also rewrites studio-server contracts.

## Order and rationale

Drain (1) placement first, (2) taxonomy behind or parallel (independent),
(3) orpc before rivers, (4) rivers last, in full, via its consolidation
playbook. Restacking is asymmetric: if rivers landed first, the 11 placement
slices would each replay against rivers' placement edits (same conflicts
re-resolved up to eleven times through the rebase chain); landing placement
first means rivers absorbs the delta once at its restack onto new main.

## The conflict-resolution oracle

The evidence branch `placement-live-integration` (worktree
`wt-placement-live-proof`) already contains the full resolution of the
placement×rivers conflict surface — merge 754e0fc9b with the decision log
`evidence/live-integration-2026-06-11.md`. Rivers' drain should cherry/adapt
from it rather than re-deriving:

- **River-tile resource exclusion** re-expressed in the new
  `domain/resources` demand pipeline (mask built in the plan-resources step
  from the two map-rivers artifacts; ANDed into per-type legality before
  counts).
- **Policy-table generator** extended to emit rivers' `riverTypes` block
  (single-generator D6 posture; byte-check stays green).
- **Studio-twin disposition** (twin generator kept only for
  `river-types.gen.d.ts` emission; fold into the map-policy generator and
  retire — D6 completion item).
- **Test re-pins** (habitat-fidelity budgets under exclusion;
  world-balance/standard-run merges; multi-seed timeout budgets).

## Rivers-drain adaptations owed (recorded, rivers-owned)

- Re-arm its two committed-red tests (navigable-trunk budget, arid
  low-signal classification) — verified red on the rivers branch itself.
- Follow `visibility.ts`'s move to `game/map/visibility.ts` (full
  migration, no alias — cli-command-taxonomy D5).
- Land `camera` / `screenshot` / `appshot` at the reserved `game view`
  noun (cli-command-taxonomy D6).

## Lab-branch retirement gate

`placement-live-integration` retires only after: (a) S11 (probe scripts +
merge decision log) is merged — DONE in this slice; (b) the rivers drain has
consumed the oracle resolutions above. Until then the worktree
`wt-placement-live-proof` stays.
