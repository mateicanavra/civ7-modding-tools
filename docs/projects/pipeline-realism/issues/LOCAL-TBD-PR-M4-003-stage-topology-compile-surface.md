id: LOCAL-TBD-PR-M4-003
title: stage topology + compile surface
state: planned
priority: 1
estimate: 16
project: pipeline-realism
milestone: M4-foundation-domain-axe-cutover
assignees: [codex]
labels: [pipeline-realism, foundation]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M4-002]
blocked: [LOCAL-TBD-PR-M4-004]
related_to: [LOCAL-TBD-PR-M4-005]
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Apply the locked 3-stage Foundation topology and remove compile-surface dual-path/inert fields so stage contracts are explicit and single-path.

## Deliverables
- Stage split plan for:
  - `foundation-substrate-kinematics`
  - `foundation-tectonics-history`
  - `foundation-projection`
- Step relocation map and stage-ordering contract.
- Compile surface cleanup list removing sentinel branches and inert stage fields.
- Full step-id/stage-id break impact matrix for config/tests/diagnostics/traces.

## Acceptance Criteria
- [ ] 3-stage topology is explicitly mapped with ordered steps and dependencies.
- [ ] Stage compile sentinel path removal is represented as mandatory cutover work.
- [ ] Inert stage compile fields are marked for deletion in the same cutover posture.
- [ ] Break-impact inventory includes recipe config keys, full step IDs, and trace/viz implications.
- [ ] Viz/tracing migration checks are owned here with executable churn checks (`stageId`/`stepId` churn allowed, semantic identities stable).

## Testing / Verification
- `rg -n "foundation-substrate-kinematics|foundation-tectonics-history|foundation-projection" docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-003-stage-topology-compile-surface.md`
- `rg -n "sentinel|dual-path|step-id|stage-id" docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-B-stage-topology.md`
- `bun run --cwd packages/mapgen-core build`
- `bun run --cwd packages/mapgen-viz build`
- `bun run --cwd apps/mapgen-studio build`
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/viz-emissions.test.ts`
- `bun run --cwd mods/mod-swooper-maps test test/morphology/tracing-observability-smoke.test.ts`
- `rg -n "mod-swooper-maps\\.standard\\.foundation\\.|stageId\\s*===\\s*\"foundation\"" apps/mapgen-studio/src mods/mod-swooper-maps/src/dev mods/mod-swooper-maps/test`
- `node -e "const fs=require('node:fs');const m=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));const stages=[...new Set(m.steps.map(s=>s.stepId.split('.').at(-2)))];console.log(JSON.stringify(stages,null,2));" <postRunDir>/manifest.json`
- `node -e "const fs=require('node:fs');const m=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));const bad=m.layers.filter(l=>/(foundation-substrate-kinematics|foundation-tectonics-history|foundation-projection)/.test(l.dataTypeKey));console.log(JSON.stringify({badCount:bad.length,bad},null,2));if(bad.length)process.exit(1);" <postRunDir>/manifest.json`

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M4-002`
- Blocks: `LOCAL-TBD-PR-M4-004`
- Related: `LOCAL-TBD-PR-M4-005`
- Paper trail: `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md`

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Path map
```yaml
files:
  - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
    notes: current monolithic stage and compile-surface source
  - path: mods/mod-swooper-maps/src/recipes/standard/recipe.ts
    notes: stage order and recipe wiring impacts
  - path: packages/mapgen-core/src/authoring/recipe.ts
    notes: full step-id composition source
  - path: packages/mapgen-core/src/compiler/recipe-compile.ts
    notes: stage-keyed config compile behavior
```

### Prework Findings (Complete)
1. Topology options were compared in spike and 3-stage recommendation was locked in planning decisions.
2. Compile dual-path sentinel behavior is already identified and evidence-cited.
