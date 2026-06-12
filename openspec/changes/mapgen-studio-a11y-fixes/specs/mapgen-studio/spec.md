## ADDED Requirements

### Requirement: Group Disclosures And Sliders Expose Correct Accessible Names

Mapgen Studio disclosure toggles SHALL take their accessible name from the visible
control content (not an `aria-label` that masks it) while still exposing
`aria-expanded` and `aria-controls`, and range sliders without an associated visible
label SHALL provide an `aria-label`.

#### Scenario: Data-type group toggle announces the group name
- **WHEN** the ExplorePanel renders a data-type group whose visible label is e.g. "Climate"
- **THEN** the group disclosure toggle's accessible name is "Climate" (the visible group label), not "Collapse group"/"Expand group"
- **AND** the toggle exposes `aria-expanded` reflecting its open state
- **AND** the toggle exposes `aria-controls` referencing the container that wraps the group's items

#### Scenario: Era slider has an accessible name
- **WHEN** the ExplorePanel era control is enabled and its range slider renders
- **THEN** the slider exposes an accessible name "Era"

### Requirement: The Save & Deploy Menu Uses A Menu Primitive With Full Keyboard Semantics

The RecipePanel Save & Deploy control SHALL present its actions through the
design-system Radix dropdown-menu primitive, exposing `role="menu"`/`menuitem`,
Escape-to-close, arrow-key navigation, and focus trap/restore, while preserving the
exact action set and their bound callbacks.

#### Scenario: Menu exposes role and keyboard semantics
- **WHEN** the user opens the Save & Deploy menu
- **THEN** the menu container has `role="menu"` and its actions have `role="menuitem"`
- **AND** Escape closes the menu and restores focus to the trigger
- **AND** arrow keys move focus between items

#### Scenario: Actions and values are preserved
- **WHEN** the user selects "Save & Deploy", "Save & Deploy As…", "Export…", "Import…", or "Delete Scratch"
- **THEN** the same callback runs as before (`onSaveToCurrent`, `onSaveAsNew`, `onExportPreset`, `onImportPreset`, `onDeletePreset` respectively)
- **AND** "Delete Scratch" is a disabled menu item when `canDeletePreset` is false
- **AND** the menu force-closes when a save action becomes disabled by another running Studio operation

### Requirement: rjsf Field Errors Are Programmatically Associated With Their Input

Mapgen Studio override-form fields SHALL associate each validation error message with
its input via `aria-describedby` and SHALL mark the input `aria-invalid` while the
error is present, so assistive technology announces the error against the control.

#### Scenario: An invalid field announces its error
- **WHEN** an rjsf override field has validation errors (`rawErrors`)
- **THEN** the rendered error message has `id="${fieldId}__error"` and `role="alert"`
- **AND** the field's input has `aria-invalid` and `aria-describedby="${fieldId}__error"`

#### Scenario: A valid field does not reference an error region
- **WHEN** an rjsf override field has no validation errors
- **THEN** the input does not set `aria-describedby` to a non-existent error node and is not marked `aria-invalid`

### Requirement: The Skip-Link Target Is Focusable And In The Accessibility Tree

The Mapgen Studio skip-link target SHALL be a laid-out element (not `display:contents`)
so the browser can move focus and scroll to it, without changing the visual layout.

#### Scenario: Skip link lands on a focusable main region
- **WHEN** the user activates the "Skip to map preview" link
- **THEN** focus moves to the `main` landmark labelled "Map preview"
- **AND** the `main` element is a real box in the layout (not `display:contents`) and remains focusable via `tabIndex={-1}`
- **AND** the visual layout and z-stacking of the canvas, docks, header, and footer are unchanged
