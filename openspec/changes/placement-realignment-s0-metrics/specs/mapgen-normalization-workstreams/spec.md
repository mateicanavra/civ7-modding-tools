## ADDED Requirements

### Requirement: Placement Realignment Slices Are Measured Against An Instrumented Baseline

The placement-realignment workstream SHALL compute its E1/E2/E3 expectation
metrics (including the resource-distribution-policy step-1 metrics under E2.9)
from placement artifacts via a reusable harness over stable seeds, and SHALL
record the pre-change baseline as evidence before any behavior-changing slice
lands.

#### Scenario: Metrics are computed from artifacts over stable seeds
- **WHEN** the placement metrics harness runs the standard recipe headlessly
  with the mock adapter for a fixed seed
- **THEN** it reports each expectation ID with either a computed value or an
  explicit skip status naming why it cannot be computed yet (pending slice,
  live engine required, or studio dump required)
- **AND** repeated runs with the same seed produce identical metric values

#### Scenario: Baseline is recorded before behavior changes
- **WHEN** a behavior-changing placement slice (S1+) claims improvement or
  regression on an expectation
- **THEN** the claim cites the recorded S0 baseline evidence document and the
  harness reproduction commands

#### Scenario: S0 reports without gating
- **WHEN** the S0 harness or its self-test runs in CI or locally against
  current known-broken placement behavior
- **THEN** it does not fail builds on expectation-range violations
- **AND** range gating is introduced only by later slices citing this baseline
