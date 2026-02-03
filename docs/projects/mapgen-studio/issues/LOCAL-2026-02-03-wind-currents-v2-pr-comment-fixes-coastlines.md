---
title: "Wind/Currents v2 — PR comment fixes (coastlines-integrated)"
date: "2026-02-03"
owner: "codex"
status: "active"
scope: "hydrology ocean geometry/currents/thermal + stage wiring + PR threads"
---

# Wind/Currents v2 — PR Comment Fix Plan (Fully Integrated With Coastlines Stack)

## Summary
Wind/Currents v2 is restacked on top of the coastlines stack (PRs #1020–#1022 / #1028). Coastlines artifacts/config are authoritative; Hydrology must consume them directly and remove any fallback coastline detection.

This plan addresses each open PR review comment with fixes landing on the correct slice branch (Graphite stack hygiene), plus replies + thread resolution.

Key shift vs prior work: `compute-ocean-geometry` / currents / thermal will treat `artifact:morphology.coastlineMetrics` as a required dependency and “no legacy left behind”.

## Scope (open review items to address)
From the triage doc + PR comments:

1) **#1031** — `coastDistance` sentinel collision (far-ocean water becomes indistinguishable from land).
2) **#1033** — ocean SST advection can pull from land tiles (water-only bug).
3) **#1030** — moisture/precip tests import wrong module/export (already fixed upstack; must be moved to the correct slice).
4) **#1029** — “migrate existing default strategy configs” concern (verify + reply/resolve).
5) **#1035** — Studio invalid strategy names (superseded; reply/resolve).

Plus: “maximally utilize coastline work; no legacy left behind”.

## Preconditions / invariants
- **Graphite-only**: `gt sync --no-restack`, `gt restack --upstack`, `gt submit`.
- Fixes land on the **owning slice**:
  - tests for moisture/precip → **#1030**
  - coast distance / ocean geometry contract → **#1031**
  - ocean thermal advection → **#1033**
  - step wiring artifacts.requires and op input binding → **#1035** (or earliest slice where the step exists)
- “No legacy”: remove internal hydrology coastline detection fallback; require Morphology coastline metrics.

## Coastlines stack integration: what we will rely on
From the coastlines work now available:
- `artifact:morphology.coastlineMetrics` exists and includes:
  - `coastalWater: Uint8Array`
  - `distanceToCoast: Uint16Array`
  - `shelfMask: Uint8Array` (from PR #1022)
- Coastline computation is Morphology-derived and wrap-correct; it becomes the source of truth for “what is coastal”.

## Phase 1 — Refresh comment context + map to GitHub thread IDs
1) Re-fetch inline review comments + PR reviews for #1029/#1030/#1031/#1033/#1035.
2) Fetch `reviewThreads` via GitHub GraphQL to get `threadId` + `comment databaseId` so we can resolve threads programmatically after fixes.
3) Update the triage doc if new human comments exist.

**Output:** comment → fix branch mapping + thread ids for resolve.

## Phase 2 — Implement fixes (with full coastline integration)

### A) #1031 — Fix coastDistance sentinel collision + make coastlineMetrics authoritative
**Where it lands**
- Primary changes: **PR #1031** (`codex/agent-B1-ocean-geometry-v2`)
- Step wiring change to feed new inputs: **PR #1035** (`codex/agent-E-studio-circulation-debug-wiring`)

**Design (no legacy)**
1) Change Hydrology `compute-ocean-geometry` op contract to require Morphology coastline fields:
   - Required inputs:
     - `coastalWaterMask: u8` (from `coastlineMetrics.coastalWater`)
     - `distanceToCoast: u16` (from `coastlineMetrics.distanceToCoast`)
     - `shelfMask: u8` (from `coastlineMetrics.shelfMask`)
   - Remove internal `isCoastalWater(...)` neighbor-scan logic entirely.

