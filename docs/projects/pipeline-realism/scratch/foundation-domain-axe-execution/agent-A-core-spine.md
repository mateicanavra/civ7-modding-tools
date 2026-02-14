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
