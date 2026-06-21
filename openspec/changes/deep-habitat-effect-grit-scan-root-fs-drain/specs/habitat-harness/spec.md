## MODIFIED Requirements

### Requirement: Grit scan-root policy is testable without live filesystem probes

Habitat Grit scan-root decisions SHALL accept explicit path-existence facts so
policy tests can verify accepted and refused roots without depending on the
current checkout.

#### Scenario: Scan-root validation uses injected existence facts

- **WHEN** a caller validates Grit scan roots with a `pathExists` option
- **THEN** missing-root decisions use that supplied existence function
- **AND** outside-repo, protected, generated, not-approved, and accepted
  decisions remain unchanged.

#### Scenario: Live adapter behavior keeps filesystem defaults

- **WHEN** a caller validates or discovers Grit scan roots without `pathExists`
- **THEN** Habitat uses the live filesystem default
- **AND** existing command behavior remains compatible.
