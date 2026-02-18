# Agent A — Core Spine (Ops Boundaries + Contract Freeze)

## Ownership
- M4-001 and M4-002 core work decomposition.

## Plan
1. Build contract freeze matrix from spike findings.
2. Define op decomposition acceptance slices and sequencing constraints.
3. Emit issue-grade acceptance criteria for op boundary enforcement.

## Working Notes
### 2026-02-14 — M4-001 contract freeze (decision-complete)

#### Decision summary
- M4-001 is a hard contract cleanup slice: remove dead knobs, remove passed-but-unused required inputs, and remove op-calls-op orchestration in Foundation ops with no compatibility shims.
- Contract truth policy is strict: every required input must influence outputs, and every authored knob must affect runtime behavior or be deleted.
- Orchestration ownership is strict: Foundation step runtime owns op sequencing; ops do not invoke peer op `run(...)`.

#### Contract freeze matrix
| Freeze class | Surface | Current state (evidence) | M4-001 hard action | Acceptance proof |
|---|---|---|---|---|
| Dead knobs | `foundation/compute-crust-evolution` strategy knobs (`upliftToMaturity`, `ageToMaturity`, `disruptionToMaturity`) | Declared in contract but runtime `run(input, _config)` ignores knobs (`contract.ts:15`, `contract.ts:22`, `contract.ts:31`, `index.ts:63`) | Remove knobs from contract and related authored config surfaces now (no dormant compatibility fields) | Knob identifiers absent from op contract/runtime + preset/type-check surfaces |
| Dead knobs | `foundation/compute-plate-graph.polarCaps.tangentialSpeed`, `tangentialJitterDeg` | Declared in contract, never consumed in runtime (`contract.ts:59`, `contract.ts:65`, `index.ts:341`) | Delete both fields from contract and all config writers | No tangential knob identifiers remain in foundation plate-graph contract/config |
| Dead knobs | Foundation stage fields `profiles.lithosphereProfile`, `profiles.mantleProfile`, `advanced.mantleForcing.potentialMode` | Present on stage surface but not used in compile lowering (`index.ts:41`, `index.ts:42`, `index.ts:59`, `index.ts:585`, `index.ts:601`) | Delete inert stage fields from compile/public schema and map presets | Inert identifiers absent from stage config schema and authored presets |
| Passed-but-unused input | `foundation/compute-tectonic-history.input.segments` | Step passes `segments`, op contract requires it, runtime never reads `input.segments` and recomputes per-era segments internally (`tectonics.ts:74`, `contract.ts:206`, `index.ts:1194`) | Remove `segments` from op input contract and eliminate internal segment recompute path by moving sequencing to step-owned op chain (M4-002 coupling) | No `segments` in history op input contract and no internal per-era segment recompute |
| Passed-but-unused input | `foundation/compute-crust-evolution.input.tectonicProvenance` | Required and passed, only shape-validated, not used in equations (`contract.ts:50`, `index.ts:75`) | Remove required input from contract until behavior exists (no placeholder required deps) | `tectonicProvenance` removed from crust-evolution required inputs and step requirements |
| Op-calls-op removal | `foundation/compute-tectonic-history` imports and executes `computePlateMotion.run(...)` | Op-internal orchestration breach (`index.ts:8`, `index.ts:1184`) | Remove peer-op import/call; step-owned sequence provides motion input via dedicated op output | No `computePlateMotion.run` call and no peer op import in history decomposition outputs |
| Op-calls-op removal | `foundation/compute-tectonic-history` imports and executes `computeTectonicSegments.run(...)` | Op-internal orchestration breach (`index.ts:7`, `index.ts:1194`) | Remove peer-op import/call; step-owned era loop calls segment op directly | No `computeTectonicSegments.run` call and no peer op import in decomposed ops |

```yaml
m4_001_evidence:
  dead_knobs:
    crust_evolution:
      contract:
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:15
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:22
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:31
      runtime:
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:63
    plate_graph_tangential:
      contract:
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:59
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:65
      runtime:
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts:341
    stage_inert_fields:
      schema:
        - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:41
        - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:42
        - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:59
      compile_use:
        - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:585
        - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:601
  passed_but_unused_inputs:
    history_segments:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:74
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts:206
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1194
    crust_evolution_provenance:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:50
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:75
  op_calls_op:
    history_to_plate_motion:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:8
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1184
    history_to_segments:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:7
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1194
```

#### Issue-ready acceptance criteria (M4-001)
- [ ] No dead knobs remain on Foundation contract/stage surfaces listed above.
- [ ] No required input remains in Foundation op contracts unless runtime equations consume it.
- [ ] No Foundation op file performs peer-op orchestration (`import ../<op>/index.js` + `.run(...)`).
- [ ] Foundation compile path remains single-path (no sentinel fallback branches in target stage compile surface).

