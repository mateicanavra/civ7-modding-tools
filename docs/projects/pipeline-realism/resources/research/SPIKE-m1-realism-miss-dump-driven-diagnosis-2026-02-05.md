# SPIKE — M1 realism miss (dump-driven diagnosis) — 2026-02-05

## Objective + scope

M1 (“Pipeline Realism”) landed substantial Foundation + observability work, but the **primary user-facing goal** remains missed:

- Morphology produces **speckled / fragmented** landmasses (weak continent-scale coherence).
- Many Foundation-level changes feel **non-causal** downstream (either dead levers, normalized away, or not consumed).

This spike is a **data-first, deterministic** diagnosis that treats VizDumper dumps (manifest + trace + binaries) as the canonical truth and produces:

- a reproduction protocol,
- metric snapshots (no screenshots required),
- grouped root causes with concrete code anchors,
- an exhaustive issue ledger used as the input to the next “no-legacy” refactor plan.

No remediation code is performed here.

## Reproduction protocol (dump-first)

### Tooling
- Dump runner: `bun run --cwd mods/mod-swooper-maps diag:dump -- ...`
- Metrics: `bun run --cwd mods/mod-swooper-maps diag:analyze -- <runDirA> [runDirB]`
- Layer stats/diffs: `diag:list`, `diag:diff`, `diag:trace`

See `docs/system/libs/mapgen/how-to/diagnose-with-viz-dumps.md`.

### Deterministic probe (canonical)

Use fixed dims + seed:
- width `106`, height `66`, seed `1337`

Commands:

```bash
# baseline
bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label probe-baseline

# variant (example: plateCount)
bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label probe-platecount6 --override '{"foundation":{"knobs":{"plateCount":6}}}'

# A/B metrics
bun run --cwd mods/mod-swooper-maps diag:analyze -- <runDirA> <runDirB>
```

## Observed symptoms (metrics, deterministic)

### Symptom A — landmass speckle exists early (landmass-plates)

Baseline (`106×66 seed=1337`) shows extreme fragmentation at the landmask stage:
- `morphology-coasts.landmass-plates` landmask:
  - `landComponents`: **434**
  - `largestLandFrac`: **0.2565**
- After `geomorphology` (erosion + re-thresholding), land is reduced and still fragmented:
  - `landTiles`: **1627** (down from 2530)
  - `landComponents`: **183**

These values come directly from `diag:analyze` connected-components over the dumped `morphology.topography.landMask` grid (Odd-Q hex adjacency).

### Symptom B — some knobs move landmask (non-zero hamming), but do not improve coherence

Example A/B (baseline vs `foundation.knobs.plateCount=6`):
- landmask hamming:
  - landmass-plates: **~19.3%**
  - geomorphology: **~26.6%**
- coherence does not materially improve:
  - components drop somewhat (434 → 361) but remain extremely high
  - largestLandFrac stays low (0.2565 → 0.2503)

Interpretation: even when the pipeline is sensitive, it remains structurally capable of producing speckle.

## Root causes (grouped, with evidence anchors)

### Root cause 1 — “continent emergence” signal is degenerate: `crustTiles.type` saturates

In the baseline dump, `foundation.crustTiles.type` is **uniform**:
- `manifest.json` stats: `min == max == 1`

Repro (for any dump run dir):

```bash
bun run --cwd mods/mod-swooper-maps diag:list -- <runDir> --dataTypeKey foundation.crustTiles.type
```

Evidence anchors:
- Projection emits `foundation.crustTiles.type` from `platesResult.crustTiles.type`:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts`
- `crustTiles.type` is a direct projection of the Foundation crust model’s `crust.type[cellId]`:
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts` (`crustType[i] = crust.type[cellId] ?? 0;`)

Consequence:
- Any downstream logic that depends on “continental vs oceanic” classification (including sea-level “continental fraction” posture) becomes ineffective or misleading if the classifier saturates.

### Root cause 2 — landmask coherence is poor by construction without strong low-frequency structure

Morphology currently forms land primarily by **thresholding elevation**:
- base topography contains high-frequency components (noise + arc noise + boundary biases)
- landmask is formed by `elevation > seaLevel`
- geomorphology can re-threshold after erosion, shredding narrow connectors

