# Grid toggle icon + icon-rendering consistency

## Why

The ViewControls grid toggle rendered a literal empty `<div className="w-4
h-4" />` where its glyph belongs — an invisible button body (the user saw an
empty "Hide grid" control). Treated categorically per the standing rule:
icons must render through the one icon system, with no empty placeholders.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-5-design-fixes.md` (X2)
- `apps/mapgen-studio/.interface-design/system.md` (icon contract: lucide-react
  is the sole icon system)

## What Changes

- `ViewControls` grid toggle renders `Grid3x3` (lucide, `w-4 h-4` matching
  its cluster).
- Categorical sweep (src + live DOM): no other empty icon-sized
  placeholders, no inline `<svg>`, no non-lucide icon libraries. The only
  other glyph-less visible button is the overrides `Switch`, whose thumb is
  its body by design.

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/src/ui/components/ViewControls.tsx`