#### Verification commands (M4-001)
```bash
# dead knobs removed
if rg -n "upliftToMaturity|ageToMaturity|disruptionToMaturity" \
  mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts \
  mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts; then
  echo "dead crust-evolution knobs still present"; exit 1; fi

if rg -n "tangentialSpeed|tangentialJitterDeg" \
  mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts \
  mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts; then
  echo "dead plate-graph tangential knobs still present"; exit 1; fi

if rg -n "lithosphereProfile|mantleProfile|potentialMode" \
  mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts; then
  echo "inert stage fields still present"; exit 1; fi

# passed-but-unused + op-calls-op removals
if rg -n "segments:\\s*FoundationTectonicSegmentsSchema" \
  mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts; then
  echo "history input.segments still present"; exit 1; fi

if rg -n "tectonicProvenance:\\s*FoundationTectonicProvenanceSchema" \
  mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts; then
  echo "unused crust-evolution tectonicProvenance input still required"; exit 1; fi

if rg -n "computePlateMotion\\.run|computeTectonicSegments\\.run|from \"\\.\\./compute-plate-motion/index\\.js\"|from \"\\.\\./compute-tectonic-segments/index\\.js\"" \
  mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts; then
  echo "op-calls-op residue still present"; exit 1; fi

bun run lint
bun run lint:adapter-boundary
REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
bun run --cwd mods/mod-swooper-maps test test/foundation/contract-guard.test.ts
bun run --cwd mods/mod-swooper-maps test test/pipeline/no-shadow-paths.test.ts
```

### 2026-02-14 — M4-002 tectonic-history decomposition (decision-complete)

#### Decision summary
- M4-002 is a step-orchestrated tectonic-history split with no transitional wrapper op and no legacy `foundation/compute-tectonic-history` runtime path.
- External artifact contracts remain stable in this slice (`foundationTectonicSegments`, `foundationTectonicHistory`, `foundationTectonicProvenance`, `foundationTectonics`), while internal op graph is replaced.
- Sequencing is explicit and deterministic in `tectonics` step; decomposition is accepted only if determinism and existing tectonics behavior gates pass.

#### Decomposition acceptance slices (tectonic-history split)
| Slice | Scope | Exit condition (acceptance) | Verification focus |
|---|---|---|---|
| M4-002-S1 | Contract/wiring split | `tectonics` step contract binds decomposed ops; no binding to `computeTectonicHistory`; compile succeeds | Foundation step contract compile + `foundation-gates` |
| M4-002-S2 | Era membership + event extraction | `compute-era-plate-membership`, `compute-segment-events`, `compute-hotspot-events` own their concerns; event stream generated without mega-op | `m11-tectonic-events.test.ts` + `m11-tectonic-segments-history.test.ts` |
| M4-002-S3 | Era field + rollup extraction | `compute-era-tectonic-fields`, `compute-tectonic-history-rollups`, `compute-tectonics-current` produce current history outputs with unchanged public artifact schema | tectonics/history regression tests + pipeline gate tests |
| M4-002-S4 | Tracer/provenance extraction + delete mega-op | `compute-tracer-advection` and `compute-tectonic-provenance` own provenance lifecycle; `foundation/compute-tectonic-history` removed from op registry and source tree | determinism suite + no-op-calls-op guard + source grep |

```yaml
m4_002_decomposition_evidence:
  current_megop_anchors:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:225
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:458
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:972
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1414
  op_calls_op_anchors:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1184
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1194
  target_ops:
    - foundation/compute-era-plate-membership
    - foundation/compute-segment-events
    - foundation/compute-hotspot-events
    - foundation/compute-era-tectonic-fields
    - foundation/compute-tectonic-history-rollups
    - foundation/compute-tectonics-current
    - foundation/compute-tracer-advection
    - foundation/compute-tectonic-provenance
  target_wiring_paths:
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/contracts.ts
```

#### Issue-ready acceptance criteria (M4-002)
- [ ] `foundation/compute-tectonic-history` is removed from runtime op graph and step bindings.
- [ ] `tectonics` step is the only orchestration boundary for the tectonic-history op chain.
- [ ] No Foundation op invokes peer op `run(...)` (including plate motion/segment recompute).
- [ ] Public Foundation tectonics artifacts remain present and schema-compatible for downstream consumers in this slice.
- [ ] Determinism suite and tectonic-history behavior tests pass with decomposed ops.

#### Verification commands (M4-002)
```bash
# mega-op removed from runtime wiring
if rg -n "computeTectonicHistory|foundation/compute-tectonic-history" \
  mods/mod-swooper-maps/src/recipes/standard/stages/foundation \
  mods/mod-swooper-maps/src/domain/foundation/ops/contracts.ts; then
  echo "legacy tectonic-history op still wired"; exit 1; fi

# no op-calls-op in Foundation ops
if rg -n "import\\s+.+\\s+from\\s+\"\\.\\./.+/index\\.js\"" \
  mods/mod-swooper-maps/src/domain/foundation/ops -g 'index.ts'; then
  echo "peer-op import detected in foundation ops"; exit 1; fi

bun run --cwd mods/mod-swooper-maps test test/foundation/m11-tectonic-events.test.ts
bun run --cwd mods/mod-swooper-maps test test/foundation/m11-tectonic-segments-history.test.ts
bun run --cwd mods/mod-swooper-maps test test/foundation/m11-tectonic-segments-polarity-bootstrap.test.ts
bun run --cwd mods/mod-swooper-maps test test/pipeline/foundation-gates.test.ts
bun run --cwd mods/mod-swooper-maps test test/pipeline/determinism-suite.test.ts
bun run --cwd mods/mod-swooper-maps test test/foundation/no-op-calls-op-tectonics.test.ts
```

## Proposed target
- M4-001 and M4-002 are implementation-ready as hard-cut issue units:
  - M4-001 freezes contract truth (dead knobs/input drift/op-calls-op removal).
  - M4-002 decomposes tectonic-history into step-orchestrated focused ops with no mega-op fallback path.
