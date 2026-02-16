id: LOCAL-TBD-PR-M4-003
title: stage topology + compile surface
state: landed
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
- Lock and verify the **current** Standard recipe stage topology + compile surface (single-path; no sentinels/shims), so downstream lane-split work can proceed without topology drift.

This issue is intentionally **forward-only**: the recipe topology and compile surface have already evolved during M4 execution (ecology already integrated; topology lock tests exist). The work remaining under M4 should treat this doc as the “rails” for what is now locked, and any future topology change must update the lock + verification in the same slice.

## Deliverables
- Canonical locked stage ordering (Standard recipe) and enforcement hook:
  - `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
  - `mods/mod-swooper-maps/test/pipeline/foundation-topology-lock.test.ts`
- Compile surface “single-path” contract (no sentinel fallback branches; no legacy stage aliases).
- Break-impact inventory for stage/step ID churn: config keys, diagnostics, traces/viz keys.

## Acceptance Criteria
- [ ] The locked Standard stage topology is represented as a single authoritative list and is enforced by a test that runs in CI (`test:architecture-cutover`).
- [ ] No legacy stage aliases are permitted in the Standard recipe.
- [ ] Compile surface is single-path: legacy/sentinel fallback branches are not present in stage compile.
- [ ] Viz/tracing churn policy is explicit: `stageId`/`stepId` churn is allowed; semantic identities remain stable.

## Testing / Verification
- `bun run test:architecture-cutover`
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/foundation-topology-lock.test.ts`
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/no-dual-contract-paths.test.ts`
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/no-shim-surfaces.test.ts`

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
