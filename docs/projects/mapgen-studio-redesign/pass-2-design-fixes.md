# Pass 2 — Design Fixes (visually-grounded, spec-driven)

> Standalone frame for the Pass-2 design-fix workstream. Survives compaction.
> Authored 2026-06-11 from a direct visual inspection of the running app
> (dark, 1600×950, dev server :5173) plus DOM measurements — not from code alone.
> Parent frame: [FRAME.md](FRAME.md). Goal ledger: [00-GOAL.md](00-GOAL.md).

## Why this pass exists (reframe diagnostic)

Pass 1 (the 16-slice redesign stack through `design/a11y-fixes`) committed to
"preserve as-built dimensions, re-skin onto shadcn"
(`apps/mapgen-studio/.interface-design/system.md` §Component patterns). That
constraint shipped the old skeleton under new paint: the left dock is still the
pre-redesign `w-[280px]`, the header still reserves a stale 104px band, and the
rjsf form still reads as a wall of same-size same-color text. The user's verdict
after Pass 1: the UI is **"squished"** and the redesign is **not functionally
complete**.

**Named reframe move: constraint relaxation.** Pass 2 releases the
"preserve as-built chrome geometry" constraint. What stays inviolate: the dense
instrument DNA (micro-typography, tight controls), the token system, and behavior
parity on the data/runtime seams.

## Frame

- **Objective:** the chrome reads as a machined instrument that makes way for the
  map — measured by a fresh screenshot passing the squint test (clear hierarchy,
  nothing cramped, nothing dead) and the user no longer calling it squished.
- **Hard core (cannot move):** run/poll/localStorage/transport semantics
  (FRAME.md §3, architecture/10 §7); token-driven styling only (no raw palette);
  Graphite-only, stack never submitted; one OpenSpec change per slice, validated
  `--strict`; tests green at every slice tip.
- **Exterior (deliberately out):** StudioShell container/presentational split
  (stabilization round), parallel-stack feature integration (control-oRPC
  binding), Bun server cutover (supervised), token *values* (P1 settled them),
  resizable/dockable panels (structural alternative — see below).
- **Falsifier:** if after C1+C2 land a fresh screenshot still reads squished,
  this frame is wrong — the problem is then the floating-panel paradigm itself,
  and the fix is a structural relayout (docked sidebars), a new frame, not more
  patching inside this one.
- **Structural alternative considered:** replacing floating docks with true
  docked sidebars (CSS grid shell). Rejected for this pass: it changes the
  product's "instrument floats over the chart table" identity, invalidates the
  panel-over-map backdrop blur language, and is not needed to clear the observed
  defects. Revisit only if the falsifier fires.

## Observed issues → changes (one change per issue; root fixes preferred)

Two root causes resolve six of the nine observed issues:

- **Geometry is encoded in stale constants** (`LAYOUT.HEADER_HEIGHT: 104`
  hard-reserved via `minHeight` even though a ResizeObserver already measures the
  real header; `PANEL_WIDTH 280` inherited verbatim from pre-redesign) → **C1**.
- **The form has no typographic hierarchy primitives** (labels and help both
  `text-data text-muted-foreground`; rjsf's always-truthy `errors` element
  renders ~40 empty `role="alert"` regions) → **C2**.

| # | Observed (visual inspection 2026-06-11) | Change | OpenSpec id |
|---|---|---|---|
| 1 | Left dock 280px; helper text wraps 3–4 lines; form cramped | C1 | `mapgen-studio-layout-geometry` |
| 2 | ~88px dead band between header and docks (stale 104px reserve) | C1 | 〃 |
| 3 | Left panel cuts content mid-sentence at scroll edge; no affordance | C1 | 〃 |
| 4 | Labels and help text same size + same color → wall of gray | C2 | `mapgen-studio-form-hierarchy` |
| 5 | 40 empty always-mounted `role="alert"` live regions | C2 | 〃 |
| 6 | Two simultaneous "Run" CTAs (RecipePanel bottom + footer) | C3 | `mapgen-studio-run-console` |
| 7 | Footer "Bal" reads as accidental truncation | C3 | 〃 |
| 8 | Render/Space rows are unbounded icon clusters; read as decoration | C4 | `mapgen-studio-explore-toolbar` |
| 9 | First Run appears to produce an empty black canvas (Foundation/Mesh default) | C5 | `mapgen-studio-first-run-visibility` |

Slice order (Graphite, stacked on `design/a11y-fixes`):
C1 → C2 → C3 → C4 → C5. Each slice: OpenSpec change validated `--strict`,
implementation, focused tests, visual check on :5173, `gt create` commit.
Final gate: full suite + tsc + dark & light screenshots of every changed surface.

## Verification contract

A change in this pass is done only when **seen**: screenshot (or measured DOM
delta) of the running app demonstrating the fix, in dark and light where
theming is implicated. Code-only or test-only proof does not close a slice.