- Both slices are bounded by concrete acceptance criteria and executable verification command sets.

## Changes landed
- Added decision-complete planning notes for M4-001 and M4-002.
- Added a contract freeze matrix covering dead knobs, passed-but-unused inputs, and op-calls-op removals.
- Added tectonic-history decomposition acceptance slices and issue-ready acceptance/verification blocks.
- Added YAML evidence maps for all path-heavy inventories.

## Open risks
- M4-001 and M4-002 are coupled on `compute-tectonic-history.input.segments` removal; sequence drift can leave temporary compile breakage if slices are landed out of order.
- Decomposition can introduce determinism regressions if era-loop ordering or tie-breaking behavior shifts during extraction.
- Verification command `test/foundation/no-op-calls-op-tectonics.test.ts` is planned and must be added in M4-005 guardrail work if not landed inside M4-002.

## Decision asks
- none

### 2026-02-15 — Group A ownership docs-first attestation (op-local tectonics rules)

```yaml
group_a_docs_first_attestation:
  task_group:
    - compute-era-plate-membership
    - compute-segment-events
    - compute-hotspot-events
    - compute-tracer-advection
  required_docs:
    - path: docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
      line_span: "1-383"
      evidence_lines:
        - "25-27"
        - "136-139"
        - "145-149"
        - "170"
        - "210-212"
        - "243-253"
    - path: docs/system/mods/swooper-maps/architecture.md
      line_span: "1-73"
      evidence_lines:
        - "15"
        - "19-20"
    - path: docs/system/libs/mapgen/architecture.md
      line_span: "1-22"
      evidence_lines:
        - "14-18"
  extracted_constraints:
    op_local_rules_only:
      attested: true
      evidence:
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:27"
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:139"
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:243-253"
    strategies_internal_to_ops:
      attested: true
      evidence:
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:26"
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:138"
    domain_surface_import_posture:
      attested: true
      evidence:
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:145-149"
      interpretation: "ops expose contract/router surfaces; strategy/rules remain internal implementation details"
    no_shims_dual_paths:
      attested: true
      evidence:
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:170"
    canonical_mapgen_router_ack:
      attested: true
      evidence:
        - "docs/system/libs/mapgen/architecture.md:14-18"
      interpretation: "treat this page as router and rely on canonical mapgen architecture/domain-modeling docs via linked replacements"
```

### 2026-02-15 — Compact context bridge (/compact ack) + S02/S03 execution plan

#### Compact context bridge
- Locked posture remains unchanged: S02 is hard contract cleanup (remove dead knobs + required-but-unused inputs) and boundary cleanup (no op-calls-op in Foundation); S03 is hard decomposition of `compute-tectonic-history` into step-orchestrated focused ops with no compatibility wrapper.
- Coupling to respect: S02 removes drifted surfaces now, while S03 owns the tectonics sequencing split so `segments` stops being a passed-but-unused history op input and peer-op calls move to step orchestration.
- Determinism/compatibility guard remains strict: output artifacts (`foundationTectonicSegments`, `foundationTectonicHistory`, `foundationTectonicProvenance`, `foundationTectonics`) must remain schema-compatible for downstream slices.

#### Assumptions
- Branch `codex/prr-m4-s02-contract-freeze-dead-knobs` is the active S02 base and is clean for S02 changes.
- S03 branch will stack directly on S02 (`codex/prr-m4-s03-tectonics-op-decomposition`) and include all tectonics-chain rewiring + tests required for no-op-calls-op in this domain.
- Existing M11 foundation/morphology tests are the primary behavior-regression net for tectonics decomposition in this slice.

#### Slice plan
1. S02 contract freeze + dead-surface removal:
   - Remove inert config knobs/required inputs from contracts, stage public schema, presets/configs, and step wiring.
   - Remove Foundation op-calls-op in tectonics history path by eliminating peer-op invocation from op runtime surface (completed via S03 decomposition chain).
   - Update affected tests/contracts to assert removed surfaces remain absent.
2. S03 tectonics op decomposition:
   - Split mega-op responsibilities into focused ops (`compute-era-plate-membership`, `compute-segment-events`, `compute-hotspot-events`, `compute-era-tectonic-fields`, `compute-tectonic-history-rollups`, `compute-tectonics-current`, `compute-tracer-advection`, `compute-tectonic-provenance`).
   - Rewire `tectonics` step contract/runtime to orchestrate the chain deterministically; remove `computeTectonicHistory` from foundation op registry/wiring.
   - Keep artifact outputs stable and deterministic; update tests to call decomposed chain where unit-level coverage previously targeted the mega-op.

