## ADDED Requirements

### Requirement: Explicit Public Stage Surface Hides Internal Step Contracts

MapGen recipe config schemas SHALL expose an explicit stage public schema when a
stage declares `public + compile`, and SHALL keep internal step/op config
schemas behind stage compilation.

#### Scenario: Product-facing stage declares public compile
- **WHEN** a stage declares a public schema and compile function
- **THEN** the derived recipe config schema exposes `knobs` plus public schema
  keys
- **AND** it does not expose hidden step ids or op-envelope keys unless those
  keys are explicitly part of the public schema

#### Scenario: Public config compiles to internal step config
- **WHEN** the recipe compiler receives public stage config
- **THEN** stage compilation produces declared internal step ids
- **AND** op defaults and op normalization run after that compilation
