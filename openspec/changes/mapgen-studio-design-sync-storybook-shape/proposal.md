# Proposal: MapGen Studio Design-Sync — Storybook Shape Flip (Stage 2)

## Summary

Flip the `apps/mapgen-studio` claude.ai/design design-sync from `package` shape
to `storybook` shape so the Stage-1 Storybook stories become the
**screenshot-verified** preview source the Claude Design agent builds with. This
is **Stage 2** of the two-stage Storybook introduction; Stage 1 (the workbench +
46 design-sync-titled CSF stories) shipped as
`mapgen-studio-storybook-workbench` (PR #1991). Stage 2 changes the verification
*oracle* (rubric-graded authored previews → screenshot pairs against the repo's
own Storybook render) and re-syncs the existing project — it does **not**
re-author the stories or edit any component.

Today the live sync runs `shape: "package"`: 46 hand-authored
`.design-sync/previews/*.tsx` scenes graded on an absolute rubric. Stage 1
authored the 46 stories title-matched to the design-sync export names and group
categories precisely so this flip is a **no-re-author cutover**: the converter
compiles each story module (its fixtures, decorators, and local helpers come
along) against the shipped `dist/` bundle, and a compare harness screenshots
each story in a reference Storybook beside its generated preview until they
match.

Stage 2 also delivers a **runbook** so agents and humans have zero confusion
about how Storybook works in this repo, how to use it, how to keep the sync
effortless in both directions, and how to develop normally with all of it in
place.

## Authority

- **Direct user decision (this session, 2026-06-30):** execute the full Stage-2
  flip — flip the shape, screenshot-verify all 46, and **re-upload to the live
  project**, plus a documented runbook ("Full flip + re-upload").
- **Stage-1 change `mapgen-studio-storybook-workbench` (shipped; PR #1991).** Its
  `proposal.md` **Enables** entry and `design.md` **Stage 2 enabler** /
  `tasks.md` §8 define this flip as the deferred follow-on: the stories are
  authored design-sync-titled and statically renderable so Stage 2 is a cutover,
  not a re-author.
- **Design-sync skill + storybook-shape contract.** The bundled `design-sync`
  skill and the staged storybook-shape contract at
  `apps/mapgen-studio/.ds-sync/storybook/SKILL.md` govern the build → self-heal →
  compare → upload flow and the re-sync driver (`resync.mjs`).
- **Present-behavior evidence (not target authority):**
  `apps/mapgen-studio/.design-sync/config.json` (`shape: "package"`, the 46-entry
  `componentSrcMap`/`docsMap`, `overrides`, `projectId 531d158d-…`),
  `apps/mapgen-studio/.design-sync/NOTES.md` (the package-shape learnings +
  Re-sync risk watch-list), and the 46 `apps/mapgen-studio/src/**/*.stories.tsx`.

## Requires / Enables

- **Requires:** Stage 1 shipped — the 46 stories and a green `build-storybook`
  (branch `studio-storybook-workbench` / PR #1991). Stage 2 stacks on that branch
  (or on `main` once #1991 merges). Requires Playwright + a chromium binary
  (`DS_CHROMIUM_PATH` for the system Chrome — see NOTES.md).
- **Enables:** every design the Claude Design agent produces renders the studio's
  real components verified pixel-faithful to Storybook; design-sync maintenance
  collapses to a one-command re-sync (`resync.mjs`) where unchanged components
  cost nothing; a documented runbook makes the Storybook ↔ design-sync ↔ normal
  development loop legible to agents and humans.

## Product Scenario

A designer prompts the Claude Design agent at claude.ai/design; it composes
screens from the studio's real, on-brand components — each one screenshot-verified
against the studio's own Storybook, so what the agent renders matches what ships.
A studio developer who changes a component re-runs one command, sees exactly which
components re-verify, grades only those, and re-uploads — the sync stays current
without ceremony. A new contributor reads one runbook and knows how to run the
workbench, how the sync works, and how to keep both in step while developing
normally.

## What Changes

- **`config.json` shape flip.** `shape: "package" → "storybook"`, adding the
  storybook-shape keys: `storybookStatic` (`.design-sync/sb-reference`),
  `storybookConfigDir` (`.storybook`), `buildCmd`, and `titleMap` only where a
  story title does not already match its export name. `projectId`, `pkg`,
  `globalName`, `componentSrcMap`, `docsMap`, and the per-component `overrides`
  (cardMode/viewport/primaryStory) are preserved.
- **A reference Storybook** is built into `.design-sync/sb-reference/` as the
  fidelity oracle (never uploaded).
- **Screenshot-pair verification of all 46** via the converter + compare harness:
  build the bundle → self-heal build/validate to 0 → capture each story in the
  reference Storybook beside its generated preview → grade match/close/mismatch
  → iterate fixes (owned `.design-sync/previews/*.tsx` overrides, or
  `cfg.provider`/`storyImports`/`overrides`) until clean.
- **Re-sync the existing project** `531d158d-…` through the atomic re-sync path
  (pinned `projectId`): upload the storybook-shape bundle, cards, and
  `_ds_sync.json`; preserve the user-authored `explorations/` design
  (`deletePaths` scoped, never blanket).
- **`NOTES.md`** gains a storybook-shape section (the first storybook-shape prior
  art for this repo: reference-build command, chromium path, any per-component
  preview overrides authored).
- **A runbook** (extends `apps/mapgen-studio/README.md`, plus a focused
  `docs/`-style section if warranted): how Storybook works here, how to run/use
  it, how to re-sync in both directions, and how to develop normally.

## What Does Not Change

- **No component behavior changes.** A screenshot mismatch is fixed in the
  preview/fixture/config layer — never by editing a component implementation. If
  a mismatch exposes a genuine story bug, that is a Stage-1 story fix, surfaced
  explicitly, not silent re-authoring.
- **No story re-authoring as a strategy.** The 46 stories are consumed as
  authored. Wholesale story rewrites are a stop condition (they signal a broken
  Stage-1 assumption — stop and reconcile).
- **No new design project / projectId.** The existing `531d158d-…` project is
  reused; `create_project` is never called.
- **No daemon/server changes** (`apps/mapgen-studio/src/server/**`).
- **No deletion of the project's user-authored `explorations/`** design.

## Affected Owners

- This change owns the design-sync surface for the studio:
  `apps/mapgen-studio/.design-sync/**` (config, NOTES, owned previews,
  reference-build inputs), the storybook-shape verification run
  (`.ds-sync/**`, `ds-bundle/**` — both transient/gitignored), and the runbook.
- The studio components remain owned by their modules; Stage 2 consumes them
  read-only through the shipped `dist/` bundle.
- The 46 stories remain owned by Stage 1; Stage 2 consumes them as the preview
  source and does not edit them (barring an explicitly-surfaced story-bug fix).
- The claude.ai/design project `531d158d-…` is updated in place via the
  `DesignSync` tool.

## Expected Implementation Write Set

Implementation may touch only:

- `apps/mapgen-studio/.design-sync/config.json` (shape flip + storybook keys).
- `apps/mapgen-studio/.design-sync/NOTES.md` (storybook-shape learnings).
- `apps/mapgen-studio/.design-sync/previews/*.tsx` — **only** owned overrides
  authored to fix a specific screenshot mismatch (ideally none; each one is a
  recorded exception).
- `apps/mapgen-studio/.gitignore` (ensure `.design-sync/sb-reference/`,
  `.design-sync/.cache/`, `.design-sync/learnings/`, `.ds-sync/`, `ds-bundle/`,
  and the `.design-sync/node_modules` symlink are ignored).
- `apps/mapgen-studio/README.md` (and/or a `docs/` runbook section).
- This OpenSpec change path.
- The claude.ai/design project `531d158d-…` (uploaded artifacts — not a repo
  path).

## Protected Paths

- All studio component source (`src/components/**`, `src/ui/**`, `src/app/**`,
  `src/features/**`) — read-only; fixes land in the preview/config layer.
- `apps/mapgen-studio/src/**/*.stories.tsx` — consumed as Stage-1-authored;
  edited only for an explicitly-surfaced story bug, never re-authored wholesale.
- `apps/mapgen-studio/src/server/**` (daemon/server).
- The project's user-authored `explorations/` design — never deleted by the sync.
- Generated build inputs (`dist/**`, `dist/types/**`,
  `.design-sync/.cache/**`, `.design-sync/sb-reference/**`, `ds-bundle/**`) —
  regenerated, not hand-edited or committed.
- The foreign `.civ7/outputs/resources` (never staged), the codex/habitat
  Graphite stack, and the `studio_runner_parked` worktree pin.

## Stop Conditions

- Stories are being re-authored wholesale (a Stage-1 assumption broke — stop,
  diagnose, reconcile with the Stage-1 change before proceeding).
- A new claude.ai/design project or `projectId` is minted instead of reusing
  `531d158d-…`.
- A component implementation is edited to make a screenshot pair match (fix the
  preview/fixture/config, not the component).
- The sync's `deletePaths` would remove the project's `explorations/` design.
- An upload is attempted while any story is still `mismatch` (or `sb-error` /
  `unpaired` / `error`) and unresolved/unexplained.

## Verification Gates

The implementation phase must run and record, each with expected status, actual
status, oracle, bad case, and non-claims:

- Reference Storybook built: `.design-sync/sb-reference/iframe.html` exists and
  is > 10 KB.
- `node .ds-sync/package-build.mjs … --out ./ds-bundle` exits 0 (no unresolved
  `[TAG]` build errors).
- `node .ds-sync/package-validate.mjs ./ds-bundle` exits 0.
- `node .ds-sync/storybook/compare.mjs …` captures all 46 components; every story
  is graded and is `match` or `close` (each `close` carries a note of what's off
  and why it is not fixable); **no unresolved `mismatch`, `sb-error`, `unpaired`,
  or `error`**.
- Re-sync driver verdict (`resync.mjs`) is sane: `added`/`changed`/`deletePaths`
  explained; `explorations/` preserved.
- Upload: `finalize_plan` approved; the project shows the 46 storybook-shape
  cards + the uploaded `_ds_sync.json`.
- `bun run openspec -- validate mapgen-studio-design-sync-storybook-shape
  --strict`; `bun run openspec:validate`.
- `git diff --check` and a final clean `git status` (only the write set; no
  component edits; no foreign files staged).
- Runbook present, accurate, and self-contained.

Validation proves the design-sync builds, validates, and screenshot-verifies in
storybook shape, and that the project was re-synced; it does **not** prove
pixel-identity beyond the graded pairs, nor any in-game / runtime behavior.
