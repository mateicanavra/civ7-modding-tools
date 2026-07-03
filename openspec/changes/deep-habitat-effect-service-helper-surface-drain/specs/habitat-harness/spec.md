## MODIFIED Requirements

### Requirement: Habitat Effect-oRPC Service Module Shape

Habitat service modules SHALL expose service behavior through the Effect-oRPC
procedure surface, not through exported helper functions beside that surface.

#### Scenario: Service router helpers are private

- **GIVEN** a Habitat service module router implements a procedure
- **WHEN** the router needs local helper functions to keep the file readable
- **THEN** those helpers MAY remain in the router file
- **AND** they SHALL NOT be exported as `runXService` or equivalent callable
  service helper APIs
- **AND** callers SHALL use the decorated procedure, module router, root service
  router, or in-process service client instead

#### Scenario: Tests use the procedure surface with fake layers

- **GIVEN** a service test needs fake Effect services
- **WHEN** it calls a Habitat service procedure
- **THEN** it SHALL call the decorated procedure or service client
- **AND** it SHALL provide fake services through Effect context
- **AND** it SHALL use `withFiberContext` when crossing the effect-oRPC runtime
  boundary with request/test scoped services
- **AND** it SHALL NOT import a private router helper to bypass module context

#### Scenario: Cross-module service composition uses procedures

- **GIVEN** one Habitat service module composes another service module
- **WHEN** it needs the sibling module behavior
- **THEN** it SHALL call the sibling module's decorated procedure surface
- **AND** it SHALL preserve request-scoped Effect services through
  `withFiberContext`
- **AND** it SHALL NOT import sibling `runXService` helpers
