## ADDED Requirements

### Requirement: Import Guard Follows Public Surface Remediation

The import-boundary change SHALL create or repair required public surfaces
before enabling the first recipe deep-import guard.

#### Scenario: Recipe deep-import guard is enabled
- **WHEN** the guard for `src/recipes/**` imports is enabled
- **THEN** every blocked import has a named public owner surface or an explicit
  accepted exception
- **AND** sanctioned domain surfaces are not broad-banned

### Requirement: Scoped Matrix Separates Policy From Enforcement

The import policy SHALL distinguish documented target policy from guardrails
that are actually enforceable in the current slice.

#### Scenario: Broader import policy is documented
- **WHEN** the policy names future cross-domain or internal import restrictions
- **THEN** the proposal records which restrictions are not yet enforced
- **AND** later guardrail work cites the cleanup slice that makes each
  restriction pass