Evidence anchors:
- Base topography composition (noise + arc-noise terms):
  - `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/strategies/default.ts`
- Landmask threshold:
  - `mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/strategies/default.ts`
- Geomorphology re-thresholding / land reclassification:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/steps/geomorphology.ts`

Consequence:
- Without a strong continent/basin signal (low-frequency “continent-scale” structure), the threshold boundary cuts through noise, yielding many disconnected land components.

### Root cause 3 — some Foundation levers are dead / normalized away / not consumed

Patterns observed in the broader diagnosis (to be validated per-lever via A/B dump diffs):
- Upstream changes can propagate into fields that Morphology does not consume (apparent “no downstream change”).
- Normalization can cancel out intended amplitude knobs (a “dead lever” trap).

Evidence anchors (example class of issue):
- Signed normalization eliminating global amplitude scaling:
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mantle-potential/index.ts` (`normalizeSigned` usage)
- Projection scaling knobs not feeding Morphology contracts:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts`

Operational check (for any suspected knob):
- Run A/B dumps changing a single knob
- `diag:diff --prefix foundation.` and `diag:diff --dataTypeKey morphology.topography.{elevation,landMask}`
- If foundation layers change but landmask doesn’t, the contract/wiring is the likely break.

## Full issue ledger (exhaustive list for the next plan)

This section is the actionable “no skipped steps” ledger. Each item must be:
- independently reproducible with the diagnostics toolkit,
- traceable to a concrete code location,
- tied to an explicit “physics-first” violation mode (legacy, noise-primary, dead lever, normalization trap, shadowed output).

### Problem: `foundation.crustTiles.type` saturates (min=max)
- Evidence:
  - dump stats show `min=max=1` for `foundation.crustTiles.type`
  - projection uses `crust.type` directly (`project-plates.ts`)
- Repro:
  - `diag:list --dataTypeKey foundation.crustTiles.type`
- Why it violates physics-first:
  - the continent/basin classifier is supposed to carry tectonic “continent emergence” truth; saturation removes that signal.

### Problem: landmask speckle (high component count) exists already at landmass-plates
- Evidence:
  - baseline `landComponents=434` at `morphology-coasts.landmass-plates`
- Repro:
  - `diag:analyze -- <runDir>`
- Why it violates physics-first:
  - coherent continents should arise from low-frequency crust + tectonic drivers, not “peaks-only” noise thresholding.

### Problem: geomorphology re-thresholding can shred connectivity
- Evidence:
  - landTiles drop significantly (2530 → 1627) and components change post-geomorphology
- Repro:
  - `diag:analyze -- <runDir>` (compare landmask layers by stepId)
- Why it violates physics-first:
  - erosion should sculpt terrain; it should not primarily reclassify land/water unless explicitly intended by the physics model.

### Problem: dead-lever class (normalization / non-consumption / shadowed outputs)
- Evidence:
  - per-lever A/B diff shows changes upstream but 0% landmask hamming (or unchanged elevation)
- Repro:
  - `diag:dump` A/B + `diag:diff` + `diag:analyze`
- Why it violates physics-first:
  - authoring surface becomes misleading; tuning degenerates into “cargo cult knobs”.

## Open questions (must be answered by the next planning spike)

1) What is the intended semantic of `crust.type` (oceanic/continental) once crust evolution exists?
   - Should it be a derived label from continuous state (maturity/thickness/buoyancy), or a primary state variable?
2) Which Morphology steps are allowed to reclassify land/water, and under what invariants?
3) Which Foundation outputs are:
   - canonical physics truth,
   - derived projections,
   - legacy or redundant,
   - currently unused or shadowed?

## Constraints for the next plan (non-negotiable)

- Physics-first: Foundation is truth; Morphology is grounded in Foundation.
- Noise is secondary flavor only (never primary continent/basin structure).
- No legacy dual-path pipelines: explicit delete/replace list; no “keep both”.
- Every Foundation output is either:
  - consumed correctly downstream, or
  - deleted, or
  - explicitly deferred with trigger + rationale.
