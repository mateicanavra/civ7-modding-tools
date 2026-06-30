## ADDED Requirements

### Requirement: Habitat Authority Paths Own The Habitat Root

Habitat SHALL expose `.habitat` root constants from an authority-path module.

#### Scenario: Code imports Habitat root paths

- **WHEN** Habitat code needs the `.habitat` root, registry path, cache path,
  baseline path, or pattern path
- **THEN** it imports from the authority-path module
- **AND** it does not import from an artifact-path module

### Requirement: Habitat Authority Project Identity Is Explicit

Habitat SHALL infer the `.habitat` Nx project as `habitat-authority`.

#### Scenario: Boundary taxonomy validates inferred authority root

- **WHEN** `.habitat` appears as an inferred Nx project-plane node
- **THEN** the accepted project name is `habitat-authority`
- **AND** diagnostics describe the Habitat authority root
