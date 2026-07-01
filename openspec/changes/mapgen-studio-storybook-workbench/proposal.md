# Proposal: MapGen Studio Storybook Component Workbench (Stage 1)

## Summary

Stand up Storybook as an isolated component workbench and living-docs surface
for `apps/mapgen-studio`. This is **Stage 1** of a two-stage Storybook
introduction: Stage 1 builds the Storybook instance, the global decorators, and
authored CSF stories for the studio's presentational component surface. The
deferred **Stage 2** (a separate change) flips the existing claude.ai/design
design-sync from `package` shape to `storybook` shape so those same stories
become the screenshot-verified preview source.

Storybook is currently absent from the repo (no `.storybook/`, no `*.stories.*`,
no `@storybook/*` dependency). The studio's presentational components are
unusually well-suited to isolation: the design-sync already enumerated a
**46-component syncable surface**, and almost all of those components are
pure prop-driven leaves whose state is hoisted to `StudioShell`/stores. A
near-complete set of validated render fixtures already exists at
`apps/mapgen-studio/.design-sync/previews/*.tsx`; Stage 1 adapts those into
co-located CSF stories rather than authoring from scratch.

Stage 1 changes no component behavior. It adds a workbench around the existing
components; it does not modify them to fit the workbench.

## Authority

- **Direct user decision (this session, 2026-06-28):** introduce Storybook as a
  full design-system surface — workbench + verified design-sync source + living
  docs — sequenced **workbench-first, sync-flip deferred** to a later stage.
- `docs/projects/studio-shell-decomposition/FRAME.md`, **Appendix B** —
  establishes Storybook as an independent track from the StudioShell
  decomposition; the decomposition produces non-visual controller hooks and
  therefore no Storybook material, so the two tracks do not gate each other.
- **StudioShell decomposition stack (PRs #1960–#1988, tip `aa389e317`) — merging
  upstream; look-ahead verified 2026-06-30.** A four-lane analysis of that stack
  vs `main` confirmed the two-layer separation holds: the decomposition is an
  orchestration-layer refactor (16 `src/app/hooks/*` controller hooks; host
  2117→940) that changes **who produces** props, not the leaves that consume
  them. All six touched presentational story targets (`sonner`, `ExplorePanel`,
  `RecipePanel`, `PresetDialogs`/`PresetSaveDialog`, `SchemaConfigForm`,
  and `PipelineStage` via the new orchestration-only `prunePipelineExpansion`)
  have **unchanged prop interfaces** — internal-only changes (effect→render-phase
  store-prev-value, rules-of-hooks reordering, sonner→`useSyncExternalStore`). The
  five decorator-mirror sources (`StudioProviders`, `main.tsx`, `lib/query.ts`,
  `useTheme.ts`, the three stores) are unchanged. Net: Stage 1 must **author
  against the post-merge component versions** but needs no plan change — only the
  refinements folded into this change (the `biome` React rules, the sonner/theme
  decorator note, the `PipelineStage` fixture invariant).
- **Design-sync prior art (present-behavior evidence):**
  `apps/mapgen-studio/.design-sync/config.json` (`shape: "package"`, the
  46-entry `componentSrcMap`, `projectId 531d158d-…`),
  `apps/mapgen-studio/.design-sync/previews/*.tsx` (46 hand-authored isolated
  render scenes), `apps/mapgen-studio/.design-sync/NOTES.md` (per-component
  provider/fixture notes), and the design-sync storybook-shape contract at
  `apps/mapgen-studio/.ds-sync/storybook/SKILL.md`.
- **Current studio source (present-behavior evidence, not target authority):**
  `apps/mapgen-studio/src/app/StudioProviders.tsx`,
  `apps/mapgen-studio/src/main.tsx`, `apps/mapgen-studio/vite.config.ts`,
  `apps/mapgen-studio/src/lib/{orpc,query}.ts`,
  `apps/mapgen-studio/src/stores/*`, `apps/mapgen-studio/components.json`.

## Product Scenario

A studio developer or designer opens the workbench to view, exercise, and review
every presentational component in isolation — in light and dark theme, across its
load-bearing visual states — without booting the daemon, the live game runtime,
or the full app shell. A reviewer uses the same surface as living documentation
of the component library. Because the stories are authored to a design-sync-
compatible shape, a later stage can promote them to the verified preview source
the claude.ai/design agent builds with, with no re-authoring.

## What Changes

- **A Storybook 9 instance** (`@storybook/react-vite`) is added to
  `apps/mapgen-studio`, configured to reuse the app's Vite toolchain (aliases,
  Tailwind v4 plugin, tsconfig paths) and to run **without** the daemon, the
  `/rpc` proxy, or the live runtime.
