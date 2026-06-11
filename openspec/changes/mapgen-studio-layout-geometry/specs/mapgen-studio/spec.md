## ADDED Requirements

### Requirement: Chrome Geometry Derives From The LAYOUT Constants

Mapgen Studio chrome geometry (dock widths, header offset, footer reserve) SHALL
derive from the `LAYOUT` constants in `src/ui/constants/layout.ts`, with no
duplicate hardcoded arbitrary-value width/height classes in the panel components,
and the constants SHALL match what actually renders.

#### Scenario: Recipe dock width is 340 from PANEL_WIDTH
- **WHEN** the recipe dock renders
- **THEN** its panel width is `LAYOUT.PANEL_WIDTH` (340px), applied from the constant rather than a hardcoded class

#### Scenario: Explore dock width matches its constant
- **WHEN** the explore dock renders
- **THEN** its panel width is `LAYOUT.EXPLORE_PANEL_WIDTH` (260px), and the constant equals the rendered width

### Requirement: The Header Reserve Is Content-Driven

The header SHALL NOT force a static height reserve. The docks' top offset SHALL
derive only from the measured header height (ResizeObserver) plus spacing, so no
dead band exists between the header and the docks.

#### Scenario: Docks sit one spacing unit below the real header
- **WHEN** the app renders with a single-row header bar
- **THEN** the dock top offset equals `SPACING + measuredHeaderHeight + SPACING`
- **AND** the measured header height reflects content (≈48px single-row), not a `minHeight: 104` reserve

#### Scenario: Header wrap still pushes docks down
- **WHEN** the viewport narrows enough that the header controls wrap to more rows
- **THEN** the docks move down to remain below the header (the ResizeObserver pipeline is preserved)

### Requirement: Docks Span The Working Column Between Header And Footer

Both docks SHALL be constrained to the column between the header and the footer:
panels MAY shrink to fit short content but SHALL NOT exceed the column or
underlap the footer, and overflow SHALL scroll internally.

#### Scenario: Recipe panel uses the full column instead of a magic cap
- **WHEN** the recipe panel's content exceeds the available column height
- **THEN** the panel fills the column (top to footer reserve) and scrolls internally
- **AND** the former `max-h-[calc(100vh-180px)]` magic cap is gone

#### Scenario: Explore panel cannot underlap the footer
- **WHEN** the viewport is short enough that the explore panel's content exceeds the column
- **THEN** the explore panel caps at the column height and scrolls internally rather than rendering beneath the footer

### Requirement: The Recipe Scroll Edge Carries A Fade Affordance

The recipe panel's scrollable body SHALL render a token-driven bottom fade while
further content exists below the fold, so a scroll cut never reads as the end of
the form.

#### Scenario: Fade visible above the fold
- **WHEN** the recipe form has content below the visible scroll area
- **THEN** a gradient fade (panel surface token, not a hardcoded color) overlays the bottom scroll edge
- **AND** the fade does not intercept pointer events