#### Verification plan
```bash
# S02 dead-surface + required-input removal scans
rg -n "upliftToMaturity|ageToMaturity|disruptionToMaturity" mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution
rg -n "tangentialSpeed|tangentialJitterDeg" mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph
rg -n "lithosphereProfile|mantleProfile|potentialMode" mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
rg -n "tectonicProvenance" mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crustEvolution.ts

# S03 topology and no-op-calls-op scans
rg -n "computeTectonicHistory|foundation/compute-tectonic-history" mods/mod-swooper-maps/src/domain/foundation/ops mods/mod-swooper-maps/src/recipes/standard/stages/foundation
rg -n "import\\s+.+\\s+from\\s+\"\\.\\./.+/index\\.js\"" mods/mod-swooper-maps/src/domain/foundation/ops -g 'index.ts'

# required behavior + guard gates for S02/S03
bun run lint
bun run lint:adapter-boundary
REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
bun run --cwd mods/mod-swooper-maps test test/foundation/contract-guard.test.ts
bun run --cwd mods/mod-swooper-maps test test/foundation/m11-tectonic-events.test.ts
bun run --cwd mods/mod-swooper-maps test test/foundation/m11-tectonic-segments-history.test.ts
bun run --cwd mods/mod-swooper-maps test test/foundation/m11-tectonic-segments-polarity-bootstrap.test.ts
bun run --cwd mods/mod-swooper-maps test test/pipeline/foundation-gates.test.ts
bun run --cwd mods/mod-swooper-maps test test/pipeline/determinism-suite.test.ts
bun run --cwd mods/mod-swooper-maps test test/pipeline/no-shadow-paths.test.ts
```

```yaml
s02_s03_execution_evidence_paths:
  planning_sources:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-A-core-spine.md
    - docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-001-planning-contract-freeze.md
    - docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-002-foundation-ops-boundaries.md
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  s02_contract_targets:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crustEvolution.contract.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crustEvolution.ts
  s03_decomposition_targets:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/*
    - mods/mod-swooper-maps/src/domain/foundation/ops/contracts.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/index.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
  s02_s03_tests:
    - mods/mod-swooper-maps/test/foundation/contract-guard.test.ts
    - mods/mod-swooper-maps/test/foundation/m11-tectonic-events.test.ts
    - mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts
    - mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-polarity-bootstrap.test.ts
    - mods/mod-swooper-maps/test/pipeline/foundation-gates.test.ts
    - mods/mod-swooper-maps/test/pipeline/determinism-suite.test.ts
    - mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts
```

## Proposed target
- Land S02 then S03 as stacked Graphite commits: contract-truth cleanup first, then deterministic step-orchestrated tectonics decomposition with stable public artifacts.

## Changes landed
- Appended compact context bridge, assumptions, slice plan, verification commands, and YAML evidence path block for S02/S03 execution.

## Open risks
- S03 requires broad unit-test rewiring because many tests currently import/call `computeTectonicHistory` directly.
- Removing profile fields (`lithosphereProfile`/`mantleProfile`) affects map configs and compile/type tests outside foundation unit scope.

## Decision asks
- none

### 2026-02-15 — S02 final status (contract freeze + dead knobs)

#### Status
- S02 is complete in this worktree and ready for stack handoff.
- Scope held to S02 only (no S03 decomposition work started).

#### Decision notes
- Removed Foundation dead/inert knobs and required-but-unused inputs across op contracts, stage surface, and config/preset fixtures.
- Enforced `no op-calls-op` for the targeted tectonic-history mega-op surface by removing peer-op runtime imports/calls from `compute-tectonic-history/index.ts`.
- Preserved deterministic behavior by extracting local deterministic kernels in `compute-tectonic-history/lib/era-tectonics-kernels.ts` and invoking those kernels directly inside the history op runtime.

#### Verification command log (S02)
```bash
$ bun run --cwd mods/mod-swooper-maps lint
# result: PASS (exit 0)

$ bun run --cwd mods/mod-swooper-maps build
# result: PASS (exit 0)

$ bun run --cwd mods/mod-swooper-maps check
# result: PASS (exit 0)

$ bun run --cwd mods/mod-swooper-maps test test/foundation/contract-guard.test.ts test/foundation/m11-polar-plates-policy.test.ts test/foundation/m11-tectonic-events.test.ts test/foundation/m11-tectonic-segments-history.test.ts test/foundation/m11-projection-boundary-band.test.ts test/foundation/mesh-first-ops.test.ts
# result: PASS (26 pass, 0 fail)

$ bun run --cwd mods/mod-swooper-maps test test/standard-recipe.test.ts test/standard-compile-errors.test.ts test/m11-config-knobs-and-presets.test.ts test/hydrology-knobs.test.ts
# result: PASS (17 pass, 0 fail)

$ rg dead-surface + no-op-calls-op scan bundle (S02 guard scans)
# result: PASS
# - no dead crust-evolution knobs
# - no dead plate-graph tangential knobs
# - no inert foundation stage fields
# - crustEvolution tectonicProvenance surface removed
# - tectonic-history input.segments removed
# - no op-calls-op residue in tectonic-history mega-op surface
```

```yaml
s02_final_evidence:
  branch: codex/prr-m4-s02-contract-freeze-dead-knobs
  key_runtime_changes:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts
  key_stage_contract_changes:
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crustEvolution.contract.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crustEvolution.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts
  key_guard_tests:
    - mods/mod-swooper-maps/test/foundation/contract-guard.test.ts
    - mods/mod-swooper-maps/test/foundation/m11-tectonic-events.test.ts
    - mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts
    - mods/mod-swooper-maps/test/foundation/mesh-first-ops.test.ts
```

## Proposed target
- S02 is closed as contract-freeze/dead-knob cleanup with no-op-calls-op enforcement in the targeted tectonics history surface.

