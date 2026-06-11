## ADDED Requirements

### Requirement: Form Labels Sit A Full Tier Above Descriptions

Config-form field labels SHALL render on the foreground text tier
(`text-foreground`, medium weight) — in the rjsf templates and the hand-rolled field set alike — while
descriptions, help text, and schema comments remain on the muted tier, so labels
and prose are distinguishable at a glance without size changes.

#### Scenario: rjsf label vs description
- **WHEN** an rjsf field renders with a label and a description
- **THEN** the label's computed color is the foreground token and the description's is the muted-foreground token
- **AND** both keep their existing font sizes from the named scale

#### Scenario: Hand-rolled fields match
- **WHEN** a non-rjsf field row (e.g. world settings) renders with label + help text
- **THEN** it follows the same label/description tier split

### Requirement: Error Live Regions Mount Only When Errors Exist

The config form SHALL NOT mount empty `role="alert"` regions. The per-field error
region renders only when the field has raw validation errors, and when it does it
SHALL keep the `id="${id}__error"` association contract consumed by the widgets'
`aria-describedby`/`aria-invalid`.

#### Scenario: Pristine form has zero alert regions
- **WHEN** the config form renders with no validation errors
- **THEN** a DOM query for `[role="alert"]` inside the form returns no per-field error nodes

#### Scenario: A real error still announces against its control
- **WHEN** a field has a validation error
- **THEN** an element with `id="${fieldId}__error"` and `role="alert"` renders the message
- **AND** the field's widget exposes `aria-invalid` and `aria-describedby` referencing that id
