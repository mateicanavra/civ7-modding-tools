# Agent D — Integration, Wiring, and Contracts

## Axis Ownership
Map required integration and contract changes across:
- op contracts,
- step contracts,
- foundation artifacts,
- stage compile/public config envelopes,
- downstream consumers impacted by boundary correction.

## Deliverables
1. Contract consistency gap report (inputs/outputs vs usage reality).
2. Proposed breaking-change matrix (no-compat posture).
3. Integration/wiring migration outline for cutover.

## Working Notes (append-only)
- 

## Proposed target model
- 

## Breaking-change inventory
- 

## Open risks
- 

## Decision asks for orchestrator
- 

### 2026-02-14 — Agent D integration/wiring/contracts pass

#### Contract consistency gap report (ops/steps/artifacts/config compile)
| Gap ID | Surface | Declared contract | Observed runtime/compile behavior | Integration consequence | Evidence |
|---|---|---|---|---|---|
| D-G1 | `foundation/compute-tectonic-history` input + tectonics step wiring | History op declares `input.segments`; `tectonics` step computes segments and passes them into history. | History op recomputes segments internally per era via `computeTectonicSegments.run(..., computeTectonicSegments.defaultConfig)` and never reads `input.segments`. | Step-provided segments are non-authoritative for history/provenance outputs; segment config can diverge from history generation path. | `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts:206`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:55`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:67`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1184`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1191` |
| D-G2 | `compute-crust-evolution` strategy config | Contract exposes strategy knobs (`upliftToMaturity`, `ageToMaturity`, `disruptionToMaturity`). | Strategy `run` uses `_config` and does not reference those knobs. | Public/typed config surface is dead; authored values do not affect outputs. | `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:14`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:63` |
| D-G3 | `compute-crust-evolution` required input edge | Op input requires `tectonicProvenance`; step requires and passes that artifact. | Runtime only validates provenance shape and does not consume fields for computation. | Hard dependency edge with no behavioral effect; wiring cost without output influence. | `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:50`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crustEvolution.ts:22`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:74` |
| D-G4 | `compute-plate-graph` strategy envelope | Contract includes `polarCaps.tangentialSpeed` + `polarCaps.tangentialJitterDeg`. | No runtime references in implementation; identifiers appear only in contract file. | Dead strategy knobs in op contract; any authored values are ignored. | `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:59`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:65` |
| D-G5 | Foundation stage public/advanced compile surface | Public surface includes `profiles.lithosphereProfile`, `profiles.mantleProfile`; advanced includes `mantleForcing.potentialMode`. | Stage compile consumes only `profiles.resolutionProfile`; mantle override parser consumes only `plumeCount`, `downwellingCount`, `lengthScale01`, `potentialAmplitude01`. | User-facing fields exist but do not affect compiled step config. | `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:40`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:42`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:59`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:585`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:601` |
| D-G6 | Projection op input optionality vs step contract | `compute-plates-tensors` input marks `tectonicProvenance` optional. | Projection step contract requires `foundationArtifacts.tectonicProvenance` and step always reads/passes it; op still carries null-fallback path. | Optional branch is unreachable in standard pipeline wiring. | `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/contract.ts:152`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:19`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:88`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts:163` |
| D-G7 | Foundation stage compile path | Stage compile has canonical lowering plus Studio sentinel branches (`advanced.<stepId>` and profile sentinel). | Sentinel branch can bypass canonical lowering and return per-step raw config blobs. | Dual compile contracts in one stage; conflicts with single-path posture. | `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:552`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:570`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:579`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:170` |
| D-G8 | Knob application ownership (compile vs step normalize) | Stage comment says knobs apply after defaulted step config. | `plateCount` is applied in stage compile and then applied again in `mesh`/`plate-graph` step normalizers. | Split ownership for same transform raises drift risk across compile surfaces. | `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:234`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:586`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.ts:17`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateGraph.ts:17` |
| D-G9 | Foundation artifact publication vs downstream reads | Foundation publishes `tectonicSegments`, `plateTopology`, `tileToCellIndex`. | Standard runtime downstream reads only `plates`, `crustTiles`, `tectonicHistoryTiles`, `tectonicProvenanceTiles` from Foundation outputs. | Multiple published artifacts are currently diagnostics-only in runtime wiring. | `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts:20`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.contract.ts:12`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:23`, `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts:17`, `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands.contract.ts:16`, `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes.contract.ts:15` |

#### Concrete mismatch inventory (requested categories)
1. Input passed but unused:
   - `computeTectonicHistory.input.segments` is passed by `tectonics` step but ignored in favor of internal recomputation. (evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:74`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1184`)
   - `computeCrustEvolution.input.tectonicProvenance` is required and passed, but only validated, not used in output equations. (evidence: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:75`)
