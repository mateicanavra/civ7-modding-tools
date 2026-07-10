# Domain Model Config Law Execution Status Register

Status: repair execution overlay; source repair rows, topology, and test import-boundary rows closed

Purpose: provide stable row IDs, lane ownership, status fields, proof labels, and closure slots for the current red captured in `red-ledger.md`. `red-ledger.md` owns the red evidence. This file owns execution tracking.

## Current Closure Overlay

This overlay supersedes the historical per-row `pending` cells below for the
2026-07-05 repair closure pass. The row tables below are preserved as the red
capture ledger that drove execution. They are not active status fields after
the overlay is populated; do not read historical `pending` cells as unresolved
file-shape work.

| Rail | Current state | Closure meaning |
| --- | --- | --- |
| `require_recipe_stage_authoring_file_shape` | enforced green, 0 diagnostics | Stage authoring/helper burn-down rows are closed for this repair. |
| `require_domain_operation_contract_file_shape` | enforced green, 0 diagnostics | Operation contract-envelope rows are closed for this repair. |
| `require_domain_model_schema_policy_owner_shape` | enforced green, 0 diagnostics | Domain model schema/policy owner-shape rows are closed for this repair; schema/policy destinations did not become renamed config buckets. |
| `require_public_domain_surfaces_in_recipes_and_maps` | enforced green, 0 diagnostics | Recipe/map public-surface rows are closed for this repair. |
| `require_artifact_index_aggregate_shape` | enforced green, 0 diagnostics | Artifact aggregate shape rows are closed for this repair. |
| `require_domain_source_topology` | enforced green, 0 diagnostics | Current domain source topology is closed for this repair and ratcheted as live Habitat law. |
| `require_public_domain_surfaces_in_tests` | enforced green, 0 diagnostics | Test import-boundary topology is closed for static module imports. Tests now use public domain surfaces instead of deep domain internals. Structural source-text inspections in package tests are a separate Habitat-authority follow-up, not an import-boundary diagnostic. |

No direct red remains in this repair overlay. The former
`resource-policy-data-contract.domino.md` follow-up is closed by the Slice 001
cleanup execution: the reusable expected-count range primitive has a named
resource model schema owner, resource operation contracts compose it, and
artifact strictness remains artifact-owned.

## Status Schema

Every executable row must end with one final state:

| Field | Allowed values / shape |
| --- | --- |
| `status` | `pending`, `closed`, `tracked-out`, `escalated`; `escalated` is non-closable and must become `closed` or exact `tracked-out` before Stage 4/6 closure |
| `finalDestination` | while `status=pending`: `pending exact path/deletion`; final states require exact path, `deletion`, or exact track-out target |
| `proofClass` | one or more proof labels from `Proof Labels` |
| `evidence` | command output path, review file, import scan summary, or exact Narsil/git evidence |
| `review` | `not-reviewed`, `accepted`, `rejected-with-evidence`, `waived-with-trigger` |

Broad destination labels do not close rows. Disallowed final destination labels include `model/*`, `domain model`, `primitives`, `policies`, `ops`, `rules`, `shared`, `config`, and `helper`.

Operation-mirror public schemas do not close by relocation. If a stage public surface merely mirrors operation input/output/config/strategy or operation contract envelopes, its exact destination is `deletion/no public schema`; only independently proven stage UX, property-level primitives, artifact contracts, or policy owners may survive.

## Proof Labels

