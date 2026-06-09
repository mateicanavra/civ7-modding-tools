## ADDED Requirements

### Requirement: Shell Renders Through Design Tokens

MapGen Studio SHALL render the shell/chrome — app root, header, brand, view
controls, the left dock (RecipePanel), the right dock (ExplorePanel), and the
footer/status strip — with surfaces, borders, and text resolved through design
system tokens rather than hardcoded hex palettes or a `lightMode`/`isLightMode`
class ternary, so the substrate-elevation hierarchy is felt and the theme flips
through the single `.dark` class.

#### Scenario: Floating docks ride the popover tier
- **WHEN** the header, brand, view-controls, recipe, explore, or footer chrome
  renders over the deck.gl map
- **THEN** its surface resolves from `bg-popover` (the floating-layer tier), its
  borders from `border`/`border-subtle`, and its text from
  `text-foreground`/`text-muted-foreground`
- **AND** it declares no hex color literal and no `lightMode`-gated class ternary
  for those surfaces

#### Scenario: Nested and inset surfaces use their tiers
- **WHEN** a nested sunken surface (the JSON config view) or a text input renders
  inside a dock
- **THEN** the sunken surface resolves from `surface-sunken` and the input from
  `input-background`, a felt step apart from the dock surface

#### Scenario: Theme flips through the single dark class
- **WHEN** the `.dark` class on `<html>` is toggled
- **THEN** the shell re-themes from the token values with no per-class
  `lightMode` branch driving its surface, border, or text colors

### Requirement: Single Slate Accent For Chrome Identity

MapGen Studio SHALL render chrome identity states in the shell (active toggles,
the dirty/modified emphasis ring, focus emphasis) through the single slate
`primary`/`ring` accent. Status indicators that report data about the map or the
live game SHALL keep their semantic hues, and a data-staleness call-to-action
SHALL use the `warning` token rather than the slate accent.

#### Scenario: Dirty and active states use the slate accent
- **WHEN** the Run control is dirty, or the auto-run toggle is active
- **THEN** its emphasis renders through `primary`/`ring` (the slate accent), not
  an ad-hoc orange

#### Scenario: Status dots keep semantic hues
- **WHEN** a generation/live status dot renders
- **THEN** running stays amber, error resolves from `destructive`, and
  ready/live-ok resolve from `success` — the semantic data the instrument reports

### Requirement: Shell Adopts The Canonical Primitives And Tooltips

The shell, the preset dialogs, and the rjsf widgets SHALL adopt the canonical
`src/components/ui` primitives at their call sites, native `title=` tooltips in
the shell SHALL be replaced by the shadcn `Tooltip` under a single
`TooltipProvider`, and the legacy `AlertDialog` and `ToastProvider`/`useToast`
SHALL be replaced by the shadcn `Dialog` and the sonner `Toaster`/`toast`.

#### Scenario: Native titles become token-styled tooltips
- **WHEN** a shell control that previously used a native `title=` attribute is
  hovered or focused
- **THEN** it shows a shadcn `Tooltip` (token-styled, delay-grouped under the
  shell `TooltipProvider`) instead of a native browser tooltip

#### Scenario: Dialog and toast use the canonical mechanisms
- **WHEN** the RecipePanel reset confirm, a preset error/save/confirm dialog, or
  a toast notification fires
- **THEN** it renders through the shadcn `Dialog` (reset/preset) or the sonner
  `Toaster` via `toast` (notifications), preserving the prior open/confirm/cancel
  and message semantics

### Requirement: Shell Reskin Preserves Behavior Parity

The shell reskin SHALL be presentation-only and SHALL NOT alter map generation,
deck.gl rendering, recipe semantics, run-in-game, the live-runtime poll
staleness/backoff gating, the localStorage schema, or browserRunner gating.

#### Scenario: Only presentation changes
- **WHEN** the reskin lands
- **THEN** the shell's props, callbacks, and control flow are unchanged, and map
  generation, deck.gl rendering, recipe semantics, run-in-game, the live-runtime
  poll staleness/backoff gating, the localStorage schema, and browserRunner
  gating behave exactly as before
