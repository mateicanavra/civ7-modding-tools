## ADDED Requirements

### Requirement: No Unlayered Author CSS May Override The Utility Layer

The app SHALL NOT ship unlayered author CSS that overrides Tailwind's layered
utilities; `index.html` style content is limited to the pre-paint flash guard,
and element resets come only from Tailwind preflight.

#### Scenario: Spacing utilities render their declared values
- **WHEN** an element declares a Tailwind spacing utility (e.g. `px-3`, `p-2.5`, `my-1.5`)
- **THEN** its computed style reflects the utility (e.g. `px-3` ⇒ 12px inline padding), with no unlayered `*` reset zeroing it

#### Scenario: Pre-paint flash guard survives
- **WHEN** the page loads before React hydrates
- **THEN** the body still paints the dark flash-guard background and font stack from `index.html`

### Requirement: The Theme Bootstrap Mirrors The App's Preference Resolution

The pre-paint theme script SHALL read the same localStorage key the app writes
(`theme-preference`) and resolve it the same way `useTheme` does — explicit
light/dark wins; absent or `system` follows the OS preference; storage errors
fall back to dark.

#### Scenario: Light preference applies before first paint
- **WHEN** `localStorage["theme-preference"]` is `"light"` and the page loads
- **THEN** the bootstrap does not add the `dark` class, so no dark pre-paint flash occurs

#### Scenario: Absent key follows the OS preference
- **WHEN** no theme preference is persisted
- **THEN** the bootstrap adds the `dark` class exactly when the OS prefers dark, matching what the app will resolve after hydration
