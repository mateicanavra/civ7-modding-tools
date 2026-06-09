## Context

Four residual P2 accessibility defects in the studio chrome, all markup-only. The
hard core (architecture/10 §7) is behavior parity: map-gen, deck.gl, recipe
semantics, run-in-game, live poll, and the localStorage schema must not change. Each
fix is constrained to presentation/semantics.

## Decisions

### 1. Group disclosure: drop the override, don't rename it

The toggle previously set `aria-label={expanded ? "Collapse group" : "Expand group"}`.
An `aria-label` *replaces* the element's content as its accessible name, so the
visible group label was never announced. The accessible state (expanded/collapsed) is
already carried by `aria-expanded`, which assistive tech narrates separately — so the
override was pure loss. Removing it lets the visible `<span>{group.label}</span>`
become the accessible name. `aria-controls` is added pointing at a new wrapper `<div>`
around the group's items (id derived from the group key via a slug), completing the
disclosure contract. The chevron is marked `aria-hidden`.

The era `<input type="range">` had no label, no wrapping `<label>`, and no
`aria-labelledby` target (the "Era" eyebrow span is a sibling, not associated). The
minimal correct fix is `aria-label="Era"`.

### 2. Save & Deploy: Radix DropdownMenu, controlled, parity-preserving

The hand-rolled menu is replaced by the existing `src/components/ui/dropdown-menu`
(Radix) primitive. Radix supplies `role="menu"`/`menuitem`, Escape-to-close,
roving-tabindex arrow navigation, type-ahead, and focus trap + restore.

Parity rules honored:

- **Same actions, same values.** Each `DropdownMenuItem`'s `onSelect` calls the exact
  same prop callback as before (`onSaveToCurrent`, `onSaveAsNew`, `onExportPreset`,
  `onImportPreset`, `onDeletePreset`). Radix closes the menu on select, so the prior
  explicit `setShowSaveMenu(false)` per item is no longer needed — same net effect.
- **`canDeletePreset` gate.** Previously: a real button when deletable, an inert
  muted `<div>` otherwise. Now: a single `DropdownMenuItem` that is `disabled` when
  `!canDeletePreset` — same "visible but non-actionable" outcome, now with correct
  `aria-disabled` semantics.
- **Controlled open state kept.** `DropdownMenu open={showSaveMenu}
  onOpenChange={setShowSaveMenu}` preserves the existing
  `useEffect(() => { if (saveActionDisabled) setShowSaveMenu(false); }, …)` so the
  menu still force-closes when another Studio operation starts.
- The trigger stays a design-system `Button` (via `DropdownMenuTrigger asChild`),
  still wrapped in the Tooltip, with its `aria-label` retained. The redundant
  hand-set `aria-haspopup`/`aria-expanded` are dropped because Radix now supplies them.

### 3. rjsf errors: id on the message, describedby on the control

RJSF passes `rawErrors: string[]` to both the FieldTemplate and the widget. The
FieldTemplate owns the rendered error node, so it gets `id="${id}__error"` +
`role="alert"` (an assertive live region, appropriate for validation). The widgets own
the input, so a shared `errorA11yProps(id, rawErrors)` helper applies `aria-invalid`
+ `aria-describedby="${id}__error"` only when `rawErrors` is non-empty (so the
reference never dangles). The error block's *render condition* is unchanged (`errors`
truthiness), preserving exactly when the message appears.

### 4. Skip target: real box instead of display:contents

`display:contents` makes an element generate no box, so it is unfocusable and
unscrollable — the skip link's `href="#map-preview"` had no landing box. The `<main>`
is changed from `className="contents"` to `className="absolute inset-0"`. Because the
sole child (`CanvasStage`) is itself `absolute inset-0` and positions against the
nearest positioned ancestor, nesting it inside an `absolute inset-0` `<main>` fills the
identical rectangle — the visual layout is unchanged. Z-stacking is preserved: header
and footer are `z-20`, docks `z-10`, and the `<main>`/canvas remain `z-auto` (0) and
earlier in DOM order, so the chrome still paints above the canvas.

## Risks / Trade-offs

- **Radix portal vs. prior in-flow menu.** The Radix content renders in a portal; the
  previous menu was a sibling. Visually it remains a `popover`-tier card anchored to
  the trigger (`align="end" side="top"`), matching the prior `bottom-full right-0`
  placement. No behavior depends on the menu's DOM location.
- **`role="alert"` on errors.** Assertive announcement on validation is the intended,
  standards-aligned behavior and does not change when/whether the message renders.

## Migration

Pure in-place edits to four files (`ExplorePanel.tsx`, `RecipePanel.tsx`,
`rjsfTemplates.tsx`, `rjsfWidgets.tsx`) plus the `<main>` class in `StudioShell.tsx`.
No data migration, no schema change.
