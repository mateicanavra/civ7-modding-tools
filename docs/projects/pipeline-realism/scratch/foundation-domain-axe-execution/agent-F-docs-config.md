# Agent F — Config + Docs + Schema Sync

## Ownership
- M4-006 config redesign, preset retuning, docs/comments/schema parity plan.

## Plan
1. Define physics-first config taxonomy with grouped author-facing knobs.
2. Enumerate preset-specific retuning/intent-fit checks.
3. Draft docs update matrix (including js comments + schema descriptions).

## Working Notes
- pending

## Proposed target
- Complete config+docs parity plan with map-intent verification, including earth-like.

## Changes landed
- Scratchpad initialized.

## Open risks
- Preset retune scope may spill into algorithm behavior if not tightly bounded.

## Decision asks
- none

## Working Notes — 2026-02-14 Update (Decision-complete)

### M4-006 locked decisions

#### F-D-001 — Keep a hard split between author physics inputs and internal math parameters
- Author-visible config remains physics-first and intent-first.
- Internal solver/normalization constants stay non-authored and cannot gain preset-facing mirrors.
- No shim aliases for removed/inert fields (`lithosphereProfile`, `mantleProfile`, `potentialMode`) or sentinel compile paths.

#### F-D-002 — Use one grouped author knob model across the 3 Foundation stages
- Keep author ergonomics grouped by intent, but compile into stage-specific surfaces (`foundation-substrate-kinematics`, `foundation-tectonics-history`, `foundation-projection`).
- Keep stage-level ownership explicit; do not reintroduce a single legacy `foundation` shim key in final state.

#### F-D-003 — Retuning is canonical-by-intent, not file-by-file drift
- Canonical realism intent profiles: `earthlike` baseline, `young-tectonics` high-activity variant, `old-erosion` low-activity variant.
- All shipped config entry points must converge to the same intent values (map config JSON, realism TS presets, Studio preset wrapper).

#### F-D-004 — Earth-like validation is a required gate, not narrative-only text
- Earth-like acceptance must include explicit measurable checks (water/land balance, component structure, coast/mountain/ecology sanity).
- Gate belongs to M4 G4 and must run before final docs/schema parity closeout.

#### F-D-005 — Docs/comments/schema parity is blocking for S09
- Config taxonomy, author knob wording, schema descriptions, and preset examples must all reflect final post-split/post-cleanup contracts.
- Any stale reference to removed fields or dual-path compile behavior is treated as a failing parity item.

### Physics-input vs math-parameter config taxonomy

| Class | Surface | Status in M4-006 |
|---|---|---|
| Physics input (author-facing) | Stage profiles/knobs/advanced inputs that express initial conditions and simulation horizon (`resolutionProfile`, `plateCount`, `plateActivity`, `advanced.mantleForcing.*`, `advanced.lithosphere.*`, `advanced.mesh.*`, `advanced.budgets.eraCount`, `advanced.tectonics.history.driftStepsByEra`) | Keep and retune by map intent |
| Math parameter (internal) | Derived constants and fixed algorithm parameters (`referenceArea`, `plateScalePower`, `smoothingIterations`, `velocityScale`, `rotationScale`, `stressNorm`, derived `eraWeights`) | Keep internal-only; no direct preset writes |
| Dead/inert surface | Unused profile fields + sentinel compile branches + dead op knobs | Remove fully, no compatibility aliases |

```yaml
m4_006_taxonomy_evidence:
  author_physics_input_surfaces:
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:23
      reason: resolution profile on stage public schema
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:236
      reason: plateCount/plateActivity knob schema
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:63
      reason: mantle forcing advanced physics inputs
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:107
      reason: lithosphere advanced physics inputs
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:149
      reason: budgets.eraCount author horizon control
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:206
      reason: tectonics history driftStepsByEra author control
  internal_math_parameters:
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:389
      reason: common mantle potential constants
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:396
      reason: common mantle forcing constants
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:405
      reason: common plate-motion constants
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:426
      reason: profile defaults include referenceArea/plateScalePower and projection scales
    - path: mods/mod-swooper-maps/src/domain/foundation/ops/compute-mesh/contract.ts:54
      reason: referenceArea/plateScalePower are solver scaling inputs
    - path: mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/contract.ts:90
      reason: projection movement/rotation scaling params are math controls
  hard_delete_surfaces:
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:41
      reason: inert lithosphereProfile
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:42
      reason: inert mantleProfile
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:59
      reason: inert mantle potentialMode
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:552
      reason: sentinel dual-path compile comment/branch
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:579
      reason: profile sentinel branch
```

### Grouped high-level author knob model (post-split target)

