## ADDED Requirements

### Requirement: The Theme Toggle Re-Themes The Chrome At Runtime

The resolved theme preference SHALL be synced to the `.dark` class on `<html>`
at runtime: cycling the theme control re-themes the chrome immediately, with the
`index.html` bootstrap owning only the pre-paint initial state.

#### Scenario: Cycling to light re-themes live
- **WHEN** the user cycles the theme control to an effective light preference
- **THEN** `<html>` loses the `dark` class without a reload and the chrome renders the light tokens

#### Scenario: Cycling to dark re-themes live
- **WHEN** the user cycles the theme control to an effective dark preference
- **THEN** `<html>` gains the `dark` class without a reload and the chrome renders the dark tokens

#### Scenario: Reload preserves the stored choice without flash
- **WHEN** the page reloads after the user chose a theme
- **THEN** the bootstrap applies the stored preference pre-paint and the runtime sync agrees with it
