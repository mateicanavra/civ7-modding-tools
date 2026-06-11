## ADDED Requirements

### Requirement: Render And Space Options Present As Segmented Controls

The explore panel's Render and Space option sets SHALL render as bounded
segmented controls — an inset container on the control-background token wrapping
the options, with the active option lifted one surface tier — while preserving
each option's accessible name, tooltip, and `aria-pressed` state.

#### Scenario: Bounded container with raised active segment
- **WHEN** the view toolbar renders the Render options
- **THEN** the options sit inside one container styled with the inset control background and hairline border
- **AND** the selected option renders one surface tier above the container with foreground text
- **AND** unselected options stay flush with the container

#### Scenario: Semantics preserved
- **WHEN** the user inspects any Render or Space option
- **THEN** it keeps its `aria-label`, tooltip, and `aria-pressed` reflecting selection
- **AND** activating it fires the same selection callback as before

#### Scenario: Independent toggles stay independent
- **WHEN** the toolbar renders fit-to-view, edges, and debug-layer toggles
- **THEN** they are not wrapped in segmented containers (independent actions, not exclusive options)