| Label | Canonical proof class | Meaning | Non-claim boundary |
| --- | --- | --- | --- |
| `HABITAT_STAGE_GREEN` | Habitat wrapper structural proof | `require_recipe_stage_authoring_file_shape` is green. | Does not prove behavior. |
| `HABITAT_OP_GREEN` | Habitat wrapper structural proof | `require_domain_operation_contract_file_shape` is green. | Does not prove behavior. |
| `HABITAT_DOMAIN_TOPOLOGY_GREEN` | Habitat topology structural proof | `require_domain_source_topology` has zero diagnostics. | Does not prove behavior or package boundaries. |
| `HABITAT_STAGE_RED_RECONCILED` | Habitat current-tree red proof | `require_recipe_stage_authoring_file_shape` current red count and path set reconcile with `red-ledger.md`. | Does not prove fixture coverage or closure. |
| `HABITAT_OP_RED_RECONCILED` | Habitat current-tree red proof | `require_domain_operation_contract_file_shape` current red count and path set reconcile with `red-ledger.md`. | Does not prove fixture coverage or closure. |
| `HABITAT_DOMAIN_TOPOLOGY_ADVISORY_RECONCILED` | Habitat advisory topology proof | `require_domain_source_topology` advisory diagnostic count and path set reconcile with `red-ledger.md`. | Does not mean the rule is green. |
| `HABITAT_STANDARD_STAGE_TOPOLOGY_GREEN` | Habitat source-derived topology proof | `preserve_standard_stage_topology_and_path_invariants` is green. | Does not prove stage authoring file content. |
| `HISTORICAL_ROOT_GRIT_UNAVAILABLE_RECORDED` | Historical harness capability evidence | A prior closure run recorded that its then-current root `.grit/grit.yaml` could not support native fixture discovery. Current Grit authority is the selected `.habitat/**/rule.json` manifest: Habitat reads its `pattern.md`, materializes an Effect-scoped temporary `grit.yaml`, and invokes pinned Grit with `--grit-dir`. | Historical root-config evidence does not prove current rule behavior or make root `.grit` current authority. |
| `INJECTED_PROBE_STAGE_PASS` | Habitat probe proof | Disposable bad/clean stage authoring probe paths prove the Habitat wrapper flags wrong carriers and ignores the clean owner shape. | Does not prove behavior. |
| `INJECTED_PROBE_OP_PASS` | Habitat probe proof | Disposable bad/clean operation contract probe paths prove the Habitat wrapper flags wrong carriers and ignores the clean owner shape. | Does not prove behavior. |
| `EXACT_DESTINATION_PREFLIGHT` | Row destination proof | A row has exact destination path, `deletion`, or exact track-out target before source edits. | Does not prove source movement is complete. |
| `RG_IMPORT_ZERO` | Static import/reference scan proof | `rg` proves removed old import/path has zero consumers. | Does not prove semantic correctness. |
| `NARSIL_REFERENCE_ZERO` | Code-intelligence reference proof | Narsil symbol/reference query proves zero consumers. | Does not replace tests. |
| `NARSIL_OWNER_HISTORY` | Code-intelligence/history evidence | Narsil/Git history informs symbol owner classification. | Does not define authority by itself. |
| `RESOURCE_PROJECTION_CONTRACT` | Resource authority classification proof | A resource/Civ7-related row records upstream Civ7 authority owner, projected domain concept, consuming file, and why the domain file is not owning official truth. | Does not close rows that require new resource-policy/data-contract design. |
| `NX_CHECK_PASS` | Package static/typecheck proof | `nx run mod-swooper-maps:check` passes. | Does not prove tests or topology. |
| `NX_TEST_PASS` | Package behavior test proof | `nx run mod-swooper-maps:test` passes. | Does not prove topology. |
| `DIFF_CHECK_PASS` | Diff hygiene proof | `git diff --check` passes. | Whitespace only. |
| `REVIEW_ACCEPTED` | Review disposition proof | Fresh-agent review has no unresolved accepted P1/P2 findings. | Does not prove behavior. |
| `GRAPHITE_SUBMITTED` | Publication proof | Graphite commit/submit completed. | Publication only. |
| `TRACKOUT_EXACT` | Record-truth track-out proof | Row is explicitly tracked out with path, symbols, owner, destination, and trigger. | Does not close source code. |
| `TOPOLOGY_PATH_TRACKOUT` | Topology follow-up proof | Advisory topology red is represented by exact current path and required next discriminator. | Does not prove symbol-level destination or make the topology row closed. |

## Active Exact Row Closure Ledger

This ledger is the active row state for the 2026-07-05 closure audit. It
supersedes the historical pending seed rows below. The historical tables remain
only as the original red capture.

### Stage 0 Exact State

