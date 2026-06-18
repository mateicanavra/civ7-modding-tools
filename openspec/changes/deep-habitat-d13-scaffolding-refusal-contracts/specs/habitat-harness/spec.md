## ADDED Requirements

### Requirement: D13 Scaffolding And Refusal Contracts Is Resolved Before Implementation

Habitat scaffolding SHALL create only supported uniform shapes and SHALL refuse unsupported project, pattern, or host-specific requests before writes with owner, reason, and recovery guidance.

#### Scenario: Supported scaffold is requested
- **WHEN** a generator request matches a supported Habitat contract
- **THEN** Habitat validates target root, metadata, and expected follow-up checks before writing

#### Scenario: Unsupported scaffold is requested
- **WHEN** a generator request lacks owning-domain support
- **THEN** Habitat refuses before file writes and reports the owning decision path
