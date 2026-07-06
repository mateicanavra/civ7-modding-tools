# Domain Model Config Law Red Ledger

Status: historical red source plus current closure proof for repair execution

Execution status overlay: `execution-status-register.md` owns stable row IDs, lane ownership, row status, proof labels, and final disposition slots. This file owns the captured red evidence.

Captured from worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown`

Branch: `codex/foundation-lib-tectonics-s6-closure`

Captured at: 2026-07-05

Current refresh: 2026-07-05 repair execution closure pass.

The repair burn-down changed the current rule state. All rails that gate this
repair are enforced and green, including the domain source topology rule. This
file retains the original red corpus below as historical evidence, but no
current red class remains in this repair overlay.

## Rule Map

| Rule | Lane | Purpose | Current state |
| --- | --- | --- | --- |
| `require_recipe_stage_authoring_file_shape` | enforced | Standard recipe stage root authoring shape. Stage `index.ts` owns authoring; wrong root helper files go red. | green |
| `require_domain_operation_contract_file_shape` | enforced | Domain operation `contract.ts` owns the operation contract envelope. | green |
| `require_domain_model_schema_policy_owner_shape` | enforced | Domain `model/schemas` and `model/policy` own primitives/policy only; they may not become renamed config buckets. | green |
| `require_public_domain_surfaces_in_recipes_and_maps` | enforced | Recipes and map entrypoints must use public domain/package surfaces instead of deep domain internals. | green |
| `require_artifact_index_aggregate_shape` | enforced | Artifact indexes aggregate artifact objects and validators through the accepted artifact shape. | green |
| `require_domain_source_topology` | enforced | Domain source topology as the positive domain blueprint destination. | green; 0 diagnostics |
| `require_public_domain_surfaces_in_tests` | enforced | Test source should use public domain surfaces instead of deep domain internals. | green; 0 diagnostics |

Retired experiment:

| Rule | Outcome |
| --- | --- |
| `require_recipe_stage_root_topology` | Removed. It hardcoded active stage roots and duplicated source-derived recipe topology authority. Do not carry it forward as law. |

Renamed rules:

| Old | New |
| --- | --- |
| `require_operation_contract_file_shape` | `require_domain_operation_contract_file_shape` |
| `require_stage_authoring_owner_shape` | `require_recipe_stage_authoring_file_shape` |

## Habitat Commands

```bash
cat .grit/grit.yaml
find .grit -maxdepth 3 -type f -print
GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns list --source local
bun habitat check --rule require_recipe_stage_authoring_file_shape --json --output /tmp/habitat-red-experiment/stage-authoring.json
bun habitat check --rule require_domain_operation_contract_file_shape --json --output /tmp/habitat-red-experiment/op-contract.json
bun habitat check --rule require_domain_source_topology --json --output /tmp/habitat-red-experiment/domain-topology.json
node .habitat/blueprints/domain/require_public_domain_surfaces_in_tests/check.mjs
```

Native Grit fixture status:

- Native `grit patterns test --filter <rule>` is not the fixture source of truth in this checkout because `.grit/grit.yaml` currently registers `patterns: []`.
- Stage 0 must record that unavailability explicitly, then use Habitat current-tree checks plus disposable injected bad/clean probes for `require_recipe_stage_authoring_file_shape` and `require_domain_operation_contract_file_shape`.
- Green for `require_domain_source_topology` means the enforced rule reports
  zero diagnostics.

## Current Counts

| Rule | Diagnostics | Paths | Closure requirement |
| --- | ---: | ---: | --- |
| `require_recipe_stage_authoring_file_shape` | 0 | 0 | Closed for this repair; enforced green. |
| `require_domain_operation_contract_file_shape` | 0 | 0 | Closed for this repair; enforced green. |
| `require_domain_model_schema_policy_owner_shape` | 0 | 0 | Closed for this repair; enforced green. |
| `require_public_domain_surfaces_in_recipes_and_maps` | 0 | 0 | Closed for this repair; enforced green. |
| `require_artifact_index_aggregate_shape` | 0 | 0 | Closed for this repair; enforced green. |
| `require_domain_source_topology` | 0 | 0 | Closed for current repair; enforced green. |
| `require_public_domain_surfaces_in_tests` | 0 | 0 | Closed for static module imports; enforced green. Structural source-text inspections in tests are a separate Habitat-authority follow-up, not this rule's remaining red. |

## Current Remaining Red Classes

None in this repair overlay.

### Domain Source Topology

`bun habitat check --rule require_domain_source_topology --json` currently
reports 0 diagnostics. Earlier topology leftovers such as root
`contract.ts`/`types.ts`/`constants.ts`, domain `shared` buckets, resource
`lib`/`policy`, operation-family shared buckets, operation-root `signals.ts`,
`layers`, and `lib` were burned down or removed. Historical rows remain below as
the source corpus that drove the repair.

### Test Public-Surface Boundary

`require_public_domain_surfaces_in_tests` is now enforced green for static
module imports:

```bash
bun habitat check --rule require_public_domain_surfaces_in_tests --json
```

Current result: 0 diagnostics.

This closes the former 166-import advisory corpus. The remaining test-related
debt is a different class: tests such as
`mods/mod-swooper-maps/test/foundation/contract-guard.test.ts` still read source
files by path and assert structural source shape. That is not a module import
violation. It is tracked at the Habitat authority level as structural-test debt
because source-shape and topology law should live in Habitat rules/patterns, not
package behavior tests.

## Execution Coverage Register

This register is the handoff matrix for `repair-execution.md`. A row is not closed until its assigned proof is attached to the execution record.

### Stage 0 Rule Integrity Rows

| Row | Rule | Lines | Stage | Required correction | Positive owner/destination | Proof | Track-out |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `R00` | `require_recipe_stage_authoring_file_shape` | n/a | Stage 0 | Keep stage content checks as constructor-envelope assertions, including the positive assertion that stage authoring helper files do not live as ad hoc stage-root children. Do not claim the separate standard-stage topology rail proves that helper-file ban. | Habitat/Grit wrapper owns `index.ts` authoring envelope/import law and stage helper-file exclusion. `preserve_standard_stage_topology_and_path_invariants` owns only its source-derived standard stage topology checks. | Native fixture unavailability record, injected bad/clean probe, current-tree Habitat output, and explicit non-claim for standard-stage topology. | none |
| `R01` | `require_domain_operation_contract_file_shape` | n/a | Stage 0 | Keep operation checks as `defineOp({ input, output, strategies })` envelope assertions. | Habitat/Grit wrapper owns operation `contract.ts` envelope/import law. | Native fixture unavailability record, injected bad/clean probe, and current-tree Habitat output. | none |
| `R02` | `require_domain_source_topology` | n/a | Stage 0 | Keep enforced now that all current-scope topology red is closed. Historical path-level rows are prior red evidence, not follow-up inventory. | Habitat structure rule owns domain topology. | Current-tree Habitat enforced output is green with zero diagnostics. | none |

### Stage 1 Recipe Stage Authoring Rows

| Path | Lines | Required correction | Positive owner/destination | Proof | Track-out |
| --- | --- | --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-biomes/index.ts` | 3 | Remove stage import of operation-mirror helper authoring surface. | deletion/no public schema for mirror surface; exact non-mirror symbols only after Narsil proof. | stage rule green; Narsil reference proof; import-zero for removed helper. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-biomes/public-config.ts` | 1 | Delete operation-mirror public config helper. | deletion/no public schema for mirror surface; exact ecology primitive/policy/artifact owner only if a non-mirror symbol is proven. | Narsil reference proof, import-zero, and stage rule green. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features/index.ts` | 3 | Remove stage import of operation-mirror helper authoring surface. | deletion/no public schema for mirror surface; exact non-mirror symbols only after Narsil proof. | stage rule green; Narsil reference proof; import scan. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features/public-config.ts` | 1 | Delete operation-mirror public config helper. | deletion/no public schema for mirror surface; exact ecology primitive/policy/artifact owner only if a non-mirror symbol is proven. | Narsil reference proof, import-zero, and stage rule green. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-pedology/index.ts` | 3 | Remove stage import of operation-mirror helper authoring surface. | deletion/no public schema for mirror surface; exact non-mirror symbols only after Narsil proof. | stage rule green; Narsil reference proof; import scan. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-pedology/public-config.ts` | 1 | Delete operation-mirror public config helper. | deletion/no public schema for mirror surface; exact ecology primitive/policy/artifact owner only if a non-mirror symbol is proven. | Narsil reference proof, import-zero, and stage rule green. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts` | 1 | Remove stage-root artifact aggregation. | domain artifacts or stage step contract imports. | import-zero and stage/topology proof. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-lithosphere/index.ts` | 1,26,27 | Delete operation schema mirror usage; do not preserve it as stage public schema. | deletion/no public schema for mirror surface; true shared concepts only to foundation `model/schemas`, `model/policy`, or artifacts. | stage rule green; Narsil reference proof; old import scan. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-mantle/index.ts` | 1,27,29,30 | Delete operation schema mirror usage; do not preserve it as stage public schema. | deletion/no public schema for mirror surface; true shared concepts only to foundation `model/schemas`, `model/policy`, or artifacts. | stage rule green; Narsil reference proof; old import scan. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/index.ts` | 1,29,31,33,34,36 | Delete operation schema mirror usage; do not preserve it as stage public schema. | deletion/no public schema for mirror surface; true shared concepts only to foundation `model/schemas`, `model/policy`, or artifacts. | stage rule green; Narsil reference proof; old import scan. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` | 1 | Remove stage-root artifact aggregation. | foundation artifacts or stage step contract imports. | import-zero and stage/topology proof. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/artifacts.ts` | 1 | Remove stage-root artifact aggregation. | hydrology artifacts or step contract imports. | import-zero and stage/topology proof. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/index.ts` | 3,4 | Remove helper imports; delete operation-mirror public surface and keep only real knob UX. | stage `index.ts` only for real knobs; deletion/no public schema for mirror surface. | stage rule green; Narsil reference proof; import scan. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/knobs.ts` | 1 | Inline or decompose knob schema helper. | stage `index.ts`; reusable pieces to hydrology `model/schemas` or `model/policy`. | import-zero and stage rule green. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/public-config.ts` | 1 | Delete operation-mirror public config helper. | deletion/no public schema for mirror surface; exact hydrology primitive/policy owner only if a non-mirror symbol is proven. | Narsil reference proof, import-zero, and stage rule green. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/artifacts.ts` | 1 | Remove stage-root artifact aggregation. | hydrology artifacts or step contract imports. | import-zero and stage/topology proof. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/index.ts` | 3,4 | Remove helper imports; delete operation-mirror public surface and keep only real knob UX. | stage `index.ts` only for real knobs; deletion/no public schema for mirror surface. | stage rule green; Narsil reference proof; import scan. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/knobs.ts` | 1 | Inline or decompose knob schema helper. | stage `index.ts`; reusable pieces to hydrology `model/schemas` or `model/policy`. | import-zero and stage rule green. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/public-config.ts` | 1 | Delete operation-mirror public config helper. | deletion/no public schema for mirror surface; exact hydrology primitive/policy owner only if a non-mirror symbol is proven. | Narsil reference proof, import-zero, and stage rule green. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/artifacts.ts` | 1 | Remove stage-root artifact aggregation. | hydrology artifacts or step contract imports. | import-zero and stage/topology proof. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/index.ts` | 3,4 | Remove helper imports; delete operation-mirror public surface and keep only real knob UX. | stage `index.ts` only for real knobs; deletion/no public schema for mirror surface. | stage rule green; Narsil reference proof; import scan. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/knobs.ts` | 1 | Inline or decompose knob schema helper. | stage `index.ts`; reusable pieces to hydrology `model/schemas` or `model/policy`. | import-zero and stage rule green. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/public-config.ts` | 1 | Delete operation-mirror public config helper. | deletion/no public schema for mirror surface; exact hydrology primitive/policy owner only if a non-mirror symbol is proven. | Narsil reference proof, import-zero, and stage rule green. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/river-adjacency.ts` | 1 | Decompose helper. | hydrology model policy/schema, step contract, or deletion after proof. | import-zero and stage/topology proof. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/biome-bindings.ts` | 1 | Decompose Civ7 binding and step-input pieces; delete any operation/step mirror public schema. | `@civ7/types`, `@civ7/map-policy`, adapter, exact step contract/helper, or deletion/no public schema by symbol class. | Narsil owner/history proof; import-zero; package boundary check; stage rule green. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts` | 3 | Remove helper import. | stage `index.ts` plus valid domain/Civ7 owners. | stage rule green; import scan. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-elevation/artifacts.ts` | 1 | Remove stage-root artifact aggregation. | domain artifacts or step contract imports. | import-zero and stage/topology proof. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/artifacts.ts` | 1 | Remove stage-root artifact aggregation. | domain artifacts or step contract imports. | import-zero and stage/topology proof. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/artifacts.ts` | 1 | Remove stage-root artifact aggregation. | domain artifacts or step contract imports. | import-zero and stage/topology proof. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/artifacts.ts` | 1 | Remove stage-root artifact aggregation. | domain artifacts or step contract imports. | import-zero and stage/topology proof. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/index.ts` | 3,8 | Remove helper imports. | stage `index.ts` plus hydrology/model policy owners. | stage rule green; import scan. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/riverProjectionKnobs.ts` | 1 | Inline or decompose projection knobs. | stage `index.ts`; reusable policy to hydrology/map policy owner. | import-zero and stage rule green. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/riverProjectionPolicy.ts` | 1 | Move policy out of stage root. | hydrology `model/policy`, map policy package, step contract, or deletion. | import-zero and topology proof. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/index.ts` | 3 | Remove helper import; delete mirror material and keep only proven non-mirror mountain-range UX if Narsil/source proof supports it. | stage `index.ts` only for proven non-mirror stage UX; deletion/no public schema for mirror surface. | stage rule green; Narsil reference proof; import scan. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/mountain-ranges-public-config.ts` | 1 | Delete helper after symbol classification. | deletion/no public schema for mirror material; exact morphology policy/schema owner only for non-mirror symbols proven by Narsil. | Narsil reference proof, import-zero, and stage rule green. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts.ts` | 1 | Remove stage-root artifact aggregation. | morphology artifacts or step contract imports. | import-zero and stage/topology proof. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts.ts` | 1 | Remove stage-root artifact aggregation. | placement artifacts or step contract imports. | import-zero and stage/topology proof. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/placement/index.ts` | 3 | Remove helper import. | stage `index.ts` plus placement model owners. | stage rule green; import scan. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/placement/placement-inputs.ts` | 1 | Decompose helper. | placement `model/schemas`, step contract, or deletion after proof. | import-zero and stage/topology proof. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/placement/placement-outputs.ts` | 1 | Decompose helper. | placement `model/schemas`, step contract, or deletion after proof. | import-zero and stage/topology proof. | none |
| `mods/mod-swooper-maps/src/recipes/standard/stages/placement/public-config.ts` | 1 | Delete operation-mirror public config surface; extract only true reusable primitives if proven. | deletion/no public schema for mirror surface; true reusable placement primitives only to exact placement `model/schemas/<concept>.ts` or `model/policy/<concern>.ts`. | Narsil reference proof, import-zero, and stage rule green. | none |

### Stage 2 Operation Contract Rows

| Path | Lines | Required correction | Positive owner/destination | Proof | Track-out |
| --- | --- | --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/contract.ts` | 2,3,4,5 | Replace local rules schema imports. | inline operation contract schema, ecology `model/schemas`, ecology `model/policy`, or Civ7 authority by symbol class. | operation rule green; import-zero for old schema files if deleted. | none |
| `mods/mod-swooper-maps/src/domain/ecology/ops/plan-plot-effects/contract.ts` | 1 | Replace root domain type import. | ecology `model/schemas`, ecology `model/policy`, artifact owner, or Civ7 authority. | operation rule green; old import scan. | none |
| `mods/mod-swooper-maps/src/domain/morphology/ops/compute-belt-drivers/contract.ts` | 1 | Replace cross-domain operation contract import. | morphology/foundation primitive schema, artifact contract, or policy owner. | operation rule green; no sibling/cross-domain op contract imports. | none |
| `mods/mod-swooper-maps/src/domain/resources/ops/adjust-resource-support/contract.ts` | 3 | Replace sibling operation contract import. | resources primitive schema, artifact contract, or resource policy/data contract owner. | operation rule green; no sibling op contract imports. | none |
| `mods/mod-swooper-maps/src/domain/resources/ops/derive-habitat-fields/contract.ts` | 116 | Move habitat field-name carrier to an allowed owner. | `mods/mod-swooper-maps/src/domain/resources/model/schemas/habitat-fields.schema.ts`. | operation rule green; old duplicate carrier removed from contract. | none |

