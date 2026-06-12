## ADDED Requirements

### Requirement: Icon Controls Always Render A Glyph From The Icon System

Every icon-only control SHALL render a visible lucide-react glyph — no empty
icon-sized placeholders and no second icon system — with the grid visibility
toggle rendering the grid glyph.

#### Scenario: Grid toggle shows its glyph

- **WHEN** the view controls render
- **THEN** the grid visibility toggle contains a lucide grid icon sized to
  its cluster (`w-4 h-4`)

#### Scenario: No empty icon placeholders anywhere

- **WHEN** the app shell renders
- **THEN** no visible icon-only button has an empty body (excluding switch
  primitives, whose thumb is the body)
