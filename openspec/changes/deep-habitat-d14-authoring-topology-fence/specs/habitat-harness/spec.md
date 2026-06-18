## ADDED Requirements

### Requirement: D14 Authoring Topology Fence Is Resolved Before Implementation

Habitat SHALL fence future authoring topology from the current generic structural toolkit and SHALL represent current unsupported authoring requests as explicit refusals unless a later accepted authority opens authoring implementation.

#### Scenario: Future authoring request appears
- **WHEN** a request asks Habitat to create or manage authoring topology outside current support
- **THEN** Habitat refuses with owner and trigger guidance rather than adding hidden coupling

#### Scenario: Current structural scenario proceeds
- **WHEN** a supported classify/check/scaffold/refusal workflow runs
- **THEN** Habitat does not require MapGen authoring concepts to complete the generic workflow