### Stage 3 Domain Source Topology Rows

| Path | Lines | Required correction | Positive owner/destination | Proof | Track-out |
| --- | --- | --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/ecology/contract.ts` | n/a | Retire root facade. | ecology `index.ts`, artifacts, model owners, or operation contracts. | topology green or row removed; import scan. | none |
| `mods/mod-swooper-maps/src/domain/ecology/feature-engine-legality.ts` | n/a | Delete wrong-owner Civ7 engine legality proxy. | deletion; official engine legality remains in `@civ7/map-policy`/map-stage application surfaces. | current topology output no longer reports this path; import-zero. | none |
| `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/layers` | n/a | Decompose operation helper bucket. | operation `rules`/`strategies` or ecology model owners. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/policies` | n/a | Normalize policy bucket. | operation `rules` or ecology `model/policy`. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/policies` | n/a | Normalize policy bucket. | operation `rules` or ecology `model/policy`. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-reefs/policies` | n/a | Normalize policy bucket. | operation `rules` or ecology `model/policy`. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/policies` | n/a | Normalize policy bucket. | operation `rules` or ecology `model/policy`. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-wetlands/policies` | n/a | Normalize policy bucket. | operation `rules` or ecology `model/policy`. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/ecology/ops/score-shared` | n/a | Decompose shared operation-family bucket. | ecology `model/schemas`, `model/policy`, operation `rules`, or real operation contract if semantically an op. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/ecology/shared` | n/a | Decompose shared domain bucket. | ecology `model/schemas`, `model/policy`, artifacts, or deletion. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/ecology/types.ts` | n/a | Decompose root type bucket. | ecology `model/schemas`, `model/policy`, artifacts, or Civ7 authority. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/foundation/constants.ts` | n/a | Move constants to policy/schema/artifact owner. | foundation `model/policy`, `model/schemas`, artifacts, or deletion. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/foundation/contract.ts` | n/a | Retire root facade. | foundation `index.ts`, artifacts, model owners, or operation contracts. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib` | n/a | Decompose operation lib. | operation `rules`/`strategies`, foundation `model/*`, or core extraction if already approved. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/foundation/shared` | n/a | Decompose shared domain bucket. | foundation `model/schemas`, `model/policy`, artifacts, or deletion. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/hydrology/contract.ts` | n/a | Retire root facade. | hydrology `index.ts`, artifacts, model owners, or operation contracts. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/hydrology/ops/shared` | n/a,n/a | Decompose shared operation-family bucket. | hydrology `model/schemas`, `model/policy`, operation `rules`, or real operation contract if semantically an op. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/hydrology/river-class.ts` | n/a | Move standalone primitive/policy. | `mods/mod-swooper-maps/src/domain/hydrology/model/policy/river-class.ts`. | current topology output no longer reports the old root path; import-zero. | none |
| `mods/mod-swooper-maps/src/domain/hydrology/river-network-metrics.ts` | n/a | Move standalone primitive/policy. | hydrology `model/schemas` or `model/policy`. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/hydrology/shared` | n/a | Decompose shared domain bucket. | hydrology `model/schemas`, `model/policy`, artifacts, or deletion. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/morphology/contract.ts` | n/a | Retire root facade. | morphology `index.ts`, artifacts, model owners, or operation contracts. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/morphology/ops/compute-belt-drivers/deriveFromHistory.ts` | n/a | Move helper out of operation root. | operation `rules`/`strategies` or morphology/foundation model owner. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared` | n/a,n/a | Decompose shared operation-family bucket. | morphology `model/schemas`, `model/policy`, operation `rules`, or real operation contract if semantically an op. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules.ts` | n/a | Move helper out of fake operation root. | morphology `model/policy`, operation `rules`, or deletion after proof. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/morphology/shared` | n/a | Decompose shared domain bucket. | morphology `model/schemas`, `model/policy`, artifacts, or deletion. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/placement` | n/a | Add missing model slot if placement owns primitives. | placement `model/schemas`/`model/policy`. | topology green. | none |
| `mods/mod-swooper-maps/src/domain/placement/contract.ts` | n/a | Retire root facade. | placement `index.ts`, artifacts, model owners, or operation contracts. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/resources` | n/a | Add missing model slot if resources owns primitives. | resources `model/schemas`/`model/policy`. | topology green. | none |
| `mods/mod-swooper-maps/src/domain/resources/contract.ts` | n/a | Retire root facade. | resources `index.ts`, artifacts, model owners, or operation contracts. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/resources/lib` | n/a | Decompose resource lib. | resources `model/data`, `model/policy`, artifacts, or deletion. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/resources/ops/derive-habitat-fields/note-to-agent.md` | n/a | Remove or move non-source note. | packet docs or deletion. | topology green; file removed/moved. | none |
| `mods/mod-swooper-maps/src/domain/resources/ops/plan-aquatic-resources/signals.ts` | n/a | Decompose signal helper. | operation `rules`, resources `model/policy`, resources `model/schemas`, or deletion. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/resources/ops/plan-cultivated-resources/signals.ts` | n/a | Decompose signal helper. | operation `rules`, resources `model/policy`, resources `model/schemas`, or deletion. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/resources/ops/plan-geological-resources/signals.ts` | n/a | Decompose signal helper. | operation `rules`, resources `model/policy`, resources `model/schemas`, or deletion. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/resources/ops/plan-terrestrial-resources/signals.ts` | n/a | Decompose signal helper. | operation `rules`, resources `model/policy`, resources `model/schemas`, or deletion. | topology green; import scan. | none |
| `mods/mod-swooper-maps/src/domain/resources/policy` | n/a | Decompose policy folder. | resources `model/policy`, `@civ7/map-policy`, or deletion. | topology green; import scan. | none |

## Historical Red Taxonomy

The following taxonomy is the red capture that drove this repair, not current
rule status. Current rule status is the `Current Counts` table above plus the
closure overlay in `execution-status-register.md`. Do not read rows in this
historical section as active failures unless they still appear in the current
Habitat output.

### Enforced Stage Authoring File Shape

Rule: `require_recipe_stage_authoring_file_shape`

Pass condition:

- Every standard recipe stage root uses `index.ts` as the authoring surface.
- Direct stage-root helper files are gone unless they are accepted rail files: `index.ts`, `viz.ts`, `log.ts`.
- Stage `index.ts` imports only stage rails, domain `model/schemas`, domain `model/policy`, domain `artifacts`, and core authoring API.
- Stage `index.ts` does not mirror operation `input`, `output`, `config`, or default strategy envelopes.
- Public authoring files that only mirror operation contracts are not legitimate stage UX. Their destination is deletion/no public schema.

| Path | Diagnostics | Class |
| --- | ---: | --- |
| `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-biomes/index.ts` | 1 | stage index wrong import or operation mirror |
| `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-biomes/public-config.ts` | 1 | stage-root helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features/index.ts` | 1 | stage index wrong import or operation mirror |
| `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features/public-config.ts` | 1 | stage-root helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-pedology/index.ts` | 1 | stage index wrong import or operation mirror |
| `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-pedology/public-config.ts` | 1 | stage-root helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts` | 1 | stage-root artifact helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-lithosphere/index.ts` | 3 | operation schema mirror |
| `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-mantle/index.ts` | 4 | operation schema mirror |
| `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/index.ts` | 6 | operation schema mirror and wrong import surface |
| `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` | 1 | stage-root artifact helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/artifacts.ts` | 1 | stage-root artifact helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/index.ts` | 2 | stage index wrong import |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/knobs.ts` | 1 | stage-root knob helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/public-config.ts` | 1 | stage-root helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/artifacts.ts` | 1 | stage-root artifact helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/index.ts` | 2 | stage index wrong import |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/knobs.ts` | 1 | stage-root knob helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/public-config.ts` | 1 | stage-root helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/artifacts.ts` | 1 | stage-root artifact helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/index.ts` | 2 | stage index wrong import |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/knobs.ts` | 1 | stage-root knob helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/public-config.ts` | 1 | stage-root helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/river-adjacency.ts` | 1 | stage-root helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/biome-bindings.ts` | 1 | Civ7/resource binding residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts` | 1 | stage index wrong import |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-elevation/artifacts.ts` | 1 | stage-root artifact helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/artifacts.ts` | 1 | stage-root artifact helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/artifacts.ts` | 1 | stage-root artifact helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/artifacts.ts` | 1 | stage-root artifact helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/index.ts` | 2 | stage index wrong import |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/riverProjectionKnobs.ts` | 1 | stage-root knob helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/riverProjectionPolicy.ts` | 1 | stage-root policy helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/index.ts` | 1 | stage index wrong import |
| `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/mountain-ranges-public-config.ts` | 1 | stage-root helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts.ts` | 1 | stage-root artifact helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts.ts` | 1 | stage-root artifact helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/placement/index.ts` | 1 | stage index wrong import |
| `mods/mod-swooper-maps/src/recipes/standard/stages/placement/placement-inputs.ts` | 1 | stage-root helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/placement/placement-outputs.ts` | 1 | stage-root helper residue |
| `mods/mod-swooper-maps/src/recipes/standard/stages/placement/public-config.ts` | 1 | stage-root helper residue |

