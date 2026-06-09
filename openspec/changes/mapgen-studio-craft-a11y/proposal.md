## Why

The Radix Tooltip migration in the prior shell-reskin slice moved the AppFooter's
operational diagnostics (the Run-in-Game request id and failure reason, the
save/deploy status, the live-sync hint, the autoplay hint) into hover-only
`TooltipContent`. That content is rendered lazily on hover, so it is invisible to
assistive technology and absent from static markup — which both regressed
screen-reader access and turned 8 AppFooter static-markup parity assertions red.
The studio also lacked landmark structure, a skip link, live-region announcements,
and `aria-expanded`/`aria-controls`/`aria-current` on its collapsible sections and
selection lists. Finally, the live World/Players/Config and Recipe/Config dropdowns
plus the rjsf override widgets still rode the legacy `lightMode` + raw-hex native
`Select` (off-token `ring-gray-400`), and the empty deck.gl stage used hard-coded
backdrop hexes with a `lightMode` ternary.

This change is **presentation + accessibility only**: no behavior, logic, data, or
parity-critical flow is altered. It restores the diagnostics to the DOM (mirrored
onto the visible triggers as `aria-label`/`title`), adds the landmark/aria scaffold,
migrates the live select call sites + rjsf widgets onto the token-driven design
system primitives, removes the now-dead legacy `AlertDialog`, adopts the named type
scale, and reframes the empty stage as an intentional "awaiting matter" survey
console.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/FRAME.md` (§3 hard core, §4.2 design-system-first, §4.7 oRPC)
- `docs/projects/mapgen-studio-redesign/architecture/10-target-architecture.md` (§6 ts rigor, §7 do-not-break registry)
- `apps/mapgen-studio/.interface-design/system.md` (craft lever #3: "awaiting matter"; contour-by-luminance; named type scale)

## What Changes

- **AppFooter diagnostics restored for AT + static markup**: each diagnostic
  Tooltip's text is mirrored onto its visible `TooltipTrigger` as `aria-label`
  (and an in-DOM `title`) — the Run-in-Game request id / phase / failure reason /
  recovery hint, the save/deploy status, the live-sync hint, and the autoplay hint.
  The footer carries its own `TooltipProvider` so its hints work whether or not an
  ancestor provides one.
- **ErrorBanner** gains `role="alert"` + `aria-live="assertive"`; a visually-hidden
  `aria-live="polite"` region mirrors the volatile run/live status.
- **Landmarks + skip link**: the canvas host is wrapped in `<main aria-label="Map
  preview">`, the docks render as `<aside>` with labels, and a visually-hidden
  skip-to-main link is the first focusable element.
- **aria-expanded/aria-controls** on the collapsible section headers (ExplorePanel
  Stage/Step/Layers, RecipePanel Recipe/Config, AppHeader Setup); **aria-current**
  on active Stage/Step/Layer items; **aria-pressed** on the render-mode/space
  toggles.
- **Token-driven selects**: the live World Size / Players / Config dropdowns
  (AppHeader) and the Recipe / Config dropdowns (RecipePanel) migrate from the
  legacy `lightMode` native `Select` to the token-driven `src/components/ui/select`
  via a thin `OptionSelect` adapter; the rjsf override widgets re-skin onto the
  `src/components/ui` Input/Textarea/Checkbox/Switch/Select primitives.
- **Dead code**: the unused legacy `src/ui/components/ui/AlertDialog.tsx` is removed
  (no importers).
- **Type scale + stage craft**: ad-hoc `text-[10px]`/`text-[11px]` adopt the named
  `text-label`/`text-data` tokens in AppHeader/RecipePanel/ExplorePanel; the
  CanvasStage backdrop is token-referenced (`bg-background`, luminance vignette/grid)
  with the `lightMode` chrome ternary dropped, and the empty stage frames the map
  with a graticule + contour panel that reads as ready.

## Requires

- Design-system foundation, ui-primitives, shell-reskin, app-decompose, client-data,
  and app-shell slices — all already lower in the stack.

## Enables Parallel Work

- Subsequent rigor / dead-code / comment passes operate on an a11y-complete,
  fully token-driven chrome.

## Affected Owners

- `apps/mapgen-studio/src/ui/components/AppFooter.tsx`
- `apps/mapgen-studio/src/ui/components/AppHeader.tsx`
- `apps/mapgen-studio/src/ui/components/RecipePanel.tsx`
- `apps/mapgen-studio/src/ui/components/ExplorePanel.tsx`
- `apps/mapgen-studio/src/ui/components/OptionSelect.tsx` (new adapter)
- `apps/mapgen-studio/src/app/{StudioShell,CanvasStage,LeftDock,RightDock,ErrorBanner}.tsx`
- `apps/mapgen-studio/src/features/configOverrides/rjsfWidgets.tsx`
- `apps/mapgen-studio/src/ui/components/ui/{index.ts}` (drop AlertDialog re-export)
- `apps/mapgen-studio/test/runInGame/AppFooter.test.tsx` (token assertion)

## Forbidden Owners

- No change to map-generation, Deck.gl math, recipe semantics, or the run-in-game flow.
- No change to the live-runtime poll request-key staleness / adaptive backoff gating.
- No change to the localStorage schema or any data contract.
- No new hand-rolled `fetch`; live reads continue through the typed oRPC client.
- No change to the value plumbing of any control (selects/widgets emit the same
  authored values).

## Stop Conditions

- Any a11y/token change would require altering control value semantics or a
  parity-critical flow rather than presentation.

## Consumer Impact

Screen-reader and keyboard users get landmarks, a skip link, live-region
announcements, labelled controls, and disclosed expand/select state; the footer's
operational diagnostics are present in the DOM again. Sighted users see a
token-consistent chrome and an intentional empty stage. No behavior changes.

## Verification Gates

- `bun run check` (tsc --noEmit) clean.
- `bun run build` succeeds, including the worker-bundle check.
- `bun run test` fully green (the 8 previously-red AppFooter assertions pass without
  weakening; the diagnostics are genuinely in the DOM).
- Live preview renders with no console errors.
- OpenSpec strict validation.
