## ADDED Requirements

### Requirement: Browser Clients Preserve Declared Error Diagnostics

MapGen Studio browser API wrappers SHALL preserve declared error code and diagnostic data where UI behavior depends on it.

#### Scenario: Defined error reaches browser state

- **WHEN** a Run in Game, Save/Deploy, setup config, Autoplay, or Explore browser call receives a declared error
- **THEN** the browser state includes tested diagnostic information for the user-facing component
- **AND** any intentionally simplified shape is documented and covered by tests