2. Recomputed outputs:
   - Tectonic era boundary events are rebuilt from internally recomputed per-era segments using default segment config; this can diverge from published `foundationTectonicSegments`. (evidence: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1183`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1191`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:65`)
3. Dead config surfaces:
   - `compute-crust-evolution` strategy knobs are dead at runtime. (evidence: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:14`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:63`)
   - `compute-plate-graph.polarCaps.tangentialSpeed` and `tangentialJitterDeg` are declared but unconsumed. (evidence: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:59`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:65`)
   - Stage surface fields `profiles.lithosphereProfile`, `profiles.mantleProfile`, and `advanced.mantleForcing.potentialMode` are inert. (evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:40`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:42`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:59`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:601`)

#### Breaking-change matrix (no shims)
| Break ID | Hard break | Why it is required | Primary impacted wiring | Evidence |
|---|---|---|---|---|
| D-BC1 | Remove `segments` from `foundation/compute-tectonic-history` contract and stop op-internal segment recomputation. | Align contract with actual source-of-truth and eliminate op-calls-op composition breach. | `tectonics` step op binding + any tests relying on current contract shape. | `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts:206`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1184`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:25` |
| D-BC2 | Split `foundation/compute-tectonic-history` into focused ops and move orchestration to step layer. | Current op is mega-op and currently hides orchestration internally. | `tectonics` step schema/run, `contracts.ts`, compile-op map, op registry. | `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1022`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:30`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:71` |
| D-BC3 | Delete dead op/stage config fields (`crust-evolution` knobs, plate-graph tangential knobs, inert stage profile fields, inert `potentialMode`). | Prevent false configurability and contract drift. | Presets/type-tests/dev scripts that currently include inert keys. | `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:14`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:59`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:40`, `mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts:13`, `mods/mod-swooper-maps/src/dev/viz/foundation-run.ts:10` |
| D-BC4 | Remove Foundation compile sentinel branches (`advanced.<stepId>` and profile sentinel path). | Enforce single compile lowering contract; remove dual-path behavior. | Studio/config producers currently emitting sentinel payload shapes. | `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:552`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:570`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:170` |
| D-BC5 | Split Foundation into multiple stage ids (recommended topology candidate B). | Reduce stage overloading and align integration boundaries; step ids will change because full ids include stage id. | Recipe config keys (`foundation` -> multiple keys), full step-id consumers, traces, snapshots, type tests. | `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:96`, `packages/mapgen-core/src/authoring/recipe.ts:65`, `packages/mapgen-core/src/compiler/recipe-compile.ts:81`, `mods/mod-swooper-maps/src/maps/__type_tests__/createMap-config.inference.ts:15` |
| D-BC6A (strict lane split path) | Move tile/map-facing Foundation projection artifacts to Gameplay map artifacts (`artifact:map.*`) in one cut (no dual publish). | Align with strict lane posture from domain modeling spec and Agent A boundary recommendation. | Morphology contracts/steps consuming `foundation.plates`, `foundation.crustTiles`, `foundation.tectonicHistoryTiles`, `foundation.tectonicProvenanceTiles`. | `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:185`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-A-boundaries-structure.md:54`, `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts:17`, `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands.contract.ts:16` |
| D-BC6B (incremental ID stability path) | Keep `artifact:foundation.*` projection IDs for the topology split, but still hard-break op/step contracts now. | Minimizes immediate downstream rewiring while still removing core contract inconsistencies. | Preserves morphology wiring in first cut; defers lane namespace break to a separate hard cut. | `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:100`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-A-boundaries-structure.md:82` |

#### Integration/wiring migration outline for downstream consumers
1. Contract cutover first (ops/steps), artifact IDs stable in same commit:
   - Land `D-BC1` + `D-BC2` + `D-BC3` + `D-BC4` together so no intermediate inconsistent op graph is exposed.
   - Update `foundation` step contracts and stage compile output together; compile schema is strict and stage-keyed, so partial migration will fail compile. (evidence: `packages/mapgen-core/src/compiler/recipe-compile.ts:85`, `packages/mapgen-core/src/compiler/recipe-compile.ts:125`)
2. Stage-topology cutover second (if approved):
   - Replace single `foundation` stage entry with split stage entries in recipe ordering.
   - Expect full step-id churn because IDs are `namespace.recipe.stage.step`; update any trace assertions/snapshots/tooling keyed by full step id.
   - Migrate config keys in all concrete map configs/presets and browser test recipe types. (evidence: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts:29`, `packages/mapgen-core/src/authoring/recipe.ts:65`, `mods/mod-swooper-maps/src/maps/configs/shattered-ring.config.ts:4`, `mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts:11`, `mods/mod-swooper-maps/src/recipes/browser-test/recipe.ts:14`)
