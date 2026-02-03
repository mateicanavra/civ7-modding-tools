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
| 1 | 1029 | P1 | Winds schema/config | Default strategy schema rejects legacy fields still present in some configs | **Addressed (needs placement check)** | Prefer landing in **#1029** (or earlier) if any config migration is still needed |
| 2 | 1030 | P2 | Tests | Moisture test imports non-existent `strategies/vector.js` | **Addressed** | **Move downstack to #1030** (currently fixed upstack) |
| 3 | 1030 | P2 | Tests | Precip test imports `vectorStrategy` but export is `defaultStrategy` | **Addressed** | **Move downstack to #1030** (currently fixed upstack) |
| 4 | 1031 | P2 | Ocean geometry | `coastDistance` uses 65535 for land; far-ocean > maxDist stays 65535, becoming indistinguishable from land | **Open** | **#1031** |
| 5 | 1033 | P2 | Ocean thermal | SST advection selects upcurrent neighbors without checking water mask → coastal “zero injection” from land | **Open** | **#1033** |
| 6 | 1035 | P1 | Studio defaults | Studio default config uses invalid strategy names (`earthlike`, `vector`) | **Superseded** (removed) | **#1035** |

## Details (with original comment text)

### (1) PR #1029 — P1 “Migrate existing default strategy configs”

**Comment** (inline, `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-atmospheric-circulation/contract.ts:108`)

> The default strategy schema now only allows the new geostrophic fields … but existing configs … still set `windJetStreaks`, `windJetStrength`, and `windVariance` under strategy `"default"`. … migrate to `strategy: "latitude"` or accept legacy fields.

**Status**
- **Likely addressed** by the subsequent strategy-key rename work: the new algorithm is now `"default"` and the legacy banded algorithm is `"latitude"`, and references to `windJetStreaks`/`windJetStrength`/`windVariance` should only exist on `"latitude"`.

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
- **Addressed**: test imports now point at the real module/export.

**Important placement note**
- The fix currently exists **upstack** (applied while fixing the top-of-stack worktree). It should be moved downstack into **#1030** so that PR-level CI and local verification on that slice are correct.

---

### (3) PR #1030 — P2 “Import exported strategy name”

**Comment** (inline, `mods/mod-swooper-maps/test/hydrology-precip-default.test.ts:3`)

> The vector precipitation strategy file exports `defaultStrategy`, not `vectorStrategy` … named import will throw.

**Status**
- **Addressed**: test imports now use the exported symbol.

**Important placement note**
- Same as (2): move downstack into **#1030**.

---

### (4) PR #1031 — P2 “Differentiate far-ocean from land in coastDistance”

**Comment** (inline, `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-ocean-geometry/rules/index.ts:102`)

> BFS stops expanding when `d >= maxDist`, leaving water tiles beyond the cap at `0xffff`. Contract says 65535 means “on land”, so distant water becomes indistinguishable from land.

**Status**
- **Open**

**Proposed fix (preferred)**
- Preserve sentinel semantics: `65535` means land **only**.
- After BFS, for any water tile with `coastDistance === 65535`, set `coastDistance = maxDist` (clamp), or use a distinct sentinel for “far ocean” and update the contract description accordingly.

**Landing**
- This should land in **#1031**.

---

### (5) PR #1033 — P2 “Avoid advecting from land tiles in water-only step”

**Comment** (inline, `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-ocean-thermal-state/rules/index.ts:167`)

> `selectUpcurrent(...)` does not consider `isWaterMask`, so the chosen upcurrent neighbor can be land … land SSTs forced to `0` → coastal injection and artificial cooling.

**Status**
- **Open**

**Proposed fix**
- Update upcurrent selection to prefer only `isWaterMask === 1` neighbors.
- Fallback hierarchy (deterministic):
  1) best water neighbor(s) by score
  2) self (no advection)

**Landing**
- This should land in **#1033**.

---

### (6) PR #1035 — P1 “Use valid strategy names in defaultConfig”

**Comment** (inline, `apps/mapgen-studio/src/ui/data/defaultConfig.ts:152`)

> Studio default config sets `strategy: 'earthlike'` / `strategy: 'vector'`, but ops register `{default, latitude}` / `{default, cardinal}` / `{default, basic, refine}`.

**Status**
- **Superseded**: Studio-side preset/default injection was removed; strategy naming now aligns with op registry.

## Next actions (proposed)

1) **Move the test-import fixes downstack** into **#1030** so that the slice is self-validating.
2) Fix `coastDistance` sentinel/clamp in **#1031**.
3) Fix ocean thermal advection water-only correctness in **#1033**.