| ID | status | finalDestination | proofClass | evidence | review |
| --- | --- | --- | --- | --- | --- |
| `S0-R00` | closed | file-shape rail proof for `require_recipe_stage_authoring_file_shape` | `HISTORICAL_ROOT_GRIT_UNAVAILABLE_RECORDED`, `INJECTED_PROBE_STAGE_PASS`, `HABITAT_STAGE_GREEN` | Historical evidence: the then-current root `.grit/grit.yaml` had `patterns: []`, so native Grit fixture discovery found no testable patterns. Current authority: `.habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/rule.json`; `bun habitat check --rule require_recipe_stage_authoring_file_shape --json` selects that manifest and runs its pattern through Habitat's Effect-scoped `--grit-dir` config. `/tmp/habitat-red-experiment/stage-authoring-probe.json` flags only bad probe files; `/tmp/habitat-red-experiment/file-shape-after-probe-cleanup.json` is green. | accepted |
| `S0-R01` | closed | file-shape rail proof for `require_domain_operation_contract_file_shape` | `HISTORICAL_ROOT_GRIT_UNAVAILABLE_RECORDED`, `INJECTED_PROBE_OP_PASS`, `HABITAT_OP_GREEN` | Historical evidence: the then-current root `.grit/grit.yaml` had `patterns: []`, so native Grit fixture discovery found no testable patterns. Current authority: `.habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/rule.json`; `bun habitat check --rule require_domain_operation_contract_file_shape --json` selects that manifest and runs its pattern through Habitat's Effect-scoped `--grit-dir` config. `/tmp/habitat-red-experiment/op-contract-probe.json` flags only bad probe files; `/tmp/habitat-red-experiment/file-shape-after-probe-cleanup.json` is green. | accepted |
| `S0-R02` | closed | current domain source topology is enforced green with zero diagnostics | `HABITAT_DOMAIN_TOPOLOGY_GREEN` | `bun habitat check --rule require_domain_source_topology --json` reports 0 diagnostics. Historical path-level rows remain in `domain-source-topology.domino.md` only as prior red evidence. | accepted |
| `S0-R03` | closed | source-derived standard stage topology rail; stage helper-file ban remains in `require_recipe_stage_authoring_file_shape` | `HABITAT_STANDARD_STAGE_TOPOLOGY_GREEN` | `/tmp/habitat-red-experiment/standard-stage-topology.json` is green for source-derived stage topology only; it does not claim ownership of per-stage helper child-file bans. | accepted |
| `S0-R04` | closed | active exact row ledger plus topology domino | `REVIEW_ACCEPTED` | this `Active Exact Row Closure Ledger`; `domain-source-topology.domino.md`; `reviews/enforcement-review-findings.md`. | accepted |
| `S0-R05` | closed | all executable file-shape, topology, recipe/map public-surface, artifact aggregate, resource expected-count primitive, and test import-boundary rows are green | `EXACT_DESTINATION_PREFLIGHT`, `REVIEW_ACCEPTED` | Stage 1 and Stage 2 tables below are closed; current topology and test import-boundary checks are green. The former `resource-policy-data-contract.domino.md` follow-up is closed by Slice 001 cleanup execution. | accepted |

### Stage 1 Exact State: Recipe Stage Authoring

All Stage 1 rows are closed by source deletion, stage `index.ts` ownership, or
exact artifact/policy destinations. Current proof: `require_recipe_stage_authoring_file_shape`
is enforced green in `/tmp/habitat-red-experiment/file-shape-after-probe-cleanup.json`;
`find mods/mod-swooper-maps/src/recipes/standard/stages ... public-config/knobs/artifacts`
returns no stage-root residue.

