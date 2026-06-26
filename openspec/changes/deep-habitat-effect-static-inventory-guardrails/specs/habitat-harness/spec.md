## ADDED Requirements

### Requirement: Habitat Direct-Use Smells Are Inventoried Before Migration

Habitat SHALL inventory direct runtime, process, filesystem, environment, time,
error, public-export, and language-leak smells before implementation packets
move source modules.

#### Scenario: A source implementation packet starts

- **WHEN** a packet begins moving Habitat source code
- **THEN** every current direct-use occurrence in its write set has a recorded
  disposition
- **AND** domain violations have either a repair task or a stop condition

### Requirement: Guardrails Enforce Structural Invariants At Owner Layers

Habitat SHALL enforce recurring refactor invariants through the correct owner
layer rather than relying only on brittle tests.

#### Scenario: A guardrail is accepted

- **WHEN** a guardrail prevents direct process, fs, env, time, runtime, export,
  `.habitat`, or vocabulary drift
- **THEN** the guardrail records its owner layer
- **AND** includes an injected violation proof
- **AND** states non-claims for behavior it does not prove
