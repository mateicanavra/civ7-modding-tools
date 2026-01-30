---
milestone: M1
id: M1-review
status: draft
reviewer: RONNY
source: docs/projects/mapgen-studio/resources/APP-TSX-REFACTOR-EXECUTION.md
updated: 2026-01-30
---

# REVIEW: M1 App.tsx Refactor (RFX + PV)

Scope:
- Non-merged stack branches: RFX-01..RFX-05, pipeline viz plan, PV-01..PV-06
- PR comment sweep for merged stack PRs #776-803 (per Graphite stack comment)

## REVIEW agent-DONNY-inside-milestone-rfx-01-config-overrides

### Quick Take
Config overrides extraction is mostly faithful to the execution plan, but three regressions/spec mismatches remain that can break overrides or drift from the intended API.

### High-Leverage Issues
- Array field template renders raw `item` objects, which triggers “Objects are not valid as a React child” for array schema fields and crashes the overrides panel. (`apps/mapgen-studio/src/features/configOverrides/rjsfTemplates.tsx`)
- JSON overrides are applied via async state, but `startBrowserRun` still uses the pre-existing `configOverridesForRun`, so the first run after editing JSON can ignore the new overrides or apply them one run late. (`apps/mapgen-studio/src/App.tsx`, `apps/mapgen-studio/src/features/configOverrides/useConfigOverrides.ts`)
- Execution plan decision says `ConfigOverridesPanel` should compute the narrow breakpoint internally, but the public API still requires `isNarrow` from `App.tsx`, drifting from the agreed plan. (`apps/mapgen-studio/src/features/configOverrides/ConfigOverridesPanel.tsx` vs `docs/projects/mapgen-studio/resources/APP-TSX-REFACTOR-EXECUTION.md`)

### PR Comment Context
- PR #798 flagged the array-item render crash; the template still renders `{item}` instead of `item.children`.
- PR #795 flagged the JSON override staleness; `applyJson()` still only mutates state before the run starts.

### Fix Now (Recommended)
- Render `item.children` (and controls) in `BrowserConfigArrayFieldTemplate` instead of `{item}`.
- Return the parsed/normalized overrides from `applyJson()` and use that value directly in `startBrowserRun` to avoid stale config.
- Either compute `isNarrow` inside `ConfigOverridesPanel` or update the execution doc decision to match the current API.

### Defer / Follow-up
- None.

### Needs Discussion
- Decide whether the plan’s `ConfigOverridesPanel` API rule should be updated or enforced in code.

### Cross-cutting Risks
- Config overrides can silently run with stale JSON, which makes repro/validation unreliable.

## REVIEW agent-DONNY-inside-milestone-rfx-02-browser-runner

### Quick Take
Browser runner extraction is clean, but segment bounds are still computed from only half of the coordinates, which can clip segments in both live runs and dumps.

### High-Leverage Issues
- `boundsFromSegments` allocates `segments.length / 2` and copies only the first half of `[x0,y0,x1,y1,...]`, so bounds ignore later coordinates and can be too small. This impacts both live streaming and dump output. (`apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts`, `apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts`)

### PR Comment Context
- PR #791 flagged the half-buffer bounds bug in `worker-trace-sink`; the same pattern still exists in both runner sinks.

### Fix Now (Recommended)
- Iterate the full `segments` buffer (step by 2) or pass the full coordinate list to `boundsFromPositions` in both worker helpers.

### Defer / Follow-up
- Consider deduplicating the bounds helper across runner + dump tooling to avoid divergent fixes.

### Needs Discussion
- None.

### Cross-cutting Risks
- Segment layers (tectonics, rifts, etc.) can render clipped or incorrectly framed in the UI.