- **A global decorator/preview layer** supplies the studio's real rendering
  context: theme (`.dark` class + `index.css` + the Inter/JetBrains-Mono
  fonts), `TooltipProvider`, a per-story `QueryClientProvider`, the `Toaster`,
  and a per-story Zustand store reset utility. A theme toolbar toggles
  light/dark.
- **Authored CSF stories** for the in-scope component surface — the ~40
  isolatable components (Tier 1 + Tier 2 from the census) plus best-effort
  Tier-3 fixtures — adapted from the existing `.design-sync/previews/*.tsx`
  fixtures and `NOTES.md`. Stories are co-located (`src/**/*.stories.tsx`) and
  titled to match the design-sync component export names.
- **A small story-support module** (decorators, a `mockWidgetProps()` factory
  for the rjsf widget cluster, and a static `RecipeDagResult` fixture for
  `PipelineStage`) so the entangled-but-pure components can be storied without
  live data.
- **Nx targets** `storybook` and `build-storybook` defined as `package.json`
  `nx` targets, matching the studio's existing inference-only target convention.
- **Autodocs** enabled so each story tree doubles as living component docs.

## What Does Not Change

- **No component behavior changes.** Components are not modified to render in
  isolation; if a component needs context, the story supplies a decorator or
  mock, and if it cannot render statically it is excluded with a recorded
  reason. (StudioShell and the controller glue are untouched — that surface
  belongs to the separate StudioShell-decomposition workstream.)
- **No design-sync shape flip.** Stage 1 does not touch
  `apps/mapgen-studio/.design-sync/`, `.ds-sync/`, or `ds-bundle/`, does not
  change `config.json` `shape`, and does not run the screenshot re-verify. The
  live design-sync remains `package` shape until **Stage 2**.
- **No daemon/server changes** (`apps/mapgen-studio/src/server/**`).
- **No new design-system / syncable components are minted.** The component
  surface is the existing 46-component set.
- **No `@nx/storybook` plugin, and no `project.json` minted by this change** —
  Stage 1 keeps the studio's current inference-only Nx targets. (The Habitat
  toolkit stack — unmerged, deferred — will later convert the studio to an
  explicit `project.json`; the two Storybook targets are authored to migrate into
  it then, not duplicated for it now. See `design.md` §8.)

## Affected Owners

- This change owns the Storybook configuration, the global decorator/preview
  layer, the story-support fixtures, the authored stories, and the two Nx
  targets.
- The studio components remain owned by their existing modules; this change
  consumes them read-only (adds stories beside them, does not edit them).
- The design-sync pipeline (`.design-sync/`, `.ds-sync/`, the `DesignSync`
  tool, `projectId 531d158d-…`) remains owned by the design-sync workstream;
  Stage 2 — not this change — flips its shape.

## Expected Implementation Write Set

Implementation may touch only:

- `apps/mapgen-studio/.storybook/**` (new: `main.ts`, `preview.tsx`, any
  manager/theme config).
- `apps/mapgen-studio/src/storybook/**` (new: decorators, `mockWidgetProps`
  factory, `RecipeDagResult` fixture, store-reset helper).
- `apps/mapgen-studio/src/**/*.stories.tsx` (new, co-located beside the
  components they cover).
- `apps/mapgen-studio/package.json` (add `@storybook/*` devDependencies and the
  `storybook` / `build-storybook` `nx` targets).
