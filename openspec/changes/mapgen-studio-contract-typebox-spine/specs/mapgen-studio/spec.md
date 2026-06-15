## ADDED Requirements

### Requirement: Studio Public Contracts Are TypeBox-Owned

D2.5 SHALL make TypeBox the single runtime schema origin for every `@civ7/studio-server` public input, output, stream event, and declared error data schema.

#### Scenario: Studio contract schemas have one origin

- **WHEN** D2.5 audits `packages/studio-server/src/contract/**`
- **THEN** every Studio-owned public success input, success output, stream event, and declared error data schema is TypeBox-owned
- **AND** every schema is exposed to oRPC through the Studio-owned TypeBox-to-Standard Schema adapter
- **AND** no raw TypeBox schema is passed directly to oRPC schema slots
- **AND** no Zod import or `z.infer` remains in Studio public contract modules
- **AND** stale comments claiming TypeBox-owned contract data is Zod-derived are removed or corrected

#### Scenario: Adapter origin is recoverable

- **WHEN** D2.5 tests the Studio TypeBox-to-Standard Schema adapter
- **THEN** a Standard Schema wrapper can prove the TypeBox `TSchema` that produced it
- **AND** validation preserves accepted TypeBox parse behavior and useful issue paths
- **AND** adapter behavior is either shared with `@civ7/control-orpc` or explicitly proven equivalent where separate

#### Scenario: Contract parity is explicit

- **WHEN** D2.5 validates the migrated contract surface
- **THEN** closed-object stripping, optional/default/coercion behavior, non-uniform error statuses, permissive expected-error data, and stream event schemas are covered by tests
- **AND** any intentional behavior change from the accepted runtime surface is named and tested

#### Scenario: Operation surfaces share canonical DTO schemas

- **WHEN** D2.5 validates Run in Game and Save&Deploy operation schemas
- **THEN** endpoint status schemas, `studio.operations.current`, and operation event payloads compose the same canonical TypeBox operation DTO schemas
- **AND** no operation-current or event schema redefines a broader duplicate operation shape

#### Scenario: Expected error data is classified

- **WHEN** D2.5 validates declared error data
- **THEN** permissive `details?: unknown` data is either narrowed to sanitized TypeBox-backed public failure fields
- **OR** classified as D3-bound bridge residue with a same-stack D3 deletion/narrowing target and guard test proving it does not become a durable unknown-data protocol

#### Scenario: Open mutation inputs reject raw control tunnels

- **WHEN** D2.5 validates any public mutation input schema with open `additionalProperties`
- **THEN** the implementation either closes the public TypeBox input schema
- **OR** pairs the recovered TypeBox input schema with adversarial parser/guard tests proving executable raw-control fields are rejected before engine execution
- **AND** literal-name negative searches alone are not accepted as the raw-control proof

### Requirement: App Modules Do Not Own Public Studio Wire DTOs

D2.5 SHALL move public Run in Game and Save&Deploy request/status DTO authority into `@civ7/studio-server` and reduce app-local modules to UI-only presentation helpers or delete them.

#### Scenario: Operation DTOs derive from the package contract

- **WHEN** the app consumes Run in Game or Save&Deploy request/status shapes
- **THEN** public request and response types are derived from the `@civ7/studio-server` oRPC contract or package-exported schema types
- **AND** app-local modules may only provide UI labels, formatting, client state, or presentation helpers that do not broaden the public wire shape

#### Scenario: Legacy operation paths stay closed

- **WHEN** D2.5 runs closeout searches
- **THEN** direct `/api` Run in Game and Save&Deploy operation clients/routes are absent
- **AND** public raw operation input or tunnel fields such as `operationType`, `rawCommand`, executable `command`, `script`, `javascript`, `session`, and `stateName` are absent from Studio public operation DTOs
- **AND** allowed historical comments or status/proof fields with matching names are explicitly classified as non-executable contract evidence