3. Lane split cutover third (only if strict path chosen):
   - Rewire morphology consumers from Foundation projection artifacts to Gameplay map artifacts in one hard cut.
   - Update `morphology-coasts` and `morphology-features` step contracts + runtime reads in the same change so dependency tags remain satisfiable.
   - Update docs/catalog references after wiring cutover to avoid stale contract docs. (evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.ts:178`, `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes.ts:77`, `docs/projects/pipeline-realism/resources/spec/artifact-catalog.md:37`)
4. Diagnostic/observability reconciliation:
   - Decide explicitly whether diagnostics-only Foundation artifacts (`tectonicSegments`, `plateTopology`, `tileToCellIndex`) remain public truth/projection surfaces or are reduced/relocated.
   - If retained, document them as diagnostics-only consumers to avoid future “unused artifact” ambiguity.

## Proposed target model
- Recommended sequencing posture: **contract cleanup first, topology split second, lane split third (decision-gated)**.
- Keep one canonical compile path for Foundation stage surfaces (remove sentinel dual path) and keep step ownership of orchestration per spec. (evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:552`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:25`)
- Make `tectonics` step the single orchestration boundary for tectonic-history sub-ops; no op-internal `computeTectonicSegments` calls.
- Resolve the checkpoint conflict explicitly:
  - If orchestrator selects strict lane split now, do `D-BC6A` in same stack and rewire morphology immediately.
  - If orchestrator selects incremental artifact-ID stability first, do `D-BC6B` now and schedule lane split as the next hard-break stack.

## Breaking-change inventory
- Remove `computeTectonicHistory.input.segments` + internal recomputation path; replace with explicit step-owned sequencing.
- Split `compute-tectonic-history` op surface into focused contracts (per Agent B decomposition pressure) and rebind tectonics step.
- Remove dead config keys:
  - `compute-crust-evolution` strategy knobs,
  - `compute-plate-graph.polarCaps.tangentialSpeed/tangentialJitterDeg`,
  - stage-level inert fields (`profiles.lithosphereProfile`, `profiles.mantleProfile`, `advanced.mantleForcing.potentialMode`).
- Remove compile sentinel branches in foundation stage.
- Topology split break: stage IDs and full step IDs change; recipe config keys and typed config tests must migrate.
- Optional policy break (decision-gated): lane split from `artifact:foundation.*` projection artifacts to `artifact:map.*` gameplay artifacts.

## Open risks
- Hidden consumers of current full step IDs and stage key `foundation` in tooling/scripts may fail silently until compile/run time. (evidence: `mods/mod-swooper-maps/src/dev/viz/foundation-run.ts:10`, `mods/mod-swooper-maps/src/maps/__type_tests__/createMap-config.inference.ts:15`)
- Removing inert config keys is semantically correct but may break authored configs/docs that currently include those keys even if they are no-op.
- Lane split in same stack as topology split creates a high blast radius across morphology + docs + visual diagnostics.
- If diagnostics-only artifacts are dropped without replacement, observability workflows that depend on them may regress.

## Decision asks for orchestrator
- Approve **lane policy now**:
  - Option 1: strict lane split now (`D-BC6A`) and accept immediate morphology contract rewiring.
  - Option 2: incremental artifact ID stability for this stack (`D-BC6B`), with a separate scheduled hard lane split next.
- Approve dead-surface cleanup policy: remove inert config keys now vs implement them before contract cleanup.
- Approve topology split timing: same stack as op decomposition vs follow-up stack after op contract cleanup lands.
- Confirm diagnostics contract policy for `artifact:foundation.tectonicSegments`, `artifact:foundation.plateTopology`, and `artifact:foundation.tileToCellIndex` (retain as explicit diagnostics surfaces vs retire/relocate).

### 2026-02-14 — Parseability formatting update (no content changes)

#### Contract consistency gap report (YAML evidence map)
```yaml
contract_gaps:
  - gap_id: D-G1
    topic: compute-tectonic-history input segments ignored
    consequence: step-provided segments are non-authoritative for history/provenance outputs
    evidence_paths:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts:206
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:55
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:67
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1184
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1191
  - gap_id: D-G2
    topic: compute-crust-evolution dead strategy config
    consequence: public knobs do not affect outputs
    evidence_paths:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:14
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:63
  - gap_id: D-G3
    topic: required tectonicProvenance dependency with no behavioral usage
    consequence: hard edge with wiring cost but no output influence
    evidence_paths:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:50
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crustEvolution.ts:22
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:74
  - gap_id: D-G4
    topic: compute-plate-graph dead tangential polar cap knobs
    consequence: authored values are ignored
    evidence_paths:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:59
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:65
  - gap_id: D-G5
    topic: inert stage public/advanced fields
    consequence: user-facing stage fields do not influence compiled step config
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:40
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:42
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:59
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:585
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:601
  - gap_id: D-G6
    topic: compute-plates-tensors optional provenance vs required step contract
    consequence: optional branch unreachable in standard wiring
    evidence_paths:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/contract.ts:152
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:19
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:88
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts:163
  - gap_id: D-G7
    topic: dual compile path via sentinel branches
    consequence: conflicting compile contracts in one stage
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:552
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:570
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:579
      - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:170
  - gap_id: D-G8
    topic: plateCount knob applied at both compile and step normalize layers
    consequence: ownership split increases drift risk
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:234
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:586
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.ts:17
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateGraph.ts:17
  - gap_id: D-G9
    topic: published Foundation artifacts not consumed by runtime downstream
    consequence: diagnostics-only surfaces are mixed into public artifact contract
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts:20
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.contract.ts:12
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:23
      - mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts:17
      - mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands.contract.ts:16
      - mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes.contract.ts:15
```

#### Concrete mismatch inventory (YAML evidence map)
```yaml
mismatches:
  input_passed_but_unused:
    - claim: computeTectonicHistory.input.segments passed by step but ignored by op runtime
      evidence_paths:
        - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:74
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1184
    - claim: computeCrustEvolution.input.tectonicProvenance required/passed but only validated
      evidence_paths:
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:75
  recomputed_outputs:
    - claim: tectonic history era boundaries rebuilt from internal per-era segment recomputation
      evidence_paths:
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1183
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1191
        - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:65
  dead_config_surfaces:
    - claim: compute-crust-evolution strategy knobs are inert
      evidence_paths:
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:14
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:63
    - claim: compute-plate-graph tangential polar cap knobs are inert
      evidence_paths:
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:59
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:65
    - claim: stage profiles.lithosphereProfile, profiles.mantleProfile, advanced.mantleForcing.potentialMode are inert
      evidence_paths:
        - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:40
        - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:42
        - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:59
        - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:601
```

#### Breaking-change matrix (YAML evidence map, no shims)
```yaml
breaking_changes:
  - break_id: D-BC1
    change: remove compute-tectonic-history input.segments and internal recomputation
    impact_area: tectonics step op binding and contract shape
    evidence_paths:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts:206
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1184
      - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:25
  - break_id: D-BC2
    change: split compute-tectonic-history into focused ops; move orchestration to step layer
    impact_area: step contracts, op registry, compile-op bindings
    evidence_paths:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1022
      - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:30
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:71
  - break_id: D-BC3
    change: delete dead config fields across ops and stage compile surfaces
    impact_area: presets, type tests, dev scripts that include inert keys
    evidence_paths:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:14
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:59
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:40
      - mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts:13
      - mods/mod-swooper-maps/src/dev/viz/foundation-run.ts:10
  - break_id: D-BC4
    change: remove compile sentinel branches and keep one canonical lowering path
    impact_area: Studio/config producers emitting sentinel payloads
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:552
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:570
      - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:170
  - break_id: D-BC5
    change: split Foundation stage ids (topology candidate B)
    impact_area: recipe config keys, full step-id consumers, snapshots, type tests
    evidence_paths:
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:96
      - packages/mapgen-core/src/authoring/recipe.ts:65
      - packages/mapgen-core/src/compiler/recipe-compile.ts:81
      - mods/mod-swooper-maps/src/maps/__type_tests__/createMap-config.inference.ts:15
  - break_id: D-BC6A
    change: strict lane split now to artifact:map.*
    impact_area: morphology contracts/steps currently reading foundation projection artifacts
    evidence_paths:
      - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:185
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-A-boundaries-structure.md:54
      - mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts:17
      - mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands.contract.ts:16
  - break_id: D-BC6B
    change: incremental artifact ID stability first; defer lane namespace break
    impact_area: preserves immediate morphology wiring but defers namespace break
    evidence_paths:
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:100
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-A-boundaries-structure.md:82
```

#### Integration/wiring migration outline (YAML evidence map)
```yaml
migration_outline:
  - phase: contract_cutover_first
    actions:
      - land D-BC1, D-BC2, D-BC3, D-BC4 together
      - update foundation step contracts and stage compile output in same commit
    evidence_paths:
      - packages/mapgen-core/src/compiler/recipe-compile.ts:85
      - packages/mapgen-core/src/compiler/recipe-compile.ts:125
  - phase: stage_topology_cutover_second
    actions:
      - replace single foundation stage entry with split stage entries
      - migrate full step-id keyed consumers and config keys
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/recipe.ts:29
      - packages/mapgen-core/src/authoring/recipe.ts:65
      - mods/mod-swooper-maps/src/maps/configs/shattered-ring.config.ts:4
      - mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts:11
      - mods/mod-swooper-maps/src/recipes/browser-test/recipe.ts:14
  - phase: lane_split_cutover_third_decision_gated
    actions:
      - rewire morphology from foundation projection artifacts to gameplay map artifacts in one hard cut
      - update contracts/runtime reads and artifact catalog together
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.ts:178
      - mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes.ts:77
      - docs/projects/pipeline-realism/resources/spec/artifact-catalog.md:37
```

## Proposed target model
- Recommended sequencing remains: contract cleanup first, topology split second, lane split third (decision-gated).
- Keep one canonical Foundation compile path and step-owned orchestration; no op-internal op chaining.
- Resolve strict lane split vs incremental artifact ID stability as an explicit orchestrator decision.
```yaml
evidence_paths:
  sequencing:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:96
  single_compile_path:
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:552
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:25
  op_decomposition_pressure:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:71
  lane_policy_conflict:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-A-boundaries-structure.md:54
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:100
```

## Breaking-change inventory
```yaml
breaking_change_inventory:
  - id: D-BC1
    summary: remove history input.segments and internal segment recomputation
  - id: D-BC2
    summary: split mega-op history into focused ops with step-layer orchestration
  - id: D-BC3
    summary: delete dead config fields across ops and stage compile surfaces
  - id: D-BC4
    summary: remove compile sentinel branches and dual-path lowering
  - id: D-BC5
    summary: split foundation stage IDs and migrate full step-id/config consumers
  - id: D-BC6A_or_D-BC6B
    summary: choose strict lane split now or incremental artifact ID stability now
```

## Open risks
```yaml
open_risks:
  - risk: hidden full-step-id and stage-key consumers outside recipe compile path
    evidence_paths:
      - mods/mod-swooper-maps/src/dev/viz/foundation-run.ts:10
      - mods/mod-swooper-maps/src/maps/__type_tests__/createMap-config.inference.ts:15
  - risk: authored configs/docs include inert keys that will hard-fail after cleanup
    evidence_paths:
      - mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts:13
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:40
  - risk: combining topology split and strict lane split in one stack creates high blast radius
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts:17
      - mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands.contract.ts:16
```

## Decision asks for orchestrator
```yaml
decision_asks:
  - ask: choose lane policy now
    options:
      - id: D-BC6A
        label: strict lane split now (artifact:map.*)
      - id: D-BC6B
        label: incremental artifact ID stability now; lane split in follow-up hard break
  - ask: approve dead-surface policy
    options:
      - remove inert keys now
      - implement semantics before cleanup
  - ask: approve topology split timing
    options:
      - same stack as op decomposition
      - follow-up stack after op contract cleanup
  - ask: diagnostics artifact policy for foundation.tectonicSegments/plateTopology/tileToCellIndex
    options:
      - retain as explicit diagnostics-only surfaces
      - retire or relocate
```