- `bun.lock` (generated by the dependency add).
- `apps/mapgen-studio/.gitignore` (ignore `storybook-static/`).
- `biome.json` only if a stories-specific override is required for generated
  story patterns.
- This OpenSpec change path.

## Protected Paths

- All existing studio component source (`src/components/**`, `src/ui/**`,
  `src/app/**`, `src/features/**`) — read-only; this change adds stories beside
  components, it does not edit component implementations.
- `apps/mapgen-studio/src/server/**` (daemon/server).
- `apps/mapgen-studio/src/app/StudioShell.tsx` and `StudioProviders.tsx`
  implementations.
- The design-sync surface: `apps/mapgen-studio/.design-sync/**`,
  `apps/mapgen-studio/.ds-sync/**`, `apps/mapgen-studio/ds-bundle/**` — Stage 2
  owns any change here.
- The in-flight design-sync PR stack draining to `main`.
- Generated outputs, `dist/**`, Nx cache, lockfiles except the `bun.lock`
  delta caused by the Storybook dependency add.
- `apps/mapgen-studio/vite.config.ts` — inherited via `viteFinal`, not edited.

## Branch Hygiene

This change set (the definition docs) is committed now to a **fresh Graphite
branch off `main`** (`studio-storybook-workbench`). Two upstream stacks gate the
**implementation** (the stories + config), not this definition commit:

1. The design-sync PR stack — **drained** (merged to `main`, tip `5aa6ccf7c`).
2. The StudioShell decomposition stack (PRs #1960–#1988) — **merging next**.

After the StudioShell stack merges, **re-stack** this branch onto the new `main`
(`gt sync`/restack) so implementation authors stories against the integrated
component versions. Story implementation does not begin until that re-stack lands
(it is the only place the post-merge `sonner`/`biome`/panel changes matter). The
definition commit carries no `apps/mapgen-studio` source, so it re-stacks cleanly
(it touches only `openspec/changes/**`). The foreign `.civ7/outputs/resources`
file is never staged.

## Enables

- **Stage 2** — design-sync `package → storybook` shape flip: the authored,
  design-sync-titled, statically-renderable stories become the screenshot-
  verified preview source (one full re-verify of the 46-component set, reusing
  the existing `projectId`).
- Ongoing isolated component development, review, and visual QA.
- Living component documentation via Storybook autodocs.

## Stop Conditions

- A story triggers a live `/rpc` or daemon call (the workbench must run with no
  daemon; data-reaching components are mocked or excluded).
- A component's implementation is modified to make it render in isolation
  (parity violation — story around it, do not rewrite it).
- The design-sync `shape` is flipped or `.design-sync`/`.ds-sync`/`ds-bundle`
  is modified (that is Stage 2).
- **This change** introduces `@nx/storybook` or mints a `project.json` (the
  later Habitat-driven `project.json` migration is out of Stage 1's scope — a
  downstream handoff, not a violation).
- React StrictMode is forced around deck.gl / canvas stories.
- An orchestration host (`StudioShell`, `StudioProviders`, `DeckCanvas`) is
  given a story.

## Validation Gates

The implementation phase must run and record, each with expected status, actual
status, oracle, bad case, and non-claims:

- `bun run openspec -- validate mapgen-studio-storybook-workbench --strict`
- `bun run openspec:validate` (full OpenSpec records)
- `build-storybook` completes (static build succeeds, `iframe.html` emitted).
- Storybook dev server serves and the in-scope stories render with **no console
  errors** and no attempted `/rpc` calls (daemon not running).
- Theme toggle renders both light and dark; a Tooltip-using component renders
  visible (not silently blank) — TooltipProvider decorator present.
- Biome check passes on the new `.storybook`, story-support, and `*.stories.tsx`
  files.
- Studio typecheck passes with the stories present.
- `git diff --check` and a final clean `git status` (only the expected write
  set).

Validation proves OpenSpec artifact shape and that Storybook builds/renders; it
does **not** prove design-sync storybook-shape verification (Stage 2) or any
in-game / runtime behavior.
