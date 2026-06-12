## ADDED Requirements

### Requirement: Config Nesting Is Expressed By Surface Elevation

Config-form nesting SHALL be expressed by surface tiers, not indent rules:
stage sections render as cards, groups within a stage render as one recessed
well surface (page-token tint, subtle border, rounded, padded), and nesting
deeper than stage→group adds no additional surface tiers.

#### Scenario: Group renders as a recessed well
- **WHEN** an object group (depth ≥ 2, not transparent) renders inside a stage card
- **THEN** it renders as a single recessed surface (tinted toward the page token with a subtle border and padding)
- **AND** no `border-l` indent rule is used to mark its nesting

#### Scenario: Deep nesting stays at two surface tiers
- **WHEN** a group contains a further nested group (depth ≥ 3)
- **THEN** the inner group differentiates by heading tier and spacing only, with no third surface tier

#### Scenario: Arrays ride the same well treatment
- **WHEN** an array field renders
- **THEN** its container uses the same well surface as object groups

### Requirement: The Config Form Has A Codified Spacing Rhythm

The config form SHALL chunk by a codified rhythm on the 4px base — tighter
within a field block than between fields, and tighter between fields than
between groups/stage sections — owned by a single constant in the rjsf
templates.

#### Scenario: Within-field is tighter than field-to-field
- **WHEN** a field renders its label, input, and description
- **THEN** the vertical gap inside the field block (4px) is smaller than the gap separating it from sibling fields (8px)

#### Scenario: Groups chunk wider than fields
- **WHEN** sibling groups or stage sections render
- **THEN** they are separated by a wider step (12px) than field-to-field spacing

### Requirement: Group Headings Sit On The Eyebrow Tier

Group headings inside stage cards SHALL use the eyebrow label tier (uppercase
`text-label`, muted), keeping field labels (foreground) the brightest text
inside a card.

#### Scenario: Field labels outrank group headings in the squint test
- **WHEN** a stage card with grouped fields renders
- **THEN** field labels render on the foreground tier while group headings render uppercase on the muted eyebrow tier
