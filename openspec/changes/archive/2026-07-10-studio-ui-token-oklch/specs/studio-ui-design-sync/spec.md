## MODIFIED Requirements

### Requirement: Authored Color And Alias Tokens Carry Full Values Consumed As var()

Authored color tokens in `@swooper/mapgen-studio-ui` SHALL declare complete,
self-contained CSS color values in the canonical `oklch(…)` color space (for
example `--primary: oklch(0.52775 0.04306 258.355)`) rather than bare channel
triplets or another color function, and every downstream consumer — the
`@theme inline` map, base and component CSS rules, and TS/TSX inline styles —
SHALL reference them as `var(--token)` and MUST NOT re-wrap a token in a color
function (`hsl(var(--token))`, `oklch(var(--token))`). Authored alias tokens
SHALL carry a bare `var(--other-token)` reference as their value and be consumed
identically as `var(--token)`. Opacity-modified consumption of an authored token
SHALL use `color-mix(in oklab, var(--token) N%, transparent)`.

A migration of the authored color space (for example the `hsl(…)` → `oklch(…)`
re-authoring) SHALL be pixel-preserving: each converted value MUST render the
byte-identical 8-bit sRGB it rendered before, verified per value, so that no
component grade drifts. Changing the rendered colors (a palette re-tune) is a
separate, deliberate design decision and is not a value-form migration.

This requirement is additive over the authored/framework partition verified by
the `studio-ui-token-noise-disposition` change — every custom property in
`dist/styles.css` classifies as an authored token pinned by name, kind, and
scope, or as a framework-owned property — which remains in force unchanged; this
requirement constrains the value form on top of that partition and does not
relax it.

#### Scenario: An authored color token is declared
- **WHEN** a color token is added or re-authored in the package theme CSS
- **THEN** its declared value is a full `oklch(…)` color value, not a bare
  channel triplet or a `hsl(…)` value
- **AND** the package token guard accepts only canonical
  `oklch(L C H)` values with finite unsigned decimal components (each with an
  integer part), `L` in `[0,1]`, nonnegative `C`, and `H` in `[0,360)`
- **AND** that guard accepts valid multidigit chroma and rejects a bare
  triplet, `hsl(…)`, malformed/empty values, and values outside those ranges

#### Scenario: A color-space migration is applied
- **WHEN** authored color values are converted from one color space to another
  (for example `hsl(…)` → `oklch(…)`)
- **THEN** each converted value renders the byte-identical 8-bit sRGB it did
  before the conversion, verified per value
- **AND** the component compare grades carry with no drift attributable to the
  conversion

#### Scenario: A component consumes an authored token
- **WHEN** the `@theme inline` map, a CSS rule, or a TS/TSX inline style
  references an authored color or alias token
- **THEN** it uses `var(--token)` directly
- **AND** it does not wrap the token in a color function such as
  `hsl(var(--token))` or `oklch(var(--token))`

#### Scenario: A consumer applies an opacity modifier to a token
- **WHEN** a consumer needs a translucent form of an authored color token
- **THEN** it composes it as `color-mix(in oklab, var(--token) N%, transparent)`
- **AND** it does not rely on channel-triplet slash-alpha
  (`hsl(var(--token) / a)`) or on compile-time-only `--alpha()`

#### Scenario: The classifier reads an authored color token after migration
- **WHEN** the design app's token classifier processes the migrated
  `dist/styles.css`
- **THEN** authored color tokens present a recognizable CSS color value
  (`oklch(…)`, a full color function)
- **AND** they are not forced to the `"other"` kind by a bare channel triplet

#### Scenario: The name, kind, and scope partition is preserved
- **WHEN** the package token guard runs after the value-form migration
- **THEN** it still fails on any custom property that is neither an authored
  token pinned by name and kind nor a framework-owned property
- **AND** the value-form re-pin only tightens the per-kind value-shape check,
  leaving the name/kind/scope partition intact