### Enforced Operation Contract File Shape

Rule: `require_domain_operation_contract_file_shape`

Pass condition:

- Operation `contract.ts` owns the `defineOp` envelope.
- Operation `contract.ts` contains `input`, `output`, and `strategies`.
- Reusable primitives come from `model/schemas`.
- Reusable policy comes from `model/policy`.
- Artifact schemas come from `artifacts/*.artifact.ts`.
- Sibling and cross-domain operation contracts are not imported as schema owners.

| Path | Diagnostics | Class |
| --- | ---: | --- |
| `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/contract.ts` | 4 | local rules schema imports must become inline contract schema or domain model schema primitives |
| `mods/mod-swooper-maps/src/domain/ecology/ops/plan-plot-effects/contract.ts` | 1 | root domain type import must become domain model schema/policy or Civ7 package input |
| `mods/mod-swooper-maps/src/domain/morphology/ops/compute-belt-drivers/contract.ts` | 1 | cross-domain operation contract import must become primitive/artifact dependency |
| `mods/mod-swooper-maps/src/domain/resources/ops/adjust-resource-support/contract.ts` | 1 | sibling operation contract import must become primitive/artifact dependency |
| `mods/mod-swooper-maps/src/domain/resources/ops/derive-habitat-fields/contract.ts` | 1 | wrong contract-shape import or export carrier; inspect exact source before burn-down |

