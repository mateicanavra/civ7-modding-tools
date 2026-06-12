# Config surface: elevation-based nesting + codified form rhythm

## Why

The user judged the config panel's padding/margins "really bad" and its
nesting/grouping representation poor — it should feel "smooth and slate", with
groups displayed flat on a proper surface-elevation scheme. Grounded diagnosis
(post spacing-substrate repair, which restores the *mechanism*):

1. **Nesting is an indent ladder, not a surface system.** Depth≥2 groups render
   as a heading plus `border-l` + `pl-2.5` — a code-editor idiom that stacks
   left rules, eats horizontal room at 340px, and contradicts the instrument's
   substrate-elevation language (system.md: depth is carried by lightness
   tiers, not lines).
2. **No chunking rhythm.** Within-field, field↔field, and group↔group spacing
   are near-identical ad-hoc gaps (`gap-0.5/1/1.5/2`), so the form has no
   Gestalt grouping — everything reads as one undifferentiated column.
3. Arrays use a different nested treatment (`bg-muted/40` boxes) than object
   groups, so sibling structures read as different species.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-3-design-fixes.md` (issues 3–4; D1 design)
- `apps/mapgen-studio/.interface-design/system.md` (§Pass-3 amendment: form
  surface elevation, form rhythm; §Foundation & depth: borders-only lightness tiers)

## What Changes

All in `src/features/configOverrides/rjsfTemplates.tsx` (+ the FORM constant):

- **Group wells replace indent ladders.** Depth≥2 object groups render as one
  recessed surface tier inside the stage card: tinted toward the page token
  (`bg-background/40`-class), `border-border-subtle`, rounded, padded. The
  `border-l` indent idiom is deleted. Deeper nesting (depth≥3) adds no further
  surfaces — eyebrow headings + rhythm only (two surface tiers maximum).
- **Arrays unify onto the same well treatment** as object groups.
- **Form rhythm is codified** in the FORM constant on the 4px base: 4px within
  a field block (label/input/description/help), 8px between fields, 12px
  between groups and between stage cards; group-well padding 8px; stage card
  padding stays `p-2.5`.
- Group headings move to the eyebrow tier (`text-label` uppercase muted) so
  field labels (foreground, Pass-2) remain the brightest scan anchors inside a
  card.
- `transparentPaths`, error/alert contracts, gs-comments rendering, and widget
  wiring are untouched (behavior parity).

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/src/features/configOverrides/rjsfTemplates.tsx`,
  `apps/mapgen-studio/test/config/rjsfFieldTemplateErrors.test.tsx` (class
  assertions), `.interface-design/system.md` (already amended in the frame).
