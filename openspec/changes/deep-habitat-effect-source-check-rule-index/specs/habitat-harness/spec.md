## MODIFIED Requirements

### Requirement: Source Check Rule Dispatch

Habitat SHALL plan source-check file reads and rule dispatch from registered
rule coverage instead of repeatedly rediscovering file/rule applicability during
diagnostic execution.

#### Scenario: Files carry matching rule plans

- **WHEN** source-check evaluates selected source rules
- **THEN** Habitat SHALL compile file matchers for supported rules once
- **AND** each planned file SHALL carry the matching rule plans used for
  diagnostic dispatch.

#### Scenario: Unsupported rules do not expand scans

- **WHEN** a selected source-check rule has no registered source-check policy
  implementation
- **THEN** Habitat SHALL report the unsupported-rule diagnostic
- **AND** that rule SHALL NOT add scan roots or file reads to the source-check
  plan.
