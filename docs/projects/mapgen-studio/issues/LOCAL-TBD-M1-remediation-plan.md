id: LOCAL-TBD-M1-REMEDIATION-PLAN
title: "[M1] Remediation plan for App.tsx refactor regressions"
state: planned
priority: 1
estimate: 8
project: mapgen-studio
milestone: M1
assignees: [codex]
labels: [remediation]
parent: null
children: []
blocked_by: []
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Consolidate and execute all M1 refactor regression fixes as a clean stack of small PRs, one fix per branch.

## Deliverables
- One fix branch/PR per item in the remediation inventory.
- Updated docs/tests when a fix changes behavior or public surfaces.
- Review doc (`docs/projects/mapgen-studio/reviews/REVIEW-M1.md`) remains the source of truth for root-cause context.

## Acceptance Criteria
- Every item in the remediation inventory is either fixed or explicitly deferred with rationale.
- Fix branches are stacked on top of the current stack tip (no mid-stack history edits).
- Mapgen Studio UX invariants from the RFX execution plan remain intact.

## Testing / Verification
- Mapgen Studio smoke: `bun run --cwd apps/mapgen-studio dev` (config overrides, viz selection, dump loading).
- Mapgen Studio build: `bun run --cwd apps/mapgen-studio build`.
- Targeted tests when applicable: `bun run --cwd mods/mod-swooper-maps test`.

## Dependencies / Notes
- Source review: `docs/projects/mapgen-studio/reviews/REVIEW-M1.md`.
- Execution plan: `docs/projects/mapgen-studio/resources/APP-TSX-REFACTOR-EXECUTION.md`.

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Remediation Inventory (one branch per item)
1) Config overrides array template renders raw items → render `item.children`.
2) Config overrides JSON overrides apply one run late → return parsed overrides and use them in `startBrowserRun`.
3) Config overrides breakpoint API mismatch → align code or execution decision.
4) Browser runner bounds for segments use half the buffer → compute from full segments array.
5) Viz layer key collisions (file-specific layers) → include valuesPath/segmentsPath in key + label.
6) Viz selection refs mutate during render → move to effect.
7) Dump picker `values()` fallback destructures tuples → handle values iterator explicitly.
8) `selectedStepId` stale fallback → sync/clear when manifest changes.
9) studio recipe artifacts types → generate via `mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts`.
10) Sea level search stops on plateau → continue stepping until sea level changes.
11) Spike doc naming mismatch → rename to lowercase and update references.
12) Swooper dump bounds for segments use half buffer → compute from full segments array.

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)
