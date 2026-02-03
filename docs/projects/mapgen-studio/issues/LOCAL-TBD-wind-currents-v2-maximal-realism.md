---
title: "Wind + Currents v2 (Maximal Realism): stacked delivery plan"
date: "2026-02-03"
owner: "codex"
status: "active"
scope: "hydrology circulation + ocean coupling + studio wiring"
---

## Goal
Build a new, fully-coupled circulation + ocean system:
winds → currents → SST/sea-ice → evaporation/moisture → precipitation

Hard requirements:
- Deterministic (seed + inputs only)
- Bounded (fixed iteration budgets)
- Hex odd-q + X-wrap correct
- A/B safe: new behavior ships as new strategies + config switches

## Base + Stack
**Base branch:** `codex/agent-codex-mapgen-studio-config-defaults-numeric-paths`

**Stack order (must remain linear, bottom → top):**
0. `codex/agent-codex-mapgen-studio-config-defaults-numeric-paths` (base)
1. `codex/agent-codex-wind-currents-spike-docs` (spike docs)
2. `codex/agent-codex-circulation-core-hex-field-utils` (core grid/vector helpers)
3. `codex/agent-A-wind-circulation-v2` (wind strategy v2)
4. `codex/agent-D-moisture-precip-v2` (moisture + precip consumers v2)
5. `codex/agent-B1-ocean-geometry-v2` (basins + coast fields)
6. `codex/agent-B2-ocean-currents-v2` (currents v2)
7. `codex/agent-C-ocean-sst-thermal-evap-v2` (SST + sea-ice)
8. `codex/agent-E-studio-circulation-debug-wiring` (pipeline wiring + studio UX)

**Worktree root:** `/Users/mateicanavra/Documents/.nosync/DEV/worktrees`

## Workflows / Guardrails (Named)
- `graphite`: Graphite-first; no ad-hoc rebases/force pushes.
- `parallel-development-workflow`: if peers are used, one slice per worktree, avoid global restacks.
- `git-worktrees`: absolute-path discipline; don’t collide branches across worktrees.
- `decision-logging`: record ambiguity choices immediately (below).

Hard constraints:
- Never run `gt sync` without `--no-restack`.
- Always restack only our upstack (`gt restack --upstack`) when mid-stack changes occur.
- Generated artifacts (`dist/`, `mod/`) and lockfiles are read-only unless intentionally regenerated.

## Environment prerequisite (important)
This repo relies on package `dist/` exports (gitignored). After any changes to core exports, run:
- `bun install --frozen-lockfile`
- `bun run --cwd packages/civ7-adapter build`
- `bun run --cwd packages/mapgen-viz build`
- `bun run --cwd packages/mapgen-core build`

Then downstream checks/tests.

## Current status (as of 2026-02-03)
- Spike docs committed on `codex/agent-codex-wind-currents-spike-docs`.
- Slice 1 committed on `codex/agent-codex-circulation-core-hex-field-utils`.
- Slice 4 (ocean geometry) implemented but not yet committed.

## Slice checklists (definition of done)
### Slice 4 — Ocean Geometry v2 (`codex/agent-B1-ocean-geometry-v2`)
- New op `hydrology/compute-ocean-geometry`:
  - Outputs: basinId (i32), coastDistance (u16), coastNormal/tangent (i8)
  - Uses odd-q neighbors + wrapX
- Tests: basin wrap connectivity; coastDistance sanity
- Commands:
  - `bun run --cwd mods/mod-swooper-maps test`
  - `bun run --cwd mods/mod-swooper-maps check`
  - `bun run --cwd mods/mod-swooper-maps lint`
- Commit + restack upstack

### Slice 2 — Wind v2 (`codex/agent-A-wind-circulation-v2`)
- Add `earthlike` strategy to `hydrology/compute-atmospheric-circulation`
- Keep `default` unchanged; any new inputs must be optional
- Tile-varying (non-row-uniform) U/V, bounded smoothing, deterministic
- Add test for “non-bandedness” (within-row variance > 0)

### Slice 3 — Consumers v2 (`codex/agent-D-moisture-precip-v2`)
- Add vector strategy for moisture transport + precip
- No cardinal snapping; use odd-q neighbor directions
- Bounded advection + orographic uplift + convergence/rainout
- Tests: no-wind stability; ridge uplift effect; determinism

### Slice 5 — Currents v2 (`codex/agent-B2-ocean-currents-v2`)
- Add `earthlike` strategy to `compute-ocean-surface-currents`
- Obstacle-aware, uses wind + latitude (+ optional ocean geometry), bounded divergence reduction
- Tests: land zeros; water variance; divergence reduced

### Slice 6 — Ocean thermal (`codex/agent-C-ocean-sst-thermal-evap-v2`)
- New op `hydrology/compute-ocean-thermal-state` → `sstC` + `seaIceMask`
- Bounded advect-diffuse along currents (water-only)
- Tests: SST bounds; polar ice; SST changes when currents change

### Slice 7 — Wiring + Studio (`codex/agent-E-studio-circulation-debug-wiring`)
- Wire new ops into hydrology baseline stage + viz emissions + A/B toggles
- Add e2e tests: non-banded winds; obstacle-aware currents; SST coupling; determinism
- Build:
  - `bun run --cwd apps/mapgen-studio build`

## Final acceptance (done only when)
- Entire stack exists as commits in the exact order above.
- All pass: `bun run test:ci`, `bun run check`, `bun run lint`, `bun run --cwd apps/mapgen-studio build`.
- Studio shows non-banded winds/currents and SST/ice responds to current changes (A/B toggles demonstrate coupling).

## Implementation Decisions (decision-logging)
Add entries here whenever a non-obvious choice is made (constants, units, optional contract fields, iteration counts).

### [Decision title]
- **Context:**
- **Options:**
- **Choice:**
- **Rationale:**
- **Risk:**

