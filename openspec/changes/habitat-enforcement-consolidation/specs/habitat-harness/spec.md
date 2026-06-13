## ADDED Requirements

### Requirement: The Harness Is The Only Enforcement Path

After consolidation, structural enforcement SHALL exist only as harness rules
(nx-boundaries, grit, biome, file-layer, habitat-native). Superseded scripts,
the legacy ESLint config, and duplicated architecture tests SHALL be retired
with parity evidence recorded per mechanism.

#### Scenario: Retired mechanism's invariant still enforced
- **WHEN** a violation that a retired script would have caught is introduced
- **THEN** the corresponding harness rule fails `habitat check` and CI

#### Scenario: Retirement without parity is rejected
- **WHEN** a retirement lacks recorded parity or supersession evidence
- **THEN** the consolidation change does not proceed for that mechanism

### Requirement: CI Verifies Through The Harness

Root verification scripts and CI jobs SHALL invoke harness targets
(`habitat verify` / nx affected harness targets) and publish harness JSON
diagnostics as the verification artifact.

#### Scenario: CI failure evidence
- **WHEN** a CI enforcement step fails
- **THEN** the uploaded habitat diagnostics name the rule id, file, line,
  message, and remediation — sufficient for an agent to repair without
  reading raw logs
