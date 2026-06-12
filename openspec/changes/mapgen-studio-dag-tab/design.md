# Design — Pipeline stage view

## The boundary question: where does a view switcher live?

Zoning v2 (system.md): top bar = Game, bottom bar = World/Map console, left
dock = Recipe authoring, right dock = Explore. None of these owns "which
stage view is showing" — it is not a game setting, not a map parameter, not
recipe authoring, and not a map-explore control. It is **stage furniture**:
the stage area itself chooses what it presents. So the switcher floats at
the stage's top edge, centered, in the same popover-tier pill chrome as the
docks/consoles, using the segmented-control idiom established for
Render/Space (C4). Labels: `Map` (Map glyph) and `Pipeline` (Workflow
glyph) — "Pipeline" is the product noun for what the recipe DAG *is* to a
map author; the accessible name keeps "recipe dependency graph".

## Stage composition (StudioShell)

- `stageView === "map"`: today's stage, unchanged. The switcher renders
  above it.
- `stageView === "pipeline"`: `CanvasStage` stays MOUNTED but visually
  hidden (`hidden` on its wrapper) — deck camera state and any in-flight
  run/poll loops are untouched (behavior parity is hard core).
  `PipelineStage` renders into the same stage rect. The right Explore dock
  does not render (every control in it is map-scoped); left dock, Game bar,
  World console persist — running a generation while reading the pipeline
  is legitimate and keeps working.

## Chrome re-expression (PipelineStage)

| Old (RecipeDagView) | New |
| --- | --- |
| `createPalette(lightMode)` hex forks | design tokens + `.dark` (chrome); neutral edge ink exported as `PIPELINE_EDGE_INK` (luminance token string) for the static-markup pins |
| `topInset` prop + absolute overlay over the whole app | a stage child in the shell's stage rect; shell owns geometry |
| `RecipeDagStatsBar` in the header accessory slot | floating console strip inside the stage, top-right: `Workflow` identity + recipe title · Phases · Stages · Edges · Issues (warn tone iff > 0) |
| `CenteredState` loading/error cards (hex) | token cards in the awaiting-matter idiom (border-border, bg-popover, muted text) |
| cyan kicker/icon accents | slate chrome accent (`--primary`); domain accents stay data-driven from `domainPresentation` |

What does NOT change (handoff §2.3–2.6, verbatim semantics):

- `buildRecipeDagLayout` / `buildArtifactEdgeLabels` /
  `resolveEdgeLabelPositions` / `pointsToPath` consumed as-is; rank
  columns, phase bands, bundled-trunk edges, deterministic label fanning.
- Stage selection vs step expansion; click-again unselects; expansion is a
  compact animated detail shelf (`aria-expanded`, `aria-controls`,
  `data-stage-expanded`, max-height transition).
- Connector labels: one per provided artifact, selectable
  (`aria-pressed`, `data-edge-label-selected`), selection activates every
  branch carrying the artifact + endpoints; focus hides unrelated labels;
  active stages/labels rise (z-order); idle connectors stay neutral;
  selected-destination pulls split labels toward that branch (this lives in
  the preserved `layout.ts`).
- Domain glyph + accent contract across nodes, lane labels, edge pills,
  step chips, diagnostics (preserved `domainPresentation` /
  `artifactPresentation`).
- Diagnostics panel (kind + domain glyph + artifact label, first 6).

## Data: TanStack Query owns the fetch

`useRecipeDagQuery(recipeId, { enabled })` → `queryKey: ["recipeDag",
recipeId]`, `queryFn: client.recipeDag.get({ recipeId })`, `staleTime:
Infinity` (the DAG only changes when authored code changes → page reload),
`enabled: stageView === "pipeline"`. This is the old monolith behavior
(lazy fetch on tab activation, cache keyed by recipe, error surface) with
the stale-response guard and cancellation handled by the query cache
instead of hand-rolled state. The module-root `QueryClientProvider`
(client-data slice) already hosts it. One oRPC client instance per module
(same as the merged code's module-scope client).

## State: the crisp rule

`stageView`, `pipelineSelectedStageId`, `pipelineExpandedStageIds` are
browser-only view state with no server coupling → `viewStore` (Zustand),
NOT persisted, setters mirror `useState` signatures. They are
pipeline-scoped names — the existing `selectedStageId` (map-explore
selection) is a different concept and stays untouched. Connector-label
selection remains `useState` inside `PipelineStage` (it resets with the
component, as merged).

## Test porting map (RecipeDagView.test.tsx → PipelineStage.test.tsx)

Kept verbatim (semantics): title render; `aria-pressed="true"` on selected
stage; `aria-expanded` + `aria-controls` + `data-stage-expanded`; expanded
z-order above graph; active `marker-end` arrow + domain-accent stroke
(`#f59e0b` comes from preserved `domainPresentation`, still assertable);
`aria-label="Select dependency hydrography"` + `data-edge-label-selected`;
`Step 1: seed` + `Creates` in the shelf; neutral-before-selection (neutral
ink, no accent border-color, default marker). Re-expressed: hex palette
assertions become token/`PIPELINE_EDGE_INK` assertions. The shared fixture
DAG moves over unchanged.

## Slices

1. `design/dag-tab-frame` — this workstream record (docs only).
2. `design/dag-tab-stage` — implementation + ported tests + old view
   deletion, gates green, visual verification dark + light.
3. Ledger/system.md amendments ride slice 2 (decision records are part of
   the change).
