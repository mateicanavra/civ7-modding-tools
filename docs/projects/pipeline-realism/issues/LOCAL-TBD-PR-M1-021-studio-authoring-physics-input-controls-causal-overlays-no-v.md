id: LOCAL-TBD-PR-M1-021
title: Studio authoring: physics-input controls + causal overlays (no velocity hacks)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-005, LOCAL-TBD-PR-M1-003]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Expose D08r physics inputs in MapGen Studio as first-class controls (profiles/knobs/advanced), and pair them with “causality spine” layer shortcuts so tuning never devolves into authoring velocities/belts.

## Deliverables
- Studio authoring UX for D08r Foundation inputs (no derived-field hacks):
  - Add a dedicated “Foundation (Physics Inputs)” authoring view in Studio that edits only D08r-approved inputs:
    - `profiles.resolutionProfile`
    - `profiles.lithosphereProfile`
    - `profiles.mantleProfile`
    - `knobs.plateCount`
    - `knobs.plateActivity`
    - `advanced.mantleForcing.*` (optional)
    - `advanced.lithosphere.*` (optional)
  - Explicitly *do not* provide any UI affordance for authoring:
    - per-plate velocities,
    - global vector fields,
    - tectonic belt masks/corridors,
    - boundary regime labels.
- Studio integration with recipe artifacts (schema/defaults/meta):
  - Ensure Studio continues to consume schema/defaults from `mod-swooper-maps/recipes/standard-artifacts` (not runtime recipe modules) and that these artifacts expose the D08r surface once `LOCAL-TBD-PR-M1-005` lands.
  - Ensure `normalizeStrict` validation errors are surfaced as actionable UI messages (path + message) when authoring violates D08r.
- “Causality spine” layer shortcuts (UI-only convenience; no correctness logic in viewer):
  - Add a small set of “jump to layer” shortcuts that select the canonical D08r/D09r tuning layers by `dataTypeKey` (depends on `LOCAL-TBD-PR-M1-003` emitting stable keys/groups/labels):
    - mantle: `foundation.mantle.potential`, `foundation.mantle.forcing`
    - plates: `foundation.plates.motion`, `foundation.plates.partition`
    - events/history: `foundation.events.boundary`, `foundation.history.regime`
    - provenance: `foundation.provenance.tracerAge`, `foundation.provenance.lineage`
    - morphology drivers: `morphology.drivers.uplift`, `morphology.drivers.fracture`

## Acceptance Criteria
- Studio exposes D08r authoring controls in a way that is:
  - schema-backed (strict validation via `normalizeStrict`),
  - deterministic (same seed + same authoring payload => identical compiled config),
  - and safe (disallowed derived-field editing is not possible because the schema/UI never exposes it).
- Invalid authoring is actionable:
  - schema errors show up with a precise path (e.g. `/foundation/profiles/mantleProfile`) and a human-readable message.
- “Jump to layer” shortcuts:
  - reliably select the intended `dataTypeKey` even when multiple `spaceId`s/`variantKey`s exist,
  - and never attempt to “validate correctness” in the viewer (viewer is for explanation/tuning; D09r owns correctness).

## Testing / Verification
- `bun run --cwd apps/mapgen-studio test`
- `bun run --cwd mods/mod-swooper-maps test`
- Extend Studio config validation tests to pin the D08r posture:
  - `apps/mapgen-studio/test/config/defaultConfigSchema.test.ts`:
    - asserts the default config validates against `STANDARD_RECIPE_CONFIG_SCHEMA`,
    - asserts D08r keys exist (profiles/knobs/advanced),
    - asserts disallowed keys do not exist (no `velocity*`, no `belt*`, no `regime*`).
- (If needed) add a recipe-side contract guard that fails if D08r disallowed keys appear in the exported schema/defaults:
  - recommend adding/expanding `mods/mod-swooper-maps/test/m11-config-knobs-and-presets.test.ts`.

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-005`
  - `LOCAL-TBD-PR-M1-003`
- Related:
  - (none)

### Implementation Anchors
- `apps/mapgen-studio/src/App.tsx` (builds default config via `normalizeStrict`; ideal place to surface schema errors)
- `apps/mapgen-studio/src/recipes/catalog.ts` (imports `STANDARD_RECIPE_CONFIG(_SCHEMA)` and `studioRecipeUiMeta` from `mod-swooper-maps/recipes/standard-artifacts`)
- `apps/mapgen-studio/src/ui/components/RecipePanel.tsx` and `apps/mapgen-studio/src/ui/components/ConfigForm.tsx` (existing schema-driven config editing UX)
- `apps/mapgen-studio/src/ui/components/ExplorePanel.tsx` (place to add “jump to layer” shortcuts; selection is `dataTypeKey → spaceId → kind[:role] → variantKey`)
- `mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts` (generates `standard-artifacts` export; this is the build-time source of schema/defaults/meta)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts` (current public schema is knobs+advanced; `LOCAL-TBD-PR-M1-005` expands this to D08r)

### References
- docs/projects/pipeline-realism/resources/spec/sections/authoring-and-config.md
- docs/projects/pipeline-realism/resources/decisions/d08r-authoring-and-config-surface.md
- docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Current State (Observed)

- Studio is already schema-driven for recipe config overrides:
  - it imports `STANDARD_RECIPE_CONFIG_SCHEMA` / `STANDARD_RECIPE_CONFIG` from `mod-swooper-maps/recipes/standard-artifacts`,
  - it merges a skeleton + defaults + overrides, then validates via `normalizeStrict`.
  Anchors:
  - `apps/mapgen-studio/src/recipes/catalog.ts`
  - `apps/mapgen-studio/src/App.tsx` (`buildDefaultConfig(...)`)
- The current Foundation stage public schema is “knobs + advanced step config baseline”:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`
  This must be expanded by `LOCAL-TBD-PR-M1-005` to match D08r’s v1 authoring surface.

### Proposed Change Surface

- Studio:
  - Add a dedicated authoring view for the D08r surface (profiles/knobs/advanced) instead of forcing users to spelunk nested objects.
  - Add “jump to layer” shortcuts that select specific `dataTypeKey`s (does not change viz contract; it’s a UI affordance).
- Recipe artifacts:
  - Ensure `standard-artifacts` exports include the D08r surface (schema + defaults + uiMeta) and Studio consumes it.

### Pitfalls / Rakes

- Accidentally exposing derived/forbidden fields (velocities, belts, regimes) via the authoring surface or UI.
- Treating Studio as a correctness gate (viewer-dependent validation): D09r owns correctness; Studio is for interpretation/tuning.
- Non-deterministic config merges (must remain deterministic + shape-preserving under `normalizeStrict`).

### Wow Scenarios

- **Physics-first tuning:** an author tweaks “mantleProfile” and “plateActivity” and immediately sees causal changes through the mantle → plates → events → provenance spine, without ever touching a velocity vector.
