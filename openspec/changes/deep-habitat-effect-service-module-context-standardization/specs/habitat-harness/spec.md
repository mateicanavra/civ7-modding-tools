## MODIFIED Requirements

### Requirement: Habitat Effect-oRPC Service Module Shape

Habitat service modules SHALL use a uniform Effect-oRPC authoring shape: root
service context owns service requirements, root service impl owns contract-bound
implementation, module context owns module implementer decoration, and module
router files own procedure logic.

#### Scenario: Service context owns the runtime service tag

- **GIVEN** the Habitat service runtime is assembled for Effect-oRPC execution
- **WHEN** root service files define runtime requirements
- **THEN** the runtime service tag SHALL live in `service/context.ts`
- **AND** the root service layer and derived requirement/error types SHALL live
  in `service/context.ts`
- **AND** there SHALL NOT be a separate `service/base.ts` file for the same
  context concept

#### Scenario: Module contexts expose one standard implementer

- **GIVEN** a Habitat service module context file decorates its contract branch
- **WHEN** the module exports its decorated implementer
- **THEN** it SHALL export that implementer as `implementer`
- **AND** it SHALL bind the matching `habitatServiceImplementer.<module>` branch
- **AND** it SHALL NOT export a module-specific implementer alias such as
  `checkModule`, `verifyModule`, or `transactionsModule`
- **AND** it SHALL NOT export the implementer as the overloaded value name
  `module`

#### Scenario: Routers author procedures directly

- **GIVEN** a Habitat service module router implements procedures
- **WHEN** the router attaches `.effect(...)` handlers
- **THEN** it SHALL import the module context implementer directly
- **AND** it SHALL keep procedure logic in the router/module file rather than a
  separate run file

#### Scenario: Structure enforcement belongs to Habitat guards

- **GIVEN** Habitat needs to preserve the service module authoring shape
- **WHEN** structure is enforced
- **THEN** the Habitat guard layer SHALL reject non-standard module context
  exports
- **AND** source-text topology tests SHALL NOT be the enforcement mechanism
