---
title: "Wind/Currents v2: PR comment fixes (coastlines-integrated)"
date: "2026-02-03"
owner: "codex"
status: "active"
scope: "wind/currents v2 stack + coastlineMetrics integration + PR thread resolution"
---

## Objective
Address open PR review comments on the Wind/Currents v2 stack, **fully integrated** with the coastlines stack:
- Treat `artifact:morphology.coastlineMetrics` as **authoritative** (no legacy fallback coast detection).
- Land fixes on the **correct slice branch** for stack hygiene.
- Reply + resolve review threads after fixes land.

## Relevant PRs / Branches

**Wind/Currents v2 stack**
- #1029 `codex/agent-A-wind-circulation-v2`
- #1030 `codex/agent-D-moisture-precip-v2`
- #1031 `codex/agent-B1-ocean-geometry-v2`
- #1032 `codex/agent-B2-ocean-currents-v2`
- #1033 `codex/agent-C-ocean-sst-thermal-evap-v2`
- #1035 `codex/agent-E-studio-circulation-debug-wiring`

**Coastlines stack (now downstack / available)**
- #1020 `codex/agent-codex-coasts-by-erosion`
- #1021 `codex/coasts-shelf-op`
- #1022 `codex/coasts-shelf-artifact`
- #1028 `codex/coasts-earthlike-coasts-test`

**Triage doc**
- #1036 `codex/agent-codex-wind-currents-pr-comments-triage`
  - `docs/projects/mapgen-studio/reviews/wind-currents-v2-pr-comments-triage.md`

## Open review items (work plan)

### (1) PR #1031 — coastDistance sentinel collision (far-ocean water vs land)
**Fix target:** `codex/agent-B1-ocean-geometry-v2`

**Plan**
- Update `hydrology/compute-ocean-geometry` op to **require** Morphology coastline inputs:
  - `coastalWaterMask` (from `coastlineMetrics.coastalWater`)
  - `distanceToCoast` (from `coastlineMetrics.distanceToCoast`)
  - `shelfMask` (from `coastlineMetrics.shelfMask`)
- Remove internal neighbor-scan coast detection (no legacy).
- Compute `coastDistance` as **water-only BFS** seeded from `coastalWaterMask`:
  - land sentinel remains `65535`
  - any water tile beyond `maxCoastDistance` clamps to `maxCoastDistance` (never `65535`)
- Add unit tests verifying sentinel semantics and seeding.

**Step wiring required (separate)**
- Update hydrology baseline step to require/read coastlineMetrics and pass the fields into the op (see (2)).

### (2) PR #1035 — step wiring for coastlineMetrics → hydrology ops
**Fix target:** `codex/agent-E-studio-circulation-debug-wiring`

**Plan**
- In `hydrology-climate-baseline` step contract:
  - Add `morphologyArtifacts.coastlineMetrics` to `artifacts.requires`.
- In step implementation:
  - Read `deps.artifacts.coastlineMetrics` and pass `coastalWater`, `distanceToCoast`, `shelfMask` into `ops.computeOceanGeometry`.

### (3) PR #1033 — SST advection “water-only” (no land upcurrent) + shelfMask usage
**Fix target:** `codex/agent-C-ocean-sst-thermal-evap-v2`

**Plan**
- Update upcurrent selection to filter candidates by `isWaterMask` and fallback deterministically to self.
- Add `shelfMask` input and apply mild, bounded extra mixing on shelf tiles.
- Add regression tests:
  - onshore flow near coast does not inject land `0` SST into water
  - shelf mixing remains bounded + deterministic

### (4) PR #1030 — move test import/export fixes downstack
**Fix target:** `codex/agent-D-moisture-precip-v2`

**Plan**
- Apply the moisture/precip test import fixes on this slice so it is self-validating.
- Restack upstack so the same hunks disappear from higher PRs.

### (5) PR #1029 — verify wind default schema migration concern
**Fix target:** `codex/agent-A-wind-circulation-v2` (only if needed)

**Plan**
- Search for legacy wind-only config keys (`windJetStreaks`, `windJetStrength`, `windVariance`) attached to `strategy: "default"`.
- If any exist, migrate those configs to `strategy: "latitude"` (or remove fields).
- Reply with evidence and resolve the thread.

### (6) PR #1035 — “invalid Studio strategy names” thread
**Fix target:** comment-only

**Plan**
- Reply that Studio preset/default injection was removed; strategy keys align with registered ops.
- Resolve the thread.

## PR thread resolution workflow
- Fetch `reviewThreads` via GitHub GraphQL to map `threadId` + `comment databaseId`.
- After each fix lands on the owning slice, reply in-thread with commit hash + tests, then run `resolveReviewThread(threadId)`.

## Stack workflow
- Use Graphite only:
  - `gt sync --no-restack`
  - `gt restack --upstack` after each mid-stack commit
  - `gt submit` to push PR updates

## Gates (top-of-stack)
- `bun run test:ci`
- `bun run check`
- `bun run lint`
- `bun run --cwd apps/mapgen-studio build`

