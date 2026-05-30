# Earthlike Balance Investigation

Date: 2026-05-30

## Current User-Observed Failures

- Swooper Earthlike remains materially unbalanced in-game.
- Forest is absent or nearly absent in visible rolls.
- Taiga is barely visible.
- Reefs are low and atolls may be absent in visible rolls.
- Mountains are near-zero and not product-visible.
- Continents appear as broad central elevation bulges that slope down to coasts,
  without mountain punctuation or varied relief.
- Large areas read as flat dry land with little vegetation.
- Plains/soil/pedology outcomes may be wrong after hydrology changes.
- Potential root causes include pedology, aridity/dryness, wind, water
  currents, humidity, biome classification, feature scoring, terrain scoring,
  or config drift.
- Potential morphology root causes include thresholding, relief sharpness,
  erosion smoothing, base topography, shore-distance blending, or foundational
  plate/topography signal shape.

## Operating Rules

- Runtime proof that FireTuner can restart the map is only pipeline proof, not
  balance proof.
- Every behavior/config/code change gets an OpenSpec change before
  implementation.
- Do not implement tuning before the relevant OpenSpec proposal/spec/tasks
  exist.
- Use Graphite branches and isolated worktrees for independent implementation
  changes when write sets do not overlap.
- Assign one intelligent agent per independent change only after the changes
  are specified and write sets are disjoint.
- Keep bridge/log evidence mechanical; no narrative diary entries in the
  FireTuner append-only log.
- Do not use brittle one-off tests as balance proof. Compiler/config behavior
  belongs in compiler, SDK, schema, or adapter contract gates; Earthlike product
  balance belongs in multi-seed world/runtime telemetry.

## Active Team Lanes

- Measures: identify missing product-visible metrics and thresholds.
- Config authority: ensure Swooper Earthlike map config and standard Earthlike
  preset are complete, consistent, and use intended strategies.
- Vegetation: investigate forest, taiga, savanna, sagebrush, and rainforest
  scoring/admission failures.
- Reefs/atolls: investigate reef-family scoring, shelf/coast eligibility, and
  atoll absence.
- Terrain/mountains: investigate near-zero mountain coverage and weak ridge
  scoring.
- Runtime validation: define repeated FireTuner roll evidence and telemetry for
  balance closure.

## Findings So Far

- `codex-010` proves raw FireTuner restart and full 50/50 Swooper recipe
  execution, but it does not prove balance.
- Swooper Earthlike map config and standard Earthlike preset diverged by
  authoring internal projection config:
  `foundation.projection.computePlates.config.boundaryInfluenceDistance` was
  `5` in the shipped map config and `7` in the standard preset. That projection
  envelope does not belong in public Earthlike posture; compilation should own
  it from public knobs/stage schemas.
- Current world-balance gates check vegetation family presence and broad shares,
  but they do not require product-visible mountain coverage, hill coverage,
  plains/pedology distribution, climate humidity bands, or per-family density
  floors.
- A 10-seed local sample on 106x66 Swooper Earthlike produced only about
  `0.07%` to `0.32%` mountain coverage of land. That explains the visible
  near-zero mountain complaint and shows the current mountain probe is too weak.
- Direct config-only probes lowering mountain thresholds and widening boundary
  influence did not fix low-mountain seeds consistently, which points to a
  deeper driver/scoring or upstream tectonic/topography signal issue.
- Earthlike config authority must not make internal projection/op defaults
  explicit in public authored config. Public Earthlike posture should stay on
  public knobs/stage schemas; compiled defaults and projection readback should
  be verified as compiled output, not duplicated as map-source policy.
- `maps/presets/realism/earthlike.config.ts` is a stale lightweight Earthlike
  source used by tests. It is not equivalent to the shipped Swooper Earthlike
  JSON/preset path and can hide failures under an "earthlike" name.
- `foundation.plate-graph.computePlateGraph.config.plateCount` is authored as
  `8`, but `foundation.knobs.plateCount` is `28` and the plate graph step
  normalizes from the knob. The duplicate authored value is misleading.
- Current mock-adapter balance tests can overcount feature success because the
  mock accepts features broadly. Real engine feature validity depends on
  official `Feature_ValidTerrains` and `Feature_ValidBiomes`, e.g. forest and
  taiga require flat terrain and specific engine biome classes.
- Feature apply records `canHaveFeature=false` rejections but does not fail
  balance tests. In-game can therefore lose planned forests/taiga while local
  tests pass unless rejection diagnostics are asserted.
- Internal biome symbols collapse into coarse engine biomes. Feature scoring is
  internal-climate based, but engine validity is terrain/engine-biome based; a
  planned feature can score well and still be rejected after projection.
- Pedology currently receives land mask, elevation, rainfall, and humidity, but
  not the optional sediment depth, bedrock age, or slope fields declared by the
  op contract. The `coastal-shelf` strategy boosts sediment weight, but the
  sediment signal is zero when not provided.
- Pedology's relief fallback normalizes absolute elevation magnitude when slope
  is absent. That can make a smooth central elevation bulge behave like high
  relief, even when the player sees no mountain punctuation.
- Current local stats show `BIOME_PLAINS` is effectively absent in Swooper
  Earthlike samples: `0` to `24` plains tiles on roughly `2,500-2,700` land
  tiles. That matches the visual complaint that plains are missing.
- Local pedology stats show no high aridity by the current `aridityIndex > 0.65`
  threshold, but soil buckets are dominated by `sandy` plus `wet`, with modest
  fertility. This means the dry/flat visual failure may come from biome binding,
  terrain/feature rejection, or pedology semantics rather than the current
  aridity index alone.
- Reef-family planning is engine-invalid for key families: atolls currently use
  shelf/coast-projection habitat even though official resources allow atolls on
  ocean, while cold reefs can be planned on ocean even though official resources
  allow cold reefs on coast.
- Mountain root cause is likely upstream of the planner thresholds: Earthlike
  `boundaryShareTarget` is `0.005`, far below schema default and
  desert-mountains, so active tectonic belts often fail to overlap land enough
  for visible mountain belts.
- Volcanoes can hide the ridge weakness because final terrain receives mountain
  tiles from volcano stamping even when planned non-volcano mountain belts are
  nearly absent.

## OpenSpec Changes

- `earthlike-balance-diagnostic-gates`: add multi-dimensional balance metrics
  for terrain, pedology, climate/humidity, vegetation families, reefs/atolls,
  and runtime roll evidence before further tuning claims.
- `earthlike-config-authority`: align Swooper Earthlike map config, standard
  preset, Studio default config, and tests so the deployed map and authoring
  preset cannot drift.
- `earthlike-engine-feature-eligibility`: make feature planning/tests account
  for engine-valid terrain and biome eligibility before planned intents are
  counted as product-visible success.
- `earthlike-terrain-relief-balance`: repair active-margin land overlap,
  mountain/ridge scoring, and continental elevation-profile shape so
  Earthlike produces product-visible mountain belts and non-bulge continental
  relief across representative seeds.
- `earthlike-pedology-humidity-balance`: verify and repair soil, aridity,
  humidity, wind, current, and biome inputs after hydrology changes.
- `earthlike-ecology-feature-density`: repair vegetation and reef-family
  scoring/admission after upstream terrain/pedology/humidity and engine
  eligibility facts are stable.
