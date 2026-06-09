## Why

The prior `mapgen-studio-craft-a11y` slice added the landmark/aria scaffold, but a
focused accessibility pass surfaced four residual P2 defects in the chrome:

1. The ExplorePanel data-type **group disclosure** carried an `aria-label`
   ("Collapse group" / "Expand group") that *overrode* the visible group name, so
   assistive tech announced the toggle as an anonymous "Collapse group" instead of
   the group it controls. The era range slider had no accessible name at all.
2. The RecipePanel **Save & Deploy** popup was a hand-rolled overlay: a fixed
   backdrop button plus a stack of plain `<button>`s. It had no menu semantics, no
   Escape handling, no arrow-key navigation, and no focus trap/restore.
3. The rjsf override **field errors** rendered as free-standing text with no
   programmatic association to their input, so a screen reader never announced the
   validation message against the control it belongs to.
4. The **skip-link target** (`<main id="map-preview">`) used `display:contents`,
   which removes the element from the box tree — the browser cannot focus or scroll
   to it, so the skip link landed nowhere.

This change is **presentation + accessibility (markup) only**: no behavior, logic,
control values, run-in-game flow, live poll, or localStorage schema is altered.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/FRAME.md` (§3 hard core = behavior parity; §4.2 design-system-first)
- `docs/projects/mapgen-studio-redesign/architecture/10-target-architecture.md` (§7 do-not-break registry)
- `apps/mapgen-studio/.interface-design/system.md` (design system is the single UI source of truth; `src/components/ui` primitives)

## What Changes

- **ExplorePanel group disclosure accessible name**: the data-type group toggle's
  accessible name is now the visible group name (the masking `aria-label` is
  dropped; expand/collapse state stays on `aria-expanded`), and it gains
  `aria-controls` pointing at the rendered group list, which is wrapped in a
  container with the matching id. The **era range slider** gains `aria-label="Era"`.
- **RecipePanel Save & Deploy popup → Radix `DropdownMenu`**: the hand-rolled
  overlay is replaced by the `src/components/ui/dropdown-menu` primitive, so the menu
  gets `role="menu"`/`menuitem`, Escape, roving arrow-key focus, and focus
  trap/restore for free. The action set and values are preserved exactly (Save &
  Deploy → `onSaveToCurrent`, As… → `onSaveAsNew`, Export… → `onExportPreset`,
  Import… → `onImportPreset`, Delete Scratch → `onDeletePreset`, gated by
  `canDeletePreset`). The controlled open state is retained so the existing
  "force-close while another operation runs" effect still applies.
- **rjsf field error association**: each field's error block in `rjsfTemplates.tsx`
  gains `id="${id}__error"` + `role="alert"`, and the corresponding input in
  `rjsfWidgets.tsx` sets `aria-invalid` + `aria-describedby="${id}__error"` whenever
  RJSF reports `rawErrors` for that field.
- **Skip-link target made focusable**: the `<main id="map-preview">` host drops
  `display:contents` for an `absolute inset-0` fill (identical to the CanvasStage it
  wraps), so it stays in the a11y tree and is focusable via `tabIndex={-1}` without
  changing the visual layout or z-stacking (header/footer `z-20`, docks `z-10`, the
  main/canvas remain `z-auto`).

## Out Of Scope / Parity Guarantees

- No map-generation, deck.gl, recipe, run-in-game, live-poll, or localStorage change.
- No `createTheme`, `lightMode` prop, `getFormTheme`, or raw-hex palette introduced.
- The RecipePanel menu's emitted actions and the rjsf form's emitted config are
  byte-for-byte unchanged; only markup/semantics differ.
