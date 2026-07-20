## ADDED Requirements

### Requirement: Generated Studio Run Mod Is A Visible Map Mod

MapGen Studio SHALL generate and deploy a request-local Studio-run mod that
Civ7 setup can discover as the selected generated map.

#### Scenario: Generated mod files are rendered

- **WHEN** Run in Game generates `mod-swooper-studio-run` for an admitted
  request
- **THEN** the generated mod contains `.modinfo`, config rows, localized text,
  runtime script, and correlation markers for the request run artifact
- **AND** the generated map row points at
  `{mod-swooper-studio-run}/maps/${runArtifactId}.js`

#### Scenario: Deployment snapshot matches generated mod

- **WHEN** Studio deploys the generated mod snapshot
- **THEN** the deployed snapshot identity and digest correspond to the
  generated mod for the same request
- **AND** diagnostics can cite the generated mod identity privately by explicit
  lookup

#### Scenario: Civ7 setup reads generated row after catalog refresh

- **WHEN** deployment changes generated mod metadata or map rows
- **THEN** direct-control reaches the Civ7 mod-catalog refresh boundary by
  closing Civ7, relaunching it, and returning to shell/setup control
- **AND** setup/shell rows are read after that boundary
- **AND** the generated Studio-run row is visible for the request run artifact
- **AND** visibility of only the source catalog row does not satisfy the check

#### Scenario: Generated mod metadata did not change

- **WHEN** deployment reuses already-loaded generated mod metadata for the same
  stable mod id
- **THEN** the generated Studio-run row is visible for the request run artifact
- **AND** visibility of only the source catalog row does not satisfy the check

#### Scenario: Generated row is not visible

- **WHEN** the generated Studio-run row cannot be read
- **THEN** the operation uses the setup failure taxonomy to terminalize safely
- **AND** private diagnostics identify generated mod visibility as the failing
  boundary when source evidence supports that classification
