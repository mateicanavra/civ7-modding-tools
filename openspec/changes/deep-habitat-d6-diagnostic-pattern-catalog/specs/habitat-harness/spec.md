## ADDED Requirements

### Requirement: D6 Diagnostic Pattern Catalog Is Resolved Before Implementation

Habitat diagnostic catalogs SHALL describe what each native or Grit diagnostic can detect and how it is projected, without owning governance admission, baseline decisions, or apply transactions.

#### Scenario: Diagnostic runs successfully
- **WHEN** a diagnostic pattern returns findings
- **THEN** Habitat records detector identity, scope, normalized findings, and limitations

#### Scenario: Diagnostic cannot run
- **WHEN** a native or Grit diagnostic fails before findings are available
- **THEN** Habitat reports diagnostic failure state without treating it as structural pass
