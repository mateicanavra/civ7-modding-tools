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
