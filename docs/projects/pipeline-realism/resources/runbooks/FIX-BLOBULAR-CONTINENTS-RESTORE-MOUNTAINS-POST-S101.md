# Plan: Fix Blobular Continents + Restore Mountains/Volcano Viz (Post-S101)

## Summary
You’re seeing two different failure modes:

1. **“Blobular / plopped up” continents**: our continent potential is still dominated by low-frequency crust truth + smoothing, with *too little apparent boundary migration* across eras and too little boundary-shaped bias in the landmask signal. This makes land look like it “emerged” rather than being sculpted by collisions.

2. **Mountains not showing (and mountain plots blank)**: in the current probe, the mountain planner is receiving a **boundaryCloseness field whose dynamic range is far too small**, so its boundary-strength gate/exponent collapses the orogeny signal to ~0, which then keeps mountain/hill scores below thresholds.

## Ground Truth From A Fresh Probe (worktree `wt-agent-GOBI-PRR-s95-plan-fix-continents-mountains`)
Using `bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label codex-manifest-debug`:

- `map.morphology.mountains.mountainMask`: `min=0 max=0`
- `map.morphology.mountains.hillMask`: `min=0 max=0`
- `map.morphology.mountains.orogenyPotential01`: `min=0 max=0`
- Volcanoes are present: `map.morphology.volcanoes.points count = 17`
- Belt drivers show the scaling issue:
  - `morphology.belts.boundaryCloseness`: `min=2 max=28` (too low to drive boundaryStrength meaningfully)

This is exactly consistent with “mountains no longer show” and “plot steps blank” for mountains.

## Root Causes (What’s Actually Going Wrong)

### A) Mountains vanished because boundary proximity is intensity-scaled twice
In `.../compute-belt-drivers/deriveFromHistory.ts`, `boundaryCloseness` is computed as:
- `boundaryCloseness = 255 * normalized * (seedIntensity/255)`

So even at the boundary (normalized≈1), if the seed intensity is ~30–60, you only get closeness≈30–60, and after diffusion it’s often <30.  
Then in `plan-ridges-and-foothills`, `boundaryStrength` is computed via a gate+exponent (default `boundaryGate=0.1`, `boundaryExponent=1.6`) and becomes so tiny that:
- `orogenyPotential01` rounds to 0 everywhere
- mountain/hill scores never exceed thresholds

### B) “Plopped up blob” continents because plates still don’t *visibly* migrate enough
Even with per-era fields, if per-era drift is small and landmask uses heavy low-pass, you still get “one big smooth blob” behavior.
Primary levers:
- `foundation/compute-tectonic-history` `driftStepsByEra` is too low for strong visible boundary migration.
- `morphology/compute-landmask` currently ignores `boundaryCloseness` entirely in the potential formula (even though it’s already an input), and also doesn’t incorporate boundary type / tectonic stress / uplift/volcanism totals as continent-shaping bias terms.

## Implementation: New Graphite Slices On Top Of Current Stack
We’ll add a new mini-stack (3 slices) on top of `agent-GOBI-PRR-s101-per-era-crust-feedback-loop`.

### Slice 1: Make `boundaryCloseness` Pure Proximity (Restore Mountains)
**Goal:** restore mountain/hill/orogeny signals without “cheating thresholds”.

**Files**
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/morphology/ops/compute-belt-drivers/deriveFromHistory.ts`
- Add test:
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/test/morphology/belt-drivers-boundary-closeness.test.ts` (new)

**Change (decision-complete)**
1. In `deriveBeltDriversFromHistory`, change:
   - From: `boundaryCloseness[i] = clampByte(255 * normalized * intensityScale);`
   - To: `boundaryCloseness[i] = clampByte(255 * normalized);`
2. Keep `upliftPotential/riftPotential/tectonicStress` as intensity-shaped fields (they already are).
3. Do not change diffusion/cutoff logic in this slice.

**Rationale**
- `boundaryCloseness` should represent “distance/proximity to a belt,” not “distance multiplied by intensity.”  
- Intensity already exists as `upliftPotential/riftPotential/tectonicStress`, so multiplying closeness by intensity double-penalizes mountains.

**Test (cheap + deterministic)**
- Construct a tiny synthetic history/provenance where a single seed tile has nonzero intensity but not max (e.g. 64).
- Assert `boundaryCloseness` at the seed tile is `255` (or near 255, if edge cases) and not `64`.
- Assert diffusion produces decreasing values with distance (monotone-ish).

**Acceptance (canonical probe)**
- Re-run `diag:dump 106 66 1337`.
- `map.morphology.mountains.orogenyPotential01 max > 0`
- `map.morphology.mountains.mountainMask max == 1` and nonzero count
- Volcano points still nonzero.

---

### Slice 2: Increase Per-Era Boundary Drift (Realistic “Plates Moved” Feel)
**Goal:** reduce blobularity by making older-era boundaries materially displaced relative to present.

**Files**
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`

**Change (decision-complete)**
1. Update `driftStepsByEra` defaults (oldest→newest):
   - From: `[2, 2, 2, 2, 2]`
   - To (Realistic): `[12, 9, 6, 3, 1]`
2. Keep `eraWeights` as-is initially (we’ll only touch if gates/visuals indicate it’s still too static).
3. Update the earthlike preset to explicitly set the same drift array in the relevant foundation config location.

**Acceptance (canonical probe)**
- `diag:dump` visual: boundary-driven belts should show era-to-era displacement (less “single static belt” look).
- Determinism + foundation gates still pass.
- Landmass metrics remain in the existing band (pctLand still earthlike).

---

### Slice 3: Landmask Uses Full Foundation Truth (Boundary Type + Stress + History Rollups)
**Goal:** make continents look collision-shaped (not just smoothed crust blobs) by feeding “all relevant inputs” into continent potential in a **multi-scale** way.

**Files**
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/contract.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/rules/index.ts` (if needed for validation changes)
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/strategies/default.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.ts`
- Add test:
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/test/pipeline/mountains-nonzero-probe.test.ts` (new, canonical probe only)

