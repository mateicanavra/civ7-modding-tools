## ADDED Requirements

### Requirement: Hydrology Publishes River Network Diagnostics

Hydrology SHALL publish diagnostics that make generated-map river networks
auditable as physical drainage systems before any Civ-visible projection is
tuned.

#### Scenario: Generated hydrology is evaluated
- **WHEN** a generated map emits hydrology diagnostics
- **THEN** diagnostics include basin identity, upstream contributing area,
  stream hierarchy proxy, mouth type, slope class, and flow permanence proxy
- **AND** they distinguish wet normal rivers from arid ephemeral/no-signal
  outcomes
- **AND** they publish an observed benchmark summary for river class ratios,
  river-specific permanence, low-order hierarchy, terminal shares, lake share,
  basin coverage, and routing-health counters
- **AND** benchmark metadata records tile scale, visible feature floor, regime
  row, external Earth anchors, and stylization notes outside the Hydrology
  compute op

#### Scenario: Physical network metrics fail
- **WHEN** drainage contains cycles, invalid receivers, unexplained discharge
  decreases, or untyped terminals
- **THEN** navigable projection and product acceptance are blocked until the
  hydrology truth failure is repaired or explicitly scoped out
