PLEASE IMPLEMENT THIS PLAN:
# Plan: Fix Continents + Mountains (Maximal Realism, No-Legacy Spine)

## Summary
We will fix the two “ugly” signatures you care about, in a staged but end-to-end decision-complete implementation:

- **Blocky / rectangular continents**: caused primarily by *rectangular coarse averaging* in the landmask continent-potential low-pass. We will replace that low-pass with a **hex/axial coarse bin + hex blur** so the smoothing kernel matches the grid topology.
- **Muted / missing mountains**: caused primarily by *polarity degeneracy + weak uplift penetration*. We will (a) bootstrap polarity deterministically from available crust truth (strength/damage), (b) make tectonic field emission smoother (continuous distance decay), and (c) tune uplift decay/radius plus base-topography uplift amplification. We will also lower belt pruning thresholds so legitimate short ranges survive.

This plan is designed for Graphite stacked PR slices (small, reviewable layers), each with the repo’s evidence bundle: `diag:dump`, `diag:analyze`, `diag:list`, and determinism/invariants tests.

## Current Baseline / Prerequisite Slice
This plan assumes we start **on top of PR #1161** (already created in your stack): https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1161

That slice:
- Lowers provenance reset floors + rift frac-of-max so later eras can reset origins
- De-weights “age-only makes continents” in crust evolution
- Adds sea-level solver guardrails so constraint chasing cannot blow up hypsometry

If this PR changes substantially during review, re-run the baseline capture step below before continuing.

## Goals (Success Criteria)
Measured on canonical probe `106 66 1337` (earthlike config), and validated across the determinism suite.

### Continents
- Coastlines are not dominated by rectangular/block artifacts.
- Landmask coherence stays within Phase B gates (from your plan doc):
  - `landComponents` low (target: single digits; hard gate is already defined in the plan as delta-vs-baseline)
  - `largestLandFrac` materially high (target > 0.40, ideally > 0.50)
  - `pctLand` stays earthlike: `0.25..0.55`

### Mountains / Belts
- Uplift/volcanism fields have non-trivial inland penetration (not confined to a 1–2 hop ring).
- Belts are visible and not entirely pruned by min-component rules.
- Mountain placement has usable signal (not “flat world with tiny ridges everywhere” and not “no mountains”).

### Determinism / Guardrails
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/determinism-suite.test.ts` passes.
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/foundation-gates.test.ts` passes.
- `bun run --cwd mods/mod-swooper-maps check` passes.

## Non-Goals (Explicitly Out of Scope for This Pass)
- Full Wilson-cycle plate reorganization (events truly changing plate graph each era)
- True geodynamics modeling of RT instability beyond a bounded heuristic term
- Any legacy/shadow/dual pipeline paths (must remain no-legacy)

## Evidence / Measurement Commands (Per Slice)
Run and attach in each slice PR description:
1. `bun run --cwd mods/mod-swooper-maps test test/pipeline/determinism-suite.test.ts`
2. `bun run --cwd mods/mod-swooper-maps test test/pipeline/foundation-gates.test.ts`
3. `bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label <slice-label>`
4. `bun run --cwd mods/mod-swooper-maps diag:analyze -- <outputDir>`
5. Spot checks:
   - `bun run --cwd mods/mod-swooper-maps diag:list -- <outputDir> --dataTypeKey foundation.crustTiles.type`
   - `bun run --cwd mods/mod-swooper-maps diag:list -- <outputDir> --dataTypeKey morphology.topography.landMask`

## Implementation: Graphite Slice Breakdown (Decision Complete)

### Slice 1: Fix Blocky Continents via Hex Low-Pass
**Primary problem addressed**: rectangular block artifacts in continents.

