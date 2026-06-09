## ADDED Requirements

### Requirement: Studio UI Uses A Single Tokenized Design System

MapGen Studio SHALL express interface color, elevation, border, radius, and focus
through a single set of named design tokens defined once in `:root` (light) and
`.dark` (dark), rather than per-component hardcoded values or multiple disagreeing
palettes.

#### Scenario: Tokens are the source of truth

- **WHEN** the design system is established
- **THEN** background, foreground, card, popover, muted, primary, border, input,
  ring, destructive, and radius are defined as HSL tokens in `:root` and `.dark`
- **AND** a single committed accent (elevated cool-steel slate) is used for
  primary action and active/focus states
- **AND** the legacy `--color-*` variables referenced by focus, scrollbar, and
  select styles resolve to those same tokens

#### Scenario: Foundation does not break existing components

- **WHEN** the token + Tailwind v4 + shadcn foundation is added
- **THEN** components still styled with arbitrary hex utilities render unchanged
- **AND** no component behavior is modified by this change

### Requirement: Studio Surfaces Use A Felt Substrate-Elevation Hierarchy

The design system SHALL encode a substrate-elevation tier scale and a border
progression such that page, panel, nested, and floating surfaces are perceivable
as a hierarchy without any element visually shouting.

#### Scenario: Hierarchy survives the squint test

- **WHEN** surfaces are rendered using the elevation tokens
- **THEN** page → panel → nested → floating each occupy a distinct (whisper-quiet)
  lightness tier
- **AND** floating layers (dialog, popover, toast) carry shadow while in-page
  surfaces rely on the border progression
- **AND** structure remains perceivable when interface detail is blurred

### Requirement: Studio Theming Uses A Single `.dark` Class Strategy

MapGen Studio SHALL select light or dark theme via a single `.dark` class on the
document root, applied before first paint, rather than OS `prefers-color-scheme`
coupling or runtime-interpolated theme classes.

#### Scenario: Theme is deterministic and flash-free

- **WHEN** the app loads
- **THEN** the stored theme (default dark) is applied to the document root before
  first paint
- **AND** toggling the theme switches the `.dark` class with no per-component prop
  threading

#### Scenario: Focus renders as a contour signature

- **WHEN** an interactive element receives keyboard focus
- **THEN** focus renders as a 1px contour ring using the ring token (a luminance
  step above the chrome), not a saturated glow block
