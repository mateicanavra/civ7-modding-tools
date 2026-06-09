## 1. ExplorePanel disclosure + slider names

- [x] 1.1 Drop the masking `aria-label` on the data-type group toggle so its accessible
      name is the visible group name; keep `aria-expanded`.
- [x] 1.2 Add `aria-controls` on the group toggle and wrap the group items in a
      container carrying the matching id.
- [x] 1.3 Give the era range slider `aria-label="Era"`.

## 2. RecipePanel Save & Deploy menu → Radix DropdownMenu

- [x] 2.1 Import `DropdownMenu*` from the design-system `components/ui` barrel.
- [x] 2.2 Replace the hand-rolled overlay (fixed backdrop button + plain buttons) with
      `DropdownMenu` / `DropdownMenuTrigger asChild` / `DropdownMenuContent` /
      `DropdownMenuItem`, preserving the exact actions + values and the
      `canDeletePreset` gate (disabled item when not deletable).
- [x] 2.3 Keep the controlled `showSaveMenu` open state so the existing
      `saveActionDisabled` force-close effect still applies.

## 3. rjsf field error association

- [x] 3.1 In `rjsfTemplates.tsx`, give the error block `id="${id}__error"` + `role="alert"`.
- [x] 3.2 In `rjsfWidgets.tsx`, add a shared `errorA11yProps(id, rawErrors)` helper and
      apply `aria-invalid` + `aria-describedby` to Text/Textarea/Number/Select/
      Checkbox/Switch widgets when `rawErrors` is present.

## 4. Skip-link target focusability

- [x] 4.1 Replace the `<main id="map-preview">` `display:contents` class with
      `absolute inset-0` so the skip target is laid out, focusable, and in the a11y
      tree, with no layout or z-stacking change.

## 5. Verification

- [x] 5.1 `bun run check` (tsc) clean.
- [x] 5.2 `bun run build` succeeds.
- [x] 5.3 `bun run test` — all tests green (no regression).
- [x] 5.4 Preview screenshots in dark and light confirm the theming repair holds and
      no console errors.
