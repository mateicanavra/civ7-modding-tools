## 1. Restore AppFooter diagnostics for AT + static markup

- [x] 1.1 Mirror each diagnostic Tooltip's text onto its visible `TooltipTrigger` via `aria-label` + in-DOM `title` (run-in-game request id/phase/failure/recovery, save/deploy status, live-sync hint, autoplay hint)
- [x] 1.2 Wrap the footer render in its own `TooltipProvider` so hints work with or without an ancestor provider (and bare static-markup mounts do not crash)
- [x] 1.3 Make `test/runInGame/AppFooter.test.tsx` fully green without weakening assertions (token-align the one stale `border-orange-400` assertion to `border-warning`)

## 2. Landmarks, live regions, and skip link

- [x] 2.1 ErrorBanner: `role="alert"` + `aria-live="assertive"`
- [x] 2.2 StudioShell: visually-hidden `aria-live="polite"` mirror of run/live status
- [x] 2.3 Wrap the canvas host in `<main aria-label="Map preview">`; docks render as `<aside>` with labels
- [x] 2.4 Visually-hidden skip-to-main link as the first focusable element

## 3. Disclosure + selection aria

- [x] 3.1 `aria-expanded` + `aria-controls` on ExplorePanel Stage/Step/Layers, RecipePanel Recipe/Config, AppHeader Setup headers
- [x] 3.2 `aria-current` on active Stage/Step/Layer items; `aria-pressed` on render-mode/space toggles

## 4. Token-driven controls + dead code

- [x] 4.1 Add `OptionSelect` adapter over the token-driven `src/components/ui/select`
- [x] 4.2 Migrate AppHeader World Size/Players/Config + setup selects to `OptionSelect`
- [x] 4.3 Migrate RecipePanel Recipe/Config selects to `OptionSelect`
- [x] 4.4 Re-skin rjsf widgets onto `src/components/ui` Input/Textarea/Checkbox/Switch/Select (drop `lightMode`, off-token `ring-gray-400`)
- [x] 4.5 Remove dead `src/ui/components/ui/AlertDialog.tsx` + its barrel re-export (confirmed no importers)

## 5. Type scale + stage craft

- [x] 5.1 Adopt `text-data`/`text-label` over `text-[11px]`/`text-[10px]` in AppHeader/RecipePanel/ExplorePanel
- [x] 5.2 Token-reference the CanvasStage backdrop (`bg-background`, luminance vignette/grid), drop the `lightMode` chrome ternary
- [x] 5.3 Reframe the empty stage as an intentional "awaiting matter" survey console (graticule + contour panel)

## 6. Verify parity

- [x] 6.1 `bun run check` clean (tsc --noEmit)
- [x] 6.2 `bun run build` succeeds incl. worker-bundle check
- [x] 6.3 `bun run test` fully green (8 AppFooter assertions pass; diagnostics in DOM)
- [x] 6.4 Live preview: no console errors
- [x] 6.5 OpenSpec strict validation passes