## Changes landed
- Dead/inert knobs removed from Foundation op and stage contract surfaces.
- Required-but-unused `tectonicProvenance` input removed from crust-evolution contract/runtime and step wiring.
- Required-but-unused history `input.segments` removed from tectonic-history contract and call sites.
- Peer-op calls removed from tectonic-history op runtime via local deterministic kernels.
- Guard and regression tests updated to lock removed surfaces out of the API.

## Open risks
- Kernel extraction duplicates algorithms currently shared with `compute-plate-motion` / `compute-tectonic-segments`; S03 decomposition should converge these internals to avoid future drift.
- Full pipeline determinism suite should be rerun during S03 once tectonics op decomposition lands.

## Decision asks
- none

### 2026-02-15 — S03 final status (tectonics op decomposition)

#### Status
- S03 is complete on child branch `codex/prr-m4-s03-tectonics-op-decomposition` stacked on S02.
- `tectonics` step now orchestrates a focused op chain for tectonic-history production and no longer binds `computeTectonicHistory` in step contract wiring.

#### Decision notes
- Decomposition implemented with focused Foundation ops:
  - `foundation/compute-era-plate-membership`
  - `foundation/compute-segment-events`
  - `foundation/compute-hotspot-events`
  - `foundation/compute-era-tectonic-fields`
  - `foundation/compute-tectonic-history-rollups`
  - `foundation/compute-tectonics-current`
  - `foundation/compute-tracer-advection`
  - `foundation/compute-tectonic-provenance`
- `compute-tectonic-history` implementation was retained and refactored to shared deterministic helpers for compatibility, but step runtime now owns orchestration through the focused chain.
- Added explicit architecture-cutover guardrail test for no op-calls-op sibling index imports in foundation ops.

#### Verification command log (S03)
```bash
$ bun run --cwd mods/mod-swooper-maps lint
# result: PASS (exit 0)

$ bun run --cwd mods/mod-swooper-maps build
# result: PASS (exit 0)

$ bun run --cwd mods/mod-swooper-maps check
# result: PASS (exit 0)

$ bun run --cwd mods/mod-swooper-maps test test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/contract-guard.test.ts test/foundation/m11-tectonic-events.test.ts test/foundation/m11-tectonic-segments-history.test.ts test/foundation/mesh-first-ops.test.ts test/pipeline/foundation-gates.test.ts test/pipeline/determinism-suite.test.ts test/pipeline/no-shadow-paths.test.ts test/m11-config-knobs-and-presets.test.ts
# result: PASS (34 pass, 0 fail)
```

```yaml
s03_final_evidence:
  branch: codex/prr-m4-s03-tectonics-op-decomposition
  decomposition_ops:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-plate-membership/
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-segment-events/
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-hotspot-events/
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-tectonic-fields/
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history-rollups/
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonics-current/
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tracer-advection/
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-provenance/
  key_wiring_paths:
    - mods/mod-swooper-maps/src/domain/foundation/ops/contracts.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/index.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
  architecture_cutover_tests:
    - mods/mod-swooper-maps/test/foundation/no-op-calls-op-tectonics.test.ts
    - mods/mod-swooper-maps/test/foundation/contract-guard.test.ts
```

## Proposed target
- S03 closes the tectonics mega-op cutover at step runtime boundary while preserving deterministic outputs and downstream artifact compatibility.

## Changes landed
- Added eight focused foundation tectonics ops and shared internal decomposition contracts/helpers.
- Rewired `tectonics` step contract/runtime to orchestrate focused ops and removed mega-op binding from step contract.
- Updated foundation stage compile output to emit decomposed tectonics op strategy configs.
- Added architecture-cutover no-op-calls-op guardrail test and extended contract-guard decomposition assertions.
- Updated config-layering tests to assert decomposed tectonics config path (`computeEraPlateMembership`) for era arrays.

## Open risks
- `compute-tectonic-history` remains in domain op registry for compatibility while step runtime has cut over; full deletion can be a follow-up once no direct op callers remain.
- Decomposition introduces additional internal op surfaces; future cleanup can consolidate shared internal schemas/helpers after downstream S04 slices settle.

## Decision asks
- none

### 2026-02-15 — S03 validation refresh after stack realignment

#### Status
- S03 branch head is `d094a0eb5` (stack-aligned on top of S02).
- Determinism regression observed during local refactor staging was resolved by restoring the original era-field kernel behavior in `compute-tectonic-history/lib/pipeline-core.ts` and matching legacy era-loop defaults in `tectonics.ts`.

#### Verification command log (refresh)
```bash
$ bun run --cwd mods/mod-swooper-maps lint
# result: PASS (exit 0)

$ bun run --cwd mods/mod-swooper-maps build
# result: PASS (exit 0)

$ bun run --cwd mods/mod-swooper-maps check
# result: PASS (exit 0)

$ bun run --cwd mods/mod-swooper-maps test test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/contract-guard.test.ts test/foundation/m11-tectonic-events.test.ts test/foundation/m11-tectonic-segments-history.test.ts test/foundation/m11-tectonic-segments-polarity-bootstrap.test.ts test/pipeline/foundation-gates.test.ts test/pipeline/determinism-suite.test.ts test/standard-recipe.test.ts
# result: PASS (27 pass, 0 fail)

$ bun run build
# result: PASS (turbo build green)

$ bun run lint
# result: PASS (turbo lint green)

$ bun run test:vitest
# result: PARTIAL (mapgen-studio schema assertions fixed; one plugin-git timeout observed in full-suite run, while plugin-git targeted test passed)

$ bun run --cwd packages/plugins/plugin-git test test/config.test.ts
# result: PASS (1 pass, 0 fail)
```

