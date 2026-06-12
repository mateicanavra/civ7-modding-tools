## ADDED Requirements

### Requirement: The Document Root Carries The Pre-Paint Theme

The flash guard SHALL set both the background color and `color-scheme` on
the root element (not only `body`) before any stylesheet loads, in the
theme the user will resolve to, so the browser's between-navigations clear
color matches the app theme and a refresh never flashes the opposite
luminance.

#### Scenario: Dark user refreshes without a white flash

- **WHEN** a dark-theme user reloads the studio
- **THEN** the root element computes the dark page background and
  `color-scheme: dark` before the first paintable frame

#### Scenario: Light user refreshes without a dark flash

- **WHEN** a light-theme user reloads the studio
- **THEN** the theme script's root override (light background +
  `color-scheme: light`) applies during head parsing, before first paint
