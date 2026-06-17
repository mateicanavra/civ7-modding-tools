## ADDED Requirements

### Requirement: Studio Server RPC Boundaries Preserve Declared Errors

MapGen Studio SHALL prove every Studio-owned server RPC boundary separately from browser, dev, and live proof labels.

#### Scenario: Declared RPC failure is returned without unexpected logging

- **WHEN** a Studio-owned read, live, operation, or recipe DAG RPC encounters a declared expected runtime failure
- **THEN** the response uses the declared error code, status, and data shape for that procedure
- **AND** the shared handler does not log it as an unexpected defect

#### Scenario: Unexpected RPC defect remains a defect

- **WHEN** a Studio-owned RPC encounters an unexpected defect
- **THEN** the response and logging preserve unexpected-defect diagnostics
- **AND** the defect is not normalized into a declared expected runtime failure
