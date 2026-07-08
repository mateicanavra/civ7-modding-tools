# studio-ui-design-sync Specification

## Purpose
TBD - created by archiving change studio-ui-token-noise-disposition. Update Purpose after archive.
## Requirements
### Requirement: Authored Token Inventory Is Repo-Verified

The `@swooper/mapgen-studio-ui` package SHALL verify its design-token surface
from the built stylesheet: every CSS custom property in `dist/styles.css` MUST
classify as either an authored token pinned in a committed fixture (name, kind,
scope) or a framework-owned property (`@property`-registered or a Tailwind
internal name), and the verification MUST fail on any property that is
neither.

#### Scenario: A new authored token is added without updating the fixture
- **WHEN** a developer adds a new custom property to the package theme CSS and
  rebuilds
- **THEN** `mapgen-studio-ui:test` fails naming the stray property
- **AND** the failure message directs the developer to add it to the authored
  fixture with a kind, or to recognize it as a framework surface change

#### Scenario: A Tailwind upgrade changes the engine-variable surface
- **WHEN** a Tailwind version bump emits a new internal custom property outside
  the known framework predicate
- **THEN** the guard fails visibly instead of silently absorbing the new
  surface
- **AND** updating the framework predicate or fixture is a reviewed diff

### Requirement: Synced Design Guidance Carries The Token Noise Disposition

The design-sync upload SHALL include a guidelines document that names the
authored token vocabulary and dispositions the known `check_design_system`
framework-noise findings, so design agents working in the DS project do not
re-diagnose them or apply breaking "fixes."

#### Scenario: A design agent encounters the recurring findings
- **WHEN** a design agent runs `check_design_system` in the MapGen Studio DS
  project after the next re-sync
- **THEN** the project's guidelines document identifies the unclassified-token
  and selector-scoped-property findings as Tailwind v4 engine internals
- **AND** it prohibits moving `--tw-*` properties to `:root` and hand-editing
  synced stylesheets

#### Scenario: Guidelines ride the sync without render impact
- **WHEN** the guidelines file is added and the sync driver runs
- **THEN** the delta is documentation-tier (no component render hashes change)
- **AND** no component grade contract is re-keyed by the config addition

### Requirement: Upstream Classifier Feedback Is Durably Routed

The repo SHALL maintain the classifier defect report as a durable artifact
addressed to the design-sync/claude.ai-design maintainers, and SHALL record a
deferral with an explicit re-check trigger instead of treating the findings as
locally fixable.

#### Scenario: A future session revisits the findings
- **WHEN** an agent investigates the recurring findings after this change
- **THEN** the deferrals record points to the feedback packet and the frame
- **AND** the recorded trigger (new Claude Code / design-sync version) tells
  the agent when re-evaluation is warranted rather than re-deriving ownership

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

