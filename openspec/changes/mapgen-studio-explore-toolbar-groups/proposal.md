# Explore toolbar: group controls by target (view vs data) + relocate debug

## Why

The explore panel's bottom toolbar mixes four different control targets with
no visible organization: camera (Fit), map overlay (Edges), selected-data
presentation (Render, Space, Era, Variant, Overlay), and a DATA-*list* filter
(Debug). The layout zig-zags (Fit/Edges left, Render right; Space left, Debug
right), so the user reads it as an unordered pile of icon buttons. Verified in
code: `showDebugLayers` feeds `buildStepDataTypeModel(..., { includeDebug })` —
it changes which entries the DATA list shows, not how the map renders, so it
is misplaced in a view toolbar. Inventory found no senseless controls; the
defect is categorization and presentation, not existence.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-3-design-fixes.md` (issues 7–8; D3 inventory table)
- `apps/mapgen-studio/.interface-design/system.md` (§Pass-3 amendment: explore
  toolbar groups; Pass-2 segmented-control pattern)

## What Changes

All in `src/ui/components/ExplorePanel.tsx`:

- **Two eyebrow-labeled clusters** replace the zig-zag rows:
  - **VIEW** — Fit to view (camera), Edges overlay toggle (map display).
  - **DATA** — Render segment, Space segment, then the conditional
    data-scoped rows (Era, Variant, Overlay + opacity) under the same cluster.
- **Consistent row anatomy**: label-left / control-right within each cluster
  (no more right-aligned-label-over-control vs left-aligned variants).
- **Debug toggle relocates to the DATA section header** (beside the count),
  because it filters that list; same icon, aria, and tooltip semantics.
- No control is removed; all handlers, aria labels, tooltips, and
  segmented-control active treatments are preserved.

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/src/ui/components/ExplorePanel.tsx`
