# 1. Framed objective

Determine the actual Civ-facing river and lake materialization surfaces for the
current Swooper/MapGen stack, and separate what is:

- pipeline-authored truth,
- pipeline-authored projection/stamping,
- Civ-owned validation/classification/cache side effects,
- Civ-only rendering/metadata,
- and currently unproven or over-claimed.

Hard core:

- Lakes and rivers are not one surface.
- Minor-river semantics and navigable-river semantics are not one surface.
- "Hydrology knows about rivers" is not the same claim as "Civ shows the right
  river."
- "Terrain tile became `TERRAIN_NAVIGABLE_RIVER`" is not the same claim as
  "Civ runtime river metadata, gameplay affordances, and visible rendering are
  all correct."

Structural alternative considered and rejected: treat all river behavior as
"MapGen-owned" because the repo now avoids `TerrainBuilder.modelRivers(...)`.
That frame is too coarse. It hides the split between authored terrain,
runtime river metadata, floodplain features, and final visual/runtime
classification.

Falsifier for this frame: if current evidence shows that a claimed surface
cannot be tied to either an official Civ rule/resource, a concrete repo code
path, or a recorded runtime/direct-control read surface, then that claim must
be downgraded to unproven.

# 2. Investigation design: questions, exclusions, falsifiers, evidence hierarchy, stop conditions

## Questions

1. For lakes, what does our pipeline author directly, what does Civ classify,
   and what does runtime readback actually confirm?
2. For navigable rivers, are we stamping final terrain ourselves, delegating to
   Civ, or doing a hybrid where MapGen chooses tiles and Civ only validates or
   names them?
3. For minor rivers, where is the current Civ-facing materialization path at
   all, if the recipe no longer calls Civ's river generator?
4. How do floodplain semantics split across Hydrology truth, navigable-river
   terrain, minor-river metadata, and Ecology feature planning?
5. Which runtime/direct-control surfaces exist today for river/lake proof, and
   which important ones remain outside the current package wrapper even if Civ
   exposes them?
6. Where does current repo wording overstate ownership or proof?

## Exclusions

- No claim that old vanilla Civ map scripts describe the current mod behavior.
  They are baseline engine evidence only.
- No claim that local artifact truth equals Civ runtime truth.
- No claim that full-grid terrain parity proves river metadata parity.
- No claim that Studio visibility proves rendered-game visibility.
- No claim that `riverClass` alone is a Civ-facing minor-river surface.

## Falsifiers

- A surface is called "materialized" but only exists as local artifact truth.
- A surface is called "Civ-facing" but no official/runtime read surface can see
  it.
- A surface is called "MapGen-owned" but the last meaningful state transition is
  actually hidden inside Civ validation or classification.
- A surface is called "proven" but the recorded proof explicitly narrows the
  claim to terrain-only parity.

## Evidence hierarchy

1. Official Civ resources and data/schema usage.
2. Current repo code paths and tests.
3. Recorded runtime/direct-control proof artifacts already captured in-repo.
4. Repo docs/ADRs stating intended ownership.
5. Inference only where the above leave a gap.

Conflict rule: official-resource/runtime evidence beats architecture intent
docs when they diverge.

## Stop conditions

- I can inventory the surfaces and name the gaps, but not collapse a gap into a
  proof claim.
- If no live same-run river metadata proof exists in-repo, the correct output
  is "unproven metadata/render surface," not "probably fine."

# 3. Materialization surface inventory (owner, evidence, limits)