2) Coast distance semantics:
   - Compute **water-only** `coastDistanceOverWater` by BFS restricted to water, seeded from `coastalWaterMask`.
   - Sentinel/clamp rule:
     - land remains `65535`
     - water beyond `maxCoastDistance` becomes `maxCoastDistance` (clamp), never `65535`.

3) Optionally use Morphology `distanceToCoast` for validation/debugging (not as a substitute for water-only distance).

4) Update docs/comments in the op contract for sentinel + clamp semantics and the relationship to coastlineMetrics.

**Tests (in #1031)**
- Unit test: big ocean region with `maxCoastDistance` small:
  - far-ocean water tiles are `== maxCoastDistance`, not `65535`
  - land tiles remain `65535`
  - BFS seeding respects `coastalWaterMask`

**Wiring (in #1035)**
- In `hydrology-climate-baseline` step:
  - add `morphologyArtifacts.coastlineMetrics` to `artifacts.requires`
  - pass `coastalWater`, `distanceToCoast`, `shelfMask` into `ops.computeOceanGeometry`

### B) #1033 — Fix SST advection “water-only” bug (and use shelfMask where valuable)
**Where it lands**
- **PR #1033** (`codex/agent-C-ocean-sst-thermal-evap-v2`)

**Fix**
- Never sample land as an upcurrent source:
  - filter candidate neighbors by `isWaterMask`
  - deterministic fallback: if no valid water neighbor exists, use self (no advection)

**Coastlines integration (maximal but safe)**
- Consume `shelfMask` to improve realism without broad churn:
  - add `shelfMask` input to `compute-ocean-thermal-state`
  - apply mild shelf-only extra mixing/eddy diffusion modifier (bounded, deterministic)

**Tests (in #1033)**
- Regression: coastal water tile with onshore flow does not pull from land (SST stays plausible)
- Shelf mixing: boundedness + determinism; no instability regressions

### C) #1030 — Move already-addressed test fixes downstack (stack hygiene)
**Where it lands**
- **PR #1030** (`codex/agent-D-moisture-precip-v2`)

**Work**
- Ensure moisture/precip test import/export fixes live in #1030 directly.
- Restack upstack so higher PRs stop “owning” those hunks.

**Acceptance**
- `bun run --cwd mods/mod-swooper-maps test` passes on #1030 branch alone.

### D) #1029 — Verify/default wind schema migration concern; fix only if still real
**Where it lands**
- If needed: **PR #1029** (`codex/agent-A-wind-circulation-v2`)
- Otherwise: comment-only.

**Work**
- Search for legacy wind keys attached to the renamed strategy.
- If any exist, migrate them to the legacy strategy name (or remove).
- If none exist, reply with evidence and resolve.

### E) #1035 — Superseded Studio strategy-name thread: reply + resolve
**Where**
- No code change expected; comment + resolve.

## Phase 3 — Run gates + reply/resolve PR threads

### A) Validation gates
Run on top-of-stack after restacks:
- `bun run test:ci`
- `bun run check`
- `bun run lint`
- `bun run --cwd apps/mapgen-studio build`

### B) Reply + resolve workflow (per PR)
For each reviewed comment:
1) Reply in-thread with:
   - “Fixed in <PR>, commit <hash>”
   - “Test added: <name>”
2) Resolve via GraphQL `resolveReviewThread(threadId: ...)`.

### C) Keep triage doc current
Update `docs/projects/mapgen-studio/reviews/wind-currents-v2-pr-comments-triage.md` with final statuses (Open → Fixed → Thread resolved).

## Deliverables / acceptance criteria
- `compute-ocean-geometry` requires coastline metrics inputs; no internal fallback coastline detection.
- `coastDistance` output:
  - land = `65535`
  - water = bounded/clamped (never `65535`)
  - computed as water-only distance seeded from `coastlineMetrics.coastalWater`
- `compute-ocean-thermal-state` never advects from land; `shelfMask` is consumed meaningfully.
- Test fixes live in the correct slice (#1030).
- Every open PR comment is either fixed + replied + resolved, or explicitly deferred in triage with trigger.
