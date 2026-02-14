# Agent B — Stage Topology + Compile Surface

## Ownership
- M4-003 stage split model and compile surface cleanup planning.

## Plan
1. Translate 3-stage model into explicit step relocation map.
2. Enumerate compile/schema/step-id break impacts.
3. Draft acceptance + migration checks for topology integrity.

## Working Notes
- pending

## Proposed target
- Fully specified stage split cutover plan with compile contract checks.

## Changes landed
- Scratchpad initialized.

## Open risks
- Hidden step-id consumers in diagnostics/docs may be missed.

## Decision asks
- none

### 2026-02-14 — M4-003 decision-complete planning addendum

#### Locked decisions (M4-003)
1. Foundation stage topology cutover is a hard 3-stage split, with no compat aliases:
   - `foundation-substrate-kinematics`
   - `foundation-tectonics-history`
   - `foundation-projection`
2. All Foundation steps are retained as semantic units; only stage envelope membership changes.
3. Compile/public surface uses one canonical lowering path only (remove sentinel branches).
4. Inert public/advanced/op config fields are removed in this cutover (no deferred dead-surface carry).
5. Stage-id/step-id break is intentional and treated as a required migration surface.

#### Explicit step relocation map (locked 3-stage model, hard cut)

| Step id | Current full step id | Target stage id | Target full step id |
|---|---|---|---|
| `mesh` | `mod-swooper-maps.standard.foundation.mesh` | `foundation-substrate-kinematics` | `mod-swooper-maps.standard.foundation-substrate-kinematics.mesh` |
| `mantle-potential` | `mod-swooper-maps.standard.foundation.mantle-potential` | `foundation-substrate-kinematics` | `mod-swooper-maps.standard.foundation-substrate-kinematics.mantle-potential` |
| `mantle-forcing` | `mod-swooper-maps.standard.foundation.mantle-forcing` | `foundation-substrate-kinematics` | `mod-swooper-maps.standard.foundation-substrate-kinematics.mantle-forcing` |
| `crust` | `mod-swooper-maps.standard.foundation.crust` | `foundation-substrate-kinematics` | `mod-swooper-maps.standard.foundation-substrate-kinematics.crust` |
| `plate-graph` | `mod-swooper-maps.standard.foundation.plate-graph` | `foundation-substrate-kinematics` | `mod-swooper-maps.standard.foundation-substrate-kinematics.plate-graph` |
| `plate-motion` | `mod-swooper-maps.standard.foundation.plate-motion` | `foundation-substrate-kinematics` | `mod-swooper-maps.standard.foundation-substrate-kinematics.plate-motion` |
| `tectonics` | `mod-swooper-maps.standard.foundation.tectonics` | `foundation-tectonics-history` | `mod-swooper-maps.standard.foundation-tectonics-history.tectonics` |
| `crust-evolution` | `mod-swooper-maps.standard.foundation.crust-evolution` | `foundation-tectonics-history` | `mod-swooper-maps.standard.foundation-tectonics-history.crust-evolution` |
| `projection` | `mod-swooper-maps.standard.foundation.projection` | `foundation-projection` | `mod-swooper-maps.standard.foundation-projection.projection` |
| `plate-topology` | `mod-swooper-maps.standard.foundation.plate-topology` | `foundation-projection` | `mod-swooper-maps.standard.foundation-projection.plate-topology` |

```yaml
m4_003_stage_topology_evidence:
  full_step_id_construction:
    formula: "<namespace>.<recipeId>.<stageId>.<stepId>"
    evidence_paths:
      - packages/mapgen-core/src/authoring/recipe.ts:58
      - packages/mapgen-core/src/authoring/recipe.ts:65
  current_foundation_stage:
    stage_id: foundation
    steps_declared:
      - mesh
      - mantle-potential
      - mantle-forcing
      - crust
      - plate-graph
      - plate-motion
      - tectonics
      - crust-evolution
      - projection
      - plate-topology
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:539
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:557
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:771
  recipe_order_anchor:
    current_foundation_position: first
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/recipe.ts:29
      - mods/mod-swooper-maps/src/recipes/standard/recipe.ts:30

m4_003_stage_module_path_map:
  current_stage_module:
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
  target_stage_modules_to_create:
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation-substrate-kinematics/index.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics-history/index.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation-projection/index.ts
  recipe_wiring_to_update:
    - mods/mod-swooper-maps/src/recipes/standard/recipe.ts
```

#### Compile/public surface cleanup list (sentinel removal + inert fields)

