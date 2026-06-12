## ADDED Requirements

### Requirement: Footer Operational Diagnostics Are Present For Assistive Tech And Static Markup

The AppFooter SHALL keep its operational diagnostics — the Run-in-Game request id,
phase, failure reason, and recovery hint; the save/deploy status; the live-sync hint;
and the autoplay hint — present in the rendered DOM and on the accessible name of the
visible control, not exclusively inside hover-only tooltip content.

#### Scenario: Run-in-Game diagnostics are in the static markup
- **WHEN** the footer renders with a Run-in-Game operation that has a request id and a failure reason
- **THEN** the request id and the failure reason appear in the server-rendered static markup of the footer
- **AND** they are exposed as the `aria-label`/`title` of the visible Run-in-Game status control
- **AND** the AppFooter static-markup parity tests pass without weakening their assertions

#### Scenario: Footer hints work without an ancestor tooltip provider
- **WHEN** the footer is rendered standalone (no ancestor `TooltipProvider`)
- **THEN** it renders without throwing and still exposes the live-sync, autoplay, save/deploy, and run-in-game hints as accessible names
- **AND** when rendered inside the studio shell (which provides a tooltip provider) the behavior is unchanged

### Requirement: Studio Chrome Exposes Landmarks, A Skip Link, And Live Regions

Mapgen Studio SHALL present a landmark structure (main, complementary asides, header,
footer), a visually-hidden skip-to-main link as the first focusable element, an
assertive alert region for errors, and a polite live region mirroring volatile
run/live status.

#### Scenario: Landmarks and skip link are present
- **WHEN** the studio shell renders
- **THEN** the deck.gl canvas host is wrapped in a `main` landmark labelled "Map preview"
- **AND** the left and right docks are `aside` landmarks with descriptive labels
- **AND** a visually-hidden skip link targeting the map preview is the first focusable element

#### Scenario: Status changes are announced politely and errors assertively
- **WHEN** the run/live status changes or an error message appears
- **THEN** the error banner is an assertive alert region (`role="alert"`, `aria-live="assertive"`)
- **AND** a visually-hidden polite live region reflects the current generation/live/run-in-game status

### Requirement: Collapsible Sections And Selection Lists Expose Their State

Mapgen Studio collapsible section headers SHALL expose `aria-expanded` and
`aria-controls`, and active items in single-select lists/toolbars SHALL expose
`aria-current` or `aria-pressed`.

#### Scenario: Disclosure state is exposed
- **WHEN** the ExplorePanel Stage/Step/Layers, RecipePanel Recipe/Config, or AppHeader Setup headers render
- **THEN** each header reports `aria-expanded` reflecting its open state and `aria-controls` referencing the controlled region

#### Scenario: Active selection is exposed
- **WHEN** a Stage, Step, or Layer item is the current selection
- **THEN** that item reports `aria-current`
- **AND** the active render-mode and space toggles report `aria-pressed`

### Requirement: Live Selects And RJSF Widgets Use The Token-Driven Design System

The live dropdowns and the rjsf override widgets SHALL render through the token-driven `src/components/ui` primitives, with no `lightMode` prop and no off-token raw-hex or named-color utilities, while emitting the same authored values as before. This covers the AppHeader World Size, Players, and Config dropdowns, the RecipePanel Recipe and Config dropdowns, and every rjsf override widget.

#### Scenario: Dropdowns are token-driven and value-preserving
- **WHEN** the AppHeader World Size/Players/Config or RecipePanel Recipe/Config dropdown changes selection
- **THEN** it is rendered by the token-driven Select (via the `OptionSelect` adapter) with a labelled trigger
- **AND** the value emitted to the settings callback is identical to the legacy native select for the same selection

#### Scenario: RJSF widgets re-skin without changing emitted config
- **WHEN** an rjsf text/number/textarea/select/checkbox/switch/tag override widget renders and is edited
- **THEN** it is built from the `src/components/ui` primitives with no `lightMode` prop and no `ring-gray-400`
- **AND** the value it passes to RJSF `onChange` (including enum mapping and empty-value normalization) matches the prior native-widget behavior

### Requirement: Empty Stage And Type Scale Are Intentional And Token-Referenced

The empty deck.gl stage SHALL be token-referenced and framed as an intentional
"awaiting matter" survey console, and the chrome SHALL adopt the named type scale in
place of ad-hoc pixel sizes for the label/data tiers.

#### Scenario: Empty stage frames the map and is token-driven
- **WHEN** no viz manifest is present
- **THEN** the stage backdrop uses the `bg-background` token (no `lightMode` hex ternary in the chrome)
- **AND** the empty state shows an intentional graticule + contour-framed "awaiting matter" panel rather than bare centered text

#### Scenario: Named type scale replaces ad-hoc pixel sizes
- **WHEN** AppHeader, RecipePanel, or ExplorePanel render their label/data text
- **THEN** the 10px/11px tiers use the named `text-label`/`text-data` tokens instead of `text-[10px]`/`text-[11px]`