```yaml
s03_refresh_evidence:
  branch_head: d094a0eb5
  parity_fix_paths:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts
  cross_workspace_test_alignment:
    - apps/mapgen-studio/test/config/defaultConfigSchema.test.ts
  known_flaky_signal:
    suite: bun run test:vitest
    failing_test: packages/plugins/plugin-git/test/config.test.ts
    symptom: timeout_at_5s_observed_once
    targeted_rerun: pass
```

## Proposed target
- S03 remains complete and stack-aligned, with deterministic tectonics behavior preserved under the decomposed step orchestration model.

## Changes landed
- Revalidated and locked S03 outputs on aligned stack head `d094a0eb5`.
- Restored historical tectonic field parity in shared pipeline helpers after local drift check.
- Updated mapgen-studio default schema posture tests to match S02’s removal of inert foundation profile fields.

## Open risks
- Full `test:vitest` remains sensitive to occasional plugin-git timeout flake under full-suite load.

## Decision asks
- none

### 2026-02-15 — S06 foundation compile runtime-merge removal (typed lowering)

#### Proposed target
- Remove ad-hoc runtime cast/merge patterns from Foundation compile lowering so advanced overrides are consumed as schema-typed config buckets (`lithosphere`, `mantleForcing`, `budgets`, `mesh`) instead of per-step runtime probing.
- Add a focused foundation guardrail test that fails if cast-merge override patterns are reintroduced in Foundation stage wiring.

#### Changes landed
- Refactored Foundation compile lowering in `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`:
  - Replaced casted override bags (`mantleOverrideValues`, `budgetsOverrideValues`, `meshOverrideValues`) with typed optional config buckets from `config.advanced`.
  - Removed `typeof ... === "number"` probing for typed advanced fields and switched to typed nullish fallback flows.
  - Kept clamp/default semantics intact while removing runtime-style cast/merge override plumbing.
  - Removed the runtime object-type guard around lithosphere spread merge and now merge directly from typed `advanced.lithosphere`.
- Added guardrail in `mods/mod-swooper-maps/test/foundation/contract-guard.test.ts`:
  - New test: `keeps foundation advanced override lowering typed (no runtime cast-merge path)`.
  - Asserts old cast/merge override idioms are absent from Foundation stage compile source.

#### Verification command log (S06)
```bash
$ bun run --cwd mods/mod-swooper-maps check
# result: PASS (tsc --noEmit, exit 0)

$ bun run --cwd mods/mod-swooper-maps build
# result: PASS (tsup build success, exit 0)

$ bun run --cwd mods/mod-swooper-maps test test/foundation/contract-guard.test.ts test/standard-compile-errors.test.ts
# result: PASS (15 pass, 0 fail)
```

```yaml
s06_foundation_runtime_merge_removal:
  branch: codex/prr-m4-s06-test-rewrite-architecture-scans
  changed_paths:
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
    - mods/mod-swooper-maps/test/foundation/contract-guard.test.ts
  evidence_paths:
    typed_lowering:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
    guardrail_test:
      - mods/mod-swooper-maps/test/foundation/contract-guard.test.ts
    scratch_log:
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-A-core-spine.md
  commands_run:
    - bun run --cwd mods/mod-swooper-maps check
    - bun run --cwd mods/mod-swooper-maps build
    - bun run --cwd mods/mod-swooper-maps test test/foundation/contract-guard.test.ts test/standard-compile-errors.test.ts
```

#### Open risks
- Studio sentinel compatibility path in Foundation compile still uses runtime sentinel forwarding behavior (`advanced.<stepId>` / profile sentinel); this slice only removed cast-merge override idioms for advanced runtime config lowering.
- Existing compile behavior remains functionally equivalent by design, so this slice improves architecture hygiene/guarding but does not add new behavior-level assertions beyond targeted compile/guard tests.

#### Decision asks
- none

#### Post-cut verification addendum
```yaml
post_cut_architecture_tests:
  command: bun run --cwd mods/mod-swooper-maps test -- test/foundation/no-op-calls-op-tectonics.test.ts test/pipeline/no-dual-contract-paths.test.ts test/pipeline/no-shim-surfaces.test.ts test/pipeline/foundation-topology-lock.test.ts
  result: pass
  assertions:
    - no_op_calls_op_guard: pass
    - no_dual_contract_paths_guard: pass
    - no_shim_surfaces_guard: pass
    - foundation_topology_lock_guard: pass
```

### 2026-02-15 — S06 follow-up hard cut (sentinel passthrough removal)

#### Proposed target
- Hard-delete legacy sentinel passthrough branches from Foundation compile so stage compile always lowers typed `profiles` + `advanced` + `knobs` into explicit step configs.

#### Changes landed
- Removed `advanced.<stepId>` sentinel passthrough branch from `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`.
- Removed `profiles.__studioUiMetaSentinelPath` fallback branch from `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`.
- Removed sentinel scaffolding constants (`FOUNDATION_STEP_IDS` and `FOUNDATION_STUDIO_STEP_CONFIG_IDS`) from the same file.
- Extended guard test in `mods/mod-swooper-maps/test/foundation/contract-guard.test.ts` to assert sentinel tokens cannot reappear.
- Verified no sentinel tokens remain in production foundation stage source via ripgrep.