`CLEANUP-1` Remove sentinel compile branches in Foundation stage compile:
- Remove per-step sentinel branch (`advanced.<stepId>` dispatch path).
- Remove profile sentinel branch (`profiles.__studioUiMetaSentinelPath` dispatch path).
- Remove sentinel helper constant derived from hyphenated step ids.

`CLEANUP-2` Remove inert stage public/advanced fields:
- `profiles.lithosphereProfile`
- `profiles.mantleProfile`
- `advanced.mantleForcing.potentialMode`

`CLEANUP-3` Remove inert Foundation op strategy fields:
- `compute-crust-evolution`: `upliftToMaturity`, `ageToMaturity`, `disruptionToMaturity`
- `compute-plate-graph.polarCaps`: `tangentialSpeed`, `tangentialJitterDeg`

```yaml
m4_003_compile_surface_cleanup:
  sentinel_removal:
    remove:
      - advanced_step_sentinel_branch
      - profiles_sentinel_branch
      - FOUNDATION_STUDIO_STEP_CONFIG_IDS
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:552
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:570
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:579
  inert_stage_fields:
    remove_fields:
      - profiles.lithosphereProfile
      - profiles.mantleProfile
      - advanced.mantleForcing.potentialMode
    schema_evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:40
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:41
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:42
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:59
    compile_usage_evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:585
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:601
  inert_op_fields:
    remove_fields:
      - foundation/compute-crust-evolution.strategies.default.upliftToMaturity
      - foundation/compute-crust-evolution.strategies.default.ageToMaturity
      - foundation/compute-crust-evolution.strategies.default.disruptionToMaturity
      - foundation/compute-plate-graph.strategies.default.polarCaps.tangentialSpeed
      - foundation/compute-plate-graph.strategies.default.polarCaps.tangentialJitterDeg
    evidence_paths:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:15
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:63
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:59
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts:341

m4_003_cleanup_consumer_path_map:
  config_stage_key_and_profiles:
    - mods/mod-swooper-maps/src/maps/configs/shattered-ring.config.ts:4
    - mods/mod-swooper-maps/src/maps/configs/sundered-archipelago.config.ts:4
    - mods/mod-swooper-maps/src/maps/configs/swooper-desert-mountains.config.ts:4
    - mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts:11
    - mods/mod-swooper-maps/src/maps/presets/realism/young-tectonics.config.ts:7
    - mods/mod-swooper-maps/src/maps/presets/realism/old-erosion.config.ts:7
    - mods/mod-swooper-maps/src/maps/__type_tests__/createMap-config.inference.ts:80
    - mods/mod-swooper-maps/src/dev/viz/foundation-run.ts:10
    - mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json:3
    - mods/mod-swooper-maps/src/presets/standard/earthlike.json:8
  docs_contract_surface:
    - docs/projects/pipeline-realism/resources/spec/sections/authoring-and-config.md:72
    - docs/projects/pipeline-realism/resources/spec/sections/authoring-and-config.md:93
    - docs/projects/pipeline-realism/resources/spec/sections/authoring-and-config.md:155
```

#### Step-id/stage-id break impact inventory

`BREAK-1` Stage-keyed compile config contract break:
- Stage config is keyed by `stage.id`; split replaces one `foundation` key with three keys.
- Missing-key and unknown-step errors will fail compile immediately on partial migration.

`BREAK-2` Full step-id break across runtime/tracing/viz:
- Full step id includes stage id; all Foundation full ids change even when step id token is unchanged.
- Any consumer using step-id-based filtering, manifest indexing, or layer keys must be updated.

`BREAK-3` Config/type-test/dev-script break:
- Typed map configs and dev runners with `foundation:` root must migrate to three stage roots.
- Type tests encoding profile fields must be rewritten to new surface after inert-field cleanup.

`BREAK-4` Docs/evidence break:
- Docs that use example full ids like `mod-swooper-maps.standard.foundation.mesh` become stale.

