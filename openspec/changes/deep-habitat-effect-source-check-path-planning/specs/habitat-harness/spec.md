## MODIFIED Requirements

### Requirement: Source-check plans rule file applicability from registry facts

Habitat source-check execution SHALL use rule registry applicability facts
before invoking generated policy logic.

#### Scenario: Exact path coverage narrows policy invocation

- **WHEN** a pattern rule has exact path coverage
- **THEN** source-check invokes that rule's generated policy logic only for
  files matching the exact coverage patterns
- **AND** files outside exact coverage do not rely on policy-internal path
  guards for exclusion.

#### Scenario: Non-exact coverage remains conservative

- **WHEN** a pattern rule lacks exact path coverage
- **THEN** source-check falls back to scan-root overlap
- **AND** unresolved or workspace-level rules keep their existing conservative
  applicability behavior.

#### Scenario: Routing and source-check share coverage semantics

- **WHEN** workspace routing and source-check evaluate exact path coverage
- **THEN** both use the rule-registry matcher for glob semantics.
