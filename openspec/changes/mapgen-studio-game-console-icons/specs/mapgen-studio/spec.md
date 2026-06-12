## ADDED Requirements

### Requirement: Game Console Commands Are Icon-Only With Accessible Names

Game console command buttons (autoplay, Explore, Run in Game) SHALL render
icon-only, and every state the removed labels carried (start/stop/in-flight
autoplay wording; the dynamic Run in Game action label including recovery
variants) SHALL remain available via `aria-label`, `title`, and Tooltip.
Glyphs: autoplay start `FastForward`, stop `Square`, in-flight spinner; Run in
Game `SquareArrowOutUpRight`.

#### Scenario: Autoplay states survive as accessible names
- **WHEN** the autoplay button renders in start, stop, or in-flight state
- **THEN** it shows only the state's glyph and its accessible name states the action (start/stop Civ7 autoplay, or that a request is in flight)

#### Scenario: Run in Game recovery actions survive as accessible names
- **WHEN** a failed or blocked operation makes the primary action "Retry Run" or "Restart Civ & Run"
- **THEN** the icon-only button's accessible name leads with that action label

### Requirement: The Game Console Offers An Explore Button

The game console SHALL render an icon-only Explore button (`Binoculars`,
tile visibility) between autoplay and the Run in Game group, disabled with an
accessible name announcing unavailability until a handler is wired.

#### Scenario: Explore renders with the command set
- **WHEN** the game console renders
- **THEN** an Explore button with the `Binoculars` glyph renders after the autoplay button and before the Run in Game status/action group

#### Scenario: Explore without a handler is announced unavailable
- **WHEN** no Explore handler is provided
- **THEN** the button renders disabled and its accessible name says tile-visibility control is not yet available