```yaml
m4_003_break_impact_inventory:
  compile_contract:
    why_breaks:
      - stage config lookup is keyed by stage id
      - stage step config presence is asserted by stage.id + step.id
    evidence_paths:
      - packages/mapgen-core/src/compiler/recipe-compile.ts:81
      - packages/mapgen-core/src/compiler/recipe-compile.ts:83
      - packages/mapgen-core/src/authoring/recipe.ts:338
      - packages/mapgen-core/src/authoring/recipe.ts:345
  full_step_id_consumers:
    why_breaks:
      - step id format embeds stage id token
      - viz layer key and manifests are keyed by stepId
    evidence_paths:
      - packages/mapgen-core/src/authoring/recipe.ts:65
      - packages/mapgen-viz/src/index.ts:205
      - packages/mapgen-viz/src/index.ts:213
      - mods/mod-swooper-maps/src/dev/viz/dump.ts:101
      - mods/mod-swooper-maps/src/dev/viz/dump.ts:117
      - mods/mod-swooper-maps/src/dev/viz/foundation-run.ts:47
  stage_config_consumers:
    direct_path_map:
      - mods/mod-swooper-maps/src/maps/configs/shattered-ring.config.ts:4
      - mods/mod-swooper-maps/src/maps/configs/sundered-archipelago.config.ts:4
      - mods/mod-swooper-maps/src/maps/configs/swooper-desert-mountains.config.ts:4
      - mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts:11
      - mods/mod-swooper-maps/src/maps/presets/realism/young-tectonics.config.ts:7
      - mods/mod-swooper-maps/src/maps/presets/realism/old-erosion.config.ts:7
      - mods/mod-swooper-maps/src/maps/__type_tests__/createMap-config.inference.ts:80
      - mods/mod-swooper-maps/src/dev/viz/foundation-run.ts:10
  docs_examples_using_old_full_ids:
    path_map:
      - docs/projects/mapgen-studio/issues/LOCAL-TBD-ui-refactor-prototype-integration.md:19
      - docs/projects/mapgen-studio/issues/LOCAL-TBD-ui-refactor-prototype-integration.md:235
```

#### Verification commands/tests for topology integrity (planning matrix)

Run these as the M4-003 acceptance sequence after implementation:

1. `bun run build`
2. `bun run lint`
3. `bun run test:ci`
4. `bun run lint:adapter-boundary`
5. `REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails`
6. `bun test mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts`
7. `bun test mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts`
8. `bun test mods/mod-swooper-maps/test/foundation/contract-guard.test.ts`
9. `bun test mods/mod-swooper-maps/test/pipeline/foundation-gates.test.ts`

Planned topology-specific tests to add in M4-003 stack:
- `mods/mod-swooper-maps/test/pipeline/foundation-topology.contract-guard.test.ts`
- `mods/mod-swooper-maps/test/pipeline/no-dual-contract-paths.test.ts`
- `mods/mod-swooper-maps/test/pipeline/foundation-legacy-absence.test.ts`

```yaml
m4_003_topology_verification:
  required_commands:
    - bun run build
    - bun run lint
    - bun run test:ci
    - bun run lint:adapter-boundary
    - REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
  existing_tests_to_run:
    - bun test mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts
    - bun test mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts
    - bun test mods/mod-swooper-maps/test/foundation/contract-guard.test.ts
    - bun test mods/mod-swooper-maps/test/pipeline/foundation-gates.test.ts
  topology_tests_to_add:
    - mods/mod-swooper-maps/test/pipeline/foundation-topology.contract-guard.test.ts
    - mods/mod-swooper-maps/test/pipeline/no-dual-contract-paths.test.ts
    - mods/mod-swooper-maps/test/pipeline/foundation-legacy-absence.test.ts
  evidence_paths:
    - package.json:8
    - package.json:17
    - package.json:19
    - package.json:38
    - package.json:39
    - mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts:30
    - mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts:23
    - mods/mod-swooper-maps/test/foundation/contract-guard.test.ts:31
    - mods/mod-swooper-maps/test/pipeline/foundation-gates.test.ts:22
```

## Proposed target
- M4-003 is executed as a hard topology/config cutover with zero shims: three locked Foundation stages, one compile path, and dead-surface removal in the same migration envelope.
- All stage-id and full-step-id breaks are explicit, inventoried, and covered by command/test gates above.

## Changes landed
- Added decision-complete M4-003 planning notes with:
  - explicit step relocation table,
  - compile/public cleanup list,
  - break impact inventory,
  - verification command/test matrix.
- Added YAML evidence blocks and path maps for topology, cleanup, break surfaces, and verification.
- Closed this axis with no open decision asks.

## Open risks
- Hidden downstream consumers of Foundation full step ids may exist in external tooling or cached trace artifacts outside repo.
- Removing inert fields may require synchronized updates to docs/examples beyond currently indexed path maps.
- Stage split + surface cleanup in one cut increases blast radius if command matrix is not run as a full gate.

## Decision asks
- none
