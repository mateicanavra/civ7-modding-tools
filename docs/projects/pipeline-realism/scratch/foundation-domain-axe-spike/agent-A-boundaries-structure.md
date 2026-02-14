# Agent A — Boundaries and Structure

## Axis Ownership
Define and evaluate Foundation boundaries:
- stage boundary semantics,
- step boundary semantics,
- op boundary semantics,
- strategy boundary semantics,
- rule boundary semantics,
and identify concrete current violations.

## Deliverables
1. Boundary definitions grounded in current SPEC + code reality.
2. Violation inventory with evidence paths.
3. Recommended target boundary model (Foundation-specific).

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

### 2026-02-14 — Boundary semantics + violation pass

#### Boundary semantics (Foundation, grounded)
- `Stage boundary`: author-facing surface + compile-time config lowering only; runtime logic belongs to steps/ops (evidence: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:155`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:160`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:101`).
- `Step boundary`: orchestration + artifact/effect boundary; steps build inputs, call ops, publish outputs (evidence: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:93`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:96`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:257`).
- `Op boundary`: stable pure contract; no orchestration role creep; prefer focused ops over mega-ops (evidence: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:82`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:83`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:29`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:39`).
- `Strategy boundary`: same op I/O, algorithmic variation only; strategy config must map to runtime behavior (evidence: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:75`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:77`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:205`).
- `Rule boundary`: small pure policy units under op-local `rules/**`, not public contract surfaces (evidence: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:70`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:73`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:243`).

#### Current violation inventory (with evidence)
- `V1 — Stage boundary breach (legacy dual-path shim)`: Foundation stage compile still branches on Studio sentinel-shaped payloads (`advanced.<stepId>` and `profiles.__studioUiMetaSentinelPath`) and bypasses the single canonical lowering path (evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:552`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:570`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:579`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:170`).
- `V2 — Step boundary breach (compute logic inside step)`: `plate-topology` is implemented directly in the step with no op contract, including topology construction + symmetry validation (evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.contract.ts:14`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.ts:12`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.ts:52`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:22`).
- `V3 — Domain lane boundary breach (physics vs projection lane)`: Foundation stage currently owns tile/map-facing projection tensors via `projection` and publishes them as `artifact:foundation.*`, while SPEC posture says map-facing projection is Gameplay lane (`artifact:map.*`) and physics should stay truth-only (evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:21`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts:739`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/contract.ts:340`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:109`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:114`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:185`).
- `V4 — Op boundary breach (op-to-op orchestration inside an op)`: `compute-tectonic-history` imports and executes `computeTectonicSegments.run(...)` per era; orchestration of multiple ops is step responsibility per decision framework (evidence: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:7`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1183`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:22`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:136`).
- `V5 — Op sizing breach (mega-op consolidation)`: `compute-tectonic-history` mixes plate-membership evolution, event synthesis, field diffusion, rollup derivation, and provenance/advection in one 1.5k LOC op (evidence: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:225`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:458`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:972`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1025`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:29`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:39`).
- `V6 — Strategy boundary breach (declared strategy knobs not wired)`: `compute-crust-evolution` declares configurable strategy knobs, but runtime ignores config (`_config`) and uses hardcoded coefficients/constants (evidence: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:12`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:23`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:63`).
- `V7 — Strategy boundary breach (dead contract knobs)`: `compute-plate-graph` strategy exposes `tangentialSpeed` and `tangentialJitterDeg`, but implementation never reads them (evidence: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:59`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:65`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts:341`).
- `V8 — Rule boundary breach (rules not materialized as units)`: Foundation ops currently keep heuristics inline in op files, with no op-local `rules/**` structure under the foundation ops tree (evidence: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts:109`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:458`, `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts:57`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:73`).

## Proposed target model
- `Stage model (single path)`: keep Foundation stage as authoring + compile lowering only; remove sentinel/legacy compile branches and keep one canonical lowering path from `public` + knobs -> step config envelopes (evidence driver: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:552`).
- `Step model`: each step should orchestrate one coherent boundary and call ops only; migrate `plate-topology` compute into a dedicated op (`foundation/compute-plate-topology`) and keep the step as orchestrator/publisher (evidence driver: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.ts:52`).
- `Domain lane split (no-shim posture)`:
  - Foundation (physics truth lane): mesh-space and physics-owned truths only (`mesh`, `mantlePotential`, `mantleForcing`, `crust`, `plateGraph`, `plateMotion`, tectonic truths/provenance).
  - Gameplay projection/materialization lane: tile/map-facing projections under `artifact:map.*` and later effects under `effect:map.*`.
  - Cutover should be direct (no dual publish surfaces) per single-path/no-legacy posture (evidence: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:170`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:192`).
- `Op model (decomposition for tectonic stack)`:
  - Split `compute-tectonic-history` into focused ops with stable contracts, e.g. `compute-plate-membership-history`, `derive-tectonic-events`, `emit-tectonic-era-fields`, `rollup-tectonic-history`, `compute-tectonic-provenance`.
  - Move orchestration across those ops into the `tectonics` step (or a dedicated sub-step sequence) instead of op-internal orchestration.
- `Strategy model`:
  - Remove dead strategy config keys or wire them fully.
  - Ensure each declared strategy field has runtime effect; otherwise move fixed coefficients to constants that are intentionally non-configurable.
- `Rule model`:
  - Introduce op-local `rules/**` for scoring/selection/threshold logic (seed picking, regime selection, emission decay, reset thresholds, provenance reset checks), keeping op `run` focused on orchestration over rule calls.

## Breaking-change inventory
- `BC1`: remove Studio sentinel compile branches in Foundation stage (`advanced.<stepId>` + sentinel profile path) and enforce one compile path.
- `BC2`: add and require `foundation/compute-plate-topology` op; `plate-topology` step contract gains an op dependency instead of `ops: {}`.
- `BC3`: relocate tile/map-facing tensors out of Foundation artifact namespace into Gameplay map projection surfaces (`artifact:map.*`), with downstream dependency rewiring.
- `BC4`: split `foundation/compute-tectonic-history` contract into multiple ops; existing single-op consumers and tests must migrate to new contracts/order.
- `BC5`: remove or implement currently dead strategy keys (`compute-crust-evolution` and `compute-plate-graph` knobs), which changes authored config compatibility.
- `BC6`: introduce explicit rule modules and test targets; op file/module layout changes for `compute-plate-graph`, `compute-tectonic-segments`, and `compute-tectonic-history`.

## Open risks
- `R1`: projection-lane extraction can ripple into downstream stages expecting `artifact:foundation.plates`/tile tensors; cutover sequencing must avoid hidden dependency gaps (evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:21`).
- `R2`: tectonic-history decomposition can change determinism if random order/tie-break behavior moves across module boundaries (evidence: heap/tie logic in `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:656` and `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts:77`).
- `R3`: removing dead knobs is a behavior-preserving cleanup only if no external tooling depends on their presence in schemas; compatibility audit is needed before contract removal.
- `R4`: extracting rules increases module count; without strict naming/ownership conventions, responsibilities could re-fragment.

## Decision asks for orchestrator
- `D1`: Approve hard lane split: Foundation ends at physics truth; map/tile projection moves to Gameplay (`artifact:map.*`) with no dual-publish shim.
- `D2`: Approve tectonic-history decomposition now (multi-op target) versus deferred behind a temporary transitional wrapper. Recommendation: now, to honor no-shim/no-legacy posture.
- `D3`: Approve contract cleanup policy for dead strategy knobs:
  - Option A: remove immediately (breaking config surface, cleaner architecture).
  - Option B: keep for one short cutover window with explicit deprecation gate and deletion trigger.
- `D4`: Decide where to host shared projection helpers long-term (`packages/mapgen-core` vs `packages/sdk`) for cross-domain reuse consistency.

### 2026-02-14 — Parseability Addendum (YAML)

```yaml
boundary_semantics_evidence:
  stage_boundary:
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:155
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:160
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:101
  step_boundary:
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:93
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:96
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:257
  op_boundary:
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:82
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:83
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:29
  strategy_boundary:
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:75
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:77
  rule_boundary:
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:70
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:73

violations:
  V1_stage_dual_compile_path:
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:552
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:570
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:579
  V2_step_contains_compute_logic:
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.ts:12
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.ts:52
  V3_truth_vs_projection_lane_bleed:
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:21
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts:739
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:185
  V4_op_calls_op:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:7
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1183
  V5_tectonic_history_mega_op:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:225
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:972
  V6_dead_crust_evolution_strategy_knobs:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:12
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:63
  V7_dead_plate_graph_tangential_knobs:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:59
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:65
  V8_rules_not_materialized:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts:109
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:458
```
