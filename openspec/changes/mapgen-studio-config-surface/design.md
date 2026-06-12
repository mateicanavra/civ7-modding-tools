## Context

The config form is the instrument's main working surface (Pass-2 made the dock
340px for it). Its nesting idiom predates the design system: headings +
`border-l` indents, with arrays on a divergent muted-box treatment. The user
asked for a ground-up pass: flat, "slate feeling", elevation-based grouping.
This slice lands AFTER the spacing-substrate repair, so declared paddings
actually render; values below were chosen against the restored baseline.

## Decisions

### 1. Recess, don't raise

Wells tint toward the page token (`bg-background/40` over `card`), not toward
`muted` (which is *lighter* than card and reads as raised chips). The
instrument language is machined slots in a slate bezel: panel (popover 11%) →
stage card (card 9%) → group well (≈7% effective). Controls keep their own
input-background wells inside, which stay legible on the darker ground.

### 2. Two surface tiers, hard cap

Schema nesting is unbounded; surface nesting is not. Stage→group gets the only
two tiers. Depth≥3 groups render heading + rhythm inside the parent well.
Rationale: each recess step costs contrast budget against the 4–5% lightness
range the whole substrate lives in; three tiers would either crush text
contrast or force lighter tints that read as raised.

### 3. One rhythm constant

`FORM.rhythm` (names, not numbers, at call sites): `fieldGap` 4px ⇒ `gap-1`,
`siblingGap` 8px ⇒ `gap-2`, `groupGap` 12px ⇒ `gap-3`, well padding `p-2`.
The root object template and stage card content adopt `siblingGap`; group/stage
boundaries adopt `groupGap`. This makes the Gestalt chunking auditable in one
place instead of scattered `gap-*` literals.

### 4. Heading tier inversion

Today depth-2 headings are `text-xs font-semibold text-foreground` — brighter
than field labels were before Pass-2, and competing with them after. Inverted:
group headings become eyebrows (`text-label` uppercase, muted), the well's
geometry carries the grouping, and field labels stay the brightest scan line.
Stage titles keep `text-sm font-semibold` (the card already separates them).

## Risks

- Well tint over `card` must survive light mode (`background` is *lighter*
  than `card` in light theme, so `bg-background/40` raises instead of
  recesses there). Verify both themes; if light mode inverts, use an explicit
  token pair or `dark:` variant — decided at implementation against the
  running app, recorded in the slice.
- 340px minus card padding minus well padding leaves ~280px for field rows —
  wider than the pre-Pass-2 panel total; acceptable.
