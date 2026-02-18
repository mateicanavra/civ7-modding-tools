# Agent E — Visualization + Tracing Alignment

## Ownership
- viz/tracing boundary alignment across S03-S07 planning.

## Plan
1. Define observability contract impacts from stage-id and lane changes.
2. Specify required stable-vs-expected-changing identity surfaces.
3. Draft trace/viz validation gates for cutover slices.

## Working Notes
- pending

## Proposed target
- Explicit observability migration/verification plan tied to execution slices.

## Changes landed
- Scratchpad initialized.

## Open risks
- Layer-key churn could break historical comparison workflows.

## Decision asks
- none

## Working Notes — 2026-02-14 Update (Decision-complete)

### Implementation Decisions

#### E-D-001 — Allow `stepId`/`stageId` churn in S03-S04; freeze semantic viz identities
- **Context:** S03 (op decomposition) and S04 (3-stage split) will relocate step ownership and rename stage ids.
- **Options:** (A) preserve old step/stage ids via shim aliases, (B) treat ids as internal and migrate consumers.
- **Choice:** **B** with explicit migration checks.
- **Rationale:** `dataTypeKey`/`variantKey`/`spaceId` are the semantic contract; `stepId` and `layerKey` are execution-path identities and will legitimately churn.
- **Risk:** tools keyed on old step ids can silently miss comparisons until migrated.

#### E-D-002 — Define two explicit observability surfaces: break-allowed vs stable-required
- **Context:** current tooling mixes semantic and execution identity (`layerKey` includes `stepId`).
- **Options:** (A) keep implicit expectations, (B) publish hard split of identity classes.
- **Choice:** **B** with explicit break matrix (below).
- **Rationale:** removes ambiguity for S03-S07 implementers and reviewers.
- **Risk:** without enforcement, future tests may regress to step-id-coupled assertions.

#### E-D-003 — Make S06 the cut line for churn-resilient diagnostics
- **Context:** `diag:diff` pairs layers by `(dataTypeKey, stepId, variantKey)`, which is brittle across stage split.
- **Options:** (A) accept broken cross-slice diffs, (B) require churn-safe comparison by semantic surfaces before S07 sign-off.
- **Choice:** **B**.
- **Rationale:** migration needs trustworthy pre/post comparisons across S03-S07.
- **Risk:** if deferred, S07 can merge with false confidence due empty/partial diffs.

#### E-D-004 — Keep trace event kinds stable across S03-S07
- **Context:** observability smoke tests and downstream diagnostics consume event kinds (e.g., `morphology.*` summaries).
- **Options:** (A) rename event kinds with stage split, (B) keep existing kind namespace unless semantic meaning changes.
- **Choice:** **B**.
- **Rationale:** reduces blast radius; stage churn should not force event-kind churn.
- **Risk:** if event kind renames are bundled into stage split, tests and dashboards fail concurrently.

#### E-D-005 — Treat lane split (S07) as emitter relocation, not semantic viz key rewrite
- **Context:** S07 rewires map-facing artifacts to map lane ownership.
- **Options:** (A) rename emitted `dataTypeKey`s to mirror new stage ownership, (B) keep keys semantic and stable.
- **Choice:** **B**.
- **Rationale:** `dataTypeKey` is a user-facing semantic API; ownership changes should show up in step metadata, not key taxonomy.
- **Risk:** key churn would invalidate historical comparisons and overlay suggestions.

### S03-S07 Viz/Tracing Impact Map
```yaml
slices:
  S03:
    change: tectonics op decomposition
    impact:
      - full step ids will change where decomposed ops become distinct steps
      - trace verbosity selectors keyed by full step id must be remapped
    decision: keep dataTypeKey/variantKey stable; allow stepId churn
  S04:
    change: stage split to foundation-substrate-kinematics, foundation-tectonics-history, foundation-projection
    impact:
      - manifest.steps[].stepId stage segment churn
      - layerKey churn because createVizLayerKey includes stepId
    decision: no compatibility shim for raw stage/step ids; require migration checks
  S05:
    change: strict CI gates
    impact:
      - enforce stable-surface tests and churn-detection scans
    decision: gate merges on trace/viz suite + churn scans
  S06:
    change: structural test rewrite and architecture scans
    impact:
      - replace brittle step-id assertions with semantic assertions
      - require churn-safe diff workflow before completion
    decision: S06 exit requires churn-resilient diagnostics path
  S07:
    change: lane split and map artifact rewire
    impact:
      - layer emitter step may move to map lane stages
      - semantic key continuity required for downstream tooling
    decision: no semantic key renames solely due ownership move
```

### Observability Identity: Expected Breaks vs Required Stable Surfaces
```yaml
expected_identity_breaks:
  - surface: manifest.steps[].stepId
    reason: S03 decomposition and S04 stage split change execution addresses
  - surface: trace.stepId on run.progress/step.event
    reason: derived from full step id; follows stage/step churn
  - surface: viz.layer.layerKey
    reason: createVizLayerKey composes stepId into key
  - surface: diagnostics pair keys using stepId (diag:diff current behavior)
    reason: pair key currently includes stepId

required_stable_surfaces:
  - surface: viz.layer.dataTypeKey
    rule: semantic identity only; no stage/step/algorithm/version tokens
  - surface: viz.layer.spaceId
    rule: explicit coordinate-space identity remains stable
  - surface: viz.layer.kind + meta.role
    rule: render-mode semantics remain stable unless visualization semantics change
  - surface: viz.layer.variantKey conventions
    rule: era/snapshot/stage qualifiers stay in variantKey, not dataTypeKey
  - surface: trace event kind namespaces
    rule: keep existing domain semantic kinds unless semantic payload meaning changes
  - surface: manifest schema contract
    rule: keep VizManifestV1 shape and required fields intact
```