### Advisory Domain Source Topology

Rule: `require_domain_source_topology`

Pass condition:

- Domain roots only expose positive domain slots: `artifacts`, `model`, `ops`, and accepted index/barrel rails.
- Operation roots only expose positive operation slots: `contract.ts`, `index.ts`, `rules`, `strategy`, and accepted tests.
- Shared buckets, root contracts, root constants, root `types.ts`, operation `policies`, `signals.ts`, `lib`, `layers`, and notes are not destination slots.

| Path | Diagnostics | Class |
| --- | ---: | --- |
| `mods/mod-swooper-maps/src/domain/ecology/contract.ts` | 1 | domain-root facade residue |
| `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/layers` | 1 | operation-root helper bucket residue |
| `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/policies` | 1 | operation-root policy bucket residue |
| `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/policies` | 1 | operation-root policy bucket residue |
| `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-reefs/policies` | 1 | operation-root policy bucket residue |
| `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/policies` | 1 | operation-root policy bucket residue |
| `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-wetlands/policies` | 1 | operation-root policy bucket residue |
| `mods/mod-swooper-maps/src/domain/ecology/ops/score-shared` | 1 | operation-family shared bucket missing operation shape |
| `mods/mod-swooper-maps/src/domain/ecology/shared` | 1 | domain shared bucket residue |
| `mods/mod-swooper-maps/src/domain/ecology/types.ts` | 1 | domain-root type bucket residue |
| `mods/mod-swooper-maps/src/domain/foundation/constants.ts` | 1 | domain-root policy residue |
| `mods/mod-swooper-maps/src/domain/foundation/contract.ts` | 1 | domain-root facade residue |
| `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib` | 1 | operation-root lib residue |
| `mods/mod-swooper-maps/src/domain/foundation/shared` | 1 | domain shared bucket residue |
| `mods/mod-swooper-maps/src/domain/hydrology/contract.ts` | 1 | domain-root facade residue |
| `mods/mod-swooper-maps/src/domain/hydrology/ops/shared` | 2 | operation-family shared bucket missing operation shape |
| `mods/mod-swooper-maps/src/domain/hydrology/river-network-metrics.ts` | 1 | domain-root schema/policy residue |
| `mods/mod-swooper-maps/src/domain/hydrology/shared` | 1 | domain shared bucket residue |
| `mods/mod-swooper-maps/src/domain/morphology/contract.ts` | 1 | domain-root facade residue |
| `mods/mod-swooper-maps/src/domain/morphology/ops/compute-belt-drivers/deriveFromHistory.ts` | 1 | operation-root helper residue |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared` | 2 | operation-family shared bucket missing operation shape |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules.ts` | 1 | operation-family helper residue |
| `mods/mod-swooper-maps/src/domain/morphology/shared` | 1 | domain shared bucket residue |
| `mods/mod-swooper-maps/src/domain/placement/contract.ts` | 1 | domain-root facade residue |
| `mods/mod-swooper-maps/src/domain/resources/contract.ts` | 1 | domain-root facade residue |
| `mods/mod-swooper-maps/src/domain/resources/lib` | 1 | domain lib bucket residue |
| `mods/mod-swooper-maps/src/domain/resources/ops/derive-habitat-fields/note-to-agent.md` | 1 | non-source note in operation root |
| `mods/mod-swooper-maps/src/domain/resources/ops/plan-aquatic-resources/signals.ts` | 1 | operation-root signals residue |
| `mods/mod-swooper-maps/src/domain/resources/ops/plan-cultivated-resources/signals.ts` | 1 | operation-root signals residue |
| `mods/mod-swooper-maps/src/domain/resources/ops/plan-geological-resources/signals.ts` | 1 | operation-root signals residue |
| `mods/mod-swooper-maps/src/domain/resources/ops/plan-terrestrial-resources/signals.ts` | 1 | operation-root signals residue |
| `mods/mod-swooper-maps/src/domain/resources/policy` | 1 | domain policy slot residue; should normalize under `model/policy` or tracked resource-policy domino |

## Track-Out Rules

A row may leave this repair execution only if it has all of:

- destination class;
- owner path or owning domino;
- trigger for return;
- proof that keeping it red is outside the current config-law repair scope.

Current pre-approved track-out:

| Rule | Path | Symbol/scope | Domino | Trigger |
| --- | --- | --- | --- | --- |
| none | none | none | `resource-policy-data-contract.domino.md` | The domino remains tracked historical context, but no current red-ledger path is pre-approved to remain red under S06. During repair execution, a row may be moved to this track-out only by adding an exact path, exact symbol set, destination class, and trigger to this table. |
