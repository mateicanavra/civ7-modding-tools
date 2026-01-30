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
