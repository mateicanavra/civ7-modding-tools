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
- Consolidate and track all M1 refactor regressions and PR-comment follow-ups, with each fix delivered as its own stacked PR.

## Deliverables
- One remediation branch/PR per fix listed in the inventory below.
- Updated docs/tests as needed to keep behavior and documentation aligned.
- Review doc (`docs/projects/mapgen-studio/reviews/REVIEW-M1.md`) remains the canonical source for root-cause context.

## Acceptance Criteria
- Each fix from the M1 review sweep is implemented or explicitly deferred with rationale.
- Fix branches are stacked cleanly on top of the current stack (no mid-stack history edits).
- No regressions in Mapgen Studio UX invariants noted in the M1 review doc.

## Testing / Verification
- Mapgen Studio smoke: `bun run --cwd apps/mapgen-studio dev` (verify config overrides, viz selection, dump loading).
- Mapgen Studio build: `bun run --cwd apps/mapgen-studio build`.
- Targeted tests when applicable: `bun run --cwd mods/mod-swooper-maps test`.

## Dependencies / Notes
- Source review: `docs/projects/mapgen-studio/reviews/REVIEW-M1.md`.
- Execution plan: `docs/projects/mapgen-studio/resources/APP-TSX-REFACTOR-EXECUTION.md`.

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Fix Inventory (one branch per item)
1) Config overrides array template renders raw items → render `item.children`.
2) Config overrides JSON overrides apply one run late → return parsed overrides and use them in `startBrowserRun`.
3) Config overrides breakpoint API mismatch → align code or execution decision.
4) Browser runner bounds for segments use half the buffer → compute from full segments array.
5) Viz layer key collisions (file-specific layers) → include valuesPath/segmentsPath in key + label.
6) Viz selection refs mutate during render → move to effect.
7) Dump picker `values()` fallback destructures tuples → handle values iterator explicitly.
8) `selectedStepId` stale fallback → sync/clear when manifest changes.
9) browser-recipes d.ts missing type exports → add exports in generator.
10) Sea level search stops on plateau → continue stepping until sea level changes.
11) Spike doc naming mismatch → rename to lowercase and update references.
12) Swooper dump bounds for segments use half buffer → compute from full segments array.

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)