| Surface | Current owner | Evidence | What it actually proves | Limits / adversarial note |
| --- | --- | --- | --- | --- |
| `artifact:hydrology.hydrography` (`runoff`, `discharge`, `riverClass`, `flowDir`, `sinkMask`, `outletMask`) | Hydrology truth | [source] `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/artifacts.ts` | The pipeline has a canonical local river model, including `riverClass` `0=none, 1=minor, 2=major`. | Not Civ-facing by itself. No runtime proof that `riverClass=1/2` becomes matching Civ minor/navigable semantics. |
| `artifact:hydrology.lakePlan` | Hydrology truth | [source] same artifact schema; [source] `docs/system/mods/swooper-maps/architecture.md` | Lakes are planned deterministically by pipeline truth, not delegated to Civ lake generation. | Intent only. Does not prove accepted water/lake classification or visibility. |
| Lake stamping via `context.adapter.stampLakes(...)` | Map-hydrology + adapter boundary | [source] `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.ts`; [source] `packages/civ7-adapter/src/civ7-adapter.ts` | The current recipe directly stamps planned lake tiles to `TERRAIN_COAST`, then forces `recalculateAreas()` and `storeWaterData()`, then reads back terrain/water/lake/area/elevation. | This is a hybrid surface: MapGen chooses tiles; Civ decides accepted classification after terrain/cache refresh. Not pure delegation, but not pure local ownership either. |
| Lake runtime evidence artifact `artifact:map.hydrology.engineProjectionLakes` | Map-hydrology projection evidence | [source] `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/artifacts.ts`; [source] archived implementation docs for `normalize-projection-lakes` and `prove-lake-runtime-water-fill` | We have explicit accepted-vs-planned lake evidence (`engineWaterMask`, `engineLakeMask`, `nonWaterMask`, `nonLakeMask`, `terrainMismatchMask`). | Strongest current proof is projection/readback, not rendered product visibility. |
| Vanilla Civ lake generation | Civ engine baseline, not current recipe | [official-resource] `.civ7/outputs/resources/Base/modules/base-standard/maps/*.js`; [official-resource] `elevation-terrain-generator.js` | Standard Civ scripts call `generateLakes(...)` before elevation, showing Civ has its own lake generator path. | Useful for contrast only. Current recipe intentionally does not use it. |
| MapGen navigable-river selection policy (`materializeNavigableRiverMask`) | MapGen policy | [source] `mods/mod-swooper-maps/src/recipes/standard/projection-policies/navigableRiverMaterialization.ts`; [source] `navigable-river-materialization.test.ts` | MapGen selects navigable-river tile corridors from Hydrology flow/discharge and a projectable land mask. | This is only a local mask policy. It is not yet proof of Civ river metadata or rendered behavior. |
| Navigable-river terrain stamping | Map-rivers stage | [source] `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.ts`; [source] `map-projection-public-config.ts`; [source] `map-stamping.contract-guard.test.ts` | Current recipe directly sets selected tiles to `NAVIGABLE_RIVER_TERRAIN` and explicitly forbids `adapter.modelRivers(...)`. | This is the clearest result of the investigation: current pipeline is not delegating navigable-river terrain generation to Civ's river generator. It is directly stamping terrain tiles. |
| Post-river Civ validation/naming/cache refresh | Civ engine side effects after pipeline stamping | [source] `plotRivers.ts`; [source] `plot-rivers-post-refresh.test.ts`; [official-resource] vanilla scripts call `validateAndFixTerrain()`, `defineNamedRivers()`, `storeWaterData()` around river generation | Civ still owns validation, naming, area recalculation, and water-cache updates after stamping. | Hidden behavior remains opaque. This means "MapGen stamped the terrain" does not prove full downstream Civ classification. |
| Navigable-river runtime projection evidence `artifact:map.rivers.engineProjectionRivers` | Map-rivers projection evidence | [source] `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/artifacts.ts`; [source] `plotRivers.ts` | Current proof surface compares projected navigable-river terrain mask to engine terrain readback and records mismatch counts. | The evidence artifact is terrain-centric. It does not prove `getRiverType`, `isNavigableRiver`, `getRiverName`, ferry/bridge affordances, or ocean-connectivity metadata. |
| Minor-river semantics in official Civ | Civ runtime/gameplay rule surface | [official-resource] `unit-movement.xml`; [official-resource] `terrain.xml`; [official-resource] `plot-tooltip.js` | Civ distinguishes `RIVER_MINOR` from `RIVER_NAVIGABLE`. Minor and navigable floodplains are separate feature ids. Tooltip and movement rules depend on this distinction. | Important adversarial point: official Civ clearly has a minor-river runtime category, but I found no current recipe path that materializes Hydrology minor rivers into that Civ edge-river metadata surface. |
| Minor-river semantics in current pipeline | Hydrology/Ecology/Placement local semantics | [source] `hydrology-hydrography/artifacts.ts`; [source] `plan-starts/contract.ts`; [source] `compute-feature-substrate/contract.ts` | The pipeline uses `riverClass > 0` and `riverClass=1/2` for local reasoning, starts, and ecology substrate planning. | This is not a proven Civ-facing minor-river materialization surface. It is local semantic input only. |
| Floodplain feature split | Ecology feature planning | [source] `terrain.xml` official feature validity rows; [source] `score-layers/index.ts`; [source] `features-plan-floodplains` contract/strategy | Floodplains are a split materialization surface: minor floodplain features sit on `TERRAIN_FLAT`; navigable floodplain features sit on `TERRAIN_NAVIGABLE_RIVER`. Ecology explicitly scores and plans both. | Current minor-floodplain planning uses local substrate logic (`floodplainMask`, `navigableRiverMask`, adjacent discharge), not proven live Civ minor-river metadata. This may be a policy proxy, not a proof-backed Civ correspondence. |
| Direct-control currently wrapped hydrology read surface | `@civ7/direct-control` current package wrapper | [source] `packages/civ7-direct-control/src/play/map/reads.ts` | The current public plot/map wrapper exposes `riverType` and `water` under `"hydrology"`. | This is narrower than the known Civ/Tuner surface; current wrapper does not expose `isLake`, `isRiver`, `isNavigableRiver`, or `getRiverName` in the standard hydrology field set, which weakens proof and classification. |
| Direct-control known underlying Civ/Tuner hydrology capabilities | Civ runtime surface, partially wrapped | [recorded-live-proof] `docs/projects/civ7-direct-control/workstream/discovery/tuner-api-inventory.md`; [recorded-live-proof] `capability-inventory/tuner-surface-report.md`; [recorded-live-proof] `morphology-terrain-authorship-control/workstream/verification-and-runtime-proof.md` | Civ runtime exposes `getRiverType`, `getRiverName`, `isRiver`, `isNavigableRiver`, `isLake`, `isWater`, etc., and repo proof artifacts have recorded their availability. | Availability is not the same as current proof integration. The repo knows these methods exist, but the main parity path still narrows rivers to terrain-only equality. |
| Current parity closure posture for rivers/floodplains | Diagnostics / proof policy | [source] `mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts`; [source] `studio-live-civ7-map-sync/workstream/parity-corpus-ledger.md`; [source] `earthlike-visible-river-acceptance/*` | The repo already admits the narrowing: navigable rivers are currently treated as terrain parity, and exact river metadata parity is outside the hard equality gate. Floodplains are treated as feature-grid parity. | This is the strongest anti-overclaim evidence in the repo. Any stronger claim than terrain/feature parity is not currently backed by the canonical parity gate. |

