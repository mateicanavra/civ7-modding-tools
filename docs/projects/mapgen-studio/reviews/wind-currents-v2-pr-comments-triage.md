---
title: "Wind + Currents v2: PR comments triage"
date: "2026-02-03"
owner: "codex"
status: "active"
---

## Scope

This doc collects reviewer feedback for the Wind/Currents v2 stack and triages what still needs action vs. what is already superseded by subsequent commits.

**Stack PRs covered**
- #1017 — docs(spike): wind + currents investigation (`codex/agent-codex-wind-currents-spike-docs`)
- #1018 — mapgen-core: add hex vector-field utils (`codex/agent-codex-circulation-core-hex-field-utils`)
- #1029 — hydrology: add earthlike atmospheric circulation (`codex/agent-A-wind-circulation-v2`)
- #1030 — hydrology: add vector moisture transport + precipitation (`codex/agent-D-moisture-precip-v2`)
- #1031 — hydrology: add compute-ocean-geometry (`codex/agent-B1-ocean-geometry-v2`)
- #1032 — hydrology: add earthlike ocean surface currents (`codex/agent-B2-ocean-currents-v2`)
- #1033 — hydrology: add compute-ocean-thermal-state (`codex/agent-C-ocean-sst-thermal-evap-v2`)
- #1035 — hydrology: wire circulation v2 + ocean SST coupling (`codex/agent-E-studio-circulation-debug-wiring`)

**Notes**
- Comment harvesting uses `gh api` to pull inline review comments and PR reviews; bot “stack mergeability” and “railway preview” issue comments are intentionally ignored.
- Most feedback came from `chatgpt-codex-connector[bot]` inline comments.

## Triage table

| ID | PR | Severity | Area | Summary | Status | Where it should land |
|---:|---:|:--:|---|---|---|---|
| 1 | 1029 | P1 | Winds schema/config | Default strategy schema rejects legacy fields still present in some configs | **Fixed (thread resolved)** | **#1029** (`1a3d811c7`) |
| 2 | 1030 | P2 | Tests | Moisture test imports non-existent `strategies/vector.js` | **Fixed (thread resolved)** | **#1030** (`3df251013`) |
| 3 | 1030 | P2 | Tests | Precip test imports `vectorStrategy` but export is `defaultStrategy` | **Fixed (thread resolved)** | **#1030** (`3df251013`) |
| 4 | 1031 | P2 | Ocean geometry | `coastDistance` uses 65535 for land; far-ocean > maxDist stays 65535, becoming indistinguishable from land | **Fixed (thread resolved)** | **#1031** (`c2379331f`) |
| 5 | 1033 | P2 | Ocean thermal | SST advection selects upcurrent neighbors without checking water mask → coastal “zero injection” from land | **Fixed (thread resolved)** | **#1033** (`bb02c8cc5`) |
| 6 | 1035 | P1 | Studio defaults | Studio default config uses invalid strategy names (`earthlike`, `vector`) | **Superseded + resolved** | **#1035** (`536c61af8`) |

## Details (with original comment text)

### (1) PR #1029 — P1 “Migrate existing default strategy configs”

**Comment** (inline, `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-atmospheric-circulation/contract.ts:108`)

> The default strategy schema now only allows the new geostrophic fields … but existing configs … still set `windJetStreaks`, `windJetStrength`, and `windVariance` under strategy `"default"`. … migrate to `strategy: "latitude"` or accept legacy fields.

**Status**
- **Fixed** in `1a3d811c7`: baseline normalization now applies legacy wind-only keys only for the legacy latitude-based strategy, and uses the v2 default knobs for the new circulation strategy.
- Review thread resolved in PR #1029.

**Verification checklist**
- Search for `windJetStreaks`/`windJetStrength`/`windVariance` in map configs: ensure none exist under `computeAtmosphericCirculation.strategy === "default"`.
- Ensure any authored maps/recipes that previously set those fields either:
  - have been migrated to `"latitude"`, or
  - no longer set those legacy keys.

**If anything remains**
- Fix belongs in **#1029** (or earlier), not upstack.

---

### (2) PR #1030 — P2 “Import actual vector strategy module”

**Comment** (inline, `mods/mod-swooper-maps/test/hydrology-moisture-default.test.ts:3`)

> The test imports `vectorStrategy` from `strategies/vector.js`, but that module does not exist … (new implementation lives in `vector-advection.ts`).

**Status**
- **Fixed** in `3df251013` (landed in PR #1030) and review thread resolved.

---

### (3) PR #1030 — P2 “Import exported strategy name”

**Comment** (inline, `mods/mod-swooper-maps/test/hydrology-precip-default.test.ts:3`)

> The vector precipitation strategy file exports `defaultStrategy`, not `vectorStrategy` … named import will throw.

**Status**
- **Fixed** in `3df251013` (landed in PR #1030) and review thread resolved.

---

### (4) PR #1031 — P2 “Differentiate far-ocean from land in coastDistance”

**Comment** (inline, `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-ocean-geometry/rules/index.ts:102`)

> BFS stops expanding when `d >= maxDist`, leaving water tiles beyond the cap at `0xffff`. Contract says 65535 means “on land”, so distant water becomes indistinguishable from land.

**Status**
- **Fixed** in `c2379331f`: `compute-ocean-geometry` now seeds coastal water from Morphology coastline metrics (`coastalWater`) and clamps far-ocean water to `maxCoastDistance` so it never collides with the land sentinel (`65535`).
- Review thread resolved in PR #1031.

---

### (5) PR #1033 — P2 “Avoid advecting from land tiles in water-only step”

**Comment** (inline, `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-ocean-thermal-state/rules/index.ts:167`)

> `selectUpcurrent(...)` does not consider `isWaterMask`, so the chosen upcurrent neighbor can be land … land SSTs forced to `0` → coastal injection and artificial cooling.

**Status**
- **Fixed** in `bb02c8cc5`: upcurrent selection is water-only; deterministic fallback to self if no valid water neighbor exists. `shelfMask` is now consumed to apply mild shelf-only extra mixing.
- Review thread resolved in PR #1033.

---

### (6) PR #1035 — P1 “Use valid strategy names in defaultConfig”

**Comment** (inline, `apps/mapgen-studio/src/ui/data/defaultConfig.ts:152`)

> Studio default config sets `strategy: 'earthlike'` / `strategy: 'vector'`, but ops register `{default, latitude}` / `{default, cardinal}` / `{default, basic, refine}`.

**Status**
- **Superseded** and thread resolved in PR #1035. Strategy keys now come directly from the registry-backed step config.

## Next actions (proposed)

All items above are fixed and review threads have been resolved. If additional reviewer feedback arrives, add it to the table and repeat the “fix on owning slice + restack + reply + resolve” loop.