| Group | Author question | Target stage envelope | Fields |
|---|---|---|---|
| Planet scaffold | "How coarse/fine and how many plates?" | `foundation-substrate-kinematics` | `resolutionProfile`, `plateCount`, `advanced.mesh.cellsPerPlate`, `advanced.mesh.relaxationSteps` |
| Mantle energy pattern | "How strong/coherent are mantle drivers?" | `foundation-substrate-kinematics` | `advanced.mantleForcing.potentialAmplitude01`, `plumeCount`, `downwellingCount`, `lengthScale01` |
| Lithosphere response | "How resistant or rift-prone is crust?" | `foundation-substrate-kinematics` | `advanced.lithosphere.yieldStrength01`, `mantleCoupling01`, `riftWeakening01` |
| Tectonic time horizon | "How deep is history simulation?" | `foundation-tectonics-history` | `advanced.budgets.eraCount`, `advanced.tectonics.history.driftStepsByEra` |
| Projection expression | "How active should projected boundary/motion read?" | `foundation-projection` | `plateActivity` |
| Downstream terrain/climate expression | "How should this feel at map level?" | morphology/hydrology/map stages | existing stage knobs (`seaLevel`, `coastRuggedness`, `erosion`, `volcanism`, `dryness`, `riverDensity`, `orogeny`) |

```yaml
grouped_knob_model_constraints:
  - no_group_may_expose_derived_velocity_or_belt_masks
  - no_group_may_duplicate_internal_solver_constants_as_public_fields
  - group_names_are_docs_only; runtime_contracts_remain_stage-scoped
  - final_state_uses_three_foundation_stage_ids_without_legacy_foundation_alias
```

### Preset/default retuning matrix (with explicit earth-like checks)

| Surface | Current drift snapshot | Retune decision | Intent-fit verification |
|---|---|---|---|
| Foundation schema defaults (`balanced` baseline) | Resolution defaults and derived constants are present but mixed with inert profile fields in public examples | Keep balanced baseline; remove inert profile fields from all preset/config writers and docs examples | `test/config/presets-schema-valid.test.ts`, `test/config/maps-schema-valid.test.ts` |
| `realism/earthlike` TS preset | Diverges from shipped earthlike map config (`seaLevel: water-heavy` vs `earthlike`; hydrology `dry/normal` vs `mix/dense`) | Rebase earthlike TS preset to canonical earthlike intent values shared with map config + Studio wrapper | Earth-like checks block merge (see `earthlike_intent_checks` block) |
| `src/maps/configs/swooper-earthlike.config.json` | Canonical map run config includes additional advanced values (`eraCount`, drift steps) and hydrology knobs | Keep as canonical earthlike run baseline; ensure TS preset + Studio wrapper converge on same semantic knobs | Diagnostics + smoke tests for map intent |
| `src/presets/standard/earthlike.json` (Studio wrapper) | Drift vs TS preset (dryness/river density/temperature) | Normalize to canonical earthlike baseline (same semantic knob values as map config) | `test/config/studio-presets-schema-valid.test.ts` + earthlike smoke tests |
| `realism/young-tectonics` | Foundation high activity set, but no explicit hydrology/map knobs | Keep high-activity morphology signature; add explicit inherited hydrology/map knobs where needed to avoid implicit drift | Compare against earthlike via deterministic compile diff + targeted morphology/hydrology tests |
| `realism/old-erosion` | Low activity + high erosion profile, hydrology unspecified | Keep low-activity/older-surface intent; add explicit inherited hydrology/map knobs where needed | Deterministic compile diff + erosion/coast regression checks |

```yaml
earthlike_intent_checks:
  config_source_of_truth:
    - mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json
  measurable_checks:
    - id: ELIKE-01-water_balance
      metric: latest_landmask_pct_land
      target_band: "0.26..0.40"
      rationale: ocean-dominant but not waterworld
    - id: ELIKE-02-landmass_structure
      metric: land_components_and_largest_fraction
      target:
        land_components: "2..8"
        largest_land_frac: "0.35..0.85"
      rationale: few large continents + secondary masses
    - id: ELIKE-03-morphology_presence
      metric: mountains_and_coasts_nondegenerate
      target: non_zero_mountains_and_non_degenerate_coast_masks
      rationale: avoid flat/no-coast failure modes
    - id: ELIKE-04-ecology_variety
      metric: biome_variety_and_vegetation_nonzero
      target: existing_earthlike_smoke_expectations_pass
      rationale: intent-fit for playable earthlike baseline
```

### Docs/comments/schema update inventory

