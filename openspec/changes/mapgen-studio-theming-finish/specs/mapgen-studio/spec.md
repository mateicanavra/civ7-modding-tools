## ADDED Requirements

### Requirement: Chrome Theming Is Carried Solely By The Single `.dark` Class

Mapgen Studio chrome SHALL be themed exclusively by design-system tokens that
re-resolve under the single `.dark` class on `<html>`. There SHALL be no
`createTheme()` runtime theme generator, no `Theme` token-bundle object threaded
through components, and no `theme`/`lightMode`/`isLightMode` styling prop on any
chrome component (`AppHeader`, `AppBrand`, `ViewControls`, `RecipePanel`,
`ExplorePanel`, `AppFooter`, `PresetDialogs`, `SchemaConfigForm`). The
`useThemePreference` hook SHALL still expose `isLightMode`, but ONLY as the deck.gl
canvas render input, not as a chrome theming signal.

#### Scenario: createTheme and the Theme type are gone

- **WHEN** the studio source is searched for `createTheme(` or the `Theme`
  token-bundle interface
- **THEN** neither exists — `ui/hooks/useTheme.ts` exports only the
  `useThemePreference` hook, and `ui/types` has no `Theme` interface

#### Scenario: No chrome component takes a theming prop

- **WHEN** `StudioShell` renders the header, panels, footer, and preset dialogs
- **THEN** it passes no `theme`, `lightMode`, or `isLightMode` prop to any of them,
  and each renders correctly in both dark and light via token classes alone

#### Scenario: The deck.gl grid color still receives the runtime boolean

- **WHEN** the background grid is drawn by `DeckCanvas`
- **THEN** it still selects its RGBA via the `lightMode` render input forwarded
  `StudioProviders → StudioShell → CanvasStage → DeckCanvas` (a canvas pixel cannot
  read a CSS class), and the Deck.gl output is unchanged from before

### Requirement: The rjsf Config-Form Chrome Is Token-Driven, Not getFormTheme Hex

The rjsf config-form templates SHALL style via design-system token classes, not a
`getFormTheme(lightMode)` raw-hex bundle. `getFormTheme` and its `FormTheme` type
SHALL be removed, and `BrowserConfigFormContext` SHALL no longer carry
`lightMode`/`theme`. The templates SHALL use the named type scale
(`text-data`/`text-label`/`text-xs`) and the `text-destructive` token instead of
ad-hoc `text-[11px]`/`text-[12px]`/`text-rose-400`.

#### Scenario: Field, object, and array templates resolve through tokens

- **WHEN** the config form renders field rows, stage sections, nested groups, and
  array items
- **THEN** their surfaces/text/borders come from token classes
  (`bg-card`/`bg-muted`/`text-foreground`/`text-muted-foreground`/`border-border`/
  `border-border-subtle`/`hover:bg-accent`), with no raw-hex class and no
  `lightMode` read

#### Scenario: Error and required markers use the destructive token

- **WHEN** a field shows a validation error or a required asterisk
- **THEN** it uses `text-destructive`, not `text-rose-400`

#### Scenario: The schema-unavailable fallback uses a token color

- **WHEN** `SchemaConfigForm` cannot resolve the config schema and shows its
  fallback message
- **THEN** the message text uses `text-muted-foreground`, not the raw `text-[#a1a1aa]`

### Requirement: The Dead lightMode/Hex Field Set Is Removed

Mapgen Studio SHALL NOT retain the unused concrete field components
(`String/Number/Boolean/Select/Array Field`) or their `getInputStyles(lightMode)`
raw-hex helper, nor the parallel legacy `ui/components/ui/*` primitives that only
those dead fields consumed. The token-free `FieldRow` (used by the rjsf templates)
SHALL be kept.

#### Scenario: getInputStyles and the legacy primitives are gone

- **WHEN** the source is searched for `getInputStyles` or imports of
  `ui/components/ui/*`
- **THEN** neither the helper nor the legacy primitive directory exists, and the
  live UI imports its primitives from the shadcn `src/components/ui/*`

#### Scenario: FieldRow survives for the rjsf templates

- **WHEN** `rjsfTemplates.tsx` lays out a labelled field row
- **THEN** it still imports `FieldRow` from `ui/components/fields`, which remains

### Requirement: AppFooter Uses The Named Type Scale

`AppFooter` SHALL express its data/label text through the named `text-data` /
`text-label` scale, not ad-hoc `text-[11px]` / `text-[10px]`.

#### Scenario: Footer status and eyebrow labels use named sizes

- **WHEN** `AppFooter` renders the status text and the uppercase eyebrow labels
- **THEN** they use `text-data` (11px) and `text-label` (10px) respectively, with no
  `text-[11px]` / `text-[10px]` arbitrary value remaining in the file

### Requirement: Orphaned Civ7 Setup Fetchers Are Removed

The studio SHALL NOT export `fetchCiv7SavedSetupConfigs` or `fetchCiv7SetupCatalog`,
which have no callers after the saved-configs / setup-catalog reads moved to the
oRPC-native TanStack Query layer (`useSetupDataQueries`). The
`Civ7SetupCatalog` / `Civ7SetupCatalogOption` TYPES SHALL be kept (consumed by the
query view and `setupOptions`).

#### Scenario: The dead fetchers are gone but the types remain

- **WHEN** `features/civ7Setup/api.ts` is inspected
- **THEN** `fetchCiv7SavedSetupConfigs` and `fetchCiv7SetupCatalog` are absent
- **AND** `Civ7SetupCatalog` and `Civ7SetupCatalogOption` are still exported and the
  module type-checks (no unused-import error)
