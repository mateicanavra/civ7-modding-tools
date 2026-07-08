## ADDED Requirements

### Requirement: Authored Color And Alias Tokens Carry Full Values Consumed As var()

Authored color tokens in `@swooper/mapgen-studio-ui` SHALL declare complete,
self-contained CSS color values (for example `--primary: hsl(216 18% 44%)`)
rather than bare channel triplets, and every downstream consumer — the
`@theme inline` map, base and component CSS rules, and TS/TSX inline styles —
SHALL reference them as `var(--token)` and MUST NOT re-wrap a token in a color
function (`hsl(var(--token))`). Authored alias tokens SHALL carry a bare
`var(--other-token)` reference as their value and be consumed identically as
`var(--token)`. Opacity-modified consumption of an authored token SHALL use
`color-mix(in oklab, var(--token) N%, transparent)`.

This requirement is additive. The authored/framework partition verified by the
`studio-ui-token-noise-disposition` change — every custom property in
`dist/styles.css` classifies as an authored token pinned by name, kind, and
scope, or as a framework-owned property — remains in force unchanged; this
requirement adds a value-form constraint on top of that partition and does not
relax it.

#### Scenario: An authored color token is declared
- **WHEN** a color token is added or re-authored in the package theme CSS
- **THEN** its declared value is a full CSS color function (for example
  `hsl(...)`), not a bare channel triplet
- **AND** the package token guard's color value-shape check accepts the full
  value and rejects a bare triplet

#### Scenario: A component consumes an authored token
- **WHEN** the `@theme inline` map, a CSS rule, or a TS/TSX inline style
  references an authored color or alias token
- **THEN** it uses `var(--token)` directly
- **AND** it does not wrap the token in `hsl(var(--token))`

#### Scenario: A consumer applies an opacity modifier to a token
- **WHEN** a consumer needs a translucent form of an authored color token
- **THEN** it composes it as `color-mix(in oklab, var(--token) N%, transparent)`
- **AND** it does not rely on channel-triplet slash-alpha
  (`hsl(var(--token) / a)`) or on compile-time-only `--alpha()`

#### Scenario: The classifier reads an authored color token after migration
- **WHEN** the design app's token classifier processes the migrated
  `dist/styles.css`
- **THEN** authored color tokens present a recognizable CSS color value
- **AND** they are no longer forced to the `"other"` kind by a bare channel
  triplet

#### Scenario: The name, kind, and scope partition is preserved
- **WHEN** the package token guard runs after the value-form migration
- **THEN** it still fails on any custom property that is neither an authored
  token pinned by name and kind nor a framework-owned property
- **AND** the value-form re-pin only tightens the per-kind value-shape check,
  leaving the name/kind/scope partition intact