**Contract/Input Expansion (decision-complete)**
Add these inputs to `compute-landmask` op (all tile-aligned arrays):
- From `beltDrivers`:
  - `boundaryType: u8`
  - `upliftPotential: u8`
  - `riftPotential: u8`
  - `tectonicStress: u8`
- From `historyTiles.rollups`:
  - `upliftTotal: u8`
  - `volcanismTotal: u8`
  - `upliftRecentFraction: u8`
  - `lastActiveEra: u8`
- From `crustTiles`:
  - `crustMaturity: f32`
  - `crustThickness: f32`
  - `crustDamage: u8`
  - `crustStrength: f32`

Update `landmassPlates.ts` to pass all of the above.

**Landmask Potential Model (decision-complete)**
Compute 3 intermediate fields, then blend:

1. `potentialCrustRaw` (low-frequency “isostasy + stable craton”)
   - Use: `crustType, crustBaseElevation, crustMaturity, crustThickness, crustStrength, crustAge, stability (originEra+driftDistance), damage penalty`
   - Example weights (sum to ~1 before penalties):
     - type: 0.28
     - baseElevation: 0.22
     - maturity: 0.16
     - thickness: 0.12
     - strength: 0.06
     - stability: 0.10
     - age: 0.06
     - subtract `0.18 * (crustDamage/255)` (penalty)

2. `potentialBoundaryRaw` (mid-frequency “collision sculpting”)
   - `b = boundaryCloseness/255`
   - `u = upliftPotential/255`
   - `r = riftPotential/255`
   - `s = tectonicStress/255`
   - `bt = boundaryType`:
     - convergent: add `b * (0.55*s + 0.45*u)`
     - transform: add `b * (0.35*s)`
     - divergent: subtract `b * (0.65*r)` (rifted margins discourage continent potential)
   - Clamp to `[-1, +1]` then remap to `[0,1]` for blending.

3. `potentialHistoryRaw` (mid-frequency “integrated tectonic buildup”)
   - `upliftTotal01 = upliftTotal/255`
   - `volcanismTotal01 = volcanismTotal/255`
   - `recent01 = upliftRecentFraction/255`
   - Add: `0.55*upliftTotal01 + 0.25*volcanismTotal01 + 0.20*recent01`
   - Subtract: `0.20*(fractureTotal/255)` (fracture as disruption)

**Multi-scale smoothing**
- Low-pass only the crust field:
  - `crustLP = blurHex(coarseAverageHex(potentialCrustRaw, grain), blurSteps)`
- Lightly blur boundary + history (no coarse binning):
  - `boundaryLP = blurHex(potentialBoundaryRaw, boundaryBlurSteps=2)`
  - `historyLP = blurHex(potentialHistoryRaw, historyBlurSteps=2)`

**Final potential**
- Keep existing craton-growth term, but treat it as one contributor, not the only “motion” signal.
- `potential = clamp01( 0.72*crustLP + 0.18*boundaryLP + 0.10*historyLP + cratonWeight*cratonLP )`
- Then threshold to `desiredLandCount` and run existing prune/fill.

**Landmask tuning**
- Reduce blobularity while avoiding blockiness:
  - `continentPotentialGrain`: `5 -> 4`
  - `continentPotentialBlurSteps`: `5 -> 4`
  - Keep `keepLandComponentFraction` unchanged initially.
  - Keep craton defaults as-is (already enabled); we’ll revisit only if continents fragment.

**New pipeline regression test**
`mountains-nonzero-probe.test.ts`:
- Run standard recipe at `106x66 seed=1337` with earthlike config.
- Capture `map.morphology.mountains.mountainMask` and assert:
  - `max == 1`
  - `sum(mountainMask) >= 10` (small but nonzero guard)
  - `map.morphology.mountains.orogenyPotential01 max > 0`
- Also assert volcano points count within a sane band (e.g. `>= 1`), to catch “all volcanoes disappeared” regressions.

**Acceptance (canonical probe + gates)**
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/determinism-suite.test.ts`
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/foundation-gates.test.ts`
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/mountains-nonzero-probe.test.ts`
- `diag:dump` and `diag:analyze` on `106 66 1337`:
  - `landComponents` stays single digits
  - `largestLandFrac` stays > 0.40
  - `pctLand` stays in `[0.25..0.55]`
  - mountain/hill masks nonzero
  - volcano points nonzero

## Graphite Workflow (per slice)
For each slice:
1. `gt sync --no-restack`
2. `gt create <slice-branch-name>`
3. Implement minimal change
4. Run the exact test/evidence bundle above
5. Commit (conventional commit)
6. `gt restack --upstack`
7. `gt submit --stack --draft --ai`

## Assumptions / Defaults Locked In
- Drift profile: **Realistic** `[12, 9, 6, 3, 1]`.
- Belt fix: **boundaryCloseness becomes pure proximity** (not intensity-scaled).
- Landmask: **include boundary type + stress + history rollups + crust truth**, blended multi-scale, while keeping land fraction fixed via thresholding to `desiredLandCount`.