### Migration Checks for `stepId`/`stageId` Churn
```yaml
migration_checks:
  - id: CHURN-01-stage-split-visible
    command: node -e "const fs=require('node:fs');const m=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));const stages=[...new Set(m.steps.map(s=>s.stepId.split('.').at(-2)))];console.log(JSON.stringify(stages,null,2));" <postRunDir>/manifest.json
    acceptance:
      - stage list includes foundation-substrate-kinematics
      - stage list includes foundation-tectonics-history
      - stage list includes foundation-projection
      - stage list excludes legacy single-stage foundation (post-S04)

  - id: CHURN-02-hardcoded-foundation-stepids
    command: rg -n "mod-swooper-maps\\.standard\\.foundation\\.|stageId\\s*===\\s*\"foundation\"" apps/mapgen-studio/src mods/mod-swooper-maps/src/dev mods/mod-swooper-maps/test
    acceptance:
      - no hardcoded legacy foundation full-step-id usages remain in viz/trace runtime paths
      - any remaining hits are deliberate fixtures with explicit migration note

  - id: CHURN-03-semantic-key-stability
    command: node -e "const fs=require('node:fs');const m=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));const bad=m.layers.filter(l=>/(foundation-substrate-kinematics|foundation-tectonics-history|foundation-projection)/.test(l.dataTypeKey));console.log(JSON.stringify({badCount:bad.length,bad},null,2));if(bad.length)process.exit(1);" <postRunDir>/manifest.json
    acceptance:
      - zero dataTypeKey values encode stage-id tokens
      - semantic keys remain stable across S03-S07

  - id: CHURN-04-cross-slice-diff-coverage
    command: bun run --cwd mods/mod-swooper-maps diag:diff -- <preRunDir> <postRunDir> --prefix foundation.
    acceptance:
      - cross-slice comparison path is documented as churn-safe by S06 exit
      - empty comparisons due stepId mismatch are treated as blocking until resolved
```

### Trace/Viz Validation Commands + Acceptance Criteria
```yaml
validation_commands:
  build_and_contract:
    - bun run build
    - bun run --cwd packages/mapgen-viz build
    - bun run --cwd apps/mapgen-studio build
  focused_tests:
    - bun test mods/mod-swooper-maps/test/pipeline/viz-emissions.test.ts
    - bun test mods/mod-swooper-maps/test/morphology/tracing-observability-smoke.test.ts
    - bun test mods/mod-swooper-maps/test/standard-recipe.test.ts
  deterministic_dump_probe:
    - bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label s03s07-pre
    - bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label s03s07-post
    - bun run --cwd mods/mod-swooper-maps diag:list -- <postRunDir> --prefix foundation.
    - bun run --cwd mods/mod-swooper-maps diag:trace -- <postRunDir> --eventPrefix foundation.
    - bun run --cwd mods/mod-swooper-maps diag:analyze -- <postRunDir>
    - bun run --cwd mods/mod-swooper-maps diag:diff -- <preRunDir> <postRunDir> --prefix foundation.

acceptance_criteria:
  - all build/test commands pass without adding viz-specific shims
  - expected semantic dataTypeKeys remain present (viz-emissions gate)
  - required morphology/foundation observability kind events remain emitted
  - post-S04 dumps show new foundation stage ids and no legacy single-stage id
  - diag/analyze completes on post-cutover dumps
  - pre/post diff workflow remains usable across churn (or blocks S06 completion)
```

### Evidence / Path Blocks
```yaml
evidence_paths:
  contracts:
    - path: docs/system/libs/mapgen/reference/VISUALIZATION.md
      reason: stable identity contract and external-viewer posture
    - path: docs/system/libs/mapgen/reference/OBSERVABILITY.md
      reason: trace must not alter semantics
    - path: docs/projects/pipeline-realism/resources/spec/sections/visualization-and-tuning.md
      reason: semantic key rules + variant conventions
  key_code_surfaces:
    - path: packages/mapgen-viz/src/index.ts
      reason: createVizLayerKey includes stepId; primary break surface
    - path: mods/mod-swooper-maps/src/dev/viz/dump.ts
      reason: dump-layer identity generation and trace envelope
    - path: mods/mod-swooper-maps/src/dev/diagnostics/diff-layers.ts
      reason: current pair key includes stepId; churn-sensitive
    - path: mods/mod-swooper-maps/src/dev/diagnostics/extract-trace.ts
      reason: trace step/event extraction surface
    - path: apps/mapgen-studio/src/shared/pipelineAddress.ts
      reason: stage/step parsing for UI grouping
  current_churn_hotspots:
    - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
      reason: legacy single stage id currently hardcoded as foundation
    - path: mods/mod-swooper-maps/test/standard-recipe.test.ts
      reason: stage ordering assertions will need S04 migration
```

## Proposed target
- S03-S07 cutover lands with explicit observability contracts: `stepId`/`stageId` churn is migrated deliberately, while semantic viz/tracing surfaces (`dataTypeKey`, `variantKey`, `spaceId`, event kinds) remain stable and gate-protected.

## Changes landed
- Added decision-complete S03-S07 viz/tracing plan with explicit decisions, break-vs-stable identity matrix, churn migration checks, executable validation commands, acceptance criteria, and path-evidence YAML blocks.

## Open risks
- `diag:diff` remains step-id-coupled today and can under-report cross-slice diffs until churn-safe matching is enforced in S06.
- Stage split may surface hidden hardcoded full-step-id strings in tests/tooling outside currently indexed viz/trace paths.
- Lane split can accidentally trigger semantic key churn if emitter ownership is conflated with data taxonomy.

## Decision asks
- none; hard-break policy for `stepId`/`stageId` with semantic-surface stability is now explicit for S03-S07 planning.