| ID | status | finalDestination |
| --- | --- | --- |
| `S1-001` | closed | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-biomes/index.ts`; helper import removed; no public schema mirror. |
| `S1-002` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-biomes/public-config.ts`. |
| `S1-003` | closed | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features/index.ts`; helper import removed; no public schema mirror. |
| `S1-004` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features/public-config.ts`. |
| `S1-005` | closed | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-pedology/index.ts`; helper import removed; no public schema mirror. |
| `S1-006` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-pedology/public-config.ts`. |
| `S1-007` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts`; artifact aggregation lives under `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts/index.ts`. |
| `S1-008` | closed | `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-lithosphere/index.ts`; operation schema mirrors deleted/no public schema. |
| `S1-009` | closed | `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-mantle/index.ts`; operation schema mirrors deleted/no public schema. |
| `S1-010` | closed | `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/index.ts`; operation schema mirrors deleted/no public schema. |
| `S1-011` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts`; foundation artifact aggregation lives under `mods/mod-swooper-maps/src/domain/foundation/artifacts/index.ts` and `mods/mod-swooper-maps/src/recipes/standard/artifacts/index.ts`. |
| `S1-012` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/artifacts.ts`; aggregation lives under `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/artifacts/index.ts`. |
| `S1-013` | closed | `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/index.ts`; public-config helper removed; real knobs owned inline. |
| `S1-014` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/knobs.ts`; reusable policy lives in `mods/mod-swooper-maps/src/domain/hydrology/model/policy/climate-knob-policy.ts`. |
| `S1-015` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/public-config.ts`. |
| `S1-016` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/artifacts.ts`; aggregation lives under `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/artifacts/index.ts`. |
| `S1-017` | closed | `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/index.ts`; public-config helper removed; real knobs owned inline. |
| `S1-018` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/knobs.ts`; reusable policy lives in `mods/mod-swooper-maps/src/domain/hydrology/model/policy/climate-knob-policy.ts`. |
| `S1-019` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/public-config.ts`. |
| `S1-020` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/artifacts.ts`; aggregation lives under `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/artifacts/index.ts`. |
| `S1-021` | closed | `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/index.ts`; public-config helper removed; real knobs owned inline. |
| `S1-022` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/knobs.ts`; reusable policy lives in `mods/mod-swooper-maps/src/domain/hydrology/model/policy/hydrography-knob-policy.ts`. |
| `S1-023` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/public-config.ts`. |
| `S1-024` | closed | moved: `mods/mod-swooper-maps/src/domain/hydrology/model/policy/river-adjacency.ts`. |
| `S1-025` | closed | deletion of stage-root `map-ecology/biome-bindings.ts`; official biome globals live in `packages/civ7-map-policy/src/biome-globals.ts`, projection helper lives in `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-biomes/engine-biome-bindings.ts`. |
| `S1-026` | closed | `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`; helper import removed. |
| `S1-027` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/map-elevation/artifacts.ts`; aggregation lives under `mods/mod-swooper-maps/src/recipes/standard/stages/map-elevation/artifacts/index.ts`. |
| `S1-028` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/artifacts.ts`; aggregation lives under `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/artifacts/index.ts`. |
| `S1-029` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/artifacts.ts`; aggregation lives under `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/artifacts/index.ts`. |
| `S1-030` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/artifacts.ts`; aggregation lives under `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/artifacts/index.ts`. |
| `S1-031` | closed | `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/index.ts`; helper imports removed. |
| `S1-032` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/riverProjectionKnobs.ts`; real knobs owned inline by `map-rivers/index.ts`. |
| `S1-033` | closed | moved: `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/navigable-river-projection-policy.ts`. |
| `S1-034` | closed | `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/index.ts`; public-config helper import removed; retained stage UX is inline. |
| `S1-035` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/mountain-ranges-public-config.ts`. |
| `S1-036` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts.ts`; aggregation lives under `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/index.ts`. |
| `S1-037` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts.ts`; aggregation lives under `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts/index.ts`. |
| `S1-038` | closed | `mods/mod-swooper-maps/src/recipes/standard/stages/placement/index.ts`; helper import removed. |
| `S1-039` | closed | deletion of `mods/mod-swooper-maps/src/recipes/standard/stages/placement/placement-inputs.ts`; artifact shape lives in `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts/placement-inputs.artifact.ts`. |
| `S1-040` | closed | deletion of `mods/mod-swooper-maps/src/recipes/standard/stages/placement/placement-outputs.ts`; artifact shape lives in `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts/placement-outputs.artifact.ts`. |
| `S1-041` | closed | deletion: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/public-config.ts`; no operation-mirror public schema. |

### Stage 2 Exact State: Operation Contracts

All Stage 2 rows are closed by the enforced operation-contract file-shape rail.
Current proof: `require_domain_operation_contract_file_shape` is enforced green
in `/tmp/habitat-red-experiment/file-shape-after-probe-cleanup.json`.

| ID | status | finalDestination |
| --- | --- | --- |
| `S2-001` | closed | `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/contract.ts`; former local rule schema bags are inline contract-owned schema definitions. |
| `S2-002` | closed | `mods/mod-swooper-maps/src/domain/ecology/model/schemas/plot-effect-intent.schema.ts`; plan-plot-effects contract imports the primitive schema owner. |
| `S2-003` | closed | `mods/mod-swooper-maps/src/domain/morphology/model/schemas/tectonic-source-tiles.ts`; compute-belt-drivers contract imports model primitive types rather than cross-domain operation contracts. |
| `S2-004` | closed | `mods/mod-swooper-maps/src/domain/resources/model/schemas/resource-site-plan.schema.ts` and `resource-family.schema.ts`; adjust-resource-support contract imports resource primitives rather than sibling operation contract envelopes. |
| `S2-005` | closed | `mods/mod-swooper-maps/src/domain/resources/model/schemas/habitat-fields.schema.ts`; derive-habitat-fields contract imports the habitat field primitive owner. |

### Stage 3 Historical Red Capture: Domain Source Topology

Stage 3 is now source-green in the current tree:
`bun habitat check --rule require_domain_source_topology --json` reports 0
diagnostics. The table below is retained as the historical red capture that
drove the repair. Do not read its old `tracked-out` cells as current work; the
active closure overlay above is the source of truth.

