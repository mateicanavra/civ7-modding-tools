# Recipe pipeline (DAG) as a first-class stage view in the redesigned Studio

## Why

The recipe-DAG visualization merged to main (PRs #1587–#1591) against the
pre-redesign Studio: its chrome mounts through the deleted App.tsx monolith,
hard-codes a `lightMode` palette, and hangs view state off monolith
`useState`. The handoff spec
(`docs/projects/graphite-stack-integration/DAG-STUDIO-REDESIGN-HANDOFF.md`)
directs this lane to re-express the surface natively in the redesign — "an
additional tab that shows the recipe DAG" — while preserving the merged
code's semantics verbatim. The merged code is the semantic source of truth;
the redesign's design system is the authority on shape.

## Target Authority Refs

- `docs/projects/graphite-stack-integration/DAG-STUDIO-REDESIGN-HANDOFF.md`
  (§2 invariants, §3 re-express list, §5 non-goals, §6 mandate)
- `openspec/changes/mapgen-recipe-dag-visualization/` (the merged feature's
  own workstream — what the feature committed to)
- `apps/mapgen-studio/.interface-design/system.md` (design-system authority)

## What Changes

- **Stage-view switcher** (new navigation primitive): a floating segmented
  control at the top-center of the stage area — `Map | Pipeline` — using the
  established segmented-control idiom (Pass-2 explore-toolbar), popover-tier
  chrome. The DAG is the *Pipeline* view of the authored recipe; the map is
  the *Map* view of its output. Zoning v2 is untouched: the switcher is
  stage furniture, not Game-bar or World-console content.
- **`features/recipeDag/PipelineStage.tsx`** (new): the redesigned stage
  component. Re-expresses `RecipeDagView.tsx`'s chrome on design tokens
  (single `.dark` class, no `lightMode` palette forks for chrome) while
  preserving every interaction semantic listed in handoff §2.6: stage
  selection separate from step expansion, click-again unselect, selectable
  per-artifact connector labels with trunk-before-fan-out projection, focus
  dimming with active elements rising, context-aware label placement, and
  diagnostics surfacing. Domain lane fills/accents keep coming from the
  preserved `domainPresentation.ts` (data color, where real color belongs).
- **Pipeline console strip**: the old `RecipeDagStatsBar` re-expressed as a
  floating instrument strip inside the stage (identity + Phases · Stages ·
  Edges · Issues, warn tone only when issues exist).
- **Data layer re-home**: `useRecipeDagQuery(recipeId, enabled)` on TanStack
  Query (`['recipeDag', recipeId]`, fetch on first activation, cached per
  recipe, typed error surface) replacing the monolith's hand-rolled
  fetch/cancellation state. Transport unchanged: the preserved oRPC client
  at `STUDIO_RECIPE_DAG_ORPC_PATH`.
- **View state re-home**: `viewStore` (Zustand, browser-only view state per
  the client-data crisp rule) gains `stageView`, `pipelineSelectedStageId`,
  `pipelineExpandedStageIds`. Connector-label selection stays
  component-local, as in the merged code.
- **Explore dock scoping**: the right Explore dock is map-scoped
  (stage/step run navigation, render/space layers); it hides while the
  Pipeline view is active. The left Recipe dock (the DAG's input), the Game
  bar, and the World console stay. The map canvas stays mounted (hidden) so
  camera state and in-flight runs are unaffected — behavior parity.
- **`RecipeDagView.tsx` deleted** with its test; the semantic assertions of
  `RecipeDagView.test.tsx` are ported onto `PipelineStage` in the same
  change (handoff §4 gate note).
- **Preserved untouched**: `layout.ts`, `domainPresentation.ts`,
  `artifactPresentation.ts`, `client.ts`, all of `server/recipeDag/*`,
  `shared/recipeDagOrpc.ts`, the vite middleware, and
  `packages/mapgen-core` recipe-dag projection + tests.

## Non-Goals (binding, handoff §5)

- No changes to the projection contract or oRPC schema.
- No runtime/execution overlay on the DAG.
- No edits to preserved headless modules beyond imports from new call sites.

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/src/features/recipeDag/{PipelineStage.tsx,useRecipeDagQuery.ts}`
  (new), `RecipeDagView.tsx` (deleted), `apps/mapgen-studio/src/ui/components/StageViewTabs.tsx`
  (new), `apps/mapgen-studio/src/stores/viewStore.ts`,
  `apps/mapgen-studio/src/app/StudioShell.tsx`,
  `apps/mapgen-studio/test/recipeDag/PipelineStage.test.tsx` (ported pins)
