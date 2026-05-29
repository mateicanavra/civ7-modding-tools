## ADDED Requirements

### Requirement: Authority Routing Change Closes Domino 0

The normalization train SHALL include an explicit authority-routing change that
proves active work enters through the accepted packet and not through source
review artifacts.

#### Scenario: Authority routing is verified
- **WHEN** implementation work for later normalization changes begins
- **THEN** the authority-routing change has verified that the packet is the
  only active root-level architecture-normalization decision artifact
- **AND** source review, comparison, and debate artifacts are labeled as
  provenance rather than normative authority

### Requirement: Source Materials Remain Audit Evidence

Authority routing SHALL preserve review and debate materials as audit evidence
while preventing them from competing with the accepted packet.

#### Scenario: A stale source artifact disagrees with the packet
- **WHEN** a source artifact under `architecture-normalization-sources/`
  disagrees with the packet
- **THEN** later OpenSpec changes follow the packet
- **AND** they cite the source artifact only as evidence or provenance