| ID | status | finalDestination |
| --- | --- | --- |
| `S3-001` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-001`: `mods/mod-swooper-maps/src/domain/ecology/contract.ts`. |
| `S3-002` | closed | deletion: `mods/mod-swooper-maps/src/domain/ecology/feature-engine-legality.ts`; official feature legality lives in `@civ7/map-policy` and map-stage projection/application. |
| `S3-003` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-003`: `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/layers`. |
| `S3-004` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-004`: `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/policies`. |
| `S3-005` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-005`: `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/policies`. |
| `S3-006` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-006`: `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-reefs/policies`. |
| `S3-007` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-007`: `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/policies`. |
| `S3-008` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-008`: `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-wetlands/policies`. |
| `S3-009` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-009`: `mods/mod-swooper-maps/src/domain/ecology/ops/score-shared`. |
| `S3-010` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-010`: `mods/mod-swooper-maps/src/domain/ecology/shared`. |
| `S3-011` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-011`: `mods/mod-swooper-maps/src/domain/ecology/types.ts`. |
| `S3-012` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-012`: `mods/mod-swooper-maps/src/domain/foundation/constants.ts`. |
| `S3-013` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-013`: `mods/mod-swooper-maps/src/domain/foundation/contract.ts`. |
| `S3-014` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-014`: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib`. |
| `S3-015` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-015`: `mods/mod-swooper-maps/src/domain/foundation/shared`. |
| `S3-016` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-016`: `mods/mod-swooper-maps/src/domain/hydrology/contract.ts`. |
| `S3-017` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-017`: `mods/mod-swooper-maps/src/domain/hydrology/ops/shared`. |
| `S3-018` | closed | moved: `mods/mod-swooper-maps/src/domain/hydrology/model/policy/river-class.ts`. |
| `S3-019` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-019`: `mods/mod-swooper-maps/src/domain/hydrology/river-network-metrics.ts`. |
| `S3-020` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-020`: `mods/mod-swooper-maps/src/domain/hydrology/shared`. |
| `S3-021` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-021`: `mods/mod-swooper-maps/src/domain/morphology/contract.ts`. |
| `S3-022` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-022`: `mods/mod-swooper-maps/src/domain/morphology/ops/compute-belt-drivers/deriveFromHistory.ts`. |
| `S3-023` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-023`: `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared`. |
| `S3-024` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-024`: `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules.ts`. |
| `S3-025` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-025`: `mods/mod-swooper-maps/src/domain/morphology/shared`. |
| `S3-026` | closed | no current diagnostic; placement model slot is not part of current topology red. |
| `S3-027` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-027`: `mods/mod-swooper-maps/src/domain/placement/contract.ts`. |
| `S3-028` | closed | `mods/mod-swooper-maps/src/domain/resources/model/schemas/**`; resources model slot exists. |
| `S3-029` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-029`: `mods/mod-swooper-maps/src/domain/resources/contract.ts`. |
| `S3-030` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-030`: `mods/mod-swooper-maps/src/domain/resources/lib`; resource data-contract subset also points to `resource-policy-data-contract.domino.md`. |
| `S3-031` | closed | deletion: `mods/mod-swooper-maps/src/domain/resources/ops/derive-habitat-fields/note-to-agent.md`. |
| `S3-032` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-032`: `mods/mod-swooper-maps/src/domain/resources/ops/plan-aquatic-resources/signals.ts`. |
| `S3-033` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-033`: `mods/mod-swooper-maps/src/domain/resources/ops/plan-cultivated-resources/signals.ts`. |
| `S3-034` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-034`: `mods/mod-swooper-maps/src/domain/resources/ops/plan-geological-resources/signals.ts`. |
| `S3-035` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-035`: `mods/mod-swooper-maps/src/domain/resources/ops/plan-terrestrial-resources/signals.ts`. |
| `S3-036` | tracked-out | `domain-source-topology.domino.md#path-level-rows` row `S3-036`: `mods/mod-swooper-maps/src/domain/resources/policy`. |

## Closure Rule

This register has one active status source: `Active Exact Row Closure Ledger`.
Historical pending seed rows were removed after closure because `red-ledger.md`
owns the original red capture and keeping stale `pending exact path/deletion`
rows here created a false second source of truth.

Closure may be claimed only against the active ledger and attached proof outputs.
Current closure covers enforced file-shape rails, current advisory-green domain
source topology, enforced-green test import boundaries, root domain ops binding,
domain ops registry shape, and the resource expected-count range owner cleanup.
