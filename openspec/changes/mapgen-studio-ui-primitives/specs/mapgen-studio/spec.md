## ADDED Requirements

### Requirement: Canonical Token-Driven Primitive Library

MapGen Studio SHALL provide a canonical primitive library at
`src/components/ui/` whose components are styled exclusively through the design
system tokens and the `cn` helper, with no hardcoded color palettes, no
`createTheme` runtime interpolation, no `lightMode` prop, and no
`prefers-color-scheme` theming.

The library SHALL include: button, input, textarea, label, select, switch,
checkbox, tooltip, dialog, dropdown-menu, popover, tabs, separator, scroll-area,
and a sonner-based toast (Toaster). It SHALL be barrel-exported from
`src/components/ui/index.ts`.

#### Scenario: A primitive consumes only tokens
- **WHEN** any primitive in `src/components/ui/` renders
- **THEN** its surface, border, text, and focus styling resolve from design
  system tokens (e.g. `bg-card`/`bg-popover`/`bg-input-background`,
  `border-border`/`border-subtle`/`border-strong`, `text-foreground`/
  `text-muted-foreground`, `ring`)
- **AND** it declares no hex color literal, no `dark:` variant, no `lightMode`
  prop, and no `prefers-color-scheme` rule

#### Scenario: Theme flips through the single dark class
- **WHEN** the `.dark` class on `<html>` is toggled
- **THEN** every primitive, including the sonner Toaster, re-themes from the
  token values without any per-component prop or remount

#### Scenario: Barrel export surfaces the library
- **WHEN** a consumer imports from `@/components/ui`
- **THEN** Button, Input, Textarea, Label, Select, Switch, Checkbox, Tooltip,
  Dialog, DropdownMenu, Popover, Tabs, Separator, ScrollArea, Toaster, and
  `toast` are available

### Requirement: As-Built Density And Contour-Focus Signature

The primitive library SHALL preserve the as-built dense dimensions and SHALL
render focus and active states as luminance contours rather than saturated
fills, with the one filled action reserved for the primary Button.

#### Scenario: Dense dimensions are preserved
- **WHEN** Button, Input, and Switch render at their defaults
- **THEN** Button is `h-8` (default) / `h-7` (sm), Input is `h-7` with 11px
  (`text-data`) type, and Switch is 36×20
- **AND** in-surface controls use the 4px radius while floating layers
  (dialog/popover/dropdown/tooltip/select content/toast) use the 8px radius and
  the only shadows in the system

#### Scenario: Focus is a contour ring
- **WHEN** a primitive receives keyboard focus
- **THEN** it draws a 1px ring in the `--ring` token (a luminance step), not a
  saturated glow block

#### Scenario: Active tab is a contour rule
- **WHEN** a Tabs trigger is the active tab
- **THEN** it is marked by a thin primary underline rule, not a filled slab

### Requirement: Named Type Scale Resolves Independent Of Color

MapGen Studio SHALL define the named type-scale utilities `text-data` (11px) and
`text-label` (10px) as font-size theme tokens, and the `cn` helper SHALL treat
them as font-size utilities so that a co-applied text color utility cannot
override the font size.

#### Scenario: Size and color compose
- **WHEN** a primitive applies both a named size (`text-data`) and a text color
  (`text-foreground`) through `cn`
- **THEN** the rendered element keeps the 11px size AND the foreground color
- **AND** neither utility clobbers the other

### Requirement: Additive Introduction Without Call-Site Changes

The primitive library SHALL be introduced additively and SHALL NOT alter map
generation, deck.gl, recipe semantics, run-in-game, the live-runtime poll
gating, the localStorage schema, or browserRunner gating, and SHALL NOT swap any
existing component call site.

#### Scenario: Behavior parity is preserved
- **WHEN** the primitive library and its supporting token/`cn` additions land
- **THEN** no existing call site is migrated to the new primitives in this change
- **AND** map generation, deck.gl rendering, recipe semantics, run-in-game, the
  live-runtime poll staleness/backoff gating, the localStorage schema, and
  browserRunner gating are unchanged