**Files**
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/strategies/default.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/contract.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`

**Change**
1. Replace the rectangular coarse averaging:
   - Replace `buildCoarseAverage(width,height,values,grain)` with `buildCoarseAverageHexOddQ(...)`:
     - Convert odd-q `(x,y)` to axial coords `(q,r)`:
       - `q = x`
       - `r = y - ((x - (x & 1)) / 2)`
     - Bin by `g = continentPotentialGrain`:
       - `Qb = floor(q / g)`
       - `Rb = floor(r / g)`
       - Key: `(Qb,Rb)` (encode into an integer key)
     - Average within bins and assign the bin’s mean back to member tiles.
     - This yields a low-frequency field aligned to the hex topology, not axis-aligned rectangles.
2. Default tuning (applies to schema + earthlike preset):
   - In `contract.ts` defaults:
     - `continentPotentialGrain`: `8 -> 5`
     - `continentPotentialBlurSteps`: `3 -> 5`
   - In `swooper-earthlike.config.json`, set the same values under `morphology-coasts.advanced.landmass-plates.landmask.config`.
3. Keep `keepLandComponentFraction` unchanged for this slice (only adjust if gates indicate regression).

**Acceptance**
- Landmask metrics still pass the Phase B sanity band (`pctLand` in `0.25..0.55` and `largestLandFrac` > `0.40`).
- Visual dump no longer shows large rectangular edges as the dominant coastline artifact.

---

### Slice 2: Polarity Bootstrap for Ocean-Ocean Convergence (Mountains On)
**Primary problem addressed**: convergent volcanism bonus suppressed because `polarity=0` when types match.

**Files**
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts`
- Add test:
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-polarity-bootstrap.test.ts` (new)

**Change**
In `compute-tectonic-segments/index.ts`, inside:
```ts
if (kind === BOUNDARY_TYPE.convergent) { ... }
```
When `aType === bType` (ocean-ocean early on), assign polarity using **strength differential** (available in crustInit and non-uniform due to rift damage):
- Let `aStrength = clamp01(crust.strength[i] ?? 0)`
- Let `bStrength = clamp01(crust.strength[j] ?? 0)`
- If `abs(aStrength - bStrength) >= 0.03`:
  - If `aStrength < bStrength`, set `pol = -1` (plate A subducts; matches existing “A oceanic under B continental” sign convention)
  - If `bStrength < aStrength`, set `pol = 1`
- Else keep `pol = 0`

Do not change regime classification or c/e/s calculations in this slice.

**Test**
- Run the op on a deterministic small fixture (or via existing harness helpers) and assert:
  - There exists at least one convergent segment with `polarity != 0` in a canonical case.
  - Convergent volcanism intensity (`segments.volcanism`) increases by the +40 bonus when polarity is non-zero (verify via segment output).

**Acceptance**
- `diag:list` / dumps show non-trivial `foundation.plates.tileVolcanism` maxima increase vs baseline.
- Mountain/belt downstream signal should strengthen (even before other tuning).

---

### Slice 3: Smooth Field Emission at the Source (Normalized Edge-Length Distance)
**Primary problem addressed**: stepped contour rings from integer-hop BFS decay in `buildEraFields`.

**Files**
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts`

**Change**
In `buildEraFields(...)`:
1. Change BFS `distance` from `Int16Array` to `Float32Array`.
2. Compute a stable per-call `meanEdgeLen` from mesh adjacency:
   - Iterate cells and a subset of neighbor edges (cap samples for perf; e.g. first 100k edges or first N cells).
   - For each edge `(cellId -> n)`, compute:
     - `dx = wrapDeltaPeriodic(siteX[n] - siteX[cellId], wrapWidth)`
     - `dy = siteY[n] - siteY[cellId]`
     - `edgeLen = sqrt(dx*dx + dy*dy)`
   - `meanEdgeLen = average(edgeLen)` with a fallback of `1` if degenerate.
3. In BFS expansion:
   - Replace `distance[n] = d + 1` with:
     - `distance[n] = distance[cellId] + (edgeLen / meanEdgeLen)`
4. Keep all existing radii `R.*` and decay `D.*` semantics unchanged:
   - Distances remain approximately “in steps” but continuous, eliminating the discrete contour rings without rewriting authoring.

**Acceptance**
- Visual: uplift/rift/shear/volcanism fields lose obvious ring stepping.
- Determinism suite still passes.

---

### Slice 4: Uplift Penetration + Mountain Visibility Tuning
**Primary problem addressed**: uplift decays too aggressively + base-topography uplift effect too small.

**Files**
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/rules/index.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/morphology/config.ts`
- Update preset (if needed):
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`

**Change**
1. In `compute-tectonic-history/index.ts`:
   - `EMISSION_RADIUS_MUL.uplift`: `1.5 -> 2.0`
   - `EMISSION_DECAY_MUL.uplift`: from `0.45 / 0.55` to `0.30 / 0.55`
2. In `compute-base-topography/rules/index.ts`:
   - Change `upliftEffect = upliftBlend * reliefSpan * 0.25` to `* 0.45`
3. In `morphology/config.ts` relief defaults:
   - `tectonics.boundaryArcWeight`: `0.35 -> 0.55`

**Acceptance**
- Elevation range increases meaningfully in `morphology.topography.elevation` without exploding into all-land.
- Mountains are visibly present in the `map-morphology` stage outputs on the canonical probe.

---

### Slice 5: Reduce Belt Pruning Threshold (Preserve Legit Short Ranges)
**Primary problem addressed**: weak/fractured fields produce short belt components that are pruned away.

**Files**
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/morphology/ops/compute-belt-drivers/deriveFromHistory.ts`
- Update tests if they assert component counts/ids:
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/test/morphology/belt-synthesis-history-provenance.test.ts`

**Change**
- `MIN_BELT_LENGTH`: `6 -> 3`

**Acceptance**
- Belt components appear more consistently; no catastrophic belt “salt-and-pepper everywhere”.
- Determinism/invariants tests pass.

