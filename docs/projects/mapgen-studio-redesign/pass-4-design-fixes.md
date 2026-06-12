# Pass 4 — Game console dock, console icon set, config collapse

> Frame for the fourth user-grounded fix wave (2026-06-11, late). Same
> discipline as Passes 2–3: OpenSpec slice per change, Graphite stack (never
> submitted), a change is done only when SEEN in the running app.
>
> NEW standing meta-rule this pass (user, saved to persistent memory): a
> pointed-out issue is **categorical by default** — fix the class across the
> codebase (grep + live UI inspection + screenshots), not just the cited
> instance, and report the sweep.

## E1 — Game console placement (deliberated, decided: colocate, not merge)

The user flagged the bottom-right Game console as misplaced: run-in-game
controls should live near the world-config toolbar that parameterizes the
launch. Two named options: **(A)** merge everything into one top bar, **(B)**
keep the console separate but colocated under the world bar. Decision: **B**.

- **A is geometrically impossible at common widths.** Measured in the live
  app at 1600px: world bar ≈ 930px, game console ≈ 580px, plus brand and view
  controls. One row cannot hold both; flex-wrap would fold A into a two-row
  layout — i.e. A devolves into B while destroying the input/console boundary.
- **Kind mismatch.** The world bar is an *input strip* (selects + disclosure);
  the Game console is *live status + commands* (chips, relation badges,
  actions). Merging mixes instrument readouts into a settings row; the Pass-3
  consoles split exists precisely to keep ownership legible.
- **The vertical zoning story is better than the old one.** Top zone = the
  GAME: world definition (inputs to both studio generation and live launches)
  with the live-game console directly beneath it. Bottom zone = the STUDIO
  iteration loop (status · last run · seed · reroll · auto-run · Run). The
  sync bridge (live chip click + stale ring) stays on the Game console; its
  effect on studio state remains visible because applying it flips the studio
  console to Modified.
- **Acknowledged tensions** (user named both): the sync button straddles
  contexts — it *observes* the game and *writes* studio state; it lives with
  what it observes (same rule that placed the debug toggle on the Data list in
  Pass 3). The studio seed staying at the bottom is correct, not awkward: the
  seed is a studio-iteration input; the world bar carries no studio-run
  controls.

Mechanics: `AppHeader` gains a `gameConsole` **slot** (ReactNode) rendered as
a centered row under the world bar (after the transient setup panel, so the
disclosure stays attached to its button); `StudioShell` composes `GameConsole`
there and the footer drops its right zone (back to a simply-centered studio
console). The header height observer (`onHeaderHeightChange` → `panelTop`)
already reflows the side panels — the setup panel uses the same mechanism.
Known cost: side panels start ~48px lower. Footer keeps the
`isRunInGameRunning`/`isSaveDeployRunning` booleans (shared operation gating
on seed/reroll/run is behavior parity).

## E2 — Console buttons: icon-only + Explore (decided)

| Button | Now | Becomes | Why |
|---|---|---|---|
| Start/Stop Auto | `Bot`/`Square` + text | icon-only `FastForward` (start) / `Square` (stop) | double-triangle is the game-UI convention for "the game advances itself"; `Bot` read as a chatbot. Alternates weighed: `Repeat` (loop without play), `IterationCw` (iteration, obscure at 14px). |
| Run in Game | `MonitorPlay` + text | icon-only `SquareArrowOutUpRight` | the action materializes the config and launches the external Civ7 app — the canonical "open out" glyph carries exactly that; `Rocket` off-style, `ExternalLink` reads hyperlink. |
| Explore (NEW) | — | icon-only `Binoculars`, disabled placeholder | tile visibility/exploration; `Eye` is reserved by convention for layer-visibility toggles. Renders now so the three-button set is judged together; behavior lands later behind an optional handler prop. |

Icon-only contract (categorical): every icon-only control carries
`aria-label` + `title` + Tooltip — already the console pattern (retry,
diagnostics, reroll, auto-run). Labels that encoded state ("Start Auto",
"Run again…") move into the aria-label/title strings unchanged. Primary CTAs
keep labels (Run, Save & Deploy, Setup disclosure) — the class going
icon-only is *secondary repeated-use actions in dense consoles*.

## E3 — Config-object collapse/expand + per-object header (cohesive feature)

Planned as one feature with its own `design.md` in the slice; decisions fixed
here:

- **Collapsed by default, everywhere.** Every config object (top-level stage
  groups and nested child objects) renders as a header row; users expand
  manually. No forced auto-expansion.
- **Sticky auto-expand is an opt-in toggle** in the existing config toolbar,
  **default OFF**: when ON, scrolling expands an object as its header reaches
  the sticky line and collapses it as it scrolls past, cascading into nested
  objects.
- **Both modes:** focused (single stage shown — children still
  collapse/expand) and unfocused (entire config).
- **Per-object header row is a first-class concept** (chevron + title +
  trailing action zone). It is the future home of object-local actions —
  Reset-to-defaults and Show-JSON migrate there from the global config
  toolbar in a later slice; this pass establishes the anatomy.
- Substrate facts that make this tractable: we own all three rjsf templates
  (`rjsfTemplates.tsx`); D1's well system already gives each object a bounded
  surface to collapse to; `fieldPathId.path` gives stable per-object keys for
  an expansion map.

## Slices (stacked on design/explore-toolbar-groups)

1. `design/pass4-frame` — this doc + system.md amendment.
2. `design/game-console-dock` — **E1** (`mapgen-studio-game-console-dock`).
3. `design/game-console-icons` — **E2** (`mapgen-studio-game-console-icons`).
4. `design/config-collapse` — **E3** (`mapgen-studio-config-collapse`, with
   design.md).

Verification contract unchanged: per slice — OpenSpec `--strict`, tsc, vitest
green, live visual proof on :5173; final — dark + light screenshots.

## Falsifier

If the docked console makes the top zone read cluttered or steals too much
map height at common widths, fall back to right-aligning it under the view
controls or returning it to the footer (the slot makes relocation cheap). If
icon-only buttons fail the squint test (indistinguishable at a glance), the
icons are wrong — iterate glyphs, don't restore labels. If collapse-by-default
makes the form feel empty/hidden, flip the default for top-level objects only;
the sticky mode stays opt-in regardless.