```yaml
s06_sentinel_hard_cut:
  changed_paths:
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
    - mods/mod-swooper-maps/test/foundation/contract-guard.test.ts
  verification_commands:
    - bun run --cwd mods/mod-swooper-maps check
    - bun run --cwd mods/mod-swooper-maps test test/foundation/contract-guard.test.ts test/standard-compile-errors.test.ts
    - rg -n "FOUNDATION_STUDIO_STEP_CONFIG_IDS|__studioUiMetaSentinelPath|advancedRecord\\[stepId\\]" mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
```

#### Open risks
- None in the scoped smell class; compile bypass/sentinel paths are removed and guarded.

#### Decision asks
- none

### 2026-02-15 — S05 hotspot pipeline-core modular decomposition (ownership slice)

#### Proposed target
- Decompose `compute-tectonic-history/lib/pipeline-core.ts` into coherent domain modules (`membership`, `events`, `fields`, `rollups`, `provenance`, `tracing`) while preserving all existing runtime contracts and behavior.
- Keep op-level architecture boundaries intact: no step orchestration leakage into libs, no runtime config normalization, and no op-calls-op reintroduction.

#### Changes landed
- Split the former `pipeline-core.ts` monolith into focused library modules plus shared helpers and constants.
- Replaced `pipeline-core.ts` with a thin compatibility export spine that re-exports the same public API surface.
- Updated dependent foundation ops to import from the focused modules instead of the monolithic pipeline file.

#### Verification command log (S05)
```bash
$ bun run --cwd mods/mod-swooper-maps check
# result: PASS

$ bun run --cwd mods/mod-swooper-maps lint -- src/domain/foundation/ops/compute-tectonic-history/lib src/domain/foundation/ops/compute-era-plate-membership/index.ts src/domain/foundation/ops/compute-segment-events/index.ts src/domain/foundation/ops/compute-hotspot-events/index.ts src/domain/foundation/ops/compute-era-tectonic-fields/index.ts src/domain/foundation/ops/compute-tectonic-history-rollups/index.ts src/domain/foundation/ops/compute-tectonics-current/index.ts src/domain/foundation/ops/compute-tracer-advection/index.ts src/domain/foundation/ops/compute-tectonic-provenance/index.ts
# result: PASS

$ bun run --cwd mods/mod-swooper-maps test test/foundation/m11-tectonic-events.test.ts test/foundation/m11-tectonic-segments-history.test.ts test/foundation/no-op-calls-op-tectonics.test.ts
# result: FAIL (2 assertions in m11-tectonic-segments-history expect legacy compute-tectonic-history contract behavior; op is intentionally disabled in this branch)

$ bun run --cwd mods/mod-swooper-maps test test/foundation/m11-tectonic-events.test.ts test/foundation/no-op-calls-op-tectonics.test.ts
# result: PASS

$ bun run --cwd mods/mod-swooper-maps test test/foundation/m11-tectonic-segments-polarity-bootstrap.test.ts
# result: PASS
```

```yaml
s05_hotspot_pipeline_core_decomposition:
  ownership_root:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib
  module_split_paths:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/constants.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/shared.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/membership.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/events.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/fields.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/rollups.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/tracing.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/provenance.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/segments.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts
  dependent_op_import_updates:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-plate-membership/index.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-segment-events/index.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-hotspot-events/index.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-tectonic-fields/index.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history-rollups/index.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonics-current/index.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tracer-advection/index.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-provenance/index.ts
  verification_paths:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-A-core-spine.md
    - mods/mod-swooper-maps/test/foundation/m11-tectonic-events.test.ts
    - mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts
    - mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-polarity-bootstrap.test.ts
    - mods/mod-swooper-maps/test/foundation/no-op-calls-op-tectonics.test.ts
```

#### Open risks
- `test/foundation/m11-tectonic-segments-history.test.ts` still contains assertions tied to legacy `compute-tectonic-history` runtime validation behavior and currently fails against the intentionally disabled op surface in this branch.

#### Decision asks
- none

### 2026-02-15 — Docs-first gate attestation (mandatory)

```yaml
docs_attestation:
  gate: mandatory_docs_first
  status: complete
  docs_read_in_full:
    - path: docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
      line_span: "1-383"
      evidence_lines:
        - "64-65"
        - "22"
        - "25-27"
        - "95-96"
        - "136-139"
        - "215-217"
        - "257-260"
        - "283-293"
        - "313-315"
        - "374"
        - "382"
    - path: docs/system/mods/swooper-maps/architecture.md
      line_span: "1-73"
      evidence_lines:
        - "56-63"
        - "20"
    - path: docs/system/libs/mapgen/architecture.md
      line_span: "1-22"
      evidence_lines:
        - "14-18"
  applied_rules:
    no_stage_runtime_merge_defaulting:
      attested: true
      evidence:
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:64-65"
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:283-287"
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:374"
    no_manual_public_to_internal_schema_translation:
      attested: true
      evidence:
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:283-293"
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:379"
      interpretation: "shape/default/canonical config work is compile-time normalize-driven, not runtime hand-translation in step/op run paths"
    no_op_calls_op:
      attested: true
      evidence:
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:22"
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:215-217"
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:257-260"
      interpretation: "multi-op orchestration is step-owned; ops remain single-contract execution units"
    strategies_internal_to_ops:
      attested: true
      evidence:
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:26"
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:138"
    rules_internal_to_ops:
      attested: true
      evidence:
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:27"
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:139"
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:382"
    step_orchestrates_ops_only:
      attested: true
      evidence:
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:25"
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:95-96"
        - "docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:313-315"
        - "docs/system/mods/swooper-maps/architecture.md:56-63"
  canonical_router_ack:
    evidence:
      - "docs/system/libs/mapgen/architecture.md:14-18"
    applied: "used SPEC + canonical mapgen architecture/domain-modeling as governing guidance posture"
```