---

### Slice 6: Full Per-Era Crust Feedback Loop (Physics Correctness Slice)
**Primary problem addressed**: crust emergence currently computed from totals; we want an actual per-era integration so “history causes material evolution”.

**Key constraint**
Foundation step ordering means this loop’s **outputs must remain deterministic and compatible** with existing artifacts (`foundationArtifacts.tectonicHistory`, `foundationArtifacts.tectonicProvenance`, and the subsequent crust evolution step). We will implement the feedback loop in `compute-crust-evolution` (authoritative crust truth) using per-era fields, and separately implement a minimal per-era polarity/intensity modulation in tectonic history emission.

This slice has two subparts; implement both in this slice to keep a single coherent model.

#### 6A: Per-era integration in crust evolution (authoritative truth)
**Files**
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts` (if new params are needed; avoid if possible)

**Algorithm (decision complete)**
Replace the “one-shot totals” maturity computation with an era loop:
- Initialize per-cell:
  - `maturity = 0`
  - `thickness = crustInit.thickness[i] ?? 0.25`
  - `thermalAge01 = 0`
  - `damage01 = (existing formula baseline)`
- For each era `e` from oldest to newest:
  - Let `u = eras[e].upliftPotential[i] / 255`
  - Let `r = eras[e].riftPotential[i] / 255`
  - Let `s = eras[e].shearStress[i] / 255`
  - Let `v = eras[e].volcanism[i] / 255`
  - Let `f = eras[e].fracture[i] / 255`
  - Differentiation increment:
    - `headroom = 1 - maturity`
    - `maturity += 0.22 * u * headroom * headroom + 0.10 * v * headroom`
  - Disruption suppression:
    - `disrupt = clamp01(0.45*r + 0.25*s + 0.30*f)`
    - `maturity -= 0.28 * disrupt * maturity`
  - Rift reset (recycling):
    - If `r >= 0.35`, then `maturity = min(maturity, 0.08)` and `thermalAge01 = thermalAge01 * 0.4`
  - Damage update:
    - `damage01 = clamp01(max(damage01, disrupt))`
  - Thermal age accrual:
    - `thermalAge01 = clamp01(thermalAge01 + (1/eraCount) * (1 - 0.6*r))`

After era loop:
- `type = maturity >= 0.55 ? 1 : 0`
- Recompute buoyancy/baseElevation/strength using the same helper logic already in `compute-crust-evolution/index.ts` (keep a single set of coefficients).
- Keep the existing contract outputs unchanged.

#### 6B: Per-era polarity/intensity modulation at emission time
**Files**
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts`

**Change**
When deriving per-era event intensities for volcanism/uplift from convergent segments:
- Use the current era index and the evolved crust truth proxies available at emission time:
  - Since tectonic-history is computed before crust-evolution step, we will use:
    - Segment polarity from Slice 2 (strength bootstrap) as baseline
    - Plus a deterministic per-era bonus multiplier based on segment compression intensity to represent increasing orogeny with time:
      - e.g. `eraGain = lerp(0.85, 1.15, e/(eraCount-1))`
      - Multiply `intensityUplift` and `intensityVolcanism` by `eraGain` before decay
- (We intentionally do not attempt to re-run segmentation per era in this milestone; that would be a separate, larger milestone.)

**Acceptance**
- `foundation.crustTiles.type` is non-degenerate and not saturated on the canonical probe (target: `pctContinental` between `0.15..0.70`).
- Landmask gates still pass (pctLand band + coherence).
- Mountains/belts look materially stronger and more structured than baseline.

---

## Test Plan (Repo-Exact)
Per slice (minimum):
- `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps check`
- `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps test test/pipeline/determinism-suite.test.ts`
- `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps test test/pipeline/foundation-gates.test.ts`
- `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps diag:dump -- 106 66 1337 --label <slice>`
- `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps diag:analyze -- <outputDir>`

Additions:
- Slice 2 adds `m11-tectonic-segments-polarity-bootstrap.test.ts` (new)
- Slice 5 may require updating belt synthesis tests if they assume component pruning behavior

## Graphite Workflow (Exact Commands)
For each slice:
1. `gt sync --no-restack`
2. `gt create <slice-branch-name>`
3. Implement minimal changes for the slice
4. Run tests + evidence bundle
5. Commit (conventional commit)
6. `gt restack --upstack`
7. `gt submit --stack --draft --ai`

## Assumptions / Defaults Locked In
- We will use **Hex Low-Pass** for landmask smoothing (not rectangular coarse averaging).
- We will implement **Normalized Edge-Length** distance decay in `buildEraFields` (continuous, step-semantics preserved).
- We will implement the **full plan**, but keep the largest architectural leap (true per-era resegmentation / changing plate graph) out of scope for this milestone.
