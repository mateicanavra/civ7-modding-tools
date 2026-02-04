# Stack Integration Memo: Morphology/Hydrology/Coasts/Wind+Current (Pipeline-Realism)

This memo reconciles Pipeline-Realism Foundation refactor docs with recent stack changes that landed in Morphology/Hydrology (including coastal shelving and wind/current updates).

Goal: ensure Pipeline-Realism assumptions, pointers, and planned seams match the **current** standard recipe stage naming, artifact wiring, and downstream dependencies.

## Sources (canonical)

- Morphology contract + stage split:
  - `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`
  - `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- Hydrology contract + stage split (winds/currents, projection posture):
  - `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`
- Code anchors (authoritative for stage/step IDs and artifact wiring):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/`

## What changed (high-signal)

### 1) Morphology stage naming split

Morphology is no longer described by the older “pre/mid/post” pseudo-stages. The standard recipe now uses explicit stages:

- `morphology-coasts`
- `morphology-routing`
- `morphology-erosion`
- `morphology-features`
- plus engine projection stage `map-morphology`

This is documented in:
- `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md` (Standard recipe stages list)

### 2) Coastal shelving contract got sharper

Morphology’s coastline/shelf work matters because `map-morphology` projection steps must preserve land/water truth (“no-water-drift” invariants).

Anchors:
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/assertions.ts` (`assertNoWaterDrift`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotCoasts.ts` (uses `coastlineMetrics.coastalWater || coastlineMetrics.shelfMask`)

Pipeline-Realism must remain consistent with this posture: Foundation refactor changes tectonic drivers; Morphology remains tile-first and owns shelf/coast truth.

### 3) Hydrology wind/current changes

Hydrology now emphasizes:

- winds + moisture transport state
- ocean surface currents computation (explicit op contracts)
- projection-only engine steps under `map-hydrology`

Anchors:
- `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md` (stage list and artifacts)
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-*/` (artifacts + steps)

Pipeline-Realism Foundation refactor does not directly change Hydrology, but it does change upstream terrain/morphology drivers that Hydrology ultimately sees via Morphology outputs.

## Where Pipeline-Realism docs were out of date (and what we changed)

The Pipeline-Realism packet referenced older pseudo-stages:

- `morphology-pre`
- `morphology-mid`
- `morphology-post`

These were updated to the current stage split:

- `morphology-pre/.../landmassPlates*` → `morphology-coasts/.../landmassPlates*`
- `morphology-mid/.../ruggedCoasts*` → `morphology-coasts/.../ruggedCoasts*`
- `morphology-post/.../volcanoes*` → `morphology-features/.../volcanoes*`

Updated files (Pipeline-Realism project scope):

- `docs/projects/pipeline-realism/resources/decisions/d06r-event-mechanics-and-force-emission.md`
- `docs/projects/pipeline-realism/resources/research/d06r-event-mechanics-and-force-emission-evidence.md`
- `docs/projects/pipeline-realism/resources/decisions/d07r-morphology-consumption-contract.md`
- `docs/projects/pipeline-realism/resources/research/d07r-morphology-consumption-contract-evidence.md`
- `docs/projects/pipeline-realism/resources/spec/sections/events-and-forces.md`
- `docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md`

## Adjustments needed vs. “no change needed”

### Adjustments needed (done in this pass)

- Update stale path references (above) so future implementation work doesn’t chase dead paths.
- Keep Morphology “tile-first truth + map-morphology projection invariants” prominent when describing downstream consumption.

### No change needed (for now)

- Hydrology wind/current refactors do not currently require changes to the Pipeline-Realism Foundation refactor SPEC:
  - Foundation remains upstream of Morphology; Hydrology consumes Morphology outputs (topography/hydrography), not Foundation mesh truth directly.
- Coastal shelving implementation details do not change the Foundation artifact plan:
  - shelving remains a Morphology-owned concern, guarded by `assertNoWaterDrift`.

## Traps (watch during final integration)

- **Trap: stage id drift in docs and plans**
  - Mitigation: when naming stages/steps in Pipeline-Realism docs, prefer referencing canonical domain docs (`MORPHOLOGY.md`, `HYDROLOGY.md`) and current `mods/mod-swooper-maps/src/recipes/standard/stages/*` paths.
- **Trap: confusing Morphology truth vs engine projections**
  - Mitigation: keep `map-morphology` explicitly labeled as projection-only; never treat engine-facing terrain stamping as truth.
- **Trap: Foundation refactor “owns coasts” by accident**
  - Mitigation: Foundation emits tectonic drivers; Morphology remains owner of coasts/shelf truth and land/water invariants.
- **Trap: viz keys drift when stage names change**
  - Mitigation: keep `dataTypeKey` stable and semantic; disambiguate via `spaceId` and `variantKey` rather than step id naming.

## Checklist (for end-of-project critical integration)

- [ ] Pipeline-Realism docs contain no references to `morphology-pre/mid/post` paths.
- [ ] Morphology consumption spec acknowledges the stage split and preserves tile-first truth posture.
- [ ] Migration slices reference the seam as “Foundation tile projections → Morphology truth stages → map-morphology projection”.
- [ ] No Pipeline-Realism doc claims Foundation owns coasts/shelf truth.
- [ ] Hydrology doc changes do not introduce new Foundation requirements (re-evaluate only if Hydrology starts consuming Foundation mesh truth).

