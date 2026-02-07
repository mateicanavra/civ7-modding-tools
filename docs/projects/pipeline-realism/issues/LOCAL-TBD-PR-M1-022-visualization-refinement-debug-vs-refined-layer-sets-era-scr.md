id: LOCAL-TBD-PR-M1-022
title: Visualization refinement: debug vs refined layer sets + era scrubber + correlation overlays
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-003]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Upgrade MapGen Studio’s exploration UX for Pipeline-Realism M1: debug vs refined layer sets, an era scrubber over `variantKey=era:<n>`, and correlation overlays for driver→response tuning (viewer-only, not validation).

## Deliverables
- Debug vs refined layer sets (viewer UX, not contract):
  - Make “debug truth” layers discoverable but off-by-default (use existing `meta.visibility: "debug"` posture).
  - Make “refined author visuals” easy to reach (default-visible) and grouped by the D08r tuning story:
    - config → mantle → plates → events → history/provenance → morphology drivers.
  - Ensure the layer list UI makes `meta.group` + `meta.label` visible enough to navigate quickly.
- Era scrubber (timeline UX over `variantKey`):
  - Implement a global Era control that activates when the currently selected data type has `variantKey`s of the form `era:<n>`.
  - Recommended UI:
    - a slider (1..maxEra) + an “Auto” mode that follows the currently selected layer’s era variant,
    - and a fallback dropdown for non-era variant dimensions (season/algo/etc).
  - When Era is set explicitly, selecting a new `dataTypeKey` should preferentially keep the same era (if that data type emits an `era:<n>` variant).
- Correlation overlays (viewer-only, no correctness logic):
  - Add an overlay mode that can render:
    - a primary layer (selected normally),
    - plus one optional overlay layer (selected from a curated list of “correlate with …” suggestions),
    - with controllable alpha.
  - Provide curated overlay presets for M1 tuning (depends on `LOCAL-TBD-PR-M1-003` stable `dataTypeKey`s):
    - overlay `foundation.events.boundary` on top of `foundation.history.regime`
    - overlay `morphology.drivers.uplift` on top of `map.morphology.mountains.orogenyPotential`
  - Keep overlays clearly labeled as “viewer assistance”; all gates live in D09r (`LOCAL-TBD-PR-M1-020`).

## Acceptance Criteria
- Debug/refined behavior is correct:
  - debug layers are hidden unless “Show debug” is enabled,
  - refined layers remain visible by default.
- Era scrubber works end-to-end:
  - for per-era emissions (e.g. Foundation tectonics per era), Studio can sweep eras quickly without manually hunting variant dropdowns,
  - selecting a new data type preserves the chosen era when possible.
- Correlation overlay mode works without violating the viz contract:
  - overlay selection uses the existing identity envelope (`dataTypeKey`, `spaceId`, `kind[:role]`, `variantKey`, `layerKey`),
  - overlay does not affect validation or determinism (it is purely a rendering choice),
  - and overlay rendering never collapses variants (no “same dataTypeKey but different variantKey” collisions).

## Testing / Verification
- `bun run --cwd apps/mapgen-studio test`
- `bun run --cwd mods/mod-swooper-maps test`
- Extend pipeline viz contract tests so Studio UX assumptions stay true:
  - `mods/mod-swooper-maps/test/pipeline/viz-emissions.test.ts`:
    - asserts `variantKey=era:<n>` exists where expected (Foundation per-era emissions),
    - asserts debug/refined layers use `meta.visibility` consistently (so Studio toggles behave).
- Add a small unit test in Studio for era parsing + selection:
  - recommended home: `apps/mapgen-studio/test/viz/eraSelection.test.ts` (new), testing pure helpers used by Explore panel.

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-003`
- Related:
  - (none)

### Implementation Anchors
- `apps/mapgen-studio/src/features/viz/dataTypeModel.ts` (current grouping model: `dataTypeKey → spaceId → kind[:role] → variantKey`)
- `apps/mapgen-studio/src/features/viz/useVizState.ts` (selection + debug toggle plumbing)
- `apps/mapgen-studio/src/ui/components/ExplorePanel.tsx` (add Era control UI and overlay selectors; current variant dropdown exists)
- `apps/mapgen-studio/src/features/viz/deckgl/render.ts` (Deck layer assembly; currently supports edge overlays; extend to render an additional optional overlay layer)
- `packages/mapgen-viz/src/index.ts` (viz contract types; keep identity/metadata semantics aligned)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts` (already emits per-era `variantKey=era:<n>` for some layers; use as the proving ground for Era scrubber)
- `mods/mod-swooper-maps/test/pipeline/viz-emissions.test.ts` (pins the emissions contract Studio relies on)

### References
- docs/projects/pipeline-realism/resources/spec/sections/visualization-and-tuning.md
- docs/system/libs/mapgen/reference/VISUALIZATION.md
- docs/system/libs/mapgen/pipeline-visualization-deckgl.md

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Implementation Decisions
- Overlay resolution prefers same step and space as the primary layer, then matches the preferred `variantKey` (manual era if fixed, otherwise primary variant), and only falls back to the first available overlay layer; this preserves identity without collapsing variants.
- Era control uses Auto (follows selected layer) vs Fixed (slider-driven) modes; Fixed keeps the era across data type/space/render mode changes when possible, and selecting a non-era variant switches back to Auto.
- Spec overlay labels are mapped to current dataTypeKeys (`foundation.history.boundaryType` overlaid with `foundation.tectonics.boundaryType`) so the curated overlay shows up immediately; the logic still filters by availability, so future `foundation.events.boundary` keys will slot in without schema changes.

### Current State (Observed)

- Studio already supports:
  - “Show debug layers” toggle (filters on `meta.visibility === "debug"`),
  - variant selection via the variant dropdown (labels derived from `variantKey`),
  - an “edge overlay” segments layer (`meta.role === "edgeOverlay"`) when available.
  Anchors:
  - `apps/mapgen-studio/src/features/viz/useVizState.ts`
  - `apps/mapgen-studio/src/features/viz/dataTypeModel.ts`
  - `apps/mapgen-studio/src/features/viz/deckgl/render.ts`
- Some Foundation steps already emit per-era variants via `variantKey=era:<n>`:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts`

### Proposed Change Surface

- Studio UI:
  - Add an Era scrubber that sits “above” variant selection and makes per-era layers fast to inspect.
  - Add an optional overlay selection + alpha that renders a second layer atop the primary selection.
- Pipeline tests:
  - Strengthen `viz-emissions` tests to pin the `variantKey` and `meta.visibility` assumptions the Studio UX relies on.

### Pitfalls / Rakes

- Collapsing distinct variants by treating `dataTypeKey` as identity (Studio must continue using `layerKey` as the concrete identity).
- Letting overlays become implicit “validation” (“green means correct”): overlays are explanation only; correctness gates stay in D09r.
- Implementing Era scrubber in a way that only works for one step/stage (must work for any `variantKey=era:<n>` emission).

### Wow Scenarios

- **Timeline tuning:** scrub eras and watch event corridors → history → morphology drivers evolve in seconds, with an overlay showing the causal driver and the response field simultaneously.