## Bottom-line classification

- **Lakes:** split across Hydrology truth, MapGen stamping, and Civ
  classification/cache refresh. Current evidence is strong for projection and
  readback.
- **Navigable rivers:** current recipe directly stamps navigable-river terrain;
  it does **not** currently delegate that terrain selection to Civ's river
  generator. Civ still owns validation, naming, and some hidden classification
  side effects.
- **Minor rivers:** current recipe has strong local semantics but no clear
  proven Civ-facing materialization path.
- **Floodplains:** split across Ecology feature planning plus official Civ
  terrain/feature validity; navigable-vs-minor floodplain distinction exists,
  but minor floodplain proof currently leans on local proxy logic.
- **Visibility/rendering:** still partly outside current closure proof because
  river metadata/render parity is explicitly not inside the hard equality gate.

# 4. Current gaps or contradictions

1. **Official Civ distinguishes minor and navigable rivers, but current recipe
   only has a proven direct stamping path for navigable-river terrain.**
   That is the single biggest gap.
2. **Repo intent docs say MapGen owns navigable-river projection, but parity
   docs simultaneously admit that exact river metadata parity is not proven.**
   Those claims are compatible only if ownership is narrowed to terrain
   materialization, not full Civ river semantics.
3. **Current direct-control wrapper under-exposes the hydrology proof surface**
   relative to known available runtime methods. This makes classification harder
   than it needs to be.
4. **Floodplain minor/navigable split is locally modeled, but minor floodplain
   correctness is not yet anchored to live minor-river metadata.**
5. **Vanilla Civ map scripts use `modelRivers(...)`, while current recipe
   forbids it.**
   That is not inherently wrong, but it means we should not casually inherit
   vanilla assumptions about names, connectivity, `RiverType`, or gameplay
   affordances without targeted proof.
6. **The active parity system already treats rivers as terrain-only closure.**
   Any broader "rivers are done" statement would outrun the current proof rail.

# 5. Product/architecture implications for this repo

- Product language should stop saying "rivers are proven" unless the claim is
  explicitly scoped to **navigable-river terrain materialization**.
- If product acceptance requires **minor-river** gameplay/visual semantics, the
  repo needs either:
  - a real materialization path into Civ edge-river metadata, or
  - an explicit product decision that minor-river semantics are intentionally
    local-only / approximated / deferred.
- If product acceptance requires **navigable-river gameplay affordances**
  beyond terrain tile counts, the proof rail must include runtime metadata such
  as `getRiverType`, `isNavigableRiver`, `getRiverName`, and where relevant
  ocean-connectivity behaviors.
- Floodplain ownership should remain in Ecology feature planning, but the repo
  should be careful not to imply that current minor-floodplain planning is
  mechanically proven against live minor-river runtime state.
- `@civ7/direct-control` is the correct authority boundary for closing this
  gap, but its current standard hydrology projection is too narrow for final
  river proof.

# 6. Concrete next checks if uncertainty remains

1. Extend the direct-control hydrology read surface or a bounded proof helper to
   emit, at minimum, `riverType`, `isRiver`, `isNavigableRiver`, `isLake`,
   `water`, and `getRiverName` for witness rows.
2. Capture same-run witness rows on:
   - a stamped navigable-river tile,
   - a local `riverClass=1` minor-river candidate,
   - a navigable floodplain feature,
   - a minor floodplain feature,
   - a lake tile,
   - negative controls.
3. For navigable-river witness rows, compare:
   - local `projectedNavigableRivers.riverMask`,
   - engine terrain readback,
   - live `riverType`,
   - live `isNavigableRiver`,
   - live `water`,
   - live rendered/tooltip evidence if needed.
4. For minor-river witness rows, determine whether any live row actually reads
   as `RIVER_MINOR` under the current recipe. If none do, the repo should stop
   implying that minor rivers are currently materialized in Civ.
5. For floodplain witness rows, confirm whether minor floodplain features
   correlate with live minor-river metadata or only with local proxy logic.
6. Update parity/acceptance wording so river closure is split into:
   - navigable-river terrain parity,
   - river metadata parity,
   - floodplain parity,
   - rendered visibility parity.

Skills used: framing-design, investigation-design