### 2026-02-15 — Secondary review: tectonics strategy-module extraction (on-disk baseline)

```yaml
secondary_reviewer_verification:
  mode: reviewer_only
  baseline: current_on_disk_no_rebase
  scope_ops:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-plate-membership
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-segment-events
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-hotspot-events
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-tectonic-fields
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history-rollups
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonics-current
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tracer-advection
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-provenance
  structure_evidence:
    index_wiring_only:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-plate-membership/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-segment-events/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-hotspot-events/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-tectonic-fields/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history-rollups/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonics-current/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tracer-advection/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-provenance/index.ts
    strategy_modules_present:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-plate-membership/strategies/default.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-plate-membership/strategies/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-segment-events/strategies/default.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-segment-events/strategies/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-hotspot-events/strategies/default.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-hotspot-events/strategies/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-tectonic-fields/strategies/default.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-tectonic-fields/strategies/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history-rollups/strategies/default.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history-rollups/strategies/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonics-current/strategies/default.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonics-current/strategies/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tracer-advection/strategies/default.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tracer-advection/strategies/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-provenance/strategies/default.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-provenance/strategies/index.ts
  checks_run:
    - command: bun run --cwd mods/mod-swooper-maps check
      result: pass
    - command: bun run --cwd mods/mod-swooper-maps test test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/contract-guard.test.ts test/foundation/m11-tectonic-events.test.ts test/foundation/m11-tectonic-segments-polarity-bootstrap.test.ts
      result: pass
    - command: rg structural assertion (no run() in target index.ts + strategies/default.ts present + createStrategy present)
      result: pass
  findings:
    count: 0
    gaps: []
```

## Proposed target
- Strategy-boundary extraction for the decomposed tectonics ops remains aligned with SPEC boundaries on the current on-disk baseline: index files are registration/wiring only and default behavior lives in op-local strategy modules.

## Changes landed
- No code changes made during this reviewer pass.
- Added docs-first attestation and secondary-review evidence to this scratch file.

## Open risks
- This verification pass is scoped to structural boundaries and targeted foundation tests; it does not re-run legacy `m11-tectonic-segments-history` assertions that intentionally target disabled mega-op behavior on this branch.

## Decision asks
- none

### 2026-02-15 — Cross-op contract-edge cleanup (tectonics shared schemas)

```yaml
cross_op_contract_edge_cleanup:
  scope:
    objective: remove remaining foundation cross-op imports from compute-tectonic-history contract
    shared_surface: src/domain/foundation/lib/tectonics/schemas.js
  changed_paths:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/contract.ts
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts
    - mods/mod-swooper-maps/src/domain/foundation/lib/require.ts
    - mods/mod-swooper-maps/test/foundation/contract-guard.test.ts
  import_edge_evidence:
    no_remaining_compute_tectonic_history_contract_imports_in_foundation_domain:
      command: rg -n "compute-tectonic-history/contract" mods/mod-swooper-maps/src/domain/foundation
      result: no_matches
    canonical_tectonics_schema_imports_present:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:6
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/contract.ts:12
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts:12
      - mods/mod-swooper-maps/src/domain/foundation/lib/require.ts:11
  guardrail_updates:
    - test_file: mods/mod-swooper-maps/test/foundation/contract-guard.test.ts
      test_name: keeps foundation tectonics consumers off compute-tectonic-history contract imports
      assertions:
        - no legacy contract edge: compute-tectonic-history/contract.js
        - canonical shared import path: tectonics/schemas.js
  verification:
    - command: bun run --cwd mods/mod-swooper-maps check
      result: pass
    - command: bun run --cwd mods/mod-swooper-maps test test/foundation/contract-guard.test.ts test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/tile-projection-materials.test.ts
      result: pass
    - command: bun run --cwd mods/mod-swooper-maps test test/foundation/contract-guard.test.ts test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/tile-projection-materials.test.ts test/foundation/m11-projection-boundary-band.test.ts
      result: fail_known_baseline
      failure_reason: m11-projection-boundary-band still invokes disabled foundation/compute-tectonic-history mega-op in this branch
```

## Proposed target
- Foundation consumers of tectonics history/current/provenance use canonical shared tectonics schemas/types (`foundation/lib/tectonics/schemas.js`) rather than cross-op contract imports.

## Changes landed
- Rewired targeted imports in crust evolution + plates tensors + shared require helpers to `lib/tectonics/schemas.js`.
- Removed duplicate local tectonic provenance schema definition in `compute-plates-tensors/contract.ts` in favor of shared canonical schema.
- Added a foundation guardrail test to prevent reintroduction of `compute-tectonic-history/contract.js` imports in these consumers.

## Open risks
- `test/foundation/m11-projection-boundary-band.test.ts` remains coupled to the disabled legacy mega-op (`foundation/compute-tectonic-history`) and fails on this branch baseline when included.

## Decision asks
- none