```yaml
m4_006_docs_comments_schema_inventory:
  config_contract_docs:
    - path: docs/projects/pipeline-realism/resources/spec/sections/authoring-and-config.md
      update: align field lists and stage ids to final 3-stage topology + inert-field removals
    - path: docs/system/libs/mapgen/reference/STANDARD-RECIPE.md
      update: replace single-foundation-stage wording with 3-stage topology and updated config posture
    - path: docs/system/libs/mapgen/how-to/tune-realism-knobs.md
      update: remove stale "advanced per-step baseline" wording for Foundation; map to grouped knob model
    - path: docs/system/libs/mapgen/tutorials/tune-a-preset-and-knobs.md
      update: update earthlike example fields/values and post-split stage roots
    - path: docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-006-config-redesign-preset-retuning-docs-cleanup.md
      update: lock acceptance checks to explicit retune matrix + earthlike checks
  schema_and_comment_surfaces:
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
      update: schema descriptions + gs.comments must match final exposed fields only
    - path: mods/mod-swooper-maps/src/maps/__type_tests__/createMap-config.inference.ts
      update: remove inert field assertions and update stage-key expectations for split topology
    - path: mods/mod-swooper-maps/test/m11-config-knobs-and-presets.test.ts
      update: remove inert profile fields from fixture configs and assertions
    - path: mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts
      update: keep mapping logic consistent with post-sentinel compile posture
  preset_and_config_assets:
    - path: mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts
    - path: mods/mod-swooper-maps/src/maps/presets/realism/young-tectonics.config.ts
    - path: mods/mod-swooper-maps/src/maps/presets/realism/old-erosion.config.ts
    - path: mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json
    - path: mods/mod-swooper-maps/src/presets/standard/earthlike.json
```

### Verification commands (M4-006 planning matrix)

```yaml
verification_commands:
  dead_surface_scan:
    - rg -n "lithosphereProfile|mantleProfile|potentialMode|__studioUiMetaSentinelPath|advanced\\.<stepId>" mods/mod-swooper-maps/src docs/system/libs/mapgen docs/projects/pipeline-realism/resources/spec
  schema_and_config_tests:
    - bun run --cwd mods/mod-swooper-maps test test/config/presets-schema-valid.test.ts
    - bun run --cwd mods/mod-swooper-maps test test/config/maps-schema-valid.test.ts
    - bun run --cwd mods/mod-swooper-maps test test/config/studio-presets-schema-valid.test.ts
    - bun run --cwd mods/mod-swooper-maps test test/m11-config-knobs-and-presets.test.ts
  earthlike_intent_tests:
    - bun run --cwd mods/mod-swooper-maps test test/morphology/earthlike-coasts-smoke.test.ts
    - bun run --cwd mods/mod-swooper-maps test test/ecology/earthlike-balance-smoke.test.ts
    - bun run --cwd mods/mod-swooper-maps test test/pipeline/mountains-nonzero-probe.test.ts
  diagnostics_probe:
    - bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label m4-006-earthlike --configFile ./src/maps/configs/swooper-earthlike.config.json
    - bun run --cwd mods/mod-swooper-maps diag:analyze -- <runDir>
    - bun run --cwd mods/mod-swooper-maps diag:list -- <runDir> --prefix foundation.
    - bun run --cwd mods/mod-swooper-maps diag:trace -- <runDir> --eventPrefix morphology.
  docs_parity:
    - bun run lint:mapgen-docs
    - rg -n "lithosphereProfile|mantleProfile|potentialMode|single-stage foundation" docs/system/libs/mapgen docs/projects/pipeline-realism
  full_gate:
    - bun run test:ci
```

## Proposed target
- M4-006 closes with a hard, explicit config contract:
  - author-facing surfaces are physics-input only,
  - internal math parameters remain non-authored,
  - preset/defaults are retuned and converged by intent (earthlike explicitly verified),
  - docs/comments/schema/test assets are parity-synced to the post-split no-shim state.

## Changes landed
- Added decision-complete M4-006 planning notes covering:
  - physics-input vs math-parameter taxonomy,
  - grouped author knob model tied to 3-stage Foundation topology,
  - preset/default retuning matrix with explicit earth-like intent-fit checks,
  - docs/comments/schema update inventory,
  - executable verification command matrix.
- Added YAML evidence/path blocks for all required planning surfaces.

## Open risks
- Earthlike intent currently drifts across TS preset vs map JSON vs Studio wrapper; convergence can affect downstream smoke baselines.
- Stage-split migration (M4-003) and docs/schema parity (M4-006) are tightly coupled; landing out of order can create temporary invalid examples/tests.
- Sentinel-oriented Studio typegen assumptions must stay aligned with final compile posture to avoid editor/type artifacts drifting from runtime contracts.

## Decision asks
- none
