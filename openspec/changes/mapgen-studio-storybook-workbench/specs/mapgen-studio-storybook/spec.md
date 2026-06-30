## ADDED Requirements

### Requirement: The Workbench Renders Studio Components Without The Runtime

The studio Storybook SHALL render presentational components in isolation without
the daemon, the `/rpc` proxy, or the live game runtime, and no story SHALL
attempt a live `/rpc` or daemon call.

#### Scenario: Workbench starts with no daemon
- **WHEN** the `storybook` target runs and no studio daemon is running
- **THEN** Storybook serves the component catalog
- **AND** no story issues a network request to `/rpc`

#### Scenario: Prop-driven component renders from props alone
- **WHEN** a Tier-1 presentational component story renders
- **THEN** the component renders from its story props with no store, query, or
  daemon dependency
- **AND** the browser console reports no errors

#### Scenario: Data-reaching component is mocked or excluded
- **WHEN** a component imports the oRPC client / data layer
- **THEN** its story supplies a seeded stub query client, or the component is
  recorded as excluded with a reason
- **AND** in neither case is a live `/rpc` call attempted

### Requirement: Stories Render In The Studio's Real Theme And Provider Context

The Storybook preview layer SHALL supply, as global decorators, the studio's
theme (light and dark), design tokens, fonts, and the providers components
require, so a story renders at in-app fidelity.

#### Scenario: Tooltip-using component renders visible
- **WHEN** a component that uses Radix Tooltip renders in a story
- **THEN** a `TooltipProvider` ancestor is present from the global decorators
- **AND** the tooltip content is reachable, not silently blank

#### Scenario: Theme toggled to dark
- **WHEN** the theme toolbar is set to dark
- **THEN** the preview root carries the `.dark` class
- **AND** the component reflects dark-theme tokens

#### Scenario: Store-reading story is reset per story
- **WHEN** a story depends on a Zustand store value
- **THEN** the store is reset (and `localStorage` seeded/cleared for the
  load-time-hydrated store) before that story renders
- **AND** state does not bleed from a previously viewed story

### Requirement: Each In-Scope Component Has A Faithful Primary Story

The workbench SHALL provide at least one faithful primary story for every
in-scope component, plus variant stories for that component's load-bearing
visual states; exhaustive prop coverage is not required.

#### Scenario: In-scope component has a primary story
- **WHEN** a component is in the Tier-1 or Tier-2 scope
- **THEN** it has a primary story rendering a representative default state

#### Scenario: Component with distinct states has variant stories
- **WHEN** a component has load-bearing visual states (for example dirty vs
  clean, running vs idle, expanded vs collapsed)
- **THEN** those states are covered by variant stories

#### Scenario: Orchestration host has no story
- **WHEN** the component is an orchestration or runtime host (`StudioShell`,
  `StudioProviders`, `DeckCanvas`) or can only render with live data
- **THEN** it has no story
- **AND** its exclusion and reason are recorded

### Requirement: Component Behavior Is Unchanged By The Workbench

Standing up the workbench SHALL NOT modify any component implementation; missing
render context is supplied by a decorator, a mock, or a fixture in the story
layer, never by editing the component.

#### Scenario: Component needs context to render
- **WHEN** a component cannot render in isolation without a provider or data
- **THEN** the story supplies a decorator, a seeded stub, or a fixture
- **AND** the component source is not edited to fit the workbench

#### Scenario: Component cannot be storied statically
- **WHEN** a component cannot render statically even with mocks
- **THEN** it is excluded with a recorded reason
- **AND** it is not rewritten to make it story-able

### Requirement: Stories Are Authored In A Design-Sync-Consumable Shape

Stage 1 stories SHALL be authored so a later design-sync `storybook`-shape flip
can consume them without re-authoring: CSF named exports, titles mapped to the
design-sync component export names, and static renderability.

#### Scenario: Story title maps to the design-sync export name
- **WHEN** a story is authored for a component in the design-sync 46-component
  set
- **THEN** its title maps to that component's design-sync export name and
  category group

#### Scenario: Non-static story is marked, not left to crash
- **WHEN** a story cannot render statically (needs live data or interaction)
- **THEN** it is excluded or skip-marked with a recorded reason
- **AND** it does not crash the build at import

#### Scenario: Story imports the studio's real component
- **WHEN** a story imports the component it covers
- **THEN** the import resolves through the studio's own aliases to the real
  component implementation

### Requirement: Storybook Coexists With The App Build, Daemon, And Test Runner

Adding the workbench SHALL NOT alter the existing app build, daemon, or test
targets, and SHALL be reachable through the repo's existing Nx target convention.

#### Scenario: Builder inherits the app's required aliases
- **WHEN** Storybook builds a story that transitively pulls deck.gl
- **THEN** the builder has inherited the `child_process` shim alias and the
  build resolves
- **AND** StrictMode is not forced around the canvas story

#### Scenario: Workbench targets follow the inference-only convention
- **WHEN** the workbench is invoked
- **THEN** it runs through `storybook` / `build-storybook` `package.json` `nx`
  targets, not an `@nx/storybook` generator or a `project.json`
- **AND** the existing `dev`, `build`, `build:vite`, and Vitest targets are
  unchanged

#### Scenario: Design-sync surface is untouched in Stage 1
- **WHEN** Stage 1 implementation completes
- **THEN** `.design-sync/`, `.ds-sync/`, and `ds-bundle/` are unchanged
- **AND** the live design-sync remains `package` shape
